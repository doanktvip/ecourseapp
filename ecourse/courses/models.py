from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from ckeditor.fields import RichTextField
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Max


# ==========================================
# MODEL NGƯỜI DÙNG VÀ CƠ SỞ
# ==========================================

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Quản trị viên'),
        ('INSTRUCTOR', 'Giảng viên'),
        ('STUDENT', 'Sinh viên'),
    )
    avatar = CloudinaryField('avatar', null=True, blank=True)
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='STUDENT')

    def __str__(self):
        return self.username


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# Bảng quản lý đơn xin làm giảng viên
class InstructorApplication(BaseModel):
    STATUS_CHOICES = (
        ('PENDING', 'Đang chờ duyệt'),
        ('APPROVED', 'Đã duyệt'),
        ('REJECTED', 'Bị từ chối'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    cv_file = models.FileField(upload_to='cvs/', null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')


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
    image = CloudinaryField('image')
    intro_video = CloudinaryField(resource_type='video', null=True, blank=True)
    fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)
    average_rating = models.FloatField(default=0.0)
    total_duration_video = models.PositiveIntegerField(default=0, help_text="Tổng số phút video")
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'INSTRUCTOR'})

    def __str__(self):
        return self.subject

    @property
    def duration_hours(self):
        return self.total_duration_video // 60


class Tag(BaseModel):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Lesson(BaseModel):
    subject = models.CharField(max_length=255)
    content = RichTextField()
    image = CloudinaryField('image', null=True, blank=True)
    video = CloudinaryField(resource_type='video', null=True, blank=True)
    video_minutes = models.PositiveIntegerField(default=0, blank=True, help_text="Thời lượng video (tính bằng phút)")
    order = models.PositiveIntegerField(default=1, help_text="Thứ tự bài học trong khóa")

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    tags = models.ManyToManyField(Tag, blank=True)

    class Meta:
        unique_together = ('order', 'course')
        ordering = ['order']

    def save(self, *args, **kwargs):
        if not self.pk:
            result = Lesson.objects.filter(course=self.course).aggregate(order_max=Max('order'))  # Dictionary
            max_order = result['order_max'] or 0
            self.order = max_order + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Bài {self.order}: {self.subject}"


# ==========================================
# MODEL NGHIỆP VỤ (ĐĂNG KÝ, THANH TOÁN VÀ TIẾN ĐỘ)
# ==========================================

class Enrollment(BaseModel):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'STUDENT'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    progress = models.FloatField(default=0.0, help_text="Tiến độ học tập (%)")

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} - {self.course.subject}"


class CompletedLesson(BaseModel):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('enrollment', 'lesson')

    def __str__(self):
        return f"{self.enrollment.student.username} completed {self.lesson.subject}"


class Payment(BaseModel):
    METHOD_CHOICES = (
        ('CASH', 'Tiền mặt trực tiếp'),
        ('PAYPAL', 'PayPal'),
        ('STRIPE', 'Stripe'),
        ('MOMO', 'MoMo'),
        ('ZALOPAY', 'ZaloPay'),
    )
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    is_successful = models.BooleanField(default=False)
    transaction_id = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Payment {self.id} - {self.payment_method}"


# ==========================================
# MODEL TƯƠNG TÁC (ĐÁNH GIÁ, BÌNH LUẬN)
# ==========================================

class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Comment(Interaction):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    content = models.CharField(max_length=255)


class Like(Interaction):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('lesson', 'user')


class CourseReview(Interaction):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('course', 'user')
