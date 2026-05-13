from courses.payments.base import PaymentGateway


class CashPayment(PaymentGateway):
    def create_payment(self, enrollment, amount: float) -> dict:
        transaction_id = f"CASH_{enrollment.id}"

        return {
            "payment_url": None,
            "transaction_id": transaction_id,
            "method": "CASH",
            "message": "Vui lòng đến trực tiếp quầy để nộp tiền hoặc chuyển khoản thủ công vào STK: 123456789 (Vietcombank) với nội dung: {}".format(
                transaction_id)
        }

    def verify_payment(self, request_data: dict) -> bool:
        return False