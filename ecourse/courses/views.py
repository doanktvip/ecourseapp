from decimal import Decimal
from rest_framework.decorators import action
from rest_framework import mixins
from rest_framework import viewsets, generics,filters
from courses.models import Course,Category,User
from courses import serializers,paginators

class CategoryViewSet(viewsets.ViewSet,generics.ListAPIView):
    queryset=Category.objects.all()
    serializer_class=serializers.CategorySerializer

class CourseViewSet(viewsets.GenericViewSet,mixins.ListModelMixin,mixins.RetrieveModelMixin,mixins.CreateModelMixin):
    queryset=Course.objects.filter(active=True)
    pagination_class = paginators.ItemPaginator
    filter_backends = [filters.OrderingFilter,filters.SearchFilter]
    search_fields=['subject']
    ordering_fields=['id']

    def get_serializer_class(self):
        if self.action in ['retrieve']:
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
    def perform_create(self,serializer):
        #Lấy tạm user đầu để ktra api post khóa học
        temp_instructor = User.objects.first()

        serializer.save(instructor=temp_instructor)
        # serializer.save(instructor=self.request.user)
