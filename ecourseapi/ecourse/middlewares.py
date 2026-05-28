import json
from urllib.parse import urlencode
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.http import QueryDict

class OAuth2InjectCredentialsMiddleware(MiddlewareMixin):
    """
    Middleware này dùng để tự động chèn (inject) thông tin client_id và client_secret 
    vào các request xin cấp token của OAuth2 (/o/token/) nếu client chưa gửi kèm.
    Mục đích: Giúp client (mobile/web frontend) không cần phải tự gửi client_secret bảo mật lên, 
    backend sẽ tự động gán thông tin này từ file cấu hình (settings.py).
    """
    def process_request(self, request):
        # Chỉ can thiệp vào endpoint cấp token và phương thức POST
        if request.path == '/o/token/' and request.method == 'POST':
            
            # Trường hợp 1: Request gửi lên dữ liệu dưới định dạng JSON
            if request.content_type == 'application/json':
                try:
                    # Chuyển đổi dữ liệu JSON từ request body sang dictionary
                    data = json.loads(request.body)
                    
                    # Nếu chưa có client_id, tự động lấy client_id và client_secret từ settings
                    if 'client_id' not in data:
                        data['client_id'] = getattr(settings, 'OAUTH2_CLIENT_ID', '')
                        data['client_secret'] = getattr(settings, 'OAUTH2_CLIENT_SECRET', '')
                    
                    # Vì thư viện django-oauth-toolkit yêu cầu dữ liệu ở dạng x-www-form-urlencoded,
                    # nên ta cần chuyển đổi dictionary ngược lại thành chuỗi urlencoded.
                    urlencoded_data = urlencode(data)
                    request._body = urlencoded_data.encode('utf-8') # Cập nhật lại request body
                    
                    # Cập nhật lại Headers để báo cho hệ thống biết định dạng dữ liệu đã thay đổi
                    request.META['CONTENT_TYPE'] = 'application/x-www-form-urlencoded'
                    if 'HTTP_CONTENT_TYPE' in request.META:
                        request.META['HTTP_CONTENT_TYPE'] = 'application/x-www-form-urlencoded'
                    
                    # Cập nhật đối tượng request.POST để các view phía sau có thể lấy dữ liệu dễ dàng
                    request.POST = QueryDict(urlencoded_data, mutable=True)
                except Exception as e:
                    print(f"Error in OAuth2InjectCredentialsMiddleware JSON parse: {e}")
            
            # Trường hợp 2: Request gửi lên dữ liệu ở dạng Form Data thông thường (x-www-form-urlencoded)
            else:
                # Copy dữ liệu POST hiện tại để chỉnh sửa (QueryDict mặc định là immutable)
                post_data = request.POST.copy()
                
                # Kiểm tra và thêm client_id, client_secret nếu bị thiếu
                if 'client_id' not in post_data:
                    post_data['client_id'] = getattr(settings, 'OAUTH2_CLIENT_ID', '')
                    post_data['client_secret'] = getattr(settings, 'OAUTH2_CLIENT_SECRET', '')
                    request.POST = post_data # Gán lại dữ liệu POST đã chỉnh sửa
