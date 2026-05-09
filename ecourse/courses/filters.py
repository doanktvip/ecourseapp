from django_filters import rest_framework as filters
from courses.models import InstructorApplication, Course


class CourseFilter(filters.FilterSet):
    category_id = filters.NumberFilter(field_name="category_id")

    instructor_id = filters.NumberFilter(field_name="instructor_id")

    fee = filters.NumberFilter(field_name="fee", lookup_expr='lte')

    class Meta:
        model = Course
        fields = ['category_id', 'instructor_id', 'fee']


class ApplicationFilter(filters.FilterSet):
    # Lọc chính xác status
    status = filters.CharFilter(field_name="status")

    class Meta:
        model = InstructorApplication
        fields = ['status']
