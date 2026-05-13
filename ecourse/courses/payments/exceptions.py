class PaymentException(Exception):
    pass

class PaymentSignatureError(PaymentException):
    """Lỗi sai chữ ký (Signature) khi verify webhook"""
    pass

class PaymentAPIError(PaymentException):
    """Lỗi khi gọi API sang đối tác (timeout, sai tham số...)"""
    pass