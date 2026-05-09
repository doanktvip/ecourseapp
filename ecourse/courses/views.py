from decimal import Decimal
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework import mixins
from rest_framework import viewsets, generics, filters, parsers, status, permissions
from courses.filters import ApplicationFilter, CourseFilter
from courses.models import Course, Category, User, InstructorApplication
from courses import serializers, paginators, perms
from rest_framework.response import Response


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer


class CourseViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin):
    queryset = Course.objects.filter(active=True)
    pagination_class = paginators.ItemPaginator

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = CourseFilter
    search_fields = ['subject']
    ordering_fields = ['id']

    def get_permissions(self):
        if self.action in ['create']:
            return [perms.IsInstructor()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action in ['retrieve']:
            return serializers.CourseDetailSerializer
        return serializers.CourseSerializer

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


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


class ApplicationViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = InstructorApplication.objects.all()
    serializer_class = serializers.ApplySerializer
    permission_classes = [perms.IsAdmin]

    filter_backends = [DjangoFilterBackend]
    filterset_class = ApplicationFilter

    @action(methods=['post'], detail=True, url_path='approve')
    def approve_application(self, request, pk=None):
        application = self.get_object()

        if application.status == InstructorApplication.Status.APPROVED:
            return Response({"detail": "Đơn xin việc này đã được duyệt trước đó."}, status=status.HTTP_400_BAD_REQUEST)

        application.status = InstructorApplication.Status.APPROVED
        application.save()

        user = application.user
        user.role = User.Role.INSTRUCTOR
        user.save()

        return Response({"message": f"Đã duyệt đơn xin việc và nâng cấp {user.username} lên Giảng viên."},
                        status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='reject')
    def reject_application(self, request, pk=None):
        application = self.get_object()

        application.status = InstructorApplication.Status.REJECTED
        application.save()

        return Response({"message": "Đã từ chối đơn ứng tuyển này."}, status=status.HTTP_200_OK)
