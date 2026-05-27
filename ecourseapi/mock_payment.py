import hmac
import hashlib
import json
import requests
import sys
import os
from dotenv import load_dotenv

load_dotenv()

def mock_momo_success(order_id, amount):
    print(f"Đang giả lập MoMo Success cho Order: {order_id}")
    access_key = os.getenv('MOMO_ACCESS_KEY', '')
    secret_key = os.getenv('MOMO_SECRET_KEY', '')
    partner_code = os.getenv('MOMO_PARTNER_CODE', '')
    base_domain = os.getenv('BASE_DOMAIN', 'http://localhost:8000')
    
    # Dữ liệu giả lập khớp với cấu trúc MoMo IPN
    data = {
        "partnerCode": partner_code,
        "orderId": order_id,
        "requestId": order_id,
        "amount": int(amount),
        "orderInfo": "Mock payment",
        "orderType": "momo_wallet",
        "transId": "123456789",
        "resultCode": 0,
        "message": "Successful",
        "payType": "qr",
        "responseTime": "2024-05-14 12:00:00",
        "extraData": "",
        "accessKey": access_key
    }

    # Tính chữ ký
    raw_signature = (
        f"accessKey={access_key}&amount={data['amount']}&extraData={data['extraData']}"
        f"&message={data['message']}&orderId={data['orderId']}&orderInfo={data['orderInfo']}"
        f"&orderType={data['orderType']}&partnerCode={data['partnerCode']}&payType={data['payType']}"
        f"&requestId={data['requestId']}&responseTime={data['responseTime']}&resultCode={data['resultCode']}"
        f"&transId={data['transId']}"
    )
    
    signature = hmac.new(
        secret_key.encode('utf-8'),
        raw_signature.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    data["signature"] = signature
    
    url = f"{base_domain}/webhooks/momo/"
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

def mock_zalopay_success(app_trans_id, amount):
    print(f"--- Đang giả lập ZaloPay Success cho Order: {app_trans_id} ---")
    key2 = os.getenv('ZALOPAY_KEY2', '')
    base_domain = os.getenv('BASE_DOMAIN', 'http://localhost:8000')
    
    # Dữ liệu trong trường 'data' của ZaloPay
    callback_data = {
        "app_id": int(os.getenv('ZALOPAY_APP_ID', 0)),
        "app_trans_id": app_trans_id,
        "app_time": 123456789,
        "app_user": "user123",
        "amount": int(amount),
        "embed_data": "{}",
        "item": "[]",
        "zp_trans_id": "987654321",
        "server_time": 123456789,
        "channel": 1,
        "merchant_user_id": "user123",
        "user_fee_amount": 0,
        "discount_amount": 0
    }
    
    data_str = json.dumps(callback_data, separators=(',', ':'))
    
    # Tính MAC bằng Key 2
    mac = hmac.new(
        key2.encode('utf-8'),
        data_str.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    payload = {
        "data": data_str,
        "mac": mac,
        "type": 1
    }
    
    url = f"{base_domain}/webhooks/zalopay/"
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Cách sử dụng: python mock_payment.py <momo|zalopay> <transaction_id> <amount>")
    else:
        method = sys.argv[1].lower()
        t_id = sys.argv[2]
        amt = sys.argv[3]
        
        if method == "momo":
            mock_momo_success(t_id, amt)
        elif method == "zalopay":
            mock_zalopay_success(t_id, amt)
        else:
            print("Phương thức không hợp lệ (momo hoặc zalopay)")
