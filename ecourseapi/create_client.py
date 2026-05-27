import os
import django
import secrets

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecourse.settings')
django.setup()

from oauth2_provider.models import Application
from django.contrib.auth import get_user_model


def update_env_file(client_id, client_secret):
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    
    if not os.path.exists(env_path):
        print(f"⚠️ Cảnh báo: Không tìm thấy tệp {env_path}. Sẽ tạo tệp mới.")
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(f"OAUTH2_CLIENT_ID={client_id}\n")
            f.write(f"OAUTH2_CLIENT_SECRET={client_secret}\n")
        return
        
    with open(env_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    client_id_exists = False
    client_secret_exists = False
    
    new_lines = []
    for line in lines:
        if line.strip().startswith('OAUTH2_CLIENT_ID='):
            new_lines.append(f"OAUTH2_CLIENT_ID={client_id}\n")
            client_id_exists = True
        elif line.strip().startswith('OAUTH2_CLIENT_SECRET='):
            new_lines.append(f"OAUTH2_CLIENT_SECRET={client_secret}\n")
            client_secret_exists = True
        else:
            new_lines.append(line)
            
    if not client_id_exists:
        new_lines.append(f"OAUTH2_CLIENT_ID={client_id}\n")
    if not client_secret_exists:
        new_lines.append(f"OAUTH2_CLIENT_SECRET={client_secret}\n")
        
    with open(env_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("[ENV] Tu dong cap nhat tep .env thanh cong!")

    # Tu dong trigger reload server Django bang cach cap nhat mtime cua settings.py
    try:
        settings_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ecourse', 'settings.py')
        if os.path.exists(settings_path):
            os.utime(settings_path, None)
            print("[DEV] Da touch settings.py de tu dong tai lai may chu Django!")
    except Exception as e:
        pass


def create_oauth_app():
    User = get_user_model()

    # 2. Tìm tài khoản Admin để gán quyền sở hữu App
    admin_user = User.objects.filter(is_superuser=True).first()

    if not admin_user:
        print("[ERROR] Khong tim thay tai khoan Superuser nao.")
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
    print("[SUCCESS] TAO APPLICATION THANH CONG!")
    print("=" * 50)
    print(f"Client ID:     {app.client_id}")
    print(f"Client Secret: {plain_text_secret}")
    print("=" * 50)
    
    # Tự động cập nhật file .env
    try:
        update_env_file(app.client_id, plain_text_secret)
    except Exception as e:
        print(f"[WARNING] Khong the cap nhat file .env: {e}")
        
    print("=" * 50 + "\n")


def update_mobile_env():
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
        
    mobile_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ecoursemobile', '.env'))
    base_url = f"http://{ip}:8000"
    
    print("\n" + "=" * 50)
    print(f"[IP DETECT] Da phat hien IP LAN cua may tinh: {ip}")
    print("=" * 50)
    
    # Tao thu muc cha neu chua co
    os.makedirs(os.path.dirname(mobile_env_path), exist_ok=True)
    
    lines = []
    if os.path.exists(mobile_env_path):
        try:
            with open(mobile_env_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        except Exception:
            pass
            
    base_url_exists = False
    new_lines = []
    for line in lines:
        if line.strip().startswith('EXPO_PUBLIC_BASE_URL='):
            new_lines.append(f"EXPO_PUBLIC_BASE_URL={base_url}\n")
            base_url_exists = True
        else:
            new_lines.append(line)
            
    if not base_url_exists:
        new_lines.append(f"EXPO_PUBLIC_BASE_URL={base_url}\n")
        
    try:
        with open(mobile_env_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"[SUCCESS] Tu dong cap nhat EXPO_PUBLIC_BASE_URL={base_url} vao file .env cua Mobile!")
    except Exception as e:
        print(f"[ERROR] Khong the cap nhat file .env cua Mobile: {e}")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    try:
        create_oauth_app()
        update_mobile_env()
    except Exception as e:
        print(f"[ERROR] Co loi xay ra: {e}")