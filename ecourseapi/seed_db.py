import uuid
from ctypes import c_voidp

from django.contrib.auth import get_user_model
from courses.models import (
    InstructorApplication, Category, Course, Tag,
    Lesson, Enrollment, LessonProgress, Payment,
    Comment, Like, CourseReview
)

User = get_user_model()

print("=== BẮT ĐẦU QUÁ TRÌNH KHỞI TẠO DỮ LIỆU MẪU ===")

PASSWORD = '123456'

print("\n[1/7] Đang tạo tài khoản Users (Admin, Giảng viên, Sinh viên)...")
# --- Admin ---
admin = User.objects.create_superuser(username='admin123', email='admin@gmail.com', password=PASSWORD, role='ADMIN')

# --- Giảng viên ---
gv_da_duyet = User.objects.create_user(
    username='gv_trang', email='trang@gmail.com', password=PASSWORD, role='INSTRUCTOR',
    first_name='Trang', last_name='Phạm Bích',
)
gv_chua_duyet = User.objects.create_user(
    username='gv_phong', email='phong@gmail.com', password=PASSWORD,
    first_name='Phong', last_name='Lê Quang'
)
gv_bi_tu_choi = User.objects.create_user(
    username='gv_duc', email='duc@gmail.com', password=PASSWORD,
    first_name='Đức', last_name='Nguyễn Văn'
)

# --- Sinh viên ---
sv_an = User.objects.create_user(
    username='sv_nam', email='an@gmail.com', password=PASSWORD, role='STUDENT',
    first_name='Nam', last_name='Nguyễn Hữu',
)
sv_binh = User.objects.create_user(
    username='sv_binh', email='binh@gmail.com', password=PASSWORD, role='STUDENT',
    first_name='Bình', last_name='Trần Thanh'
)

print("\n[2/7] Đang xử lý Đơn xin giảng dạy (trạng thái)...")
InstructorApplication.objects.create(user=gv_da_duyet, cv_file='raw/upload/v1779352929/zzlghpocc3gpsvnuonp1.pdf',
                                     status='APPROVED')
InstructorApplication.objects.create(user=gv_chua_duyet, cv_file='raw/upload/v1779352929/zzlghpocc3gpsvnuonp1.pdf',
                                     status='PENDING')
InstructorApplication.objects.create(user=gv_bi_tu_choi, cv_file='raw/upload/v1779352929/zzlghpocc3gpsvnuonp1.pdf',
                                     status='REJECTED')

print("\n[3/7] Đang tạo Danh mục & Từ khóa (Tags)...")
cat_cntt = Category.objects.create(name='Công nghệ thông tin')
cat_nn = Category.objects.create(name='Ngoại ngữ')

tag_py = Tag.objects.create(name='Python')
tag_js = Tag.objects.create(name='Javascript')

print("\n[4/7] Đang tạo các Khóa học (Có phí & Miễn phí)...")
# Khóa học có phí
course_python = Course.objects.create(
    subject='Lập trình python từ Zero đến Hero',
    description='Khóa học cung cấp kiến thức nền tảng vững chắc về Python.',
    image='image/upload/v1778204592/lap_trinh_python_r6koh9.png',
    fee=1000.00,
    category=cat_cntt,
    instructor=gv_da_duyet
)
# Khóa học miễn phí (Để test luồng thanh toán 0đ)
course_free = Course.objects.create(
    subject='Nhập môn lập trình Javascript',
    description='Khóa học làm quen Javascript cho người mới.',
    image='image/upload/v1778204630/nhap_mon_lap_trinh_javascript_znpncy.jpg',
    fee=0.00,
    category=cat_cntt,
    instructor=gv_da_duyet
)

print("\n[5/7] Đang tạo Bài học (Video)...")
# Các bài học của khóa Python
l1 = Lesson.objects.create(
    subject='Bài 1: Cài đặt môi trường', content='<p>Hướng dẫn cài đặt.</p>',
    image='image/upload/v1778204683/cai_dat_moi_truong_gnrtvq.jpg',
    video='video/upload/v1778204725/cai_dat_moi_truong_wklmse.mp4',
    video_seconds=334, course=course_python
)
l1.tags.add(tag_py)

l2 = Lesson.objects.create(
    subject='Bài 2: Biến và kiểu dữ liệu', content='<p>Kiểu dữ liệu cơ bản.</p>',
    image='image/upload/v1778204812/bien_va_kieu_du_lieu_l55uoq.jpg',
    video='video/upload/v1778204823/bien_va_kieu_du_lieu_phytrl.mp4',
    video_seconds=198, course=course_python
)
l2.tags.add(tag_py)

# Bài học của khóa Miễn phí
l_free = Lesson.objects.create(
    subject='Bài 1: Javascript cơ bản', content='<p>Lý thuyết.</p>',
    image='image/upload/v1778204930/javascript_co_ban_g14h1l.jpg',
    video='video/upload/v1778204938/javascript_co_ban_ljztix.mp4',
    video_seconds=259, course=course_free
)
l_free.tags.add(tag_js)
print("\n[6/7] Đang xử lý Ghi danh, Thanh toán & Tiến độ học tập...")
# TH1: Sinh viên An mua khóa Python -> Thanh toán thành công -> Có tiến độ
en_an_pro = Enrollment.objects.create(student=sv_an, course=course_python)
Payment.objects.create(
    enrollment=en_an_pro, amount=course_python.fee, payment_method='MOMO',
    is_successful=True, transaction_id=str(uuid.uuid4())
)
LessonProgress.objects.create(enrollment=en_an_pro, lesson=l1, status='COMPLETED', watched_seconds=l1.video_seconds)
LessonProgress.objects.create(enrollment=en_an_pro, lesson=l2, status='IN_PROGRESS', watched_seconds=100)

# TH2: Sinh viên Bình mua khóa Python -> Thanh toán thất bại -> Không có tiến độ
en_binh_pro = Enrollment.objects.create(student=sv_binh, course=course_python)
Payment.objects.create(
    enrollment=en_binh_pro, amount=course_python.fee, payment_method='ZALOPAY',
    is_successful=False, transaction_id=str(uuid.uuid4())
)

# TH3: Sinh viên An đăng ký khóa Miễn phí -> Thanh toán Tiền mặt (0đ) thành công
en_an_free = Enrollment.objects.create(student=sv_an, course=course_free)
Payment.objects.create(
    enrollment=en_an_free, amount=course_free.fee, payment_method='CASH',
    is_successful=True, transaction_id=str(uuid.uuid4())
)
LessonProgress.objects.create(enrollment=en_an_free, lesson=l_free, status='COMPLETED',
                              watched_seconds=l_free.video_seconds)

print("\n[7/7] Đang tạo Tương tác (Bình luận, Thích, Đánh giá)...")
# Bình luận & Reply
cmt_goc = Comment.objects.create(user=sv_an, lesson=l1, content='Thầy giảng rất dễ hiểu ạ!', parent=None)
Comment.objects.create(user=gv_da_duyet, lesson=l1, content='Cảm ơn em nhé!', parent=cmt_goc)

# Thích bài học
Like.objects.create(user=sv_an, lesson=l1)

# Đánh giá khóa học
# (Sinh viên An đã hoàn thành 1/2 bài khóa Python = 50% tiến độ -> Đủ điều kiện > 20% để đánh giá)
CourseReview.objects.create(
    user=sv_an, course=course_python, rating=5,
    comment='Khóa học vô cùng chất lượng, hình ảnh và âm thanh rõ nét.'
)

print("\n=== HOÀN TẤT! DỮ LIỆU ĐÃ SẴN SÀNG ĐỂ SỬ DỤNG. ===")
