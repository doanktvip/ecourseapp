import json
from urllib.parse import urlencode
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.http import QueryDict

class OAuth2InjectCredentialsMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Intercept POST requests to the /o/token/ endpoint
        if request.path == '/o/token/' and request.method == 'POST':
            # Case 1: application/json body (React Native default Axios content-type)
            if request.content_type == 'application/json':
                try:
                    data = json.loads(request.body)
                    
                    # Inject OAUTH2 client credentials if not present in the body
                    if 'client_id' not in data:
                        data['client_id'] = getattr(settings, 'OAUTH2_CLIENT_ID', '')
                        data['client_secret'] = getattr(settings, 'OAUTH2_CLIENT_SECRET', '')
                    
                    # Convert parsed data to standard URL-encoded query string
                    urlencoded_data = urlencode(data)
                    request._body = urlencoded_data.encode('utf-8')
                    
                    # Rewrite the Content-Type header in request.META so oauthlib parses it as urlencoded form
                    request.META['CONTENT_TYPE'] = 'application/x-www-form-urlencoded'
                    if 'HTTP_CONTENT_TYPE' in request.META:
                        request.META['HTTP_CONTENT_TYPE'] = 'application/x-www-form-urlencoded'
                    
                    # Re-populate request.POST for Django view compatibility
                    request.POST = QueryDict(urlencoded_data, mutable=True)
                except Exception as e:
                    print(f"Error in OAuth2InjectCredentialsMiddleware JSON parse: {e}")
            
            # Case 2: standard application/x-www-form-urlencoded
            else:
                post_data = request.POST.copy()
                if 'client_id' not in post_data:
                    post_data['client_id'] = getattr(settings, 'OAUTH2_CLIENT_ID', '')
                    post_data['client_secret'] = getattr(settings, 'OAUTH2_CLIENT_SECRET', '')
                    request.POST = post_data
