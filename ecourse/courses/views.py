from django.db import transaction
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth, TruncYear, TruncQuarter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework import mixins, request
from rest_framework import viewsets, generics, filters, parsers, status, permissions
from courses.filters import ApplicationFilter, CourseFilter, LessonFilter
from courses.models import Course, Category, User, InstructorApplication, Lesson, Tag, Comment, Like, Payment
from courses import serializers, paginators, perms
from rest_framework.response import Response
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
        if self.action == 'lessons' and self.request.method == 'POST':
            return [perms.IsInstructor(), perms.IsCourseOwner()]

        elif self.action == 'lessons' and self.request.method == 'GET':
            return [perms.IsEnrolled()]

        if self.action == 'partial_update':
            return [perms.IsCourseOwner()]

        elif self.action in ['create', 'destroy']:
            return [perms.IsInstructor()]

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

    @action(methods=['get', 'patch'], url_path='me', detail=False, permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            s = serializers.SimpleUserSerializer(u, data=request.data)
            s.is_valid(raise_exception=True)
            u = s.save()
        return Response(serializers.UserSerializer(u).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False, url_path='me/change-password',
            permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):

        s = serializers.ChangePasswordSerializer(data=request.data, context={'request': request})
        if s.is_valid():
            user = request.user
            user.set_password(s.validated_data['new_password'])
            user.save()
            return Response({"message": "Đổi mật khẩu thành công!"}, status=status.HTTP_200_OK)

        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get', 'post'], detail=False, url_path='me/apply',
            permission_classes=[perms.IsStudent], parser_classes=[parsers.MultiPartParser])
    def apply_instructor(self, request):
        # Lấy đơn ứng tuyển của user hiện tại
        application = InstructorApplication.objects.filter(user=request.user).first()

        # TRƯỜNG HỢP XEM ĐƠN (GET)
        if request.method == 'GET':
            if not application:
                return Response({"detail": "Bạn chưa nộp đơn nào."}, status=status.HTTP_404_NOT_FOUND)
            serializer = serializers.ApplySerializer(application)
            return Response(serializer.data)

        # TRƯỜNG HỢP NỘP ĐƠN (POST)
        if request.method == 'POST':
            if application:
                return Response(
                    {"detail": "Bạn đã nộp đơn rồi. Trạng thái hiện tại: " + application.status},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = serializers.ApplySerializer(data=request.data)
            if serializer.is_valid():
                # Quan trọng: Gán user từ request vào đây
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        if self.action == 'retrieve':
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

        if self.action in ['create', 'partial_update', 'destroy']:
            return [perms.IsAdmin()]

        return [permissions.AllowAny()]

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


