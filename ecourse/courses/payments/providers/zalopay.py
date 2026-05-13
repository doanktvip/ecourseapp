# Import json để chuyển đổi từ điển Python sang chuỗi JSON (ZaloPay yêu cầu định dạng này cho một số field)
import json
import random
# Import time và datetime để lấy mốc thời gian hiện tại (app_time) và định dạng mã giao dịch
import time
from datetime import datetime
# Import thư viện mã hóa chữ ký
import hmac
import hashlib
import requests
import logging
from django.conf import settings
from courses.payments.base import PaymentGateway

logger = logging.getLogger(__name__)


class ZaloPayPayment(PaymentGateway):

    def create_payment(self, enrollment, amount: float) -> dict:
        """
        Tạo đơn hàng trên hệ thống ZaloPay và lấy link thanh toán.
        """
        config = settings.ZALOPAY_CONFIG

        # 1. TẠO CÁC THÔNG SỐ CƠ BẢN
        app_time = int(round(time.time() * 1000))
        date_str = time.strftime('%y%m%d')

        # Tạo trans_id duy nhất: yyMMdd_enrollID_timestamp
        # Hạn chế dùng random quá nhiều, dùng timestamp để đảm bảo không trùng trong ngày
        trans_id = f"{date_str}_{enrollment.id}_{int(time.time() % 100000)}"

        # ZaloPay yêu cầu item và embed_data phải là CHUỖI JSON
        # Lưu ý: Tuyệt đối không để khoảng trắng dư thừa trong JSON string nếu dùng để tính MAC
        items = json.dumps([{"itemid": str(enrollment.course.id), "itemname": enrollment.course.subject}],
                           separators=(',', ':'))
        embed_data = json.dumps({"redirecturl": config['REDIRECT_URL']}, separators=(',', ':'))

        # 2. XÂY DỰNG PAYLOAD (Sắp xếp theo thứ tự để dễ quản lý)
        order = {
            "app_id": int(config['APP_ID']),
            "app_trans_id": trans_id,
            "app_user": str(enrollment.student.id),
            "app_time": app_time,
            "item": items,
            "embed_data": embed_data,
            "amount": int(amount),
            "description": f"Thanh toan khoa hoc: {enrollment.course.subject}"[:100],  # Giới hạn độ dài
            "bank_code": "",
            "callback_url": config['CALLBACK_URL']  # THIẾU CÁI NÀY LÀ DỄ ĂN LỖI 401
        }

        # 3. TẠO CHỮ KÝ (MAC) CHUẨN
        # Công thức: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
        data_to_mac = "|".join([
            str(order["app_id"]),
            order["app_trans_id"],
            order["app_user"],
            str(order["amount"]),
            str(order["app_time"]),
            order["embed_data"],
            order["item"]
        ])

        order["mac"] = hmac.new(
            config['KEY1'].encode('utf-8'),
            data_to_mac.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        # 4. GỬI YÊU CẦU
        try:
            # THÊM timeout=10 để tránh treo worker khi server ZaloPay chậm phản hồi
            response = requests.post(config['ENDPOINT'], json=order, timeout=10)
            res_data = response.json()

            if res_data.get('return_code') == 1:
                return {
                    "payment_url": res_data.get('order_url'),
                    "transaction_id": trans_id,
                    "method": "ZALOPAY"
                }
            else:
                # Trả về lỗi chi tiết từ ZaloPay để dễ bắt bệnh
                error_msg = res_data.get('sub_return_message', res_data.get('return_message'))
                logger.error(f"ZaloPay tu choi: {error_msg}")
                raise ValueError(f"ZaloPay tu choi: {error_msg}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Loi ket noi ZaloPay: {e}")
            raise ValueError("Khong the ket noi ZaloPay.")

    def verify_payment(self, request_data: dict) -> bool:
        """
        Xác thực Webhook (Callback) do ZaloPay gọi về.
        ZaloPay sẽ POST về 1 body JSON có dạng: {"data": "{...}", "mac": "...", "type": 1}
        """
        config = settings.ZALOPAY_CONFIG

        # Lấy chuỗi dữ liệu (đã được stringify) và chữ ký ZaloPay gửi về
        data_str = request_data.get('data')
        request_mac = request_data.get('mac')

        if not data_str or not request_mac:
            logger.warning("ZaloPay Callback thiếu trường 'data' hoặc 'mac'.")
            return False

        # TẠO LẠI CHỮ KÝ KIỂM TRA BẰNG KEY 2
        # ZaloPay dùng KEY2 để mã hóa Callback (khác với lúc tạo đơn dùng KEY1)
        mac_calculated = hmac.new(
            config['KEY2'].encode('utf-8'),
            data_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        # So sánh 2 chữ ký
        if mac_calculated == request_mac:
            # Chữ ký hợp lệ -> Giao dịch này thực sự từ ZaloPay
            # Ta có thể parse json.loads(data_str) để lấy ra app_trans_id nếu cần xử lý phức tạp hơn
            return True
        else:
            logger.warning("Cảnh báo bảo mật: Sai chữ ký ZaloPay Callback!")
            return False