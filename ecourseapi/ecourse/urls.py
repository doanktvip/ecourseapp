from django.contrib import admin
from django.urls import path, include, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

from courses.admin import admin_site

# Cấu hình giao diện Swagger/ReDoc để xem tài liệu API
schema_view = get_schema_view(
    openapi.Info(
        title="Course API",
        default_version='v1',
        description="APIs for CourseApp",
        contact=openapi.Contact(email="2351050031doan@ou.edu.vn"),
        license=openapi.License(name="Nguyễn Văn Đoàn"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # Gọi các URL của app courses (chứa logic chính)
    path('', include('courses.urls')),
    
    # Giao diện Admin tuỳ chỉnh
    path('admin/', admin_site.urls),
    
    # URL cho ứng dụng tải ảnh lên CKEditor
    re_path(r'^ckeditor/', include('ckeditor_uploader.urls')),
    
    # Các đường dẫn tới tài liệu API (Swagger & Redoc)
    re_path(r'^swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0),
            name='schema-json'),
    re_path(r'^swagger/$',
            schema_view.with_ui('swagger', cache_timeout=0),
            name='schema-swagger-ui'),
    re_path(r'^redoc/$',
            schema_view.with_ui('redoc', cache_timeout=0),
            name='schema-redoc'),
            
    # Các API liên quan tới việc cấp quyền OAuth2 (lấy token, làm mới token)
    path('o/', include('oauth2_provider.urls',
                       namespace='oauth2_provider'))
]
