import os
import django
import secrets

# 1. Cấu hình môi trường Django
# Thay 'ecourse.settings' bằng tên thư mục chứa file settings.py của bạn nếu khác
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecourse.settings')
django.setup()

from oauth2_provider.models import Application
from django.contrib.auth import get_user_model


def create_oauth_app():
    User = get_user_model()

    # 2. Tìm tài khoản Admin để gán quyền sở hữu App
    admin_user = User.objects.filter(is_superuser=True).first()

    if not admin_user:
        print("❌ Lỗi: Không tìm thấy tài khoản Superuser nào.")
        print("Vui lòng chạy lệnh: python manage.py createsuperuser trước.")
        return

    # 3. Tạo mã Secret ngẫu nhiên (chưa bị băm)
    plain_text_secret = secrets.token_hex(32)

    # 4. Tạo Application trong Database
    app = Application.objects.create(
        user=admin_user,
        client_type=Application.CLIENT_CONFIDENTIAL,
        authorization_grant_type=Application.GRANT_PASSWORD,
        name=f'Postman App {secrets.token_hex(2)}',
        client_secret=plain_text_secret  # Django sẽ tự băm khi lưu, nhưng ta đã có biến plain_text_secret
    )

    print("\n" + "=" * 50)
    print("🚀 TẠO APPLICATION THÀNH CÔNG!")
    print("=" * 50)
    print(f"🔹 Client ID:     {app.client_id}")
    print(f"🔹 Client Secret: {plain_text_secret}")
    print("=" * 50)
    print("👉 Hãy copy 2 mã trên dán vào Postman ngay.")
    print("👉 Lưu ý: Mã Secret này chỉ hiện ra 1 lần duy nhất này thôi!")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    try:
        create_oauth_app()
    except Exception as e:
        print(f"❌ Có lỗi xảy ra: {e}")