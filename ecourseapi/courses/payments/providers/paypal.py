import logging
from ecourse import settings
from courses.payments.base import PaymentGateway
from paypalcheckoutsdk.core import PayPalHttpClient, SandboxEnvironment, LiveEnvironment
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
from paypalhttp.http_error import HttpError

logger = logging.getLogger(__name__)


class PayPalPayment(PaymentGateway):

    def __init__(self):
        config = settings.PAYPAL_CONFIG

        if config.get('MODE') == 'live':
            self.environment = LiveEnvironment(
                client_id=config['CLIENT_ID'],
                client_secret=config['CLIENT_SECRET']
            )
        else:
            self.environment = SandboxEnvironment(
                client_id=config['CLIENT_ID'],
                client_secret=config['CLIENT_SECRET']
            )

        self.client = PayPalHttpClient(self.environment)

    def create_payment(self, enrollment, amount: float) -> dict:
        config = settings.PAYPAL_CONFIG

        EXCHANGE_RATE = 25000
        usd_amount = round(amount / EXCHANGE_RATE, 2)

        request = OrdersCreateRequest()

        request.prefer('return=representation')

        request.request_body(
            {
                "intent": "CAPTURE",
                "application_context": {
                    "return_url": config['RETURN_URL'],
                    "cancel_url": config['CANCEL_URL'],
                    "brand_name": "Hệ thống E-Course",
                    "user_action": "PAY_NOW"
                },
                "purchase_units": [
                    {
                        "reference_id": f"enroll_{enrollment.id}",
                        "description": f"Thanh toan khoa hoc: {enrollment.course.subject}",
                        "amount": {
                            "currency_code": "USD",
                            "value": str(usd_amount)
                        }
                    }
                ]
            }
        )

        try:
            response = self.client.execute(request)

            order_id = response.result.id

            approve_url = next(link.href for link in response.result.links if link.rel == 'approve')

            return {
                "payment_url": approve_url,
                "transaction_id": order_id,
                "amount": amount,
                "method": "PAYPAL"
            }
        except HttpError as e:
            logger.error(f"Lỗi khi gọi API PayPal: {e.message}")
            raise ValueError("Không thể kết nối đến cổng thanh toán PayPal lúc này.")

    def verify_payment(self, request_data: dict) -> bool:
        order_id = request_data.get('token')

        if not order_id:
            logger.warning("Không tìm thấy PayPal token trong dữ liệu trả về.")
            return False

        request = OrdersCaptureRequest(order_id)

        try:
            response = self.client.execute(request)

            if response.result.status == 'COMPLETED':
                return True
            else:
                logger.warning(f"Giao dịch PayPal không thành công. Trạng thái: {response.result.status}")
                return False

        except HttpError as e:
            logger.error(f"Lỗi khi capture PayPal Order: {e.message}")
            return False
