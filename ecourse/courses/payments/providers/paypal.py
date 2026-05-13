import logging
from django.conf import settings
from courses.payments.base import PaymentGateway

# Import các module từ SDK của PayPal
from paypalcheckoutsdk.core import PayPalHttpClient, SandboxEnvironment, LiveEnvironment
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
from paypalhttp.http_error import HttpError

logger = logging.getLogger(__name__)


class PayPalPayment(PaymentGateway):

    def __init__(self):
        """
        Hàm khởi tạo: Cấu hình môi trường và client cho PayPal.
        """
        # Lấy thông tin cấu hình từ settings.py (bạn cần thêm cấu hình này vào settings)
        config = settings.PAYPAL_CONFIG

        # Kiểm tra xem đang chạy ở môi trường thật (Live) hay thử nghiệm (Sandbox)
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

        # Khởi tạo Client dùng để gọi API
        self.client = PayPalHttpClient(self.environment)

    def create_payment(self, enrollment, amount: float) -> dict:
        """
        Tạo đơn hàng (Order) trên PayPal và lấy link thanh toán.
        """
        config = settings.PAYPAL_CONFIG

        # CHUYỂN ĐỔI TIỀN TỆ (VND -> USD)
        # Vì PayPal không hỗ trợ VND, ta chia cho tỷ giá (Ví dụ: 25000 VND = 1 USD)
        EXCHANGE_RATE = 25000
        usd_amount = round(amount / EXCHANGE_RATE, 2)

        # 1. Khởi tạo một Request để tạo Order (Đơn hàng)
        request = OrdersCreateRequest()

        # Yêu cầu PayPal trả về toàn bộ chi tiết đơn hàng (representation)
        request.prefer('return=representation')

        # 2. Xây dựng nội dung đơn hàng (Payload) theo chuẩn PayPal
        request.request_body(
            {
                "intent": "CAPTURE",  # Lấy tiền ngay lập tức khi khách hàng đồng ý
                "application_context": {
                    "return_url": config['RETURN_URL'],  # URL trả về khi thanh toán thành công
                    "cancel_url": config['CANCEL_URL'],  # URL trả về khi người dùng bấm Hủy
                    "brand_name": "Hệ thống E-Course",  # Tên thương hiệu hiển thị
                    "user_action": "PAY_NOW"  # Hiển thị nút "Pay Now" thay vì "Continue"
                },
                "purchase_units": [
                    {
                        "reference_id": f"enroll_{enrollment.id}",  # ID đơn hàng nội bộ của ta
                        "description": f"Thanh toan khoa hoc: {enrollment.course.subject}",
                        "amount": {
                            "currency_code": "USD",  # Bắt buộc là USD hoặc loại tiền PayPal hỗ trợ
                            "value": str(usd_amount)  # Số tiền (chuyển sang chuỗi)
                        }
                    }
                ]
            }
        )

        try:
            # 3. Gửi Request sang PayPal
            response = self.client.execute(request)

            # Lấy Order ID do PayPal sinh ra
            order_id = response.result.id

            # 4. Tìm đường dẫn (URL) để chuyển người dùng sang trang duyệt thanh toán
            # PayPal trả về 1 mảng 'links', ta cần tìm link có 'rel' == 'approve'
            approve_url = next(link.href for link in response.result.links if link.rel == 'approve')

            return {
                "payment_url": approve_url,
                "transaction_id": order_id,
                "method": "PAYPAL"
            }
        except HttpError as e:
            logger.error(f"Lỗi khi gọi API PayPal: {e.message}")
            raise ValueError("Không thể kết nối đến cổng thanh toán PayPal lúc này.")

    def verify_payment(self, request_data: dict) -> bool:
        """
        Xác nhận thanh toán (Capture Order) khi người dùng quay lại từ PayPal.
        """
        # Khi PayPal redirect về, nó sẽ đính kèm tham số 'token' (chính là Order ID) trên URL
        order_id = request_data.get('token')

        if not order_id:
            logger.warning("Không tìm thấy PayPal token trong dữ liệu trả về.")
            return False

        # Khởi tạo Request để Capture (thực thi lấy tiền) đơn hàng
        request = OrdersCaptureRequest(order_id)

        try:
            # Gửi yêu cầu lấy tiền sang PayPal
            response = self.client.execute(request)

            # Kiểm tra trạng thái đơn hàng
            # COMPLETED nghĩa là tiền đã vào tài khoản của bạn thành công
            if response.result.status == 'COMPLETED':
                return True
            else:
                logger.warning(f"Giao dịch PayPal không thành công. Trạng thái: {response.result.status}")
                return False

        except HttpError as e:
            # Lỗi này xảy ra nếu token đã bị sử dụng (đã thanh toán rồi) hoặc bị sai
            logger.error(f"Lỗi khi capture PayPal Order: {e.message}")
            return False