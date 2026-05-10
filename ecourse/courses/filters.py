from django_filters import rest_framework as filters
from courses.models import InstructorApplication, Course, Lesson


class NumberInFilter(filters.BaseInFilter, filters.NumberFilter):
    pass


class CourseFilter(filters.FilterSet):
    category_id = filters.NumberFilter(field_name="category_id")

    instructor_id = filters.NumberFilter(field_name="instructor_id")

    fee = filters.NumberFilter(field_name="fee", lookup_expr='lte')

    ids = NumberInFilter(field_name='id', lookup_expr='in')

    class Meta:
        model = Course
        fields = ['category_id', 'instructor_id', 'fee', 'ids']


class ApplicationFilter(filters.FilterSet):
    status = filters.CharFilter(field_name="status")

    class Meta:
        model = InstructorApplication
        fields = ['status']


class LessonFilter(filters.FilterSet):
    search = filters.CharFilter(field_name='subject', lookup_expr='icontains')

    tags = NumberInFilter(field_name='tags__id', lookup_expr='in')

    class Meta:
        model = Lesson
        fields = ['search', 'tags']
