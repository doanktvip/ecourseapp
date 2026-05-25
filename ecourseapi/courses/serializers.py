from rest_framework import serializers
from courses.models import (Course, Category, Tag, User, InstructorApplication, Lesson, Enrollment, Payment, Comment,
                            CourseReview, LessonProgress)
from courses.validators import validate_custom_username
from django.contrib.auth.password_validation import validate_password


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'avatar', 'role']
        read_only_fields = ['role']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            try:
                data['avatar'] = instance.avatar.url
            except AttributeError:
                data['avatar'] = f"https://res.cloudinary.com/db4bjqp4f/{instance.avatar}"
        return data


class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            data['image'] = instance.image.url
        return data


class CourseSerializer(ItemSerializer):
    category = CategorySerializer(read_only=True)
    instructor = SimpleUserSerializer(read_only=True)

    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category',
                                                     write_only=True)
    lesson_count = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'subject', 'description', 'fee', 'image', 'average_rating',
                  'total_duration_video', 'total_students', 'total_revenue', 'category', 'category_id', 'instructor',
                  'lesson_count', 'review_count']
        read_only_fields = ['average_rating', 'total_duration_video', 'total_students', 'total_revenue', 'instructor']

    def get_lesson_count(self, obj):
        return obj.lessons.count()

    def get_review_count(self, obj):
        return obj.reviews.count()


class CourseDetailSerializer(CourseSerializer):
    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class AddTagsSerializer(serializers.Serializer):
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, allow_empty=False,
        error_messages={
            'empty': 'Dữ liệu tags không được để trống.',
            'does_not_exist': 'Thất bại! Tag có ID "{pk_value}" hoàn toàn không tồn tại.',
            'not_a_list': 'Dữ liệu gửi lên bắt buộc phải là một mảng (list).'
        }
    )


class UserSerializer(SimpleUserSerializer):
    username = serializers.CharField(validators=[validate_custom_username])

    class Meta:
        model = SimpleUserSerializer.Meta.model
        fields = SimpleUserSerializer.Meta.fields + ['id', 'username', 'password']
        extra_kwargs = {
            'password': {
                'write_only': True,
                'validators': [validate_password]
            }
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]  # kiểm tra độ mạnh mật khẩu của Django
    )

    def validate_old_password(self, value):
        # Lấy user hiện tại từ request của View
        user = self.context['request'].user
        # Kiểm tra old_password so sánh với mk của user hiện tại
        # value = old_password
        if not user.check_password(value):
            raise serializers.ValidationError("Mật khẩu cũ không chính xác.")
        return value

    def validate(self, data):
        # Kiểm tra không trùng mk
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError({
                "new_password": "Mật khẩu mới không được trùng với mật khẩu cũ."
            })

        return data


class ApplySerializer(serializers.ModelSerializer):
    cv_file = serializers.FileField(required=False, allow_null=True)
    user = SimpleUserSerializer(read_only=True)

    class Meta:
        model = InstructorApplication
        fields = ['id', 'cv_file', 'status', 'created_date', 'user']
        read_only_fields = ['id', 'status', 'created_date', 'user']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.cv_file and hasattr(instance.cv_file, 'url'):
            data['cv_file'] = instance.cv_file.url
        return data


class LessonSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    video = serializers.FileField(required=False, allow_null=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, source='tags', write_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'subject', 'content', 'image', 'video', 'video_seconds', 'order', 'tags', 'tag_ids',
                  'created_date', 'is_preview']
        read_only_fields = ['id', 'order', 'video_seconds', 'created_date']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            if hasattr(instance.image, 'url'):
                data['image'] = instance.image.url
        if instance.video:
            if hasattr(instance.video, 'url'):
                data['video'] = instance.video.url
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            data['liked'] = instance.likes.filter(user=request.user, active=True).exists()

            # Lấy thông tin tiến độ bài học của học viên
            progress = LessonProgress.objects.filter(enrollment__student=request.user, lesson=instance).first()
            if progress:
                data['completed'] = progress.status == LessonProgress.Status.COMPLETED
                data['watched_seconds'] = progress.watched_seconds
            else:
                data['completed'] = False
                data['watched_seconds'] = 0

        return data


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'payment_method', 'is_successful', 'transaction_id', 'created_date']
        read_only_fields = ['id', 'amount', 'is_successful', 'transaction_id', 'created_date']


class EnrollmentDetailSerializer(serializers.ModelSerializer):
    payment = PaymentSerializer(read_only=True)
    student = SimpleUserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'progress', 'payment', 'created_date']


class EnrollmentSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=Payment.Method.choices)


class CommentSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'user', 'lesson', 'parent']
        read_only_fields = ['id', 'user', 'lesson']


class CourseReviewSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)

    class Meta:
        model = CourseReview
        fields = ['id', 'course', 'user', 'rating', 'comment', 'created_date']
        read_only_fields = ['id', 'course', 'user', 'created_date']
