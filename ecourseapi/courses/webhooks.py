import json
from django.db import transaction
from rest_framework.response import Response
from rest_framework import status, views
from rest_framework.permissions import AllowAny
from courses.models import Payment
from courses.payments.factory import PaymentFactory


# Webhook xử lý phản hồi từ MoMo
class MomoWebhookView(views.APIView):
    permission_classes = [AllowAny] # Cho phép cổng thanh toán gọi API không cần token

    # Xử lý thông báo bất đồng bộ từ MoMo (Server-to-Server)
    def post(self, request):
        data = request.data
        order_id = data.get('orderId')

        if not order_id:
            return Response({"message": "Thiếu orderId"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Lock row payment để tránh conflict nếu nhận được request đồng thời
                payment = Payment.objects.select_for_update().get(transaction_id=order_id)

                if payment.is_successful:
                    return Response(status=status.HTTP_204_NO_CONTENT)

                gateway = PaymentFactory.get_payment_gateway(Payment.Method.MOMO)

                # Xác thực chữ ký
                if gateway.verify_payment(data):
                    # Kiểm tra số tiền
                    if float(data.get('amount', 0)) != float(payment.amount):
                        return Response({"message": "Số tiền thanh toán không khớp"},
                                        status=status.HTTP_400_BAD_REQUEST)

                    # Cập nhật trạng thái thành công
                    payment.is_successful = True
                    payment.save(update_fields=['is_successful'])
                    return Response(status=status.HTTP_204_NO_CONTENT)

                return Response({"message": "Xác thực chữ ký thất bại"}, status=status.HTTP_400_BAD_REQUEST)

        except Payment.DoesNotExist:
            return Response({"message": "Không tìm thấy giao dịch"}, status=status.HTTP_404_NOT_FOUND)

    # Xử lý chuyển hướng người dùng từ MoMo về (Return URL)
    def get(self, request):
        result_code = request.query_params.get('resultCode')
        message = request.query_params.get('message')

        if str(result_code) == '0':
            return Response({
                "status": "success",
                "message": "Thanh toán MoMo thành công!",
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "failed",
            "message": f"Thanh toán MoMo thất bại: {message}",
        }, status=status.HTTP_400_BAD_REQUEST)


# Webhook xử lý phản hồi từ ZaloPay
class ZaloPayWebhookView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        gateway = PaymentFactory.get_payment_gateway(Payment.Method.ZALOPAY)

        if gateway.verify_payment(request.data):
            try:
                data_str = request.data.get('data')
                cb_data = json.loads(data_str)
                app_trans_id = cb_data.get('app_trans_id')
                amount = cb_data.get('amount')

                if not app_trans_id:
                    return Response({"return_code": 0, "return_message": "Missing app_trans_id"},
                                    status=status.HTTP_200_OK)

                with transaction.atomic():
                    payment = Payment.objects.select_for_update().get(transaction_id=app_trans_id)
                    if not payment.is_successful:
                        if float(amount) != float(payment.amount):
                            return Response({"return_code": 0, "return_message": "Amount mismatch"},
                                            status=status.HTTP_200_OK)

                        payment.is_successful = True
                        payment.save(update_fields=['is_successful'])

                return Response({"return_code": 1, "return_message": "success"}, status=status.HTTP_200_OK)

            except Payment.DoesNotExist:
                return Response({"return_code": 0, "return_message": "Order not found"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"return_code": 0, "return_message": str(e)}, status=status.HTTP_200_OK)

        return Response({"return_code": -1, "return_message": "mac not equal"}, status=status.HTTP_200_OK)

    def get(self, request):
        status_code = request.query_params.get('status')

        if str(status_code) == '1':
            return Response({
                "status": "success",
                "message": "Thanh toán ZaloPay thành công!",
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "failed",
            "message": "Thanh toán ZaloPay không thành công hoặc đã bị hủy.",
        }, status=status.HTTP_400_BAD_REQUEST)


# Webhook xử lý phản hồi từ Stripe
class StripeWebhookView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        request_data = {
            'raw_body': payload,
            'stripe_signature': sig_header
        }

        gateway = PaymentFactory.get_payment_gateway(Payment.Method.STRIPE)

        if gateway.verify_payment(request_data):
            event = json.loads(payload)
            if event['type'] == 'checkout.session.completed':
                session_id = event['data']['object']['id']
                try:
                    with transaction.atomic():
                        payment = Payment.objects.select_for_update().get(transaction_id=session_id)
                        if not payment.is_successful:
                            payment.is_successful = True
                            payment.save(update_fields=['is_successful'])
                except Payment.DoesNotExist:
                    pass

        return Response(status=status.HTTP_200_OK)

    def get(self, request):
        return Response({
            "status": "success",
            "message": "Giao dịch Stripe đã hoàn tất. Đang chờ xác nhận từ hệ thống.",
        }, status=status.HTTP_200_OK)


# Webhook xử lý phản hồi từ PayPal
class PayPalWebhookView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        return self._process_paypal(request)

    def get(self, request):
        return self._process_paypal(request)

    def _process_paypal(self, request):
        token = request.query_params.get('token') or request.data.get('token')

        if not token:
            return Response({"detail": "Thiếu mã xác thực (token)."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                payment = Payment.objects.select_for_update().get(transaction_id=token)

                if payment.is_successful:
                    return Response({"message": "Đơn hàng đã được thanh toán."}, status=status.HTTP_200_OK)

                gateway = PaymentFactory.get_payment_gateway(Payment.Method.PAYPAL)

                if gateway.verify_payment({'token': token}):
                    payment.is_successful = True
                    payment.save(update_fields=['is_successful'])
                    return Response({
                        "status": "success",
                        "message": "Thanh toán PayPal thành công!",
                    }, status=status.HTTP_200_OK)

                return Response({
                    "status": "failed",
                    "message": "Giao dịch PayPal thất bại hoặc chưa được phê duyệt.",
                }, status=status.HTTP_400_BAD_REQUEST)

        except Payment.DoesNotExist:
            return Response({"detail": "Không tìm thấy giao dịch."}, status=status.HTTP_404_NOT_FOUND)
