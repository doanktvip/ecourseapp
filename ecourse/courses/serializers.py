from rest_framework import serializers
from courses.models import Course, Category, Tag, User, InstructorApplication, Lesson, Enrollment, Payment
from django.contrib.auth.password_validation import validate_password


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'avatar']


class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            data['image'] = instance.image.url
        if instance.intro_video:
            data['intro_video'] = instance.intro_video.url
        return data


class CourseSerializer(ItemSerializer):
    category = CategorySerializer(read_only=True)
    instructor = SimpleUserSerializer(read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'subject', 'description', 'fee', 'image', 'intro_video', 'average_rating',
                  'total_duration_video', 'total_students', 'total_revenue', 'category', 'instructor']
        read_only_fields = ['average_rating', 'total_duration_video', 'total_students', 'total_revenue', 'instructor']


class CourseDetailSerializer(ItemSerializer):
    class Meta:
        model = CourseSerializer.Meta.model
        fields = CourseSerializer.Meta.fields


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class UserSerializer(SimpleUserSerializer):
    class Meta:
        model = SimpleUserSerializer.Meta.model
        fields = SimpleUserSerializer.Meta.fields + ['id', 'username', 'password']
        extra_kwargs = {
            'password': {
                'write_only': True,
            }
        }

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(user.password)
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

    class Meta:
        model = InstructorApplication
        fields = ['id', 'cv_file', 'status', 'created_date']
        read_only_fields = ['id', 'status', 'created_date']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.cv_file and hasattr(instance.cv_file, 'url'):
            data['cv_file'] = instance.cv_file.url
        return data


class LessonSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    video = serializers.FileField(required=False, allow_null=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'subject', 'content', 'image', 'video', 'video_seconds', 'order', 'tags', 'created_date']
        read_only_fields = ['id', 'order', 'video_seconds', 'created_date']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            data['image'] = instance.image.url
        if instance.video:
            data['video'] = instance.video.url
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
