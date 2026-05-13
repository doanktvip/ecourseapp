# Hướng dẫn Kiểm thử Thanh toán (Sandbox / Tiền ảo) bằng Postman

Tài liệu này hướng dẫn bạn cách sử dụng Postman và môi trường Sandbox của các đối tác thanh toán để thực hiện giao dịch bằng "tiền ảo", giúp bạn kiểm tra toàn bộ luồng thanh toán mà không tốn tiền thật.

---

## BƯỚC 1: CHUẨN BỊ (Lấy Token & Tạo đơn hàng)

Trước khi thanh toán, bạn cần đăng ký một khóa học để hệ thống sinh ra một bản ghi `Payment` với trạng thái `is_successful = False`.

### 1.1. Lấy Access Token (Student)
- **Endpoint**: `POST /o/token/` (hoặc endpoint đăng nhập tương ứng của bạn)
- **Body** (form-data):
  - `client_id`: (từ hệ thống)
  - `client_secret`: (từ hệ thống)
  - `grant_type`: `password`
  - `username`: `student1`
  - `password`: `123456`
- **Kết quả**: Bạn copy giá trị `access_token` để bỏ vào tab **Authorization (Bearer Token)** cho các API bên dưới.

### 1.2. Đăng ký khóa học (Tạo Payment)
- **Endpoint**: `POST /courses/{course_id}/enrolls/`
- **Headers**: Authorization: Bearer `<token>`
- **Kết quả**: API sẽ trả về thông tin đăng ký cùng ID của `Payment`. Bạn cần gọi API lấy chi tiết hoặc xem trong DB để lấy **Payment ID**.

---

## BƯỚC 2: KHỞI TẠO GIAO DỊCH (PROCESS PAYMENT)

Dùng API này để chọn phương thức thanh toán và lấy Link thanh toán (Payment URL).

- **Endpoint**: `POST /payments/{payment_id}/process/`
- **Headers**: Authorization: Bearer `<student_token>`
- **Body** (JSON):
```json
{
    "payment_method": "MOMO" // Thay bằng: ZALOPAY, STRIPE, PAYPAL
}
```
- **Kết quả trả về**:
```json
{
    "payment_url": "https://test-payment.momo.vn/...",
    "transaction_id": "c1f2-...",
    "method": "MOMO"
}
```

---

## BƯỚC 3: THỰC HIỆN THANH TOÁN (BẰNG TIỀN ẢO)

Có 2 cách để test việc thanh toán thành công:

### CÁCH 1: Test Thực tế qua Sandbox (Khuyên dùng)
Cách này mô phỏng y hệt thao tác của người dùng thực.

**1. STRIPE (Thẻ tín dụng ảo)**
- Mở link `payment_url` thu được ở Bước 2 lên trình duyệt.
- Nhập thẻ test của Stripe:
  - **Số thẻ:** `4242 4242 4242 4242`
  - **MM/YY:** Bất kỳ ngày nào trong tương lai (vd: `12/30`)
  - **CVC:** `123`
- Ấn Pay. Hệ thống sẽ tự bắn Webhook về ngrok của bạn để cập nhật trạng thái.

**2. PAYPAL (Tài khoản ảo)**
- Mở link `payment_url` thu được ở Bước 2.
- Đăng nhập bằng tài khoản **Personal Sandbox** (Bạn có thể tạo trong `developer.paypal.com` > Accounts).
- Nhấn "Pay Now". Hệ thống sẽ redirect về web của bạn kèm token và xác nhận thành công.

**3. MOMO (App Tiền ảo MoMo)**
- Bạn cần tải app **MoMo Sandbox** (apk cho Android hoặc qua TestFlight cho iOS).
- Sử dụng tài khoản test do MoMo cấp (Xem trong Business Dashboard MoMo).
- Quét mã QR trên `payment_url` bằng app MoMo Sandbox. Máy chủ MoMo sẽ tự động gọi IPN về.

**4. ZALOPAY (App Tiền ảo ZaloPay)**
- Tương tự MoMo, tải app **ZaloPay Sandbox**.
- Quét mã QR trên `payment_url`.

---

### CÁCH 2: Test giả lập Webhook bằng Postman (Không cần mở trình duyệt)

Nếu bạn không muốn quét mã hay dùng thẻ ảo, bạn có thể **dùng Postman bắn thẳng request IPN/Webhook** vào hệ thống của bạn để giả lập đối tác thanh toán báo về.

Tuy nhiên, vì các hệ thống có tính năng bảo mật HMAC SHA256 (kiểm tra chữ ký), bạn không thể tự gõ bừa dữ liệu JSON được. Dưới đây là cách thực hiện cho từng loại:

#### 1. Thanh toán Tiền Mặt (CASH)
Đây là cách đơn giản nhất, không cần Webhook. Admin/Giảng viên thu tiền mặt xong sẽ tự xác nhận.
- **Endpoint**: `POST /payments/{payment_id}/confirm_cash/`
- **Headers**: Authorization: Bearer `<instructor_or_admin_token>`
- **Kết quả**: Giao dịch thành công, khóa học được mở.

#### 2. Stripe Webhook
Stripe kiểm tra chữ ký raw. Bạn nên dùng công cụ **Stripe CLI** để giả lập thay vì dùng Postman:
1. Tải Stripe CLI.
2. Login: `stripe login`
3. Lắng nghe server local của bạn: `stripe listen --forward-to localhost:8000/payments/stripe-webhook/`
4. Mở 1 terminal khác, bắn event ảo: `stripe trigger checkout.session.completed`

#### 3. MoMo IPN
Để giả lập MoMo IPN qua Postman, bạn cần gửi một request có `signature` khớp với dữ liệu. 
Vì dữ liệu thay đổi theo từng đơn hàng (khác `orderId`, `amount`), tôi đã viết một đoạn script Python nhỏ để bạn chạy. Nó sẽ tự in ra Body JSON hợp lệ cho Postman.

**Bước 1:** Tạo file `generate_momo_mock.py` ở máy bạn:
```python
import hmac, hashlib
# Giả sử cấu hình MoMo của bạn (Lấy trong settings.py)
ACCESS_KEY = "MOMO_ACCESS_KEY"
SECRET_KEY = "MOMO_SECRET_KEY"
PARTNER_CODE = "MOMO_PARTNER_CODE"

amount = 500000
order_id = "đIỀN_TRANSACTION_ID_Ở_BƯỚC_PROCESS_VÀO_ĐÂY"
request_id = "test-req-123"

# Raw data giả lập y hệt MoMo gửi về
raw_data = (
    f"accessKey={ACCESS_KEY}"
    f"&amount={amount}"
    f"&extraData="
    f"&message=Success"
    f"&orderId={order_id}"
    f"&orderInfo=Test"
    f"&orderType=momo_wallet"
    f"&partnerCode={PARTNER_CODE}"
    f"&payType=qr"
    f"&requestId={request_id}"
    f"&responseTime=1640000000"
    f"&resultCode=0"
    f"&transId=1234567890"
)

signature = hmac.new(
    SECRET_KEY.encode('utf-8'),
    raw_data.encode('utf-8'),
    hashlib.sha256
).hexdigest()

print(f"""
COPY CHUỖI JSON SAU VÀO BODY CỦA POSTMAN:
{{
    "partnerCode": "{PARTNER_CODE}",
    "orderId": "{order_id}",
    "requestId": "{request_id}",
    "amount": {amount},
    "orderInfo": "Test",
    "orderType": "momo_wallet",
    "transId": 1234567890,
    "resultCode": 0,
    "message": "Success",
    "payType": "qr",
    "responseTime": 1640000000,
    "extraData": "",
    "signature": "{signature}"
}}
""")
```
**Bước 2:** Chạy file trên để lấy JSON.
**Bước 3:** Mở Postman
- **Endpoint**: `POST /payments/momo-ipn/` (Nhớ là link ngrok hoặc localhost)
- **Body**: Raw -> JSON (Dán đoạn JSON vừa generate)
- **Kết quả**: HTTP 204 No Content -> Thanh toán thành công!

#### 4. ZaloPay Callback
Tương tự MoMo, bạn dùng script Python để generate chữ ký cho ZaloPay.

```python
import hmac, hashlib, json

KEY2 = "ZALOPAY_KEY_2_CỦA_BẠN"
app_trans_id = "ĐIỀN_TRANSACTION_ID_CỦA_ZALOPAY_Ở_BƯỚC_PROCESS"
amount = 500000

# Tạo cục data bên trong
data_obj = {
    "app_id": 2553,
    "app_trans_id": app_trans_id,
    "app_time": 1640000000,
    "app_user": "user123",
    "amount": amount,
    "embed_data": "{}",
    "item": "[]",
    "zp_trans_id": 987654321,
    "server_time": 1640000000,
    "channel": 38,
    "merchant_user_id": "user123",
    "zp_user_id": "zp123",
    "user_fee_amount": 0,
    "discount_amount": 0
}

data_str = json.dumps(data_obj, separators=(',', ':'))

mac = hmac.new(KEY2.encode('utf-8'), data_str.encode('utf-8'), hashlib.sha256).hexdigest()

print(f"""
COPY CHUỖI JSON SAU VÀO BODY CỦA POSTMAN:
{{
    "data": '{data_str}',
    "mac": "{mac}",
    "type": 1
}}
""")
```
*Lưu ý: Chú ý cái nháy đơn ở trường `"data"`. Hãy in ra JSON từ script và paste đúng cấu trúc vào body.*
- **Endpoint**: `POST /payments/zalopay-callback/`
- **Body**: Raw -> JSON
- **Kết quả**: Trả về `{"return_code": 1, "return_message": "success"}` -> Thành công!

---

## KIỂM TRA LẠI KẾT QUẢ
Sau khi thanh toán thành công (Bằng Cách 1 hoặc Cách 2), dùng Postman gọi lại:
- **Endpoint**: `GET /courses/{course_id}/enrolls/{enroll_id}/` (hoặc kiểm tra lại trong `GET /payments/`)
- Nếu thấy `is_successful: true` và course được unlock, tức là API hoạt động hoàn hảo.
