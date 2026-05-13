# Import thư viện chính thức của Stripe
import stripe
# Import logging để ghi nhận lỗi hoặc cảnh báo
import logging
# Import uuid để tạo mã giao dịch ngẫu nhiên (dù Stripe cũng tự tạo, nhưng ta có thể dùng làm metadata)
import uuid
# Import settings để lấy cấu hình bảo mật
from django.conf import settings
# Kế thừa Abstract Base Class của hệ thống
from courses.payments.base import PaymentGateway

logger = logging.getLogger(__name__)


class StripePayment(PaymentGateway):

    def create_payment(self, enrollment, amount: float) -> dict:
        """
        Tạo một phiên thanh toán (Checkout Session) trên hệ thống của Stripe.
        """
        # Lấy thông tin cấu hình từ settings.py
        config = settings.STRIPE_CONFIG

        # Cung cấp Secret Key cho thư viện Stripe để xác thực API
        stripe.api_key = config['SECRET_KEY']

        # Tạo thông tin mô tả đơn hàng
        order_info = f"Thanh toán khóa học: {enrollment.course.subject}"

        try:
            # GỌI API STRIPE ĐỂ TẠO CHECKOUT SESSION
            # Session này sẽ trả về một đường link URL để chuyển hướng người dùng sang trang của Stripe
            session = stripe.checkout.Session.create(
                # Phương thức thanh toán (chấp nhận thẻ card)
                payment_method_types=['card'],

                # Chi tiết các mặt hàng trong đơn thanh toán
                line_items=[{
                    'price_data': {
                        'currency': 'vnd',  # Stripe hỗ trợ VND trực tiếp
                        'product_data': {
                            'name': order_info,  # Tên sản phẩm hiển thị trên trang thanh toán
                        },
                        # Stripe yêu cầu số tiền là số nguyên (VND không có số lẻ thập phân như USD)
                        'unit_amount': int(amount),
                    },
                    'quantity': 1,  # Số lượng mua
                }],

                # Chế độ thanh toán 1 lần (payment) thay vì đăng ký tự động gia hạn (subscription)
                mode='payment',

                # URL Stripe sẽ gọi về khi người dùng thanh toán thành công
                # {CHECKOUT_SESSION_ID} là biến đặc biệt Stripe sẽ tự thay thế bằng ID thật
                success_url=config['RETURN_URL'] + "?session_id={CHECKOUT_SESSION_ID}",

                # URL Stripe gọi về nếu người dùng bấm nút "Quay lại / Hủy thanh toán"
                cancel_url=config['CANCEL_URL'],

                # Mã tham chiếu của hệ thống ta (để dễ dàng đối soát sau này)
                client_reference_id=str(enrollment.id),
            )

            return {
                "payment_url": session.url,  # Link để chuyển hướng người dùng sang Stripe Checkout
                "transaction_id": session.id,  # Lưu lại ID Session của Stripe để tra cứu Webhook
                "method": "STRIPE"
            }

        except stripe.error.StripeError as e:
            # Bắt mọi lỗi từ server Stripe (sai key, lỗi mạng, dữ liệu không hợp lệ...)
            logger.error(f"Lỗi khi gọi API Stripe: {e.user_message}")
            raise ValueError("Không thể kết nối đến cổng thanh toán Stripe lúc này.")

    def verify_payment(self, request_data: dict) -> bool:
        """
        Xác thực thanh toán qua Webhook của Stripe (Tương tự như IPN của MoMo).
        """
        config = settings.STRIPE_CONFIG
        stripe.api_key = config['SECRET_KEY']

        # Secret của Endpoint Webhook để xác minh chữ ký (do Stripe cấp khi bạn tạo Webhook trên Dashboard)
        endpoint_secret = config['WEBHOOK_SECRET']

        # ⚠️ LƯU Ý QUAN TRỌNG VỀ STRIPE WEBHOOK:
        # Stripe yêu cầu phải kiểm tra chữ ký dựa trên "raw body" (dữ liệu thô nguyên bản chưa bị parse sang JSON)
        # Vì vậy request_data ở đây phải chứa chuỗi byte thô và header 'Stripe-Signature'
        payload = request_data.get('raw_body')
        sig_header = request_data.get('stripe_signature')

        if not payload or not sig_header:
            logger.warning("Thiếu payload hoặc signature header từ Stripe.")
            return False

        try:
            # Thư viện Stripe sẽ TỰ ĐỘNG thực hiện việc băm (hash) và đối chiếu chữ ký giúp ta
            # Bạn không cần phải code thủ công dùng hmac/hashlib như MoMo nữa!
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError as e:
            # Lỗi nếu payload bị hỏng hoặc không đúng định dạng
            logger.error("Stripe Webhook lỗi: Invalid payload")
            return False
        except stripe.error.SignatureVerificationError as e:
            # Lỗi báo động đỏ: Có người cố tình gửi webhook giả mạo hệ thống của bạn!
            logger.warning("Cảnh báo bảo mật: Sai chữ ký Stripe Webhook!")
            return False

        # Nếu chữ ký hợp lệ, Stripe sẽ trả về một object 'event'
        # Ta chỉ quan tâm đến sự kiện "Người dùng đã thanh toán xong Checkout Session"
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']

            # Kiểm tra chắc chắn lần cuối xem tiền đã thực sự được trả hay chưa
            if session.payment_status == 'paid':
                return True

        # Nếu là các sự kiện khác (như tạo session, thất bại...), ta không đánh dấu là đã thanh toán
        return False