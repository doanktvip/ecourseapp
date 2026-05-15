import hmac
import hashlib
import requests
import uuid
import logging
from courses.payments.base import PaymentGateway
from ecourse import settings
from courses.payments.utils import generate_qr_base64

logger = logging.getLogger(__name__)


# Khai báo lớp MoMoPayment kế thừa từ PaymentGateway, đóng vai trò là một implementation cụ thể cho cổng thanh toán MoMo
class MoMoPayment(PaymentGateway):

    def create_payment(self, enrollment, amount: float) -> dict:
        config = settings.MOMO_CONFIG

        order_id = str(uuid.uuid4())
        request_id = str(uuid.uuid4())
        order_info = f"Tên khóa học: {enrollment.course.subject}"
        extra_data = ""
        request_type = "captureWallet"

        # Bước 1: Xây dựng chuỗi dữ liệu gốc (raw_signature) bằng cách nối các tham số theo đúng thứ tự từ điển (alphabet) mà MoMo yêu cầu
        raw_signature = (
            f"accessKey={config['ACCESS_KEY']}"
            f"&amount={int(amount)}"
            f"&extraData={extra_data}"
            f"&ipnUrl={config['NOTIFY_URL']}"
            f"&orderId={order_id}"
            f"&orderInfo={order_info}"
            f"&partnerCode={config['PARTNER_CODE']}"
            f"&redirectUrl={config['RETURN_URL']}"
            f"&requestId={request_id}"
            f"&requestType={request_type}"
        )

        # Bước 2: Dùng thuật toán HMAC kết hợp với hàm băm SHA256 để tạo ra chữ ký từ chuỗi dữ liệu gốc và khóa bí mật (secretKey)
        signature = hmac.new(
            config['SECRET_KEY'].encode('utf-8'),
            raw_signature.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        # Đóng gói toàn bộ các thông số cùng với chữ ký vừa tạo thành một dictionary để chuẩn bị gửi đi trong phần body (dạng JSON) của HTTP Request
        payload = {
            "partnerCode": config['PARTNER_CODE'],
            "partnerName": "Hệ thống E-Course",
            "storeId": "E-Course-Store",
            "requestId": request_id,
            "amount": int(amount),
            "orderId": order_id,
            "orderInfo": order_info,
            "redirectUrl": config['RETURN_URL'],
            "ipnUrl": config['NOTIFY_URL'],
            "lang": "vi",
            "extraData": extra_data,
            "requestType": request_type,
            "signature": signature
        }

        try:
            response = requests.post(config['ENDPOINT'], json=payload, timeout=10)
            response.raise_for_status()
            res_data = response.json()

            # Trả về một dictionary chứa các thông tin quan trọng cần thiết cho việc xử lý tiếp theo của hệ thống
            return {
                "payment_url": res_data.get("payUrl"),
                "qr_code_base64": generate_qr_base64(res_data.get("qrCodeUrl")),
                "transaction_id": order_id,
                "amount": amount,
                "method": "MOMO"
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Lỗi khi gọi API MoMo: {e}")
            raise ValueError("Không thể kết nối đến cổng thanh toán MoMo lúc này. Vui lòng thử lại sau.")

    # Ghi đè phương thức verify_payment từ lớp cha để xác minh tính toàn vẹn của dữ liệu IPN (Webhook) do MoMo gửi về
    def verify_payment(self, request_data: dict) -> bool:
        if request_data.get('resultCode') != 0:
            return False

        config = settings.MOMO_CONFIG

        partner_code = request_data.get('partnerCode', '')
        order_id = request_data.get('orderId', '')
        request_id = request_data.get('requestId', '')
        amount = request_data.get('amount', '')
        order_info = request_data.get('orderInfo', '')
        order_type = request_data.get('orderType', '')
        trans_id = request_data.get('transId', '')
        result_code = request_data.get('resultCode', '')
        message = request_data.get('message', '')
        pay_type = request_data.get('payType', '')
        response_time = request_data.get('responseTime', '')
        extra_data = request_data.get('extraData', '')

        # Trích xuất chữ ký điện tử (signature) do MoMo tính toán và đính kèm theo để ta sử dụng đối chiếu
        momo_signature = request_data.get('signature', '')

        # Bước 1: Ghép các tham số nhận được thành một chuỗi dữ liệu gốc (raw_data) tuân thủ nghiêm ngặt thứ tự từ điển alphabet
        raw_data = (
            f"accessKey={config['ACCESS_KEY']}"
            f"&amount={amount}"
            f"&extraData={extra_data}"
            f"&message={message}"
            f"&orderId={order_id}"
            f"&orderInfo={order_info}"
            f"&orderType={order_type}"
            f"&partnerCode={partner_code}"
            f"&payType={pay_type}"
            f"&requestId={request_id}"
            f"&responseTime={response_time}"
            f"&resultCode={result_code}"
            f"&transId={trans_id}"
        )

        # Bước 2: Thực hiện tính toán chữ ký mới bằng thuật toán HMAC-SHA256 trên chuỗi raw_data vừa tạo và SECRET_KEY của ứng dụng
        my_signature = hmac.new(
            config['SECRET_KEY'].encode('utf-8'),
            raw_data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        # Bước 3: So sánh chữ ký do hệ thống tự tính (my_signature) với chữ ký do MoMo cung cấp (momo_signature)
        if my_signature == momo_signature:
            return True
        else:
            logger.warning(f"Cảnh báo bảo mật: Sai chữ ký IPN MoMo! Order ID: {order_id}")
            return False
