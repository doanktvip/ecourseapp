from courses.payments.base import PaymentGateway
from ecourse import settings


class CashPayment(PaymentGateway):
    def create_payment(self, enrollment, amount: float) -> dict:
        config = settings.CASH_CONFIG
        transaction_id = f"CASH_{enrollment.course.id}_{enrollment.student.id}"

        return {
            "payment_url": None,
            "transaction_id": transaction_id,
            "method": "CASH",
            "message": f"Vui lòng đến trực tiếp quầy để nộp tiền hoặc chuyển khoản thủ công vào STK: {config['BANK_ACCOUNT']} ({config['BANK_NAME']}) người nhận {config['ACCOUNT_NAME']} với nội dung: {transaction_id}"
        }

    def verify_payment(self, request_data: dict) -> bool:
        return False
