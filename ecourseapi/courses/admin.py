from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db.models.functions import TruncMonth
from django.template.response import TemplateResponse
from django.utils.html import mark_safe
from django.urls import path
from django import forms
from django.db.models import Count, Sum, Q
from ckeditor_uploader.widgets import CKEditorUploadingWidget

# Import toàn bộ models của bạn
from .models import (
    User, InstructorApplication, Category, Course, Tag,
    Lesson, Enrollment, LessonProgress, Payment,
    Comment, Like, CourseReview
)


# =========================================================
# 1. TÙY CHỈNH FORMS (GIAO DIỆN NHẬP LIỆU CHO ADMIN)
# =========================================================

class CourseForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Cho phép trường description không bắt buộc nhập
        self.fields['description'].required = False

    class Meta:
        model = Course
        fields = '__all__'


class LessonForm(forms.ModelForm):
    # Sử dụng CKEditor để soạn thảo nội dung HTML cho bài học
    content = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Lesson
        fields = '__all__'


# =========================================================
# 2. NHÓM 1: TOÀN QUYỀN (QUẢN TRỊ VIÊN CÓ THỂ THÊM/SỬA/XÓA)
# =========================================================

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Thông tin bổ sung', {'fields': ('avatar', 'role')}),
    )


class InstructorApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'created_date')
    list_filter = ('status',)
    search_fields = ('user__username',)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'active', 'created_date')
    search_fields = ('name',)


class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)


# =========================================================
# 3. NHÓM 2: KIỂM DUYỆT & QUẢN LÝ NỘI DUNG (HẠN CHẾ)
# =========================================================

class CourseAdmin(admin.ModelAdmin):
    list_display = ['id', 'subject', 'category', 'instructor', 'fee', 'active', 'course_image']
    search_fields = ['subject', 'description']
    list_filter = ['category', 'active']
    readonly_fields = ['course_image', 'total_duration_video', 'total_students', 'total_revenue', 'average_rating']
    form = CourseForm

    def course_image(self, course):
        if course.image:
            return mark_safe(
                f'<img src="{course.image.url}" width="120" style="border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />')
        return "Chưa có ảnh"

    course_image.short_description = 'Ảnh đại diện'


class LessonAdmin(admin.ModelAdmin):
    form = LessonForm
    list_display = ('subject', 'course', 'order', 'active', 'is_preview')
    search_fields = ('subject',)
    list_filter = ('course', 'is_preview')


class CourseReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'rating', 'created_date')
    list_filter = ('rating',)
    readonly_fields = ('user', 'course', 'rating', 'comment')  # Khóa không cho sửa nội dung đánh giá

    # Chặn không cho Admin tự tạo đánh giá ảo
    def has_add_permission(self, request):
        return False


class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'content', 'created_date')
    readonly_fields = ('user', 'lesson', 'content', 'parent')

    def has_add_permission(self, request):
        return False


class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'created_date')

    def has_add_permission(self, request):
        return False


# =========================================================
# 4. NHÓM 3: CHỈ XEM (READ-ONLY) - DỮ LIỆU NHẠY CẢM/TỰ ĐỘNG
# =========================================================

class PaymentAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'amount', 'payment_method', 'is_successful', 'transaction_id')
    list_filter = ('payment_method', 'is_successful')
    search_fields = ('transaction_id', 'enrollment__student__username')

    # Khóa hoàn toàn quyền Thêm và Sửa để bảo vệ dữ liệu tài chính
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'progress', 'active', 'created_date')
    list_filter = ('course', 'active')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'lesson', 'status', 'watched_seconds')
    list_filter = ('status',)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


# =========================================================
# 5. TẠO TRANG QUẢN TRỊ TÙY BIẾN (CUSTOM ADMIN SITE)
# =========================================================

class MyAdminSite(admin.AdminSite):
    site_header = 'Hệ Thống Quản Lý Khóa Học'
    site_title = 'Admin eCourse'
    index_title = 'Bảng điều khiển trung tâm'

    def get_urls(self):
        return [
            path('courses-stats/', self.course_stats, name='course-stats'),
        ] + super().get_urls()

    def course_stats(self, request):
        # 1. Thống kê khóa học theo danh mục (Biểu đồ tròn)
        stats = Category.objects.annotate(c=Count('courses')).values('name', 'c')

        # 2. Thống kê doanh thu theo Khóa học (Top 5 khóa học kiếm tiền nhiều nhất)
        revenue_stats = Course.objects.annotate(
            total_rev=Sum('enrollments__payment__amount', filter=Q(enrollments__payment__is_successful=True))
        ).values('subject', 'total_rev').order_by('-total_rev')[:5]

        # 3. Tần suất đăng ký theo tháng
        enrollment_trend = Enrollment.objects.annotate(month=TruncMonth('created_date')).values('month').annotate(
            count=Count('id')
        ).order_by('month')

        # 4. Lấy các con số tổng quát (Tổng quan)
        total_students = User.objects.filter(role='STUDENT').count()
        total_revenue = Payment.objects.filter(is_successful=True).aggregate(Sum('amount'))['amount__sum'] or 0

        context = self.each_context(request)
        context.update({
            'stats': stats,
            'revenue_stats': revenue_stats,
            'enrollment_trend': enrollment_trend,
            'total_students': total_students,
            'total_revenue': total_revenue,
            'title': 'Báo Cáo Tổng Quan Hệ Thống'
        })

        return TemplateResponse(request, 'admin/course_stats.html', context)


# Khởi tạo site admin mới
admin_site = MyAdminSite(name='myadmin')

# =========================================================
# 6. ĐĂNG KÝ MODELS VÀO CUSTOM ADMIN SITE
# =========================================================

admin_site.register(User, CustomUserAdmin)
admin_site.register(InstructorApplication, InstructorApplicationAdmin)
admin_site.register(Category, CategoryAdmin)
admin_site.register(Tag, TagAdmin)

admin_site.register(Course, CourseAdmin)
admin_site.register(Lesson, LessonAdmin)
admin_site.register(CourseReview, CourseReviewAdmin)
admin_site.register(Comment, CommentAdmin)
admin_site.register(Like, LikeAdmin)

admin_site.register(Payment, PaymentAdmin)
admin_site.register(Enrollment, EnrollmentAdmin)
admin_site.register(LessonProgress, LessonProgressAdmin)