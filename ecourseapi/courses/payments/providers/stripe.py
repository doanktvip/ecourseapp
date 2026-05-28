import stripe
import logging
from ecourse import settings
from courses.payments.base import PaymentGateway

logger = logging.getLogger(__name__)


class StripePayment(PaymentGateway):

    def create_payment(self, enrollment, amount: float) -> dict:
        config = settings.STRIPE_CONFIG

        stripe.api_key = config['SECRET_KEY']

        order_info = f"Thanh toán khóa học: {enrollment.course.subject}"

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],

                line_items=[{
                    'price_data': {
                        'currency': 'vnd',
                        'product_data': {
                            'name': order_info,
                        },
                        'unit_amount': int(amount),
                    },
                    'quantity': 1,
                }],

                mode='payment',

                success_url=config['RETURN_URL'] + "?session_id={CHECKOUT_SESSION_ID}",

                cancel_url=config['CANCEL_URL'],

                client_reference_id=str(enrollment.id),
            )

            return {
                "payment_url": session.url,
                "transaction_id": session.id,
                "amount": amount,
                "method": "STRIPE"
            }

        except stripe.error.StripeError as e:
            logger.error(f"Lỗi khi gọi API Stripe: {e.user_message}")
            raise ValueError(f"Stripe từ chối: {e.user_message}")

    def verify_payment(self, request_data: dict) -> bool:
        config = settings.STRIPE_CONFIG
        stripe.api_key = config['SECRET_KEY']

        endpoint_secret = config['WEBHOOK_SECRET']

        payload = request_data.get('raw_body')
        sig_header = request_data.get('stripe_signature')

        if not payload or not sig_header:
            logger.warning("Thiếu payload hoặc signature header từ Stripe.")
            return False

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )

        except ValueError as e:
            logger.error("Stripe Webhook lỗi: Invalid payload")
            return False
        except stripe.error.SignatureVerificationError as e:
            logger.warning("Cảnh báo bảo mật: Sai chữ ký Stripe Webhook!")
            return False

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']

            if session.payment_status == 'paid':
                return True

        return False
