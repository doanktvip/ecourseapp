import json
import time
from datetime import datetime
import uuid
import hmac
import hashlib
import requests
import logging
from ecourse import settings
from courses.payments.base import PaymentGateway
from courses.payments.utils import generate_qr_base64

logger = logging.getLogger(__name__)


# Khai báo lớp mô hình hóa luồng xử lý riêng cho cổng thanh toán điện tử ZaloPay, tuân thủ theo hợp đồng của lớp nền tảng PaymentGateway
class ZaloPayPayment(PaymentGateway):

    # Phương thức thực hiện giao tiếp với máy chủ ZaloPay để đăng ký khởi tạo một phiên giao dịch mới và trích xuất đường dẫn thanh toán
    def create_payment(self, enrollment, amount: float) -> dict:
        config = settings.ZALOPAY_CONFIG

        app_time = int(round(time.time() * 1000))

        today_str = datetime.now().strftime("%y%m%d")
        trans_id = f"{today_str}_{uuid.uuid4().hex}"

        items = json.dumps([{"itemid": str(enrollment.course.id), "itemname": enrollment.course.subject}],
                           separators=(',', ':'))
        embed_data = json.dumps({"redirecturl": config['REDIRECT_URL']}, separators=(',', ':'))

        order = {
            "app_id": int(config['APP_ID']),
            "app_trans_id": trans_id,
            "app_user": str(enrollment.student.id),
            "app_time": app_time,
            "item": items,
            "embed_data": embed_data,
            "amount": int(amount),
            "description": f"Thanh toan khoa hoc: {enrollment.course.subject}"[:100],
            "bank_code": "",
            "callback_url": config['CALLBACK_URL']
        }

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

        try:
            response = requests.post(config['ENDPOINT'], json=order, timeout=10)
            res_data = response.json()

            if res_data.get('return_code') == 1:
                return {
                    "payment_url": res_data.get('order_url'),
                    "qr_code_base64": generate_qr_base64(res_data.get('order_url')),
                    "transaction_id": trans_id,
                    "amount": amount,
                    "method": "ZALOPAY"
                }
            else:
                error_msg = res_data.get('sub_return_message', res_data.get('return_message'))
                logger.error(f"ZaloPay tu choi: {error_msg}")
                raise ValueError(f"ZaloPay tu choi: {error_msg}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Loi ket noi ZaloPay: {e}")
            raise ValueError("Khong the ket noi ZaloPay.")

    # Xây dựng phương thức xác nhận và thẩm định an ninh cho tập gói tin (Callback/Webhook) mà hệ thống tự động của ZaloPay đệ trình khi một giao dịch đã tiến hành xong
    def verify_payment(self, request_data: dict) -> bool:
        config = settings.ZALOPAY_CONFIG

        data_str = request_data.get('data')
        request_mac = request_data.get('mac')

        if not data_str or not request_mac:
            logger.warning("ZaloPay Callback thiếu trường 'data' hoặc 'mac'.")
            return False

        mac_calculated = hmac.new(
            config['KEY2'].encode('utf-8'),
            data_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        if mac_calculated == request_mac:
            return True
        else:
            logger.warning("Cảnh báo bảo mật: Sai chữ ký ZaloPay Callback!")
            return False
