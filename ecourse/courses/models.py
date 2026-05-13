import cloudinary.api
from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from ckeditor.fields import RichTextField
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
from django.db.models import Max
from django.db.models.aggregates import Sum, Avg


# ==========================================
# MODEL NGƯỜI DÙNG VÀ CƠ SỞ
# ==========================================

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Quản trị viên'
        INSTRUCTOR = 'INSTRUCTOR', 'Giảng viên'
        STUDENT = 'STUDENT', 'Sinh viên'

    avatar = CloudinaryField('avatar', null=True, blank=True,
                             default="image/upload/v1765436438/shtnr60mecp057e2uctk.jpg")
    role = models.CharField(max_length=15, choices=Role.choices, default=Role.STUDENT)

    def __str__(self):
        return self.username

    def get_full_name(self):
        return f"{self.last_name} {self.first_name}".strip()


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# Bảng quản lý đơn xin làm giảng viên
class InstructorApplication(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Đang chờ duyệt'
        APPROVED = 'APPROVED', 'Đã duyệt'
        REJECTED = 'REJECTED', 'Bị từ chối'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='instructor')
    cv_file = CloudinaryField('cv_file', resource_type='raw', null=True, blank=True,
                              validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])])
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)


# ==========================================
# MODEL QUẢN LÝ KHÓA HỌC VÀ NỘI DUNG
# ==========================================

class Category(BaseModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Course(BaseModel):
    subject = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    image = CloudinaryField('image', null=True, blank=True)
    intro_video = CloudinaryField(resource_type='video', null=True, blank=True)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.0,
                              validators=[MinValueValidator(Decimal('0.00'))])
    average_rating = models.FloatField(default=0.0)
    total_duration_video = models.PositiveIntegerField(default=0, help_text="Tổng số giây video")

    total_students = models.PositiveIntegerField(default=0, help_text="Tổng số học viên")
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0.0,
                                        validators=[MinValueValidator(Decimal('0.00'))], help_text="Tổng doanh thu")

    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='courses')
    instructor = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='teaching_courses',
                                   limit_choices_to={'role': 'INSTRUCTOR', 'instructor__status': 'APPROVED'})

    def __str__(self):
        return self.subject

    def update_duration(self):
        duration = self.lessons.aggregate(total=Sum('video_seconds'))
        self.total_duration_video = duration['total'] or 0
        self.save(update_fields=['total_duration_video'])

    def update_rating(self):
        rating = self.reviews.aggregate(avg=Avg('rating'))
        self.average_rating = round(rating['avg'] or 0.0, 1)
        self.save(update_fields=['average_rating'])

    def update_stats(self):
        successful_enrollments = self.enrollments.filter(payment__is_successful=True)
        self.total_students = successful_enrollments.count()
        total_rev = successful_enrollments.aggregate(total=Sum('payment__amount'))['total']
        self.total_revenue = total_rev or 0.0
        self.save(update_fields=['total_students', 'total_revenue'])


class Tag(BaseModel):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Lesson(BaseModel):
    subject = models.CharField(max_length=255)
    content = RichTextField()
    image = CloudinaryField('image', null=True, blank=True)
    video = CloudinaryField(resource_type='video', null=True, blank=True)
    video_seconds = models.PositiveIntegerField(default=0, blank=True, help_text="Thời lượng video (tính bằng giây)")
    order = models.PositiveIntegerField(default=1, help_text="Thứ tự bài học trong khóa")

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    tags = models.ManyToManyField(Tag, blank=True)

    class Meta:
        unique_together = ('order', 'course')
        ordering = ['order']

    def save(self, *args, **kwargs):
        if self.video and isinstance(self.video, str) and not self.video.startswith('http'):
            self.video = None

        if self.image and isinstance(self.image, str) and not self.image.startswith('http'):
            self.image = None

        if not self.pk:
            result = Lesson.objects.filter(course=self.course).aggregate(order_max=Max('order'))
            max_order = result['order_max'] or 0
            self.order = max_order + 1

        super().save(*args, **kwargs)

        if self.video and self.video_seconds == 0:
            try:
                duration = self.video.metadata.get('duration') if hasattr(self.video, 'metadata') else None

                if not duration:
                    res = cloudinary.api.resource(self.video.public_id, resource_type="video")
                    duration = res.get('duration')

                if duration:
                    self.video_seconds = int(duration)
                    Lesson.objects.filter(pk=self.pk).update(video_seconds=self.video_seconds)
            except Exception as e:
                print(f"Lỗi lấy duration: {e}")

        self.course.update_duration()

    def delete(self, *args, **kwargs):
        course = self.course
        super().delete(*args, **kwargs)
        course.update_duration()


# ==========================================
# MODEL NGHIỆP VỤ (ĐĂNG KÝ, THANH TOÁN VÀ TIẾN ĐỘ)
# ==========================================

class Enrollment(BaseModel):
    student = models.ForeignKey(User, on_delete=models.RESTRICT, limit_choices_to={'role': 'STUDENT'},
                                related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.RESTRICT, related_name='enrollments')
    progress = models.FloatField(default=0.0, help_text="Tiến độ học tập (%)")

    class Meta:
        unique_together = ('student', 'course')

    def update_progress(self):
        total_lessons = self.course.lessons.count()
        if total_lessons > 0:
            completed = self.lesson_progresses.filter(status='COMPLETED').count()
            self.progress = round((completed / total_lessons) * 100, 2)
        else:
            self.progress = 0.0
        self.save(update_fields=['progress'])


class LessonProgress(BaseModel):
    class Status(models.TextChoices):
        IN_PROGRESS = 'IN_PROGRESS', 'Đang học'
        COMPLETED = 'COMPLETED', 'Đã hoàn thành'

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='lesson_progresses')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.IN_PROGRESS)
    watched_seconds = models.PositiveIntegerField(default=0, help_text="Đã xem đến giây thứ")

    class Meta:
        unique_together = ('enrollment', 'lesson')

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.enrollment.update_progress()

    def delete(self, *args, **kwargs):
        enrollment = self.enrollment
        super().delete(*args, **kwargs)
        enrollment.update_progress()


class Payment(BaseModel):
    class Method(models.TextChoices):
        CASH = 'CASH', 'Tiền mặt trực tiếp'
        PAYPAL = 'PAYPAL', 'PayPal'
        STRIPE = 'STRIPE', 'Stripe'
        MOMO = 'MOMO', 'MoMo'
        ZALOPAY = 'ZALOPAY', 'ZaloPay'

    enrollment = models.OneToOneField(Enrollment, on_delete=models.RESTRICT, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    payment_method = models.CharField(max_length=20, choices=Method.choices, null=True, blank=True)
    is_successful = models.BooleanField(default=False)
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.is_successful:
            self.enrollment.course.update_stats()


# ==========================================
# MODEL TƯƠNG TÁC (ĐÁNH GIÁ, BÌNH LUẬN)
# ==========================================

class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Comment(Interaction):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='comments')
    content = models.CharField(max_length=255)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')


class Like(Interaction):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='likes')

    class Meta:
        unique_together = ('lesson', 'user')


class CourseReview(Interaction):
    user = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'STUDENT'},
                             related_name='reviews')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('course', 'user')

    def clean(self):
        MIN_PROGRESS = 20.0

        enrollment = self.user.enrollments.filter(course=self.course, payment__is_successful=True).first()

        if not enrollment:
            raise ValidationError("Bạn chưa đăng ký khóa học này hoặc thanh toán chưa thành công.")

        if enrollment.progress < MIN_PROGRESS:
            raise ValidationError(
                f"Tiến độ hiện tại của bạn là {enrollment.progress}%. Cần tối thiểu {int(MIN_PROGRESS)}% để đánh giá.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
        self.course.update_rating()

    def delete(self, *args, **kwargs):
        course = self.course
        super().delete(*args, **kwargs)
        course.update_rating()
