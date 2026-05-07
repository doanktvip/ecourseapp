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
        return data

class CourseSerializer(ItemSerializer):
    class Meta:
        model = Course
        fields=['id','subject','image','fee','created_date']

class CourseDetailSerializer(ItemSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True)
    def to_representation(self,instance):
        data = super().to_representation(instance)
        if instance.intro_video:
            data['intro_video']=instance.intro_video.url
        if instance.category:
            data['category_name']=instance.category.name
        return data
    class Meta:
        model = CourseSerializer.Meta.model
        fields = CourseSerializer.Meta.fields + ['description','intro_video','average_rating','total_duration_video','total_students','total_revenue','category']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields=['id','name']