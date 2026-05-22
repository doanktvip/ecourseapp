import uuid
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth, TruncYear, TruncQuarter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework import mixins, request
from rest_framework import viewsets, generics, filters, parsers, status, permissions
from courses.filters import ApplicationFilter, CourseFilter, LessonFilter
from courses.models import (Course, Category, User, InstructorApplication, Lesson, Tag, Enrollment, Payment,
                            LessonProgress, Comment, Like)
from courses import serializers, paginators, perms
from rest_framework.response import Response
from courses.payments.factory import PaymentFactory
from django.core.exceptions import ValidationError as DjangoValidationError

from courses.serializers import TagSerializer, AddTagsSerializer


class CategoryViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer

    def get_permissions(self):
        if self.action == 'create':
            return [perms.IsAdmin()]
        return [permissions.AllowAny()]


class CourseViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin,
                    mixins.UpdateModelMixin, mixins.DestroyModelMixin):
    queryset = Course.objects.filter(active=True)
    pagination_class = paginators.ItemPaginator
    http_method_names = ['get', 'post', 'patch', 'head', 'options', 'delete']
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = CourseFilter
    search_fields = ['subject', 'instructor__first_name', 'instructor__last_name']
    ordering_fields = ['id']

    def get_permissions(self):
        if self.action in ['create']:
            return [perms.IsInstructor()]

        if self.action in ['partial_update', 'destroy', 'students']:
            return [perms.IsCourseOwner()]

        if self.action == 'lessons':
            if self.request.method == 'POST':
                return [perms.IsCourseOwner()]
            return [permissions.AllowAny()]

        if self.action == 'enrolls':
            return [perms.IsAuthenticatedUser()]

        if self.action == 'enroll_detail':
            return [perms.HasEnrollmentRecord()]

        if self.action == 'reviews' and self.request.method == 'POST':
            return [perms.IsEnrolled()]

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
                serializer = serializers.LessonSerializer(page, many=True, context={'request': request})
                return self.get_paginated_response(serializer.data)

            serializer = serializers.LessonSerializer(filtered_lessons, many=True, context={'request': request})
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

        if course.instructor == user:
            return Response({"detail": "Bạn không thể đăng ký khóa học do chính mình giảng dạy."},
                            status=status.HTTP_400_BAD_REQUEST)

        if Enrollment.objects.filter(student=user, course=course).exists():
            return Response({"detail": "Bạn đã đăng ký khóa học này rồi."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            enrollment = Enrollment.objects.create(student=user, course=course)

            if course.fee == 0:
                Payment.objects.create(enrollment=enrollment, amount=0, payment_method=Payment.Method.CASH,
                                       is_successful=True, transaction_id=str(uuid.uuid4()))
            else:
                Payment.objects.create(enrollment=enrollment, amount=course.fee, is_successful=False,
                                       payment_method=None)

        return Response(serializers.EnrollmentDetailSerializer(enrollment).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], detail=True, url_path=r'enrolls/(?P<enroll_id>\d+)')
    def enroll_detail(self, request, pk=None, enroll_id=None):
        course = self.get_object()
        enrollment = get_object_or_404(Enrollment, pk=enroll_id, course=course)
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
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action in ['me', 'change_password']:
            return [permissions.IsAuthenticated()]
        if self.action == 'apply_instructor':
            return [perms.IsStudent()]
        if self.action == 'my_enrolls':
            return [(perms.IsStudent | perms.IsInstructor | perms.IsAdmin)()]
        if self.action == 'my_courses':
            return [(perms.IsInstructor | perms.IsAdmin)()]
        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='me', detail=False)
    def me(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            s = serializers.SimpleUserSerializer(u, data=request.data, partial=True)
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

    @action(methods=['get'], detail=False, url_path='me/courses')
    def my_courses(self, request):
        user = request.user
        if user.role == User.Role.INSTRUCTOR:
            courses = Course.objects.filter(instructor=user, active=True)
        elif user.role == User.Role.ADMIN:
            courses = Course.objects.filter(active=True)
        else:
            courses = Course.objects.none()

        serializer = serializers.CourseSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=False, url_path='me/enrolls')
    def my_enrolls(self, request):
        user = request.user
        enrollments = Enrollment.objects.filter(student=user, course__active=True)
        serializer = serializers.EnrollmentDetailSerializer(enrollments, many=True, context={'request': request})
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
            return [perms.IsCourseOwner()]

        if self.action == 'list':
            return [perms.IsAdmin()]

        if self.action == 'comments':
            return [perms.HasEnrollmentRecord()]

        if self.action == 'like':
            return [perms.HasEnrollmentRecord()]

        return [permissions.AllowAny()]

    @action(methods=['post'], detail=True, url_path='tags')
    def add_tags(self, request, pk=None):
        lesson = self.get_object()

        serializer = AddTagsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        tags_objects = serializer.validated_data['tags']
        lesson.tags.set(tags_objects)

        return Response({"detail": "Cập nhật tags thành công!"}, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='complete')
    def complete(self, request, pk=None):
        lesson = self.get_object()
        enrollment = Enrollment.objects.filter(student=request.user, course=lesson.course).first()

        if not enrollment:
            return Response({"detail": "Không tìm thấy thông tin đăng ký."}, status=status.HTTP_404_NOT_FOUND)

        progress, created = LessonProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson,
                                                                 defaults={'status': LessonProgress.Status.COMPLETED,
                                                                           'watched_seconds': lesson.video_seconds})

        if not created and progress.status == LessonProgress.Status.COMPLETED:
            return Response({"detail": "Bài học này đã được đánh dấu hoàn thành trước đó."},
                            status=status.HTTP_400_BAD_REQUEST)

        if not created and progress.status != LessonProgress.Status.COMPLETED:
            progress.status = LessonProgress.Status.COMPLETED
            progress.watched_seconds = lesson.video_seconds
            progress.save(update_fields=['watched_seconds', 'status'])

        enrollment.refresh_from_db()

        return Response({"detail": "Đã đánh dấu hoàn thành bài học.",
                         "current_progress": enrollment.progress}, status=status.HTTP_200_OK)

    @action(methods=['get', 'post'], detail=True, url_path='comments')
    def comments(self, request, pk=None):
        lesson = self.get_object()

        if request.method == 'GET':
            comments = lesson.comments.select_related('user').filter(active=True)

            p = paginators.CommentPaginator()
            page = p.paginate_queryset(comments, request)

            if page is not None:
                serializer = serializers.CommentSerializer(page, many=True)
                return p.get_paginated_response(serializer.data)

            serializer = serializers.CommentSerializer(comments, many=True)
            return Response({
                "count": comments.count(),
                "next": None,
                "previous": None,
                "results": serializer.data
            }, status=status.HTTP_200_OK)

        if request.method == 'POST':
            serializer = serializers.CommentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            comment = serializer.save(user=request.user, lesson=lesson)

            return Response(serializers.CommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='like', detail=True)
    def like(self, request, pk):
        lesson = self.get_object()

        li, created = Like.objects.get_or_create(lesson=lesson, user=request.user)
        if not created:
            li.active = not li.active
            li.save(update_fields=['active'])
        else:
            li.save()

        serializer = serializers.LessonSerializer(lesson, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


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

        return [permissions.IsAuthenticated(),
                (perms.IsAdmin | perms.IsPaymentStudentOwner | perms.IsPaymentCourseInstructor)()]

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

    @action(methods=['post'], detail=True, url_path='confirm-cash')
    def confirm_cash(self, request, pk=None):
        payment = self.get_object()

        if payment.is_successful:
            return Response({"detail": "Giao dịch này đã được xác nhận thanh toán trước đó."},
                            status=status.HTTP_400_BAD_REQUEST)

        payment.payment_method = Payment.Method.CASH
        payment.is_successful = True
        payment.transaction_id = f'CASH_{payment.enrollment.course.id}_{payment.enrollment.student.id}'
        payment.save(update_fields=['is_successful', 'payment_method', 'transaction_id'])

        return Response({
            "message": "Đã xác nhận thu tiền mặt thành công. Khóa học đã được kích hoạt cho sinh viên.",
            "payment": serializers.PaymentSerializer(payment).data
        }, status=status.HTTP_200_OK)


class StatsViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action == 'list':
            return [perms.IsInstructor()]

        return [permissions.AllowAny()]

    def list(self, request):
        user = request.user
        # Lấy hóa đơn liên quan đến giáo viên đó
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
