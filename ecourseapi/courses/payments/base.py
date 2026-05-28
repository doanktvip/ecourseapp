from abc import ABC, abstractmethod


class PaymentGateway(ABC):
    @abstractmethod
    def create_payment(self, enrollment, amount: float) -> dict:
        """
        Khởi tạo giao dịch.
        Trả về dict chứa thông tin như: {'payment_url': '...', 'transaction_id': '...'}
        """
        pass

    @abstractmethod
    def verify_payment(self, request_data: dict) -> bool:
        """
        Xác thực Webhook/IPN trả về từ đối tác.
        Trả về True nếu hợp lệ, False nếu sai chữ ký/dữ liệu.
        """
        pass
