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


class User(AbstractUser):
    """
    Model User mở rộng từ AbstractUser của Django để lưu trữ thông tin người dùng.
    Mỗi User có một vai trò (role) cụ thể trong hệ thống.
    """
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Quản trị viên'
        INSTRUCTOR = 'INSTRUCTOR', 'Giảng viên'
        STUDENT = 'STUDENT', 'Sinh viên'

    # Lưu ảnh đại diện của user trên Cloudinary
    avatar = CloudinaryField('avatar', null=True, blank=True,
                             default="image/upload/v1765436438/shtnr60mecp057e2uctk.jpg")
    # Phân quyền user
    role = models.CharField(max_length=15, choices=Role.choices, default=Role.STUDENT)

    def __str__(self):
        return self.username

    def get_full_name(self):
        # Trả về họ tên đầy đủ của user, loại bỏ khoảng trắng thừa
        return f"{self.last_name} {self.first_name}".strip()


class BaseModel(models.Model):
    """
    Model cơ sở chứa các trường chung cho nhiều model khác (active, created_date, updated_date).
    Được thiết kế dưới dạng abstract class để không tạo bảng riêng trong database.
    """
    active = models.BooleanField(default=True) # Trạng thái kích hoạt (soft delete)
    created_date = models.DateTimeField(auto_now_add=True) # Thời gian tạo (tự động gán)
    updated_date = models.DateTimeField(auto_now=True) # Thời gian cập nhật (tự động cập nhật mỗi khi save)

    class Meta:
        abstract = True


class InstructorApplication(BaseModel):
    """
    Đơn đăng ký làm giảng viên của User.
    Admin sẽ dựa vào đơn này (và file CV) để xét duyệt.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Đang chờ duyệt'
        APPROVED = 'APPROVED', 'Đã duyệt'
        REJECTED = 'REJECTED', 'Bị từ chối'

    # Một user chỉ có 1 đơn đăng ký
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='instructor')
    # File CV upload lên Cloudinary, chỉ chấp nhận định dạng tài liệu
    cv_file = CloudinaryField('cv_file', resource_type='raw', null=True, blank=True,
                              validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])])
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)


class Category(BaseModel):
    """
    Danh mục khóa học (vd: Lập trình, Thiết kế, Marketing...).
    """
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Course(BaseModel):
    """
    Thông tin về khóa học, bao gồm các thống kê được tính toán tự động 
    để tối ưu hiệu suất truy vấn thay vì tính toán (count, sum) realtime.
    """
    subject = models.CharField(max_length=255) # Tên khóa học
    description = models.TextField(null=True, blank=True) # Mô tả chi tiết
    image = CloudinaryField('image', null=True, blank=True) # Ảnh bìa
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.0,
                              validators=[MinValueValidator(Decimal('0.00'))]) # Giá khóa học
    average_rating = models.FloatField(default=0.0) # Điểm đánh giá trung bình
    total_duration_video = models.PositiveIntegerField(default=0, help_text="Tổng số giây video")

    total_students = models.PositiveIntegerField(default=0, help_text="Tổng số học viên")
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0.0,
                                        validators=[MinValueValidator(Decimal('0.00'))], help_text="Tổng doanh thu")

    # Mối quan hệ tới Category, khi category bị xóa thì set null
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='courses')
    # Giảng viên của khóa học, chỉ cho phép chọn những User là INSTRUCTOR và đã được APPROVED
    instructor = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='teaching_courses',
                                   limit_choices_to={'role': 'INSTRUCTOR', 'instructor__status': 'APPROVED'})

    def __str__(self):
        return self.subject

    def update_duration(self):
        # Hàm tính lại tổng thời lượng video của các bài học và cập nhật vào khóa học
        duration = self.lessons.aggregate(total=Sum('video_seconds'))
        self.total_duration_video = duration['total'] or 0
        self.save(update_fields=['total_duration_video'])

    def update_rating(self):
        # Hàm tính lại đánh giá trung bình từ các review và cập nhật
        rating = self.reviews.aggregate(avg=Avg('rating'))
        self.average_rating = round(rating['avg'] or 0.0, 1)
        self.save(update_fields=['average_rating'])

    def update_stats(self):
        # Hàm tính lại tổng học viên và doanh thu dựa trên các enrollments đã thanh toán thành công
        successful_enrollments = self.enrollments.filter(payment__is_successful=True)
        self.total_students = successful_enrollments.count()
        total_rev = successful_enrollments.aggregate(total=Sum('payment__amount'))['total']
        self.total_revenue = total_rev or 0.0
        self.save(update_fields=['total_students', 'total_revenue'])


class Tag(BaseModel):
    """
    Từ khóa để phân loại nội dung bài học.
    """
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Lesson(BaseModel):
    """
    Bài học thuộc về một khóa học. Mỗi bài học có nội dung văn bản và/hoặc video.
    """
    subject = models.CharField(max_length=255)
    content = RichTextField() # Nội dung định dạng HTML (CKEditor)
    image = CloudinaryField('image', null=True, blank=True)
    video = CloudinaryField(resource_type='video', null=True, blank=True)
    video_seconds = models.PositiveIntegerField(default=0, blank=True, help_text="Thời lượng video (tính bằng giây)")
    order = models.PositiveIntegerField(default=1, help_text="Thứ tự bài học trong khóa")
    is_preview = models.BooleanField(default=False,
                                     help_text="Cho phép xem thử bài học miễn phí trước khi đăng ký khóa học")

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    tags = models.ManyToManyField(Tag, blank=True)

    class Meta:
        unique_together = ('order', 'course') # Không được trùng thứ tự trong cùng 1 khóa học
        ordering = ['order'] # Mặc định sắp xếp theo thứ tự (order)

    def save(self, *args, **kwargs):
        # Xử lý dọn dẹp các đường dẫn (URL) cho video/image không hợp lệ trước khi lưu
        if self.video and isinstance(self.video, str) and not self.video.startswith(
                'http') and 'upload/' not in self.video:
            self.video = None

        if self.image and isinstance(self.image, str) and not self.image.startswith(
                'http') and 'upload/' not in self.image:
            self.image = None

        # Tự động gán thứ tự bài học tiếp theo (max order + 1) nếu là tạo mới
        if not self.pk:
            result = Lesson.objects.filter(course=self.course).aggregate(order_max=Max('order'))
            max_order = result['order_max'] or 0
            self.order = max_order + 1

        super().save(*args, **kwargs)

        # Lấy độ dài (duration) của video trên Cloudinary sau khi upload
        if self.video and self.video_seconds == 0 and hasattr(self.video, 'public_id'):
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

        # Tính toán lại tổng thời lượng cho khóa học mẹ
        self.course.update_duration()

    def delete(self, *args, **kwargs):
        course = self.course
        super().delete(*args, **kwargs)
        # Cập nhật lại thời lượng của khóa học sau khi xóa bài học
        course.update_duration()


class Enrollment(BaseModel):
    """
    Bảng ghi lại việc học viên đăng ký tham gia một khóa học.
    Đồng thời lưu tiến độ hoàn thành khóa học của học viên.
    """
    student = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.RESTRICT, related_name='enrollments')
    progress = models.FloatField(default=0.0, help_text="Tiến độ học tập (%)")

    class Meta:
        unique_together = ('student', 'course') # Một sinh viên chỉ đăng ký một khóa học 1 lần

    def update_progress(self):
        # Hàm tính toán lại % tiến độ hoàn thành dựa trên số bài học đã học
        total_lessons = self.course.lessons.count()
        if total_lessons > 0:
            completed = self.lesson_progresses.filter(status='COMPLETED').count()
            self.progress = round((completed / total_lessons) * 100, 2)
        else:
            self.progress = 0.0
        self.save(update_fields=['progress'])


class LessonProgress(BaseModel):
    """
    Bảng theo dõi tiến độ của học viên cho TỪNG BÀI HỌC cụ thể.
    """
    class Status(models.TextChoices):
        IN_PROGRESS = 'IN_PROGRESS', 'Đang học'
        COMPLETED = 'COMPLETED', 'Đã hoàn thành'

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='lesson_progresses')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.IN_PROGRESS)
    watched_seconds = models.PositiveIntegerField(default=0, help_text="Đã xem đến giây thứ")

    class Meta:
        unique_together = ('enrollment', 'lesson') # Mỗi lượt đăng ký chỉ có 1 tiến độ cho mỗi bài học

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Cập nhật tiến độ tổng quát của khóa học (Enrollment) khi bài học này đổi trạng thái
        self.enrollment.update_progress()

    def delete(self, *args, **kwargs):
        enrollment = self.enrollment
        super().delete(*args, **kwargs)
        enrollment.update_progress()


class Payment(BaseModel):
    """
    Lưu trữ lịch sử thanh toán cho khóa học.
    """
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
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True) # Mã GD từ cổng thanh toán

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Nếu thanh toán thành công, thống kê lại tổng thu và học viên cho khóa học
        if self.is_successful:
            self.enrollment.course.update_stats()


class Interaction(BaseModel):
    """
    Model abstract chung cho các tương tác của user (bình luận, like, đánh giá).
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Comment(Interaction):
    """
    Bình luận của user về một bài học cụ thể.
    """
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='comments')
    content = models.CharField(max_length=255)
    # Hỗ trợ reply bình luận bằng cách tự liên kết với chính Comment (Self-referential)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')


class Like(Interaction):
    """
    Chức năng thích (Like) bài học.
    """
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='likes')

    class Meta:
        unique_together = ('lesson', 'user') # Một user chỉ được like một bài học 1 lần


class CourseReview(Interaction):
    """
    Đánh giá khóa học (từ 1-5 sao) kèm nhận xét.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('course', 'user') # Một user chỉ review một khóa học 1 lần

    def clean(self):
        # Custom logic để kiểm tra (validate) dữ liệu trước khi save
        MIN_PROGRESS = 20.0

        # Giảng viên chính của khóa học không thể tự đánh giá
        if self.course.instructor == self.user:
            raise ValidationError("Bạn không thể đánh giá khóa học do chính mình giảng dạy.")

        # Kiểm tra user đã mua khóa học hay chưa
        enrollment = self.user.enrollments.filter(course=self.course, payment__is_successful=True).first()

        if not enrollment:
            raise ValidationError("Bạn chưa đăng ký khóa học này hoặc thanh toán chưa thành công.")

        # Chỉ được đánh giá khi hoàn thành tối thiểu 20% khóa học
        if enrollment.progress < MIN_PROGRESS:
            raise ValidationError(
                f"Tiến độ hiện tại của bạn là {enrollment.progress}%. Cần tối thiểu {int(MIN_PROGRESS)}% để đánh giá.")

    def save(self, *args, **kwargs):
        # Đảm bảo hàm clean() chạy khi save thủ công (Django model form sẽ tự gọi clean)
        self.full_clean()
        super().save(*args, **kwargs)
        # Cập nhật điểm rating cho khóa học sau khi có review mới
        self.course.update_rating()

    def delete(self, *args, **kwargs):
        course = self.course
        super().delete(*args, **kwargs)
        # Cập nhật điểm rating cho khóa học sau khi xóa review
        course.update_rating()
