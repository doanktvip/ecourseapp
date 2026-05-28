import re
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils.module_loading import import_string


# Validator: Kiểm tra độ dài mật khẩu (6-30 ký tự)
class PasswordLengthValidator:
    def validate(self, password, user=None):
        if len(password) < 6 or len(password) > 30:
            raise ValidationError(
                "Mật khẩu phải có độ dài từ 6 đến 30 ký tự.",
            )

    def get_help_text(self):
        return "Mật khẩu phải có độ dài từ 6 đến 30 ký tự."


# Validator: Kiểm tra mật khẩu không chứa khoảng trắng
class PasswordWhitespaceValidator:
    def validate(self, password, user=None):
        if re.search(r'\s', password):
            raise ValidationError(
                "Mật khẩu không được chứa khoảng trắng.",
            )

    def get_help_text(self):
        return "Mật khẩu không được chứa khoảng trắng."


# Validator: Kiểm tra mật khẩu không chứa tiếng Việt có dấu/ký tự đặc biệt lạ
class PasswordAsciiValidator:
    def validate(self, password, user=None):
        if not password.isascii():
            raise ValidationError(
                "Mật khẩu không được chứa ký tự tiếng Việt có dấu hoặc ký tự đặc biệt lạ.",
            )

    def get_help_text(self):
        return "Mật khẩu không được chứa ký tự tiếng Việt có dấu."


# Validator: Kiểm tra độ dài username (6-30 ký tự)
class UsernameLengthValidator:
    def validate(self, username, user=None):
        if len(username) < 6 or len(username) > 30:
            raise ValidationError("Tên đăng nhập phải có độ dài từ 6 đến 30 ký tự.")

    def get_help_text(self):
        return "Tên đăng nhập phải có độ dài từ 6 đến 30 ký tự."


# Validator: Kiểm tra username không chứa khoảng trắng
class UsernameWhitespaceValidator:
    def validate(self, username, user=None):
        if re.search(r'\s', username):
            raise ValidationError("Tên đăng nhập không được chứa khoảng trắng.")

    def get_help_text(self):
        return "Tên đăng nhập không được chứa khoảng trắng."


# Validator: Kiểm tra username không chứa tiếng Việt có dấu
class UsernameAsciiValidator:
    def validate(self, username, user=None):
        if not username.isascii():
            raise ValidationError("Tên đăng nhập không được chứa ký tự tiếng Việt có dấu.")

    def get_help_text(self):
        return "Tên đăng nhập không được chứa ký tự tiếng Việt có dấu."


# Hàm gọi các Validator Custom cho Username được định nghĩa trong settings
def validate_custom_username(value, serializer_instance=None):
    validators_config = getattr(settings, 'CUSTOM_USERNAME_VALIDATORS', [])

    user = None
    if serializer_instance and hasattr(serializer_instance, 'context'):
        request = serializer_instance.context.get('request')
        if request and request.user and request.user.is_authenticated:
            user = request.user

    for config in validators_config:
        validator_class = import_string(config['NAME'])
        validator_instance = validator_class()

        validator_instance.validate(value, user=user)
