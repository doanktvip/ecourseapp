import json
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth, TruncYear, TruncQuarter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework import mixins, request
from rest_framework import viewsets, generics, filters, parsers, status, permissions
from rest_framework.permissions import AllowAny
from courses.filters import ApplicationFilter, CourseFilter, LessonFilter
from courses.models import (Course, Category, User, InstructorApplication, Lesson, Tag, Enrollment, Payment,
                            LessonProgress, Comment, Like)
from courses import serializers, paginators, perms
from rest_framework.response import Response
from courses.payments.factory import PaymentFactory
from django.core.exceptions import ValidationError as DjangoValidationError


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer


class CourseViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin,
                    mixins.UpdateModelMixin, mixins.DestroyModelMixin):
    queryset = Course.objects.filter(active=True)
    pagination_class = paginators.ItemPaginator
    http_method_names = ['get', 'post', 'patch', 'head', 'options', 'delete']
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = CourseFilter
    search_fields = ['subject']
    ordering_fields = ['id']

    def get_permissions(self):
        if self.action in ['create']:
            return [perms.IsInstructor()]

        if self.action in ['partial_update', 'destroy', 'students']:
            return [perms.IsCourseOwner()]

        if self.action == 'lessons':
            if self.request.method == 'POST':
                return [perms.IsCourseOwner()]
            return [perms.IsEnrolled()]

        if self.action == 'enrolls':
            return [perms.IsStudent()]

        if self.action == 'reviews' and self.request.method == 'POST':
            return [perms.IsStudent()]

        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action in ['retrieve', 'partial_update']:
            return serializers.CourseDetailSerializer
        if self.action == 'reviews':
            return serializers.CourseReviewSerializer

        return serializers.CourseSerializer

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    def perform_destroy(self, instance):
        instance.active = False
        instance.save()

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(f"Xóa khóa học bị lỗi: {str(e)}")
            return Response({"detail": "Lỗi hệ thống khi vô hiệu hóa khóa học."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['get'], detail=False, url_path='compare')
    def compare(self, request):
        if 'ids' not in request.query_params:
            return Response({"error": "Vui lòng cung cấp danh sách ids cần so sánh"},
                            status=status.HTTP_400_BAD_REQUEST)

        courses = self.filter_queryset(self.get_queryset())

        if not courses.exists():
            return Response({"message": "Không tìm thấy khóa học nào khớp với các ids đã cho."},
                            status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get', 'post'], detail=True, url_path='lessons')
    def lessons(self, request, pk=None):
        course = self.get_object()
        if request.method == 'GET':
            lessons = course.lessons.filter(active=True)
            filtered_lessons = LessonFilter(request.GET, queryset=lessons).qs
            page = self.paginate_queryset(filtered_lessons)
            if page is not None:
                serializer = serializers.LessonSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = serializers.LessonSerializer(filtered_lessons, many=True)
            return Response({
                "count": filtered_lessons.count(),
                "next": None,
                "previous": None,
                "results": serializer.data
            }, status=status.HTTP_200_OK)
        if request.method == 'POST':
            serializer = serializers.LessonSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save(course=course)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=True, url_path='enrolls')
    def enrolls(self, request, pk=None):
        course = self.get_object()
        user = request.user

        if Enrollment.objects.filter(student=user, course=course).exists():
            return Response({"detail": "Bạn đã đăng ký khóa học này rồi."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            enrollment = Enrollment.objects.create(student=user, course=course)

            if course.fee == 0:
                Payment.objects.create(enrollment=enrollment, amount=0, payment_method=Payment.Method.CASH,
                                       is_successful=True, transaction_id=f"FREE_{user.id}_{course.id}")
            else:
                Payment.objects.create(enrollment=enrollment, amount=course.fee, is_successful=False,
                                       payment_method=None)

        return Response(serializers.EnrollmentDetailSerializer(enrollment).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], detail=True, url_path=r'enrolls/(?P<enroll_id>\d+)')
    def enroll_detail(self, request, pk=None, enroll_id=None):
        enrollment = get_object_or_404(Enrollment, pk=enroll_id, course_id=pk)
        serializer = serializers.EnrollmentDetailSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=True, url_path='students')
    def students(self, request, pk=None):
        course = self.get_object()
        enrollments = Enrollment.objects.filter(course=course, payment__is_successful=True)

        serializer = serializers.EnrollmentDetailSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    @action(methods=['get', 'post'], detail=True, url_path='reviews')
    def reviews(self, request, pk):
        if request.method.__eq__('GET'):
            # Lấy khóa học hiện tại
            course = self.get_object()
            reviews = course.reviews.filter(active=True).order_by('-created_date')
            # Phân trang
            p = paginators.CourseReviewPaginator()
            page = p.paginate_queryset(reviews, request)

            if page is not None:
                serializer = serializers.CourseReviewSerializer(page, many=True)
                return p.get_paginated_response(serializer.data)

            return Response(serializers.CourseReviewSerializer(reviews, many=True).data, status=status.HTTP_200_OK)

        if request.method.__eq__('POST'):
            course = self.get_object()
            # thuộc tính course chỉ cho phép đọc nên phải gán dl qua biến khác
            data = request.data.copy()
            data['course'] = course.id

            serializer = serializers.CourseReviewSerializer(data=data)
            if serializer.is_valid():
                try:
                    # Lưu review
                    review = serializer.save(user=request.user)
                    return Response(serializers.CourseReviewSerializer(review).data, status=status.HTTP_201_CREATED)

                # Không đủ tiến độ để review
                except DjangoValidationError as e:
                    return Response({"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST)

            # Lỗi sai định dạng dữ liệu (vd:rating > 5)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action in ['me', 'change_password']:
            return [permissions.IsAuthenticated()]
        if self.action in ['apply_instructor', 'my_enrollments']:
            return [perms.IsStudent()]
        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='me', detail=False)
    def me(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            s = serializers.SimpleUserSerializer(u, data=request.data)
            s.is_valid(raise_exception=True)
            u = s.save()
        return Response(serializers.UserSerializer(u).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False, url_path='me/change-password')
    def change_password(self, request):

        s = serializers.ChangePasswordSerializer(data=request.data, context={'request': request})
        if s.is_valid():
            user = request.user
            user.set_password(s.validated_data['new_password'])
            user.save()
            return Response({"message": "Đổi mật khẩu thành công!"}, status=status.HTTP_200_OK)

        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get', 'post'], detail=False, url_path='me/apply', parser_classes=[parsers.MultiPartParser])
    def apply_instructor(self, request):
        application = InstructorApplication.objects.filter(user=request.user).first()

        if request.method == 'GET':
            if not application:
                return Response({"detail": "Bạn chưa nộp đơn nào."}, status=status.HTTP_404_NOT_FOUND)
            serializer = serializers.ApplySerializer(application)
            return Response(serializer.data)

        if request.method == 'POST':
            if application:
                return Response({"detail": "Bạn đã nộp đơn rồi. Trạng thái hiện tại: " + application.status},
                                status=status.HTTP_400_BAD_REQUEST)

            serializer = serializers.ApplySerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], detail=False, url_path='me/enrollments')
    def my_enrollments(self, request):
        enrollments = Enrollment.objects.filter(student=request.user)
        serializer = serializers.EnrollmentDetailSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ApplicationViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.UpdateModelMixin):
    http_method_names = ['get', 'patch', 'head', 'options']
    queryset = InstructorApplication.objects.all()
    serializer_class = serializers.ApplySerializer
    permission_classes = [perms.IsAdmin]

    filter_backends = [DjangoFilterBackend]
    filterset_class = ApplicationFilter

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()

        new_status = request.data.get('status')
        old_status = instance.status

        valid_statuses = [InstructorApplication.Status.APPROVED, InstructorApplication.Status.REJECTED]
        if new_status not in valid_statuses:
            return Response(
                {"detail": f"Trạng thái '{new_status}' không hợp lệ. Chỉ chấp nhận APPROVED hoặc REJECTED."},
                status=status.HTTP_400_BAD_REQUEST)

        if old_status != InstructorApplication.Status.PENDING:
            return Response({"detail": f"Đơn này đã được xử lý (Trạng thái hiện tại: {old_status})."},
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                updated_instance = serializer.save(status=new_status)
                if new_status == InstructorApplication.Status.APPROVED:
                    user = updated_instance.user
                    user.role = User.Role.INSTRUCTOR
                    user.save(update_fields=['role'])

                return Response(serializer.data)
        except Exception:
            return Response({"detail": "Lỗi hệ thống khi cập nhật trạng thái đơn."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LessonViewSet(viewsets.GenericViewSet, generics.RetrieveAPIView, generics.ListAPIView, mixins.UpdateModelMixin,
                    mixins.DestroyModelMixin):
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    queryset = Lesson.objects.all()
    serializer_class = serializers.LessonSerializer

    def get_permissions(self):
        if self.action in ['retrieve', 'complete']:
            return [perms.IsEnrolled()]
        if self.action in ['partial_update', 'destroy', 'add_tags']:
            return [perms.IsInstructor(), perms.IsCourseOwner()]

        if self.action == 'list':
            return [perms.IsAdmin()]

        if self.action == 'comments' and self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        if self.action == 'comments' and self.request.method == 'POST':
            return [perms.IsEnrolled()]
        if self.action == 'like':
            return [perms.IsEnrolled()]

        return [permissions.AllowAny()]

    @action(methods=['post'], detail=True, url_path='tags')
    def add_tags(self, request, pk=None):
        lesson = self.get_object()
        tags_data = request.data.get('tags')

        if not tags_data:
            return Response({"detail": "Dữ liệu tags không được để trống."},
                            status=status.HTTP_400_BAD_REQUEST)

        tags = Tag.objects.filter(id__in=tags_data)
        lesson.tags.add(*tags)

        serializer = self.get_serializer(lesson)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='complete')
    def complete(self, request, pk=None):
        lesson = self.get_object()
        enrollment = Enrollment.objects.filter(student=request.user, course=lesson.course).first()

        if not enrollment:
            return Response({"detail": "Không tìm thấy thông tin đăng ký."}, status=status.HTTP_404_NOT_FOUND)

        progress, created = LessonProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson,
                                                                 defaults={'status': LessonProgress.Status.COMPLETED})

        if not created and progress.status != LessonProgress.Status.COMPLETED:
            progress.status = LessonProgress.Status.COMPLETED
            progress.save()

        enrollment.refresh_from_db()

        return Response({"detail": "Đã đánh dấu hoàn thành bài học.",
                         "current_progress": enrollment.progress}, status=status.HTTP_200_OK)
    @action(methods=['get', 'post'], detail=True, url_path='comments')
    def comments(self, request, pk):
        if request.method.__eq__('GET'):
            comments = self.get_object().comments.select_related('user').filter(active=True)
            p = paginators.CommentPaginator()
            page = p.paginate_queryset(comments, request)

            if page is not None:
                serializer = serializers.CommentSerializer(page, many=True)
                return p.get_paginated_response(serializer.data)

            return Response(serializers.CommentSerializer(comments, many=True).data, status=status.HTTP_200_OK)

        if request.method.__eq__('POST'):
            lesson = self.get_object()
            s = serializers.CommentSerializer(data={
                'content': request.data.get('content'),
                'user': request.user.pk,
                'lesson': lesson.pk,
                'parent': request.data.get('parent')
            })
            s.is_valid(raise_exception=True)
            c = s.save()
            return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='like', detail=True)
    def like(self, request, pk):
        # Nếu chưa like thì tạo li có active=true
        li, created = Like.objects.get_or_create(lesson=self.get_object(), user=request.user)
        if not created:
            li.active = not li.active

        li.save()

        return Response(serializers.LessonSerializer(self.get_object(), context={'request': request}).data)


class TagViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin, mixins.UpdateModelMixin,
                 mixins.DestroyModelMixin):
    queryset = Tag.objects.all()
    serializer_class = serializers.TagSerializer

    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.IsAuthenticated()]
        return [perms.IsAdmin()]

class PaymentViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin, mixins.ListModelMixin):
    http_method_names = ['get', 'post', 'head', 'options']
    queryset = Payment.objects.all()
    serializer_class = serializers.PaymentSerializer

    def get_permissions(self):
        if self.action == 'confirm_cash':
            return [perms.IsPaymentCourseInstructor()]
        if self.action == 'process':
            return [perms.IsPaymentStudentOwner()]
        if self.action in ['list', 'retrieve']:
            return [
                permissions.IsAuthenticated(),
                (perms.IsAdmin | perms.IsPaymentStudentOwner | perms.IsPaymentCourseInstructor)()
            ]
        if self.action in ['momo_ipn', 'momo_return', 'zalopay_callback', 'stripe_webhook', 'paypal_return']:
            return [permissions.AllowAny()]

        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if not user or user.is_anonymous:
            return Payment.objects.none()

        user_role = getattr(user, 'role', None)

        if user_role == User.Role.ADMIN:
            return Payment.objects.all()

        if user_role == User.Role.INSTRUCTOR:
            return Payment.objects.filter(enrollment__course__instructor=user)

        return Payment.objects.filter(enrollment__student=user)

    @action(methods=['post'], detail=True, url_path='process')
    def process(self, request, pk=None):
        payment = self.get_object()

        if payment.is_successful:
            return Response({"detail": "Giao dịch này đã được xác nhận thanh toán trước đó."},
                            status=status.HTTP_400_BAD_REQUEST)

        method_name = request.data.get('payment_method')
        if method_name not in dict(Payment.Method.choices):
            return Response({"detail": "Phương thức thanh toán không hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)

        payment.payment_method = method_name
        payment.save(update_fields=['payment_method'])

        try:
            gateway = PaymentFactory.get_payment_gateway(payment.payment_method)
            payment_info = gateway.create_payment(
                enrollment=payment.enrollment,
                amount=float(payment.amount)
            )

            if payment_info.get('transaction_id'):
                payment.transaction_id = payment_info['transaction_id']
                payment.save(update_fields=['transaction_id'])

            return Response(payment_info, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['post'], detail=True, url_path='confirm_cash')
    def confirm_cash(self, request, pk=None):
        payment = self.get_object()

        if payment.is_successful:
            return Response({"detail": "Giao dịch này đã được xác nhận thanh toán trước đó."},
                            status=status.HTTP_400_BAD_REQUEST)

        payment.payment_method = Payment.Method.CASH
        payment.is_successful = True
        payment.save(update_fields=['is_successful'])

        return Response({
            "message": "Đã xác nhận thu tiền mặt thành công. Khóa học đã được kích hoạt cho sinh viên.",
            "payment": serializers.PaymentSerializer(payment).data
        }, status=status.HTTP_200_OK)

    # ==========================================
    # 1. MOMO IPN (Webhook)
    # ==========================================
    @action(methods=['post'], detail=False, url_path='momo-ipn')
    def momo_ipn(self, request):
        data = request.data
        order_id = data.get('orderId')  # Lấy transaction_id
        
        if not order_id:
            return Response({"message": "Thiếu orderId"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Sử dụng select_for_update() để khóa bản ghi, chống Double-spending (Race Condition)
                payment = Payment.objects.select_for_update().get(transaction_id=order_id)

                # Tránh xử lý lại nếu đã thành công trước đó
                if payment.is_successful:
                    return Response(status=status.HTTP_204_NO_CONTENT)

                gateway = PaymentFactory.get_payment_gateway(Payment.Method.MOMO)

                # Hàm verify_payment đã bao gồm check resultCode == 0 và check chữ ký HMAC
                if gateway.verify_payment(data):
                    # Kiểm tra đối chiếu số tiền để tránh việc hacker giả mạo số tiền (dù khó vì có signature)
                    if float(data.get('amount', 0)) != float(payment.amount):
                        return Response({"message": "Số tiền thanh toán không khớp"}, status=status.HTTP_400_BAD_REQUEST)

                    payment.is_successful = True
                    payment.save(update_fields=['is_successful'])
                    return Response(status=status.HTTP_204_NO_CONTENT)
                else:
                    return Response({"message": "Xác thực chữ ký MoMo thất bại"}, status=status.HTTP_400_BAD_REQUEST)

        except Payment.DoesNotExist:
            return Response({"message": "Không tìm thấy giao dịch"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='momo-return')
    def momo_return(self, request):
        result_code = request.query_params.get('resultCode')
        order_id = request.query_params.get('orderId')
        message = request.query_params.get('message')

        if str(result_code) == '0':
            return Response({
                "status": "success",
                "message": "Thanh toán thành công!",
                "order_id": order_id
            })
        else:
            return Response({
                "status": "failed",
                "message": f"Thanh toán thất bại: {message}",
                "order_id": order_id
            }, status=400)

    # ==========================================
    # 2. ZALOPAY CALLBACK (Webhook)
    # ==========================================
    @action(methods=['post'], detail=False, url_path='zalopay-callback')
    def zalopay_callback(self, request):
        gateway = PaymentFactory.get_payment_gateway(Payment.Method.ZALOPAY)

        # ZaloPay yêu cầu trả về chuẩn {"return_code": x, "return_message": y}
        if gateway.verify_payment(request.data):
            try:
                # ZaloPay gói toàn bộ dữ liệu thật vào một chuỗi JSON trong field 'data'
                data_str = request.data.get('data')
                cb_data = json.loads(data_str)
                app_trans_id = cb_data.get('app_trans_id')
                amount = cb_data.get('amount')

                if not app_trans_id:
                    return Response({"return_code": 0, "return_message": "Missing app_trans_id"}, status=status.HTTP_200_OK)

                with transaction.atomic():
                    # Sử dụng select_for_update() để khóa bản ghi, chống Double-spending
                    payment = Payment.objects.select_for_update().get(transaction_id=app_trans_id)
                    if not payment.is_successful:
                        # Kiểm tra đối chiếu số tiền
                        if float(amount) != float(payment.amount):
                            return Response({"return_code": 0, "return_message": "Amount mismatch"}, status=status.HTTP_200_OK)
                            
                        payment.is_successful = True
                        payment.save(update_fields=['is_successful'])

                # Báo với ZaloPay là ta đã nhận và xử lý thành công
                return Response({"return_code": 1, "return_message": "success"}, status=status.HTTP_200_OK)

            except Payment.DoesNotExist:
                return Response({"return_code": 0, "return_message": "Order not found"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"return_code": 0, "return_message": str(e)}, status=status.HTTP_200_OK)
        else:
            return Response({"return_code": -1, "return_message": "mac not equal"}, status=status.HTTP_200_OK)

    # ==========================================
    # 3. STRIPE WEBHOOK
    # ==========================================
    @action(methods=['post'], detail=False, url_path='stripe-webhook')
    def stripe_webhook(self, request):
        # Bắt buộc phải lấy body thô (raw bytes) để Stripe tính toán đúng chữ ký
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        request_data = {
            'raw_body': payload,
            'stripe_signature': sig_header
        }

        gateway = PaymentFactory.get_payment_gateway(Payment.Method.STRIPE)

        # Hàm verify_payment sẽ tự check sự kiện 'checkout.session.completed' và chữ ký
        if gateway.verify_payment(request_data):
            # Parse payload thành JSON để trích xuất Session ID
            event = json.loads(payload)
            # Dù verify_payment đã check type, ta vẫn parse để lấy object
            if event['type'] == 'checkout.session.completed':
                session_id = event['data']['object']['id']

                try:
                    with transaction.atomic():
                        payment = Payment.objects.select_for_update().get(transaction_id=session_id)
                        if not payment.is_successful:
                            payment.is_successful = True
                            payment.save(update_fields=['is_successful'])
                except Payment.DoesNotExist:
                    pass  # Bỏ qua nếu là session không thuộc hệ thống (VD: test trên dashboard)

        # Luôn trả về 200 để Stripe biết ta đã nhận được Webhook
        return Response(status=status.HTTP_200_OK)

    # ==========================================
    # 4. PAYPAL RETURN / CAPTURE
    # ==========================================
    @action(methods=['get', 'post'], detail=False, url_path='paypal-return')
    def paypal_return(self, request):
        # Khi PayPal redirect về, ID đơn hàng nằm trong param 'token'
        token = request.query_params.get('token') or request.data.get('token')

        if not token:
            return Response({"detail": "Thiếu mã xác thực (token) từ PayPal."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                payment = Payment.objects.select_for_update().get(transaction_id=token)

                if payment.is_successful:
                    return Response({"message": "Đơn hàng này đã được thanh toán thành công."}, status=status.HTTP_200_OK)

                gateway = PaymentFactory.get_payment_gateway(Payment.Method.PAYPAL)

                # Gọi API Capture PayPal bên trong transaction block để tránh Capture nhiều lần gây lỗi 400
                if gateway.verify_payment({'token': token}):
                    payment.is_successful = True
                    payment.save(update_fields=['is_successful'])
                    return Response({"message": "Thanh toán PayPal thành công! Khóa học đã được mở."},
                                    status=status.HTTP_200_OK)
                else:
                    return Response({"message": "Giao dịch PayPal thất bại hoặc chưa được phê duyệt."},
                                    status=status.HTTP_400_BAD_REQUEST)

        except Payment.DoesNotExist:
            return Response({"detail": "Không tìm thấy giao dịch tương ứng."}, status=status.HTTP_404_NOT_FOUND)

class StatsViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action == 'list':
            return [perms.IsInstructor()]

        return [permissions.AllowAny()]

    def list(self, request):
        user = request.user
        #Lấy hóa đơn liên quan đến giáo viên đó
        payments = Payment.objects.filter(is_successful=True, enrollment__course__instructor=user)

        # Thống kê theo khóa học
        # payments.value gom nhóm
        # annotate tính toán từng nhóm
        stat_course = payments.values('enrollment__course__subject').annotate(
            total_students=Count('enrollment__student', distinct=True),
            total_revenue=Sum('amount')
        ).order_by('-total_revenue')

        def get_time_stats(trunc_class):
            # Nhóm và tính toán
            data = payments.annotate(period=trunc_class('created_date')).values('period').annotate(
                total_students=Count('enrollment__student', distinct=True),
                total_revenue=Sum('amount')
            ).order_by('period')

            # Format chuỗi thời gian cho đẹp tùy theo loại thống kê
            def format_period(p):
                if not p: return "N/A"
                if trunc_class == TruncMonth: return p.strftime('%Y-%m')  # Vd: 2026-05
                if trunc_class == TruncYear: return p.strftime('%Y')  # Vd: 2026
                if trunc_class == TruncQuarter: return f"{p.year}-Q{(p.month - 1) // 3 + 1}"  # Vd: 2026-Q2
                return str(p)

            # Đóng gói ra mảng JSON
            return [
                {
                    "period": format_period(item['period']),
                    "total_students": item['total_students'],
                    "total_revenue": item['total_revenue']
                } for item in data
            ]

        # 4. GỌI HÀM VÀ TRẢ VỀ KẾT QUẢ
        return Response({
            "stat_course": stat_course,
            "by_month": get_time_stats(TruncMonth),
            "by_quarter": get_time_stats(TruncQuarter),
            "by_year": get_time_stats(TruncYear),
        }, status=status.HTTP_200_OK)


