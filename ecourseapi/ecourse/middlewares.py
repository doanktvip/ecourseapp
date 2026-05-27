import json
from urllib.parse import urlencode
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.http import QueryDict

class OAuth2InjectCredentialsMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path == '/o/token/' and request.method == 'POST':
            if request.content_type == 'application/json':
                try:
                    data = json.loads(request.body)
                    
                    if 'client_id' not in data:
                        data['client_id'] = getattr(settings, 'OAUTH2_CLIENT_ID', '')
                        data['client_secret'] = getattr(settings, 'OAUTH2_CLIENT_SECRET', '')
                    
                    urlencoded_data = urlencode(data)
                    request._body = urlencoded_data.encode('utf-8')
                    
                    request.META['CONTENT_TYPE'] = 'application/x-www-form-urlencoded'
                    if 'HTTP_CONTENT_TYPE' in request.META:
                        request.META['HTTP_CONTENT_TYPE'] = 'application/x-www-form-urlencoded'
                    
                    request.POST = QueryDict(urlencoded_data, mutable=True)
                except Exception as e:
                    print(f"Error in OAuth2InjectCredentialsMiddleware JSON parse: {e}")
            
            else:
                post_data = request.POST.copy()
                if 'client_id' not in post_data:
                    post_data['client_id'] = getattr(settings, 'OAUTH2_CLIENT_ID', '')
                    post_data['client_secret'] = getattr(settings, 'OAUTH2_CLIENT_SECRET', '')
                    request.POST = post_data
