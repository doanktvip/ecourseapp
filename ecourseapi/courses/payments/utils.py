import qrcode
import base64
from io import BytesIO

def generate_qr_base64(url: str) -> str:
    """
    Tạo mã QR từ một đường link (URL) và trả về dưới dạng chuỗi Base64
    để frontend có thể nhúng trực tiếp vào thẻ <img src="...">
    """
    if not url:
        return ""
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    # Lưu ảnh vào bộ nhớ đệm (buffer)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    
    # Mã hóa sang Base64
    img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    return f"data:image/png;base64,{img_str}"
