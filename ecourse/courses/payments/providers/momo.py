# Import thư viện hmac để tạo mã xác thực thông điệp (Hash-based Message Authentication Code)
import hmac
# Import thư viện hashlib để sử dụng thuật toán băm SHA256
import hashlib
# Import thư viện requests để thực hiện gọi API (HTTP POST) sang server của MoMo
import requests
# Import thư viện uuid để tạo các chuỗi định danh duy nhất (cho Order ID và Request ID)
import uuid
# Import thư viện logging để ghi log hệ thống (giúp debug và theo dõi lỗi)
import logging
# Import settings từ Django để lấy cấu hình MOMO_CONFIG đã cài đặt trong file settings.py
from django.conf import settings
# Import class PaymentGateway (Abstract Base Class) mà lớp này cần kế thừa
from courses.payments.base import PaymentGateway

# Khởi tạo logger cho file này để ghi lại các cảnh báo hoặc lỗi nếu có
logger = logging.getLogger(__name__)


# Khai báo lớp MoMoPayment kế thừa từ PaymentGateway
class MoMoPayment(PaymentGateway):

    # Định nghĩa hàm tạo yêu cầu thanh toán (bắt buộc phải có do kế thừa từ PaymentGateway)
    def create_payment(self, enrollment, amount: float) -> dict:
        # Lấy toàn bộ thông tin cấu hình MoMo (như SECRET_KEY, PARTNER_CODE...) từ settings
        config = settings.MOMO_CONFIG

        # Tạo order_id duy nhất cho giao dịch này bằng cách sinh một chuỗi UUID ngẫu nhiên
        order_id = str(uuid.uuid4())
        # Tạo request_id duy nhất cho mỗi lần gọi API sang MoMo (MoMo yêu cầu request_id không trùng lặp)
        request_id = str(uuid.uuid4())
        # Tạo thông tin mô tả đơn hàng (hiển thị trên ứng dụng MoMo khi khách hàng quét mã)
        order_info = f"Thanh toán khóa học: {enrollment.course.subject}"
        # MoMo yêu cầu extraData, nếu không có dữ liệu thêm thì để chuỗi rỗng
        extra_data = ""
        # Loại giao dịch: "captureWallet" nghĩa là thanh toán bằng ví MoMo (quét mã QR)
        request_type = "captureWallet"

        # TẠO CHỮ KÝ (SIGNATURE)
        # BƯỚC 1: Xây dựng chuỗi dữ liệu thô (raw signature) theo đúng thứ tự alphabet của các key mà MoMo quy định.
        # Lưu ý: Tuyệt đối không thay đổi thứ tự hay thiếu dấu '=' , '&' trong chuỗi này.
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

        # BƯỚC 2: Băm chuỗi dữ liệu thô (raw_signature) bằng thuật toán HMAC SHA256 với khóa bí mật là SECRET_KEY.
        signature = hmac.new(
            config['SECRET_KEY'].encode('utf-8'),  # Chuyển SECRET_KEY sang dạng byte
            raw_signature.encode('utf-8'),  # Chuyển chuỗi thô sang dạng byte
            hashlib.sha256  # Sử dụng thuật toán SHA256
        ).hexdigest()  # Lấy kết quả ở dạng chuỗi hex (hệ thập lục phân)

        # BƯỚC 3: Đóng gói toàn bộ dữ liệu thành một dictionary để gửi đi qua body của request (định dạng JSON).
        payload = {
            "partnerCode": config['PARTNER_CODE'],  # Mã đối tác của bạn do MoMo cấp
            "partnerName": "Hệ thống E-Course",  # Tên đối tác (Tùy chọn hiển thị)
            "storeId": "E-Course-Store",  # ID cửa hàng (Tùy chọn)
            "requestId": request_id,  # Mã yêu cầu API
            "amount": int(amount),  # Số tiền thanh toán (MoMo yêu cầu số nguyên)
            "orderId": order_id,  # Mã đơn hàng nội bộ của bạn
            "orderInfo": order_info,  # Thông tin đơn hàng
            "redirectUrl": config['RETURN_URL'],  # URL MoMo sẽ chuyển người dùng về sau khi thanh toán xong trên web
            "ipnUrl": config['NOTIFY_URL'],  # URL (Webhook) MoMo sẽ tự động gọi API (server-to-server) để báo kết quả
            "lang": "vi",  # Ngôn ngữ hiển thị (vi: Tiếng Việt, en: Tiếng Anh)
            "extraData": extra_data,  # Dữ liệu đính kèm thêm
            "requestType": request_type,  # Loại thanh toán
            "signature": signature  # Chữ ký bảo mật vừa tạo ở trên
        }

        try:
            # Gửi HTTP POST request tới địa chỉ API (ENDPOINT) của MoMo
            # THÊM timeout=10 để chống treo worker của hệ thống nếu API MoMo phản hồi chậm
            response = requests.post(config['ENDPOINT'], json=payload, timeout=10)
            # Kiểm tra xem request có thành công không (mã trạng thái HTTP 200)
            response.raise_for_status()
            # Parse dữ liệu response từ JSON sang kiểu dictionary của Python
            res_data = response.json()

            # Trả về kết quả cho Factory và View xử lý
            return {
                "payment_url": res_data.get("payUrl"),
                # Đường dẫn tới trang thanh toán của MoMo (người dùng sẽ mở link này)
                "transaction_id": order_id,  # Mã giao dịch (để lưu vào Database đối soát sau này)
                "method": "MOMO"  # Tên phương thức thanh toán
            }
        # Nếu có lỗi trong quá trình gọi request (mất mạng, sai URL...)
        except requests.exceptions.RequestException as e:
            # Ghi log lại lỗi để developer kiểm tra
            logger.error(f"Lỗi khi gọi API MoMo: {e}")
            # Ném ra lỗi cho hệ thống biết (hàm process trong views.py sẽ bắt lỗi này và trả về HTTP 500)
            raise ValueError("Không thể kết nối đến cổng thanh toán MoMo lúc này. Vui lòng thử lại sau.")

    # Định nghĩa hàm xác thực thông tin khi MoMo gọi IPN (Webhook) trả về server của bạn
    def verify_payment(self, request_data: dict) -> bool:
        # Đầu tiên, kiểm tra xem giao dịch có thành công không. 'resultCode' = 0 là thành công.
        if request_data.get('resultCode') != 0:
            # Nếu thất bại (người dùng hủy, không đủ tiền...), lập tức trả về False
            return False

        # Lấy lại thông tin cấu hình để dùng SECRET_KEY xác minh chữ ký
        config = settings.MOMO_CONFIG

        # LẤY CÁC THAM SỐ MOMO GỬI VỀ (Sử dụng .get() kèm giá trị mặc định là chuỗi rỗng '' để tránh lỗi NoneType)
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

        # Chữ ký (signature) mà MoMo tính toán và gửi về để ta so sánh
        momo_signature = request_data.get('signature', '')

        # TẠO LẠI CHỮ KÝ NỘI BỘ
        # BƯỚC 1: Xây dựng chuỗi dữ liệu thô (raw data) dựa trên các tham số MoMo gửi về theo đúng thứ tự alphabet
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

        # BƯỚC 2: Băm chuỗi dữ liệu thô bằng HMAC SHA256 tương tự như lúc tạo giao dịch
        my_signature = hmac.new(
            config['SECRET_KEY'].encode('utf-8'),  # Dùng chính SECRET_KEY của ứng dụng
            raw_data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        # BƯỚC 3: Đối chiếu chữ ký tự tạo (my_signature) và chữ ký MoMo gửi về (momo_signature)
        if my_signature == momo_signature:
            # Nếu trùng khớp, thông điệp này thực sự đến từ MoMo và không bị hacker sửa đổi
            return True
        else:
            # Nếu sai lệch chữ ký, ghi lại cảnh báo vào log để theo dõi hành vi giả mạo (hacking)
            logger.warning(f"Cảnh báo bảo mật: Sai chữ ký IPN MoMo! Order ID: {order_id}")
            # Trả về False để báo hiệu với Views đây là request không hợp lệ
            return False