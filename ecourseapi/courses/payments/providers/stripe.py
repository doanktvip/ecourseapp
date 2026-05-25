import stripe
import logging
from ecourse import settings
from courses.payments.base import PaymentGateway

logger = logging.getLogger(__name__)


# Khởi tạo lớp xử lý thanh toán cho dịch vụ Stripe, lớp này phải kế thừa tính năng và luật lệ từ lớp PaymentGateway
class StripePayment(PaymentGateway):

    # Phương thức đảm trách nhiệm vụ sinh yêu cầu và phiên làm việc (Session) trên máy chủ thanh toán Stripe
    def create_payment(self, enrollment, amount: float) -> dict:
        config = settings.STRIPE_CONFIG

        stripe.api_key = config['SECRET_KEY']

        order_info = f"Thanh toán khóa học: {enrollment.course.subject}"

        # Đặt khối mã lệnh tương tác với mạng nội bộ vào phạm vi bắt lỗi, nhằm đề phòng trường hợp xảy ra ngoại lệ bất ngờ
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],

                line_items=[{
                    'price_data': {
                        'currency': 'vnd',
                        'product_data': {
                            'name': order_info,
                        },
                        'unit_amount': int(amount),
                    },
                    'quantity': 1,
                }],

                mode='payment',

                success_url=config['RETURN_URL'] + "?session_id={CHECKOUT_SESSION_ID}",

                cancel_url=config['CANCEL_URL'],

                client_reference_id=str(enrollment.id),
            )

            return {
                "payment_url": session.url,
                "transaction_id": session.id,
                "amount": amount,
                "method": "STRIPE"
            }

        except stripe.error.StripeError as e:
            logger.error(f"Lỗi khi gọi API Stripe: {e.user_message}")
            raise ValueError(f"Stripe từ chối: {e.user_message}")

    # Cung cấp thuật toán đánh giá và nghiệm thu thông tin khi có dữ liệu gọi từ hệ thống tự động (Webhook) của Stripe gửi đến
    def verify_payment(self, request_data: dict) -> bool:
        config = settings.STRIPE_CONFIG
        stripe.api_key = config['SECRET_KEY']

        endpoint_secret = config['WEBHOOK_SECRET']

        payload = request_data.get('raw_body')
        sig_header = request_data.get('stripe_signature')

        # Thẩm định tính đầy đủ của bộ đôi thông tin, nếu bất kỳ thành phần nào khuyết thiếu thì hệ thống lập tức bác bỏ gói tin
        if not payload or not sig_header:
            logger.warning("Thiếu payload hoặc signature header từ Stripe.")
            return False

        # Thiết lập vùng an toàn để vận hành cơ chế giải mã đối soát chữ ký số của thư viện Stripe
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        # Bắt trường hợp thư viện không thể biên dịch hay thấu hiểu cấu trúc của chuỗi payload (thường là do lỗi dữ liệu truyền đi không phải JSON hợp lệ)
        except ValueError as e:
            logger.error("Stripe Webhook lỗi: Invalid payload")
            return False
        except stripe.error.SignatureVerificationError as e:
            logger.warning("Cảnh báo bảo mật: Sai chữ ký Stripe Webhook!")
            return False

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']

            if session.payment_status == 'paid':
                return True

        return False
