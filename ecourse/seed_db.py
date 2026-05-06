import datetime
from django.contrib.auth import get_user_model
from courses.models import (
    InstructorApplication, Category, Course, Tag,
    Lesson, Enrollment, LessonProgress, Payment,
    Comment, Like, CourseReview
)

User = get_user_model()

print("=== BẮT ĐẦU QUÁ TRÌNH KHỞI TẠO DỮ LIỆU MẪU ===")

print("\n[1/8] Đang dọn dẹp dữ liệu cũ (Xóa Database)...")
CourseReview.objects.all().delete()
Comment.objects.all().delete()
Like.objects.all().delete()
Payment.objects.all().delete()
LessonProgress.objects.all().delete()
Enrollment.objects.all().delete()
Lesson.objects.all().delete()
Course.objects.all().delete()
Tag.objects.all().delete()
Category.objects.all().delete()
InstructorApplication.objects.all().delete()
User.objects.exclude(is_superuser=True).delete()  # Giữ lại tài khoản Admin (Superuser)

PASSWORD = '123'

print("\n[2/8] Đang tạo tài khoản Users (Giảng viên, Sinh viên)...")
# --- Giảng viên ---
gv_thanh = User.objects.create_user(
    username='gv_thanh', email='thanh@gmail.com', password=PASSWORD, role='INSTRUCTOR',
    first_name='Thành', last_name='Dương Hữu',
)
gv_chua_duyet = User.objects.create_user(
    username='gv_test', email='test@gmail.com', password=PASSWORD, role='INSTRUCTOR',
    first_name='Test', last_name='Giảng Viên'
)
gv_bi_tu_choi = User.objects.create_user(
    username='gv_fail', email='fail@gmail.com', password=PASSWORD, role='INSTRUCTOR',
    first_name='Fail', last_name='Giảng Viên'
)

# --- Sinh viên ---
sv_an = User.objects.create_user(
    username='sv_an', email='an@gmail.com', password=PASSWORD, role='STUDENT',
    first_name='An', last_name='Nguyễn',
)
sv_binh = User.objects.create_user(
    username='sv_binh', email='binh@gmail.com', password=PASSWORD, role='STUDENT',
    first_name='Bình', last_name='Trần'
)

print("\n[3/8] Đang xử lý Đơn xin giảng dạy (cv_file, trạng thái, ghi chú)...")
InstructorApplication.objects.create(
    user=gv_thanh,  # cv_file='cvs/cv_thanh_duong.pdf',
    status='APPROVED'
)
InstructorApplication.objects.create(
    user=gv_chua_duyet,  # cv_file='cvs/cv_test.docx',
    status='PENDING'
)
InstructorApplication.objects.create(
    user=gv_bi_tu_choi,  # cv_file='cvs/cv_sao_chep.pdf',
    status='REJECTED',
)

print("\n[4/8] Đang tạo Danh mục & Từ khóa (Tags)...")
cat_cntt = Category.objects.create(name='Công nghệ thông tin')
cat_nn = Category.objects.create(name='Ngoại ngữ')

tag_py = Tag.objects.create(name='Python')
tag_web = Tag.objects.create(name='Web Dev')

print("\n[5/8] Đang tạo các Khóa học (Có phí & Miễn phí)...")
# Khóa học có phí
course_python = Course.objects.create(
    subject='Lập trình Python từ Zero đến Hero',
    description='Khóa học cung cấp kiến thức nền tảng vững chắc về Python.',
    image='image/upload/v12345/course_python.jpg',
    intro_video='video/upload/v12345/intro_python.mp4',
    fee=1200000.00,
    category=cat_cntt,
    instructor=gv_thanh
)
# Khóa học miễn phí (Để test luồng thanh toán 0đ)
course_free = Course.objects.create(
    subject='Nhập môn Lập trình (Miễn phí)',
    description='Khóa học làm quen tư duy thuật toán.',
    image='image/upload/v1/free.jpg',
    fee=0.00,
    category=cat_cntt,
    instructor=gv_thanh
)

print("\n[6/8] Đang tạo Bài học (Tài liệu đính kèm, Video)...")
# Các bài học của khóa Python
l1 = Lesson.objects.create(
    subject='Bài 1: Cài đặt môi trường', content='<p>Hướng dẫn cài đặt.</p>',
    image='image/upload/v123/l1_thumb.jpg', video='video/upload/v123/l1.mp4',
    video_minutes=15, course=course_python, attachment='raw/upload/v1/slide_l1.pdf'
)
l1.tags.add(tag_py)

l2 = Lesson.objects.create(
    subject='Bài 2: Biến và Kiểu dữ liệu', content='<p>Kiểu dữ liệu cơ bản.</p>',
    image='image/upload/v123/l2_thumb.jpg', video='video/upload/v123/l2.mp4',
    video_minutes=30, course=course_python, attachment='raw/upload/v1/source_l2.zip'
)
l2.tags.add(tag_py, tag_web)

# Bài học của khóa Miễn phí
l_free = Lesson.objects.create(
    subject='Bài 1: Tư duy máy tính', content='<p>Lý thuyết.</p>',
    video_minutes=20, course=course_free
)

print("\n[7/8] Đang xử lý Ghi danh, Thanh toán & Tiến độ học tập...")
# TH1: Sinh viên An mua khóa Python -> Thanh toán thành công -> Có tiến độ
en_an_pro = Enrollment.objects.create(student=sv_an, course=course_python)
Payment.objects.create(
    enrollment=en_an_pro, amount=1200000.00, payment_method='MOMO',
    is_successful=True, transaction_id='MOMO_TXN_001928'
)
LessonProgress.objects.create(enrollment=en_an_pro, lesson=l1, status='COMPLETED', watched_seconds=900)
LessonProgress.objects.create(enrollment=en_an_pro, lesson=l2, status='IN_PROGRESS', watched_seconds=600)

# TH2: Sinh viên Bình mua khóa Python -> Thanh toán thất bại -> Không có tiến độ
en_binh_pro = Enrollment.objects.create(student=sv_binh, course=course_python)
Payment.objects.create(
    enrollment=en_binh_pro, amount=1200000.00, payment_method='ZALOPAY',
    is_successful=False, transaction_id='ZALO_FAILED_001'
)

# TH3: Sinh viên An đăng ký khóa Miễn phí -> Thanh toán Tiền mặt (0đ) thành công
en_an_free = Enrollment.objects.create(student=sv_an, course=course_free)
Payment.objects.create(
    enrollment=en_an_free, amount=0.00, payment_method='CASH',
    is_successful=True, transaction_id='FREE_TXN_001'
)
LessonProgress.objects.create(enrollment=en_an_free, lesson=l_free, status='COMPLETED', watched_seconds=1200)

print("\n[8/8] Đang tạo Tương tác (Bình luận, Thích, Đánh giá)...")
# Bình luận & Reply
cmt_goc = Comment.objects.create(user=sv_an, lesson=l1, content='Thầy giảng rất dễ hiểu ạ!', parent=None)
Comment.objects.create(user=gv_thanh, lesson=l1, content='Cảm ơn em nhé!', parent=cmt_goc)

# Thích bài học
Like.objects.create(user=sv_an, lesson=l1)

# Đánh giá khóa học
# (Sinh viên An đã hoàn thành 1/2 bài khóa Python = 50% tiến độ -> Đủ điều kiện > 20% để đánh giá)
CourseReview.objects.create(
    user=sv_an, course=course_python, rating=5,
    comment='Khóa học vô cùng chất lượng, hình ảnh và âm thanh rõ nét.'
)

print("\n=== HOÀN TẤT! DỮ LIỆU ĐÃ SẴN SÀNG ĐỂ SỬ DỤNG. ===")
