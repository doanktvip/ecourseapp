from courses.models import Payment
from courses.payments.providers.momo import MoMoPayment
from courses.payments.providers.zalopay import ZaloPayPayment
from courses.payments.providers.stripe import StripePayment
from courses.payments.providers.paypal import PayPalPayment
from courses.payments.providers.cash import CashPayment

class PaymentFactory:
    _gateways = {
        Payment.Method.MOMO: MoMoPayment,
        Payment.Method.ZALOPAY: ZaloPayPayment,
        Payment.Method.STRIPE: StripePayment,
        Payment.Method.PAYPAL: PayPalPayment,
        Payment.Method.CASH: CashPayment,
    }

    @staticmethod
    def get_payment_gateway(method_name: str):
        gateway_class = PaymentFactory._gateways.get(method_name)
        if not gateway_class:
            raise ValueError(f"Phương thức thanh toán {method_name} không được hỗ trợ.")
        return gateway_class()