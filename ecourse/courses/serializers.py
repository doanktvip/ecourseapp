from rest_framework import serializers
from courses.models import Course, Category, Tag


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields='__all__'

class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self,instance):
        data = super().to_representation(instance)
        if instance.image:
            data['image'] = instance.image.url
        if instance.category:
            data['category_name']=instance.category.name
        if instance.intro_video:
            data['intro_video'] = instance.intro_video.url
        return data

class CourseSerializer(ItemSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True)
    class Meta:
        model = Course
        fields=['id','subject','description','fee','image','intro_video','average_rating','total_duration_video','total_students','total_revenue','category']
        read_only_fields = ['average_rating', 'total_duration_video', 'total_students', 'total_revenue']

class CourseDetailSerializer(ItemSerializer):
    class Meta:
        model = CourseSerializer.Meta.model
        fields = CourseSerializer.Meta.fields

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields=['id','name']