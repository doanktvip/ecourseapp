from decimal import Decimal
from rest_framework.decorators import action
from rest_framework import mixins
from rest_framework import viewsets, generics,filters,parsers,status,permissions
from courses.models import Course,Category,User
from courses import serializers, paginators, perms
from rest_framework.response import Response

class CategoryViewSet(viewsets.ViewSet,generics.ListAPIView):
    queryset=Category.objects.all()
    serializer_class=serializers.CategorySerializer

class CourseViewSet(viewsets.GenericViewSet,mixins.ListModelMixin,mixins.RetrieveModelMixin,mixins.CreateModelMixin,mixins.UpdateModelMixin):
    queryset=Course.objects.filter(active=True)
    pagination_class = paginators.ItemPaginator
    filter_backends = [filters.OrderingFilter,filters.SearchFilter]
    search_fields=['subject']
    ordering_fields=['id']
    # CHỈ CHO PHÉP CÁC PHƯƠNG THỨC NÀY
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_permissions(self):
        if self.action=='partial_update':
            return [permissions.IsAuthenticated(), perms.CourseOwner()]
        # Tạo khóa học mới
        elif self.action == 'create':
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action in ['retrieve','partial_update']:
            return serializers.CourseDetailSerializer
        return serializers.CourseSerializer

    def get_queryset(self):
        query=self.queryset
        cate_id=self.request.query_params.get('category_id')
        if cate_id:
            query=query.filter(category_id=cate_id)

        instructor_id=self.request.query_params.get('instructor_id')
        if instructor_id:
            query=query.filter(instructor_id=instructor_id)

        fee=self.request.query_params.get('fee')
        if fee:
            fee = Decimal(fee)
            query=query.filter(fee__lte=fee)

        return query
    #Chỉ cho phép tạo khóa học khi user có role là instructor
    def perform_create(self,serializer):
        serializer.save(instructor=self.request.user)

    @action(methods=['get'],detail=False,url_path='compare')
    def compare(self,request):
        ids_str = request.query_params.get('ids')
        if not ids_str:
            return Response({"error": "Vui lòng cung cấp danh sách ids cần so sánh"},status=status.HTTP_400_BAD_REQUEST)
        try:
            ids_list = [int(i.strip()) for i in ids_str.split(',')] #Cắt chuỗi vd: 1,2,3 thành mảng số
        except ValueError:
            return Response({"error": "Định dạng tham số ids không hợp lệ"},status=status.HTTP_400_BAD_REQUEST)
        #Lấy các khóa học cần so sánh
        courses=self.queryset.filter(id__in=ids_list)
        if not courses.exists():
            return Response({"message": "Không tìm thấy khóa học nào khớp với các ids đã cho."},status=status.HTTP_404_NOT_FOUND)
        #dùng many=true khi lấy nhiều courses
        serializer=serializers.CourseSerializer(courses,many=True,context={'request': request})
        return Response(serializer.data,status=status.HTTP_200_OK)




class UserViewSet(viewsets.ViewSet,generics.CreateAPIView):
    queryset=User.objects.filter(is_active=True)
    serializer_class=serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get','patch'],url_path='me',detail=False,permission_classes=[permissions.IsAuthenticated])
    def me(self,request):
        u=request.user
        if request.method.__eq__('PATCH'):
            s=serializers.SimpleUserSerializer(u,data=request.data)
            s.is_valid(raise_exception=True)
            u=s.save()
        return Response(serializers.UserSerializer(u).data,status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False, url_path='me/change-password',permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):

        s=serializers.ChangePasswordSerializer(data=request.data, context={'request': request})
        if s.is_valid():
            user = request.user
            user.set_password(s.validated_data['new_password'])
            user.save()
            return Response({"message": "Đổi mật khẩu thành công!"}, status=status.HTTP_200_OK)

        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)