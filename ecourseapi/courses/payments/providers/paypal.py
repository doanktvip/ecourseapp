import logging
from ecourse import settings
from courses.payments.base import PaymentGateway
from paypalcheckoutsdk.core import PayPalHttpClient, SandboxEnvironment, LiveEnvironment
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
from paypalhttp.http_error import HttpError
from courses.payments.utils import generate_qr_base64

logger = logging.getLogger(__name__)


# Khai báo lớp PayPalPayment với tính năng kế thừa từ lớp trừu tượng PaymentGateway
class PayPalPayment(PaymentGateway):

    # Phương thức khởi tạo của lớp (constructor) được tự động gọi khi một đối tượng thuộc lớp PayPalPayment được tạo ra
    def __init__(self):
        config = settings.PAYPAL_CONFIG

        # Kiểm tra giá trị của cờ 'MODE' trong cấu hình để xác định hệ thống sẽ làm việc với môi trường thật hay môi trường thử nghiệm
        if config.get('MODE') == 'live':
            self.environment = LiveEnvironment(
                client_id=config['CLIENT_ID'],
                client_secret=config['CLIENT_SECRET']
            )
        else:
            # Nếu không phải 'live', mặc định sử dụng môi trường Sandbox (thử nghiệm) để kiểm tra luồng thanh toán mà không dùng tiền thật
            self.environment = SandboxEnvironment(
                client_id=config['CLIENT_ID'],
                client_secret=config['CLIENT_SECRET']
            )

        # Tạo và lưu trữ đối tượng PayPalHttpClient vào thuộc tính của lớp, nó sẽ sử dụng cấu hình môi trường ở trên để gọi các API của PayPal
        self.client = PayPalHttpClient(self.environment)

    # Ghi đè phương thức từ lớp cha để định nghĩa logic khởi tạo phiên thanh toán với hệ thống PayPal
    def create_payment(self, enrollment, amount: float) -> dict:
        config = settings.PAYPAL_CONFIG

        # Định nghĩa tỷ giá hối đoái quy đổi cố định (1 USD tương đương 25000 VNĐ)
        EXCHANGE_RATE = 25000
        usd_amount = round(amount / EXCHANGE_RATE, 2)

        # Khởi tạo một đối tượng yêu cầu API chuyên dụng để tạo đơn hàng (Order) trên hệ thống PayPal
        request = OrdersCreateRequest()

        request.prefer('return=representation')

        # Gắn dữ liệu (payload) cho HTTP Body của yêu cầu theo cấu trúc JSON mà API PayPal quy định
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

            # Đóng gói và trả về một bộ thông tin tổng hợp cho View xử lý việc điều hướng người dùng
            return {
                "payment_url": approve_url,
                "qr_code_base64": generate_qr_base64(approve_url),
                "transaction_id": order_id,
                "amount": amount,
                "method": "PAYPAL"
            }
        # Chỉ định khối xử lý ngoại lệ bắt lỗi HttpError, là lỗi đặc thù khi API của PayPal trả về mã HTTP báo thất bại
        except HttpError as e:
            logger.error(f"Lỗi khi gọi API PayPal: {e.message}")
            raise ValueError("Không thể kết nối đến cổng thanh toán PayPal lúc này.")

    # Cung cấp bản triển khai cho phương thức xác thực giao dịch, được kích hoạt khi quy trình thanh toán trên PayPal có kết quả (thành công hoặc không)
    def verify_payment(self, request_data: dict) -> bool:
        order_id = request_data.get('token')

        if not order_id:
            logger.warning("Không tìm thấy PayPal token trong dữ liệu trả về.")
            return False

        request = OrdersCaptureRequest(order_id)

        # Sử dụng một khối lệnh try-except nhằm theo dõi và bắt lỗi nếu việc thực hiện Capture gặp trở ngại từ phía API
        try:
            response = self.client.execute(request)

            if response.result.status == 'COMPLETED':
                return True
            else:
                logger.warning(f"Giao dịch PayPal không thành công. Trạng thái: {response.result.status}")
                return False

        # Quản lý những lỗi phát sinh trong suốt quá trình gọi thao tác Capture, chẳng hạn như token không còn hiệu lực hay đã từng được capture trước đó
        except HttpError as e:
            logger.error(f"Lỗi khi capture PayPal Order: {e.message}")
            return False
