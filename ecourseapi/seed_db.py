import uuid
import random
import re
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Max
from django.core.exceptions import ValidationError

from courses.models import (
    InstructorApplication, Category, Course, Tag,
    Lesson, Enrollment, LessonProgress, Payment,
    Comment, Like, CourseReview
)

User = get_user_model()

print("=========================================================")
print("=== BẮT ĐẦU QUÁ TRÌNH KHỞI TẠO DỮ LIỆU MẪU ĐỒ SỘ (MASSIVE) ===")
print("=========================================================")

PASSWORD = '123456'
now = timezone.now()

# ---------------------------------------------------------
# 1. Tạo Tài khoản Người dùng (Admin, Giảng viên, Sinh viên)
# ---------------------------------------------------------
print("\n[1/10] Đang tạo tài khoản Users (Admin, Giảng viên, Sinh viên)...")

# --- Admin ---
admin = User.objects.create_superuser(
    username='admin123',
    email='admin@gmail.com',
    password=PASSWORD,
    role='ADMIN',
    first_name='Trị',
    last_name='Quản'
)
print(f" -> Đã tạo Admin: {admin.username}")

# --- Giảng viên ---
instructors_data = [
    ('gv_trang', 'Phạm Bích', 'Trang', 'trang@gmail.com', 'APPROVED'),
    ('gv_phong', 'Lê Quang', 'Phong', 'phong@gmail.com', 'APPROVED'),
    ('gv_duc', 'Nguyễn Văn', 'Đức', 'duc@gmail.com', 'APPROVED'),
    ('gv_tranha', 'Trần Thu', 'Hà', 'ha@gmail.com', 'APPROVED'),
    ('gv_tuan', 'Hoàng Minh', 'Tuấn', 'tuan@gmail.com', 'APPROVED'),
    ('gv_anh', 'Bùi Minh', 'Anh', 'anh@gmail.com', 'APPROVED'),
    ('gv_long', 'Võ Hoàng', 'Long', 'long@gmail.com', 'PENDING'),
    ('gv_lan', 'Nguyễn Thị', 'Lan', 'lan@gmail.com', 'REJECTED'),
]

instructors = []
for username, last_name, first_name, email, status in instructors_data:
    user = User.objects.create_user(
        username=username,
        email=email,
        password=PASSWORD,
        role='INSTRUCTOR',
        first_name=first_name,
        last_name=last_name
    )
    # Tạo đơn đăng ký tương ứng
    InstructorApplication.objects.create(
        user=user,
        cv_file='raw/upload/v1779352929/zzlghpocc3gpsvnuonp1.pdf',
        status=status
    )
    if status == 'APPROVED':
        instructors.append(user)
    print(f" -> Đã tạo Giảng viên: {user.username} ({status})")

# --- Sinh viên ---
students_data = [
    ('sv_an_sv', 'Nguyễn Hữu', 'An', 'an@gmail.com'),
    ('sv_binh', 'Trần Thanh', 'Bình', 'binh@gmail.com'),
    ('sv_cuong', 'Lê Quốc', 'Cường', 'cuong@gmail.com'),
    ('sv_dung', 'Phạm Tiến', 'Dũng', 'dung@gmail.com'),
    ('sv_giang', 'Hoàng Hương', 'Giang', 'giang@gmail.com'),
    ('sv_hoa', 'Nguyễn Mai', 'Hoa', 'hoa@gmail.com'),
    ('sv_khanh', 'Trần Gia', 'Khánh', 'khanh@gmail.com'),
    ('sv_linh', 'Vũ Thùy', 'Linh', 'linh@gmail.com'),
    ('sv_minh', 'Đỗ Quang', 'Minh', 'minh@gmail.com'),
    ('sv_nam', 'Nguyễn Hải', 'Nam', 'nam@gmail.com'),
    ('sv_oanh', 'Phan Kim', 'Oanh', 'oanh@gmail.com'),
    ('sv_phuong', 'Nguyễn Lan', 'Phương', 'phuong@gmail.com'),
    ('sv_quan', 'Lê Hồng', 'Quân', 'quan@gmail.com'),
    ('sv_son', 'Trần Minh', 'Sơn', 'son@gmail.com'),
    ('sv_thao', 'Phạm Thu', 'Thảo', 'thao@gmail.com'),
    ('sv_tuan_sv', 'Nguyễn Anh', 'Tuấn', 'tuan_sv@gmail.com'),
    ('sv_vy_sv', 'Đặng Mai', 'Vy', 'vy@gmail.com'),
    ('sv_yen', 'Bùi Kim', 'Yến', 'yen@gmail.com'),
    ('sv_hoang', 'Nguyễn Huy', 'Hoàng', 'hoang@gmail.com'),
    ('sv_lam', 'Võ Hoàng', 'Lâm', 'lam@gmail.com'),
    ('sv_duong', 'Nguyễn Thùy', 'Dương', 'duong@gmail.com'),
    ('sv_quynh', 'Lê Thị', 'Quỳnh', 'quynh@gmail.com'),
    ('sv_trang_sv', 'Phạm Quỳnh', 'Trang', 'trang_sv@gmail.com'),
    ('sv_phong_sv', 'Lê Thanh', 'Phong', 'phong_sv@gmail.com'),
    ('sv_dat', 'Nguyễn Tiến', 'Đạt', 'dat@gmail.com'),
    ('sv_hieu', 'Trần Trung', 'Hiếu', 'hieu@gmail.com'),
    ('sv_bach', 'Đỗ Hoàng', 'Bách', 'bach@gmail.com'),
    ('sv_hung', 'Nguyễn Mạnh', 'Hùng', 'hung@gmail.com'),
    ('sv_thanh', 'Phan Văn', 'Thành', 'thanh@gmail.com'),
    ('sv_quang', 'Vũ Đăng', 'Quang', 'quang@gmail.com'),
]

students = []
for username, last_name, first_name, email in students_data:
    user = User.objects.create_user(
        username=username,
        email=email,
        password=PASSWORD,
        role='STUDENT',
        first_name=first_name,
        last_name=last_name
    )
    students.append(user)
print(f" -> Đã tạo thành công {len(students)} tài khoản sinh viên.")

# ---------------------------------------------------------
# 2. Tạo Danh mục (Categories) & Thẻ Từ khóa (Tags)
# ---------------------------------------------------------
print("\n[2/10] Đang tạo Danh mục & Từ khóa (Tags)...")

categories_data = [
    'Công nghệ thông tin',
    'Ngoại ngữ',
    'Thiết kế đồ họa',
    'Kỹ năng mềm',
    'Kinh doanh & Khởi nghiệp',
    'Marketing & Truyền thông',
    'Khoa học dữ liệu & AI',
    'Nhiếp ảnh & Quay phim'
]
categories = []
for name in categories_data:
    cat = Category.objects.create(name=name)
    categories.append(cat)
    print(f" -> Danh mục: {cat.name}")

tags_data = [
    'Python', 'Django', 'Javascript', 'React Native', 'ReactJS',
    'Node.JS', 'HTML/CSS', 'UI/UX', 'IELTS', 'TOEIC',
    'Tiếng Nhật', 'Photoshop', 'Illustrator', 'Premiere', 'Kỹ năng giao tiếp',
    'Thuyết trình', 'SEO', 'Google Ads', 'Machine Learning', 'Kịch bản phim'
]
tags = []
for name in tags_data:
    tag = Tag.objects.create(name=name)
    tags.append(tag)
print(f" -> Đã tạo {len(tags)} thẻ từ khóa.")

# ---------------------------------------------------------
# 3. Tạo Khóa học (Courses)
# ---------------------------------------------------------
print("\n[3/10] Đang tạo các Khóa học (Có phí & Miễn phí)...")

courses_spec = [
    # CNTT
    {
        'subject': 'Lập trình Python từ Zero đến Hero',
        'description': 'Khóa học cung cấp kiến thức nền tảng vững chắc về Python từ cú pháp cơ bản đến nâng cao, lập trình hướng đối tượng, xử lý file và chuẩn bị cho lập trình web/phân tích dữ liệu.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 990000.00,
        'category_idx': 0,
        'instructor_idx': 0,  # gv_trang
        'tag_names': ['Python', 'HTML/CSS']
    },
    {
        'subject': 'Lập trình Web với ReactJS và Django',
        'description': 'Học cách xây dựng một ứng dụng web Fullstack hiện đại sử dụng Django REST Framework ở Back-end và ReactJS ở Front-end.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 1500000.00,
        'category_idx': 0,
        'instructor_idx': 1,  # gv_phong
        'tag_names': ['Django', 'ReactJS', 'Javascript', 'HTML/CSS']
    },
    {
        'subject': 'Xây dựng App Mobile với React Native',
        'description': 'Hướng dẫn tự tay thiết kế và lập trình ứng dụng di động đa nền tảng iOS & Android với React Native và Expo từ đầu.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 1800000.00,
        'category_idx': 0,
        'instructor_idx': 2,  # gv_duc
        'tag_names': ['React Native', 'Javascript', 'UI/UX']
    },
    {
        'subject': 'Nhập môn lập trình Javascript',
        'description': 'Học nền tảng lập trình Javascript căn bản, các khái niệm biến, hàm, mảng, bất đồng bộ và tương tác với DOM trình duyệt.',
        'image': 'image/upload/v1778204630/nhap_mon_lap_trinh_javascript_znpncy.jpg',
        'fee': 0.00,
        'category_idx': 0,
        'instructor_idx': 0,  # gv_trang
        'tag_names': ['Javascript']
    },
    # Ngoại ngữ
    {
        'subject': 'Luyện thi IELTS 6.5+ toàn diện',
        'description': 'Khóa học cung cấp lộ trình, phương pháp và đề thi thử trọn vẹn cả 4 kỹ năng Nghe, Nói, Đọc, Viết đạt mục tiêu IELTS 6.5+.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 2200000.00,
        'category_idx': 1,
        'instructor_idx': 3,  # gv_ha
        'tag_names': ['IELTS']
    },
    {
        'subject': 'Tiếng Anh giao tiếp công sở thực chiến',
        'description': 'Trang bị tiếng Anh giao tiếp chuyên nghiệp trong môi trường doanh nghiệp: viết email, họp hành, đàm phán, gọi điện thoại.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 650000.00,
        'category_idx': 1,
        'instructor_idx': 3,  # gv_ha
        'tag_names': ['IELTS']
    },
    {
        'subject': 'Tự học Tiếng Nhật N5 cấp tốc',
        'description': 'Khóa học dành cho người mới bắt đầu chinh phục tiếng Nhật: thuộc bảng chữ cái, giao tiếp cơ bản và thi đỗ N5.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 0.00,
        'category_idx': 1,
        'instructor_idx': 4,  # gv_tuan
        'tag_names': ['Tiếng Nhật']
    },
    # Thiết kế đồ họa
    {
        'subject': 'Thiết kế đồ họa chuyên nghiệp với Photoshop & Illustrator',
        'description': 'Làm chủ hai công cụ thiết kế đồ họa đỉnh cao để tự tay thiết kế logo, banner quảng cáo, poster, và chỉnh sửa ảnh chuyên nghiệp.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 1200000.00,
        'category_idx': 2,
        'instructor_idx': 5,  # gv_anh
        'tag_names': ['Photoshop', 'Illustrator']
    },
    {
        'subject': 'UI/UX Design cho thiết kế Web/App di động',
        'description': 'Học tư duy trải nghiệm người dùng (UX) và thiết kế giao diện (UI) hiện đại với Figma. Quy trình thiết kế sản phẩm hoàn chỉnh.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 1600000.00,
        'category_idx': 2,
        'instructor_idx': 5,  # gv_anh
        'tag_names': ['UI/UX', 'Photoshop']
    },
    # Kỹ năng mềm
    {
        'subject': 'Kỹ năng giao tiếp và thuyết trình trước đám đông',
        'description': 'Giúp bạn tự tin nói trước đám đông, rèn luyện giọng nói cuốn hút, sử dụng ngôn ngữ cơ thể và thiết kế cấu trúc bài thuyết trình đỉnh cao.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 350000.00,
        'category_idx': 3,
        'instructor_idx': 4,  # gv_tuan
        'tag_names': ['Kỹ năng giao tiếp', 'Thuyết trình']
    },
    {
        'subject': 'Quản lý thời gian và làm việc hiệu quả',
        'description': 'Làm chủ thời gian của bạn bằng cách thiết lập mục tiêu thông minh, phân bổ công việc theo ma trận tầm quan trọng và phương pháp Pomodoro.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 0.00,
        'category_idx': 3,
        'instructor_idx': 4,  # gv_tuan
        'tag_names': ['Thuyết trình']
    },
    # Kinh doanh
    {
        'subject': 'Khởi nghiệp kinh doanh online từ con số 0',
        'description': 'Lộ trình từng bước tìm kiếm nguồn hàng, nghiên cứu thị trường, lập gian hàng trên Shopee, TikTok Shop và tối ưu hóa quy trình bán hàng.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 850000.00,
        'category_idx': 4,
        'instructor_idx': 1,  # gv_phong
        'tag_names': ['SEO']
    },
    {
        'subject': 'Kỹ năng đàm phán và chốt sale đỉnh cao',
        'description': 'Học cách nắm bắt tâm lý khách hàng, xây dựng kịch bản bán hàng qua điện thoại, xử lý các từ chối và nghệ thuật chốt hợp đồng nhanh chóng.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 950000.00,
        'category_idx': 4,
        'instructor_idx': 1,  # gv_phong
        'tag_names': ['Kỹ năng giao tiếp']
    },
    # Marketing
    {
        'subject': 'Tiếp thị kỹ thuật số và chạy quảng cáo Facebook/Google',
        'description': 'Học tổng quan về Digital Marketing, thực chiến thiết lập chiến dịch quảng cáo tối ưu ngân sách trên Facebook Ads và Google Ads.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 1400000.00,
        'category_idx': 5,
        'instructor_idx': 2,  # gv_duc
        'tag_names': ['Google Ads', 'SEO']
    },
    {
        'subject': 'SEO Website nâng cao - Thống trị thứ hạng tìm kiếm',
        'description': 'Chiến lược đưa website của bạn lên trang 1 Google. Nghiên cứu từ khóa, tối ưu SEO Onpage, SEO Technical và xây dựng liên kết an toàn.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 1100000.00,
        'category_idx': 5,
        'instructor_idx': 2,  # gv_duc
        'tag_names': ['SEO']
    },
    # Khoa học dữ liệu
    {
        'subject': 'Nhập môn Trí tuệ nhân tạo (AI) và Học máy (Machine Learning)',
        'description': 'Làm quen với các thuật toán học máy phổ biến như Linear Regression, Decision Trees, K-Means và mạng thần kinh nhân tạo bằng Python.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 2500000.00,
        'category_idx': 6,
        'instructor_idx': 0,  # gv_trang
        'tag_names': ['Python', 'Machine Learning']
    },
    {
        'subject': 'Data Analysis với SQL và Power BI',
        'description': 'Học viết các câu lệnh truy vấn dữ liệu từ CSDL SQL, kết nối dữ liệu và thiết kế các Dashboard báo cáo tương tác trực quan với Power BI.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 1750000.00,
        'category_idx': 6,
        'instructor_idx': 1,  # gv_phong
        'tag_names': ['Machine Learning']
    },
    {
        'subject': 'Python cho phân tích dữ liệu ứng dụng',
        'description': 'Sử dụng thư viện Pandas, NumPy, Matplotlib và Seaborn để làm sạch, trực quan hóa và khai thác giá trị từ các tệp dữ liệu thực tế.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 0.00,
        'category_idx': 6,
        'instructor_idx': 0,  # gv_trang
        'tag_names': ['Python', 'Machine Learning']
    },
    # Nhiếp ảnh
    {
        'subject': 'Nghệ thuật nhiếp ảnh và bố cục chụp hình bằng Smartphone',
        'description': 'Bí quyết căn chỉnh ánh sáng, áp dụng các quy tắc bố cục kinh điển và chỉnh sửa ảnh nhanh chóng để có những bức ảnh triệu like bằng điện thoại.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 450000.00,
        'category_idx': 7,
        'instructor_idx': 5,  # gv_anh
        'tag_names': ['UI/UX']
    },
    {
        'subject': 'Quay dựng phim và biên tập video ngắn bằng Premiere & CapCut',
        'description': 'Lộ trình biên kịch, kỹ thuật quay và chỉnh sửa video ngắn chuyên nghiệp thu hút người xem trên các nền tảng TikTok, Reels, Shorts.',
        'image': 'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
        'fee': 800000.00,
        'category_idx': 7,
        'instructor_idx': 5,  # gv_anh
        'tag_names': ['Premiere', 'Kịch bản phim']
    }
]

courses = []
for c_spec in courses_spec:
    course = Course.objects.create(
        subject=c_spec['subject'],
        description=c_spec['description'],
        image=c_spec['image'],
        fee=c_spec['fee'],
        category=categories[c_spec['category_idx']],
        instructor=instructors[c_spec['instructor_idx']]
    )
    # Thêm tags
    for tag_name in c_spec['tag_names']:
        tag_obj = Tag.objects.filter(name=tag_name).first()
        if tag_obj:
            course.save()  # Ensure PK is active (though create does it)
            # wait, tags are usually added on lessons or courses? Course does not have tags, Lesson has tags!
            # Looking at models.py: Lesson has ManyToManyField(Tag, blank=True)
            # Ah, yes! Course has category and instructor, Tag is associated with Lesson!
            # That's perfectly fine. We will assign these tags to the lessons of the course.
            pass

    # Cập nhật thời gian tạo lùi về quá khứ (khoảng 5-6 tháng trước, từ 150 đến 180 ngày)
    days_ago = random.randint(150, 180)
    creation_date = now - timedelta(days=days_ago)
    Course.objects.filter(pk=course.pk).update(created_date=creation_date, updated_date=creation_date)

    courses.append(course)
    print(f" -> Khóa học: {course.subject} - Fee: {course.fee}đ")

# ---------------------------------------------------------
# 4. Tạo Bài học (Lessons)
# ---------------------------------------------------------
print("\n[4/10] Đang tạo Bài học (Lessons)...")

COURSE_LESSONS = {
    'Lập trình Python từ Zero đến Hero': [
        'Giới thiệu và Cài đặt Python',
        'Biến, Kiểu dữ liệu và Phép toán',
        'Cấu trúc điều kiện và Vòng lặp',
        'Hàm (Function) và Module trong Python',
        'Xử lý file và Biểu thức chính quy',
        'Lập trình hướng đối tượng (OOP) cơ bản',
        'Tổng kết khóa học và Bài tập thực hành'
    ],
    'Lập trình Web với ReactJS và Django': [
        'Tổng quan về kiến trúc Web Front-end & Back-end',
        'Cài đặt và cấu hình Django REST Framework',
        'Thiết kế API và Serializers trong Django',
        'Khởi tạo Project ReactJS và Cài đặt Axios',
        'Quản lý State với Context API và Kết nối API',
        'Xây dựng giao diện Responsive với Bootstrap/CSS',
        'Đăng nhập OAuth2 và Quản lý quyền truy cập',
        'Triển khai dự án lên Render và Vercel'
    ],
    'Xây dựng App Mobile với React Native': [
        'Giới thiệu về Expo và Cấu trúc dự án React Native',
        'Các Components cơ bản: View, Text, Image, StyleSheet',
        'Xử lý cuộn trang với ScrollView và FlatList',
        'Điều hướng ứng dụng với React Navigation (Stack & Tab)',
        'Quản lý State toàn cục bằng Redux Toolkit',
        'Tích hợp API và Quản lý đăng ký/đăng nhập',
        'Tích hợp cổng thanh toán MoMo và ZaloPay mẫu',
        'Đóng gói và phát hành ứng dụng lên Google Play & App Store'
    ],
    'Nhập môn lập trình Javascript': [
        'Javascript là gì? Nhúng Javascript vào HTML',
        'Biến, Hằng số và Các kiểu dữ liệu cơ bản',
        'Hàm (Functions) và Arrow Functions trong ES6',
        'Làm việc với Array và các hàm map, filter, reduce',
        'Lập trình bất đồng bộ: Callback, Promise và Async/Await',
        'Thao tác với DOM trong trình duyệt'
    ],
    'Luyện thi IELTS 6.5+ toàn diện': [
        'Cấu trúc đề thi IELTS và Chiến thuật làm bài tổng quan',
        'Listening: Phương pháp nghe chép chính tả và nhận diện bẫy',
        'Reading: Kỹ thuật Skimming, Scanning và định vị thông tin',
        'Writing Task 1: Cách viết biểu đồ đường, cột và bảng số liệu',
        'Writing Task 2: Cấu trúc bài luận nghị luận xã hội chuẩn 4 đoạn',
        'Speaking Part 1 & 2: Cách triển khai ý tưởng và kéo dài câu trả lời',
        'Speaking Part 3: Tư duy phản biện và diễn đạt học thuật',
        'Thi thử và Review lỗi sai phổ biến'
    ],
    'Tiếng Anh giao tiếp công sở thực chiến': [
        'Chào hỏi, tự giới thiệu bản thân và đồng nghiệp chuyên nghiệp',
        'Cách viết Email công việc lịch thiệp bằng Tiếng Anh',
        'Giao tiếp qua điện thoại và đặt lịch hẹn với đối tác',
        'Tham gia và trình bày ý kiến trong các cuộc họp',
        'Kỹ năng thuyết phục khách hàng và đàm phán hợp đồng sơ bộ',
        'Xử lý phàn nàn của khách hàng bằng tiếng Anh khéo léo'
    ],
    'Tự học Tiếng Nhật N5 cấp tốc': [
        'Học bảng chữ cái Hiragana toàn diện',
        'Học bảng chữ cái Katakana và từ mượn',
        'Các chữ Kanji cơ bản của trình độ N5 (Phần 1)',
        'Ngữ pháp N5: Cách giới thiệu bản thân và chỉ định từ',
        'Ngữ pháp N5: Động từ chia thể Masu và các hoạt động hàng ngày',
        'Luyện nghe hội thoại chào hỏi cơ bản hàng ngày'
    ],
    'Thiết kế đồ họa chuyên nghiệp với Photoshop & Illustrator': [
        'Làm quen với giao diện và hệ màu trong Photoshop',
        'Kỹ thuật cắt ghép ảnh và loại bỏ nền chuyên nghiệp',
        'Sử dụng Adjustment Layers và Blend Modes để blend màu',
        'Khởi tạo Workspace và công cụ Pen Tool trong Illustrator',
        'Thiết kế Logo dạng Vector và Typography cơ bản',
        'Thiết kế ấn phẩm truyền thông (Banner/Poster) hoàn chỉnh',
        'Quy trình xuất bản file in ấn và hiển thị digital'
    ],
    'UI/UX Design cho thiết kế Web/App di động': [
        'Khái niệm UI/UX và Quy trình thiết kế sản phẩm số',
        'Nghiên cứu người dùng (User Research) và Xây dựng Persona',
        'Vẽ phác thảo cấu trúc thông tin (Information Architecture) & Wireframes',
        'Sử dụng Figma: Components, Auto Layout và Variants',
        'Thiết kế giao diện Web/Mobile responsive (Visual Design)',
        'Tạo mẫu thử tương tác (Interactive Prototyping) và chuyển tiếp',
        'Kiểm thử tính khả dụng (Usability Testing) và bàn giao cho Developer'
    ],
    'Kỹ năng giao tiếp và thuyết trình trước đám đông': [
        'Vượt qua nỗi sợ hãi đứng trước đám đông',
        'Làm chủ ngôn ngữ cơ thể (Body Language) và ánh mắt',
        'Luyện giọng nói: Tông giọng, tốc độ và cách nhả chữ',
        'Thiết kế cấu trúc bài thuyết trình thu hút (Mở - Thân - Kết)',
        'Sử dụng slide thuyết trình hiệu quả hỗ trợ bài nói',
        'Kỹ năng xử lý câu hỏi hóc búa từ khán giả'
    ],
    'Quản lý thời gian và làm việc hiệu quả': [
        'Nhận diện kẻ cắp thời gian và đánh giá hiện trạng bản thân',
        'Thiết lập mục tiêu thông minh theo nguyên tắc SMART',
        'Quy tắc Ma trận Eisenhower: Phân loại việc khẩn cấp và quan trọng',
        'Kỹ thuật Pomodoro giúp tập trung cao độ',
        'Cách từ chối khéo léo để bảo vệ quỹ thời gian của bản thân',
        'Sử dụng các ứng dụng quản lý công việc: Notion, Trello'
    ],
    'Khởi nghiệp kinh doanh online từ con số 0': [
        'Lựa chọn ngách kinh doanh và Nghiên cứu đối thủ cạnh tranh',
        'Tìm kiếm nguồn hàng chất lượng và đàm phán giá sỉ',
        'Xây dựng thương hiệu cá nhân và Fanpage bán hàng chuyên nghiệp',
        'Thiết lập gian hàng trên Shopee, TikTok Shop tối ưu chuẩn SEO',
        'Quy trình đóng gói, vận chuyển và quản lý tồn kho',
        'Chăm sóc khách hàng và xây dựng tập khách hàng trung thành'
    ],
    'Kỹ năng đàm phán và chốt sale đỉnh cao': [
        'Tâm lý học trong bán hàng: Hiểu người mua để bán dễ dàng',
        'Chuẩn bị kịch bản gọi điện (Telesales) và tiếp cận khách hàng',
        'Kỹ thuật khai thác nhu cầu thực tế của khách hàng',
        'Trình bày giải pháp sản phẩm vượt trội so với đối thủ',
        'Xử lý từ chối (Handling Objections) về giá cả và chất lượng',
        'Các đòn tâm lý chốt sale thần tốc và chăm sóc sau bán'
    ],
    'Tiếp thị kỹ thuật số và chạy quảng cáo Facebook/Google': [
        'Tổng quan về Digital Marketing và các kênh truyền thông chính',
        'Thiết lập Trình quản lý doanh nghiệp (BM) trên Facebook Ads',
        'Kỹ thuật Target đối tượng mục tiêu và tối ưu ngân sách quảng cáo',
        'Tạo tài khoản Google Ads và nghiên cứu từ khóa quảng cáo',
        'Lập chiến dịch quảng cáo tìm kiếm (Search Ads) và hiển thị (GDN)',
        'Viết nội dung quảng cáo (Copywriting) thu hút tỷ lệ click cao',
        'Đo lường, đọc chỉ số báo cáo CTR, CPC, ROAS và tối ưu hóa chiến dịch'
    ],
    'SEO Website nâng cao - Thống trị thứ hạng tìm kiếm': [
        'Cơ chế hoạt động của Google Search Engine',
        'Nghiên cứu từ khóa chuyên sâu bằng Ahrefs và SEMrush',
        'Tối ưu SEO Onpage: Tiêu đề, Thẻ Heading, Hình ảnh, URL',
        'Viết bài chuẩn SEO chuẩn cấu trúc thu hút người đọc',
        'Kỹ thuật SEO Technical: Sơ đồ trang web, robots.txt, tốc độ load',
        'Xây dựng liên kết (Link Building) và SEO Offpage an toàn',
        'Đánh giá hiệu quả bằng Google Analytics và Search Console'
    ],
    'Nhập môn Trí tuệ nhân tạo (AI) và Học máy (Machine Learning)': [
        'Khái niệm AI, Machine Learning và Deep Learning',
        'Cài đặt Jupyter Notebook và làm quen thư viện NumPy, Pandas',
        'Học máy có giám sát (Supervised Learning): Hồi quy tuyến tính',
        'Thuật toán phân loại: Logistic Regression và Decision Tree',
        'Học máy không giám sát (Unsupervised Learning): Phân cụm K-Means',
        'Tổng quan về Mạng thần kinh nhân tạo (Artificial Neural Networks)',
        'Thực hành xây dựng mô hình dự báo giá nhà đơn giản'
    ],
    'Data Analysis với SQL và Power BI': [
        'Vai trò của Phân tích dữ liệu trong doanh nghiệp',
        'SQL cơ bản: Viết truy vấn SELECT, WHERE, GROUP BY',
        'Liên kết các bảng dữ liệu bằng SQL JOIN',
        'Làm sạch và chuẩn hóa dữ liệu bằng Power Query',
        'Thiết lập mối quan hệ dữ liệu (Data Modeling) trong Power BI',
        'Viết công thức phân tích DAX cơ bản',
        'Thiết kế Dashboard tương tác trực quan sinh động báo cáo doanh số'
    ],
    'Python cho phân tích dữ liệu ứng dụng': [
        'Cài đặt Anaconda và Jupyter Lab',
        'Thao tác với cấu trúc Series và DataFrame trong Pandas',
        'Đọc/Ghi dữ liệu từ các file CSV, Excel, SQL database',
        'Xử lý dữ liệu khuyết thiếu (Null) và chuẩn hóa dữ liệu',
        'Trực quan hóa dữ liệu với Matplotlib và Seaborn',
        'Phân tích thống kê mô tả cơ bản trên tập dữ liệu thực tế'
    ],
    'Nghệ thuật nhiếp ảnh và bố cục chụp hình bằng Smartphone': [
        'Hiểu về camera trên Smartphone và cách làm sạch ống kính',
        'Làm chủ ánh sáng tự nhiên và hướng sáng chụp ảnh đẹp',
        'Các quy tắc bố cục kinh đoán: 1/3, đường dẫn, đối xứng',
        'Kỹ thuật chụp ảnh chân dung xóa phông tự nhiên',
        'Kỹ thuật chụp ảnh phong cảnh và đồ ăn bắt mắt',
        'Chỉnh sửa ảnh nhanh bằng ứng dụng Lightroom Mobile và Snapseed'
    ],
    'Quay dựng phim và biên tập video ngắn bằng Premiere & CapCut': [
        'Tư duy biên kịch và xây dựng Storyboard cho video ngắn',
        'Thiết lập cỡ khung hình dọc (9:16) cho TikTok/Reels',
        'Kỹ thuật cắt ghép và khớp nhạc (BGM) tạo nhịp điệu trên CapCut',
        'Làm quen giao diện và công cụ cắt ghép chuyên sâu trên Premiere',
        'Thiết kế hiệu ứng chuyển cảnh (Transitions) mượt mà',
        'Chèn phụ đề tự động (Auto Captions) và hiệu ứng chữ độc đáo',
        'Phối màu cơ bản và xuất video chất lượng cao không bị mờ'
    ]
}

images_list = [
    'image/upload/v1778204683/cai_dat_moi_truong_gnrtvq.jpg',
    'image/upload/v1778204812/bien_va_kieu_du_lieu_l55uoq.jpg',
    'image/upload/v1778204930/javascript_co_ban_g14h1l.jpg',
    'image/upload/v1778204592/lap_trinh_python_r6koh9.png',
]
videos_list = [
    'video/upload/v1778204725/cai_dat_moi_truong_wklmse.mp4',
    'video/upload/v1778204823/bien_va_kieu_du_lieu_phytrl.mp4',
    'video/upload/v1778204938/javascript_co_ban_ljztix.mp4',
]

lessons_created_count = 0
for course in courses:
    subjects = COURSE_LESSONS.get(course.subject, [])
    for idx, subject in enumerate(subjects):
        # Bài đầu tiên sẽ luôn là preview
        is_preview = (idx == 0)

        # Chọn ngẫu nhiên ảnh và video
        img = random.choice(images_list)
        vid = random.choice(videos_list)
        vid_sec = random.randint(300, 1800)  # Từ 5 phút đến 30 phút

        # Rich content mẫu
        content = f"""
        <h3>Nội dung chính của {subject}</h3>
        <p>Trong bài học này, chúng ta sẽ cùng nghiên cứu các khái niệm thực tế quan trọng nhất của bài học. Hãy xem kỹ video đính kèm và làm bài tập thực hành.</p>
        <ul>
            <li>Khái niệm nền tảng cốt lõi</li>
            <li>Các ví dụ minh họa và viết mã/thực hành thực tế</li>
            <li>Bài tập áp dụng và câu hỏi củng cố kiến thức</li>
        </ul>
        """

        lesson = Lesson.objects.create(
            subject=subject,
            content=content,
            image=img,
            video=vid,
            video_seconds=vid_sec,
            is_preview=is_preview,
            course=course
            # order sẽ tự động tính trong model Lesson.save()
        )

        # Thêm ngẫu nhiên 1 - 2 tag phù hợp
        course_tags = [t for t in tags if t.name in course.description or t.name in course.subject]
        if not course_tags:
            course_tags = [random.choice(tags)]
        for tag in course_tags:
            lesson.tags.add(tag)

        # Cập nhật thời gian tạo khớp với khóa học (được tạo muộn hơn khóa học 1 ngày)
        lesson_date = course.created_date + timedelta(days=1)
        Lesson.objects.filter(pk=lesson.pk).update(created_date=lesson_date, updated_date=lesson_date)

        lessons_created_count += 1

print(f" -> Đã tạo thành công {lessons_created_count} bài học phân bổ trên 20 khóa học.")

# ---------------------------------------------------------
# 5. Tạo Đăng ký học (Enrollment) & Thanh toán (Payment)
# ---------------------------------------------------------
print("\n[5/10] Đang tạo Đăng ký học & Thanh toán (Phân bổ qua các tháng)...")

# 6 tháng gần nhất (Từ tháng 12/2025 đến tháng 5/2026)
# Phân chia đều đặn số ngày lùi về quá khứ
# Dec: 150-180 ngày trước, Jan: 120-150, Feb: 90-120, Mar: 60-90, Apr: 30-60, May: 1-30
months_ranges = [
    (150, 180),  # Tháng 12/2025
    (120, 150),  # Tháng 1/2026
    (90, 120),  # Tháng 2/2026
    (60, 90),  # Tháng 3/2026
    (30, 60),  # Tháng 4/2026
    (1, 30),  # Tháng 5/2026 (Hiện tại)
]

enrollments = []
created_pairs = set()

# Chúng ta cần sinh ra 60 Đăng ký
total_enrollments_to_create = 60
successful_count = 0
failed_count = 0

# Tập hợp người dùng đăng ký bao gồm tất cả sinh viên + tất cả giảng viên đã duyệt (để giảng viên học chéo khóa của nhau)
eligible_users = list(students) + list(instructors)

# Random các cặp (student, course) duy nhất
student_course_pairs = []
while len(student_course_pairs) < total_enrollments_to_create:
    std = random.choice(eligible_users)
    crs = random.choice(courses)
    
    # Giảng viên không được tự đăng ký khóa học của chính mình
    if std == crs.instructor:
        continue
        
    pair = (std.pk, crs.pk)
    if pair not in created_pairs:
        created_pairs.add(pair)
        student_course_pairs.append((std, crs))

# Phân bổ đều các cặp này vào 6 tháng
for idx, (student, course) in enumerate(student_course_pairs):
    # Tạo Enrollment
    enrollment = Enrollment.objects.create(
        student=student,
        course=course,
        progress=0.0  # sẽ tính lại khi có tiến độ bài học
    )

    # Chọn ngẫu nhiên tháng
    month_range = months_ranges[idx % len(months_ranges)]
    days_ago = random.randint(month_range[0], month_range[1])
    enrollment_date = now - timedelta(days=days_ago)

    # Ghi đè ngày tạo Enrollment
    Enrollment.objects.filter(pk=enrollment.pk).update(created_date=enrollment_date, updated_date=enrollment_date)

    # 85% Đăng ký thành công, 15% thất bại (nhưng khóa học miễn phí fee=0 thì luôn thành công)
    is_success = True
    if course.fee > 0 and random.random() < 0.15:
        is_success = False

    # Tạo Payment tương ứng
    method = random.choice(['MOMO', 'ZALOPAY', 'STRIPE', 'PAYPAL', 'CASH']) if course.fee > 0 else 'CASH'
    payment = Payment.objects.create(
        enrollment=enrollment,
        amount=course.fee,
        payment_method=method,
        is_successful=is_success,
        transaction_id=str(uuid.uuid4())
    )

    # Ghi đè ngày tạo Payment khớp với Enrollment
    Payment.objects.filter(pk=payment.pk).update(created_date=enrollment_date, updated_date=enrollment_date)

    if is_success:
        successful_count += 1
        enrollments.append(enrollment)
        # Kích hoạt cập nhật thống kê khóa học (students, revenue)
        course.update_stats()
    else:
        failed_count += 1

print(f" -> Đã tạo 60 giao dịch: {successful_count} thành công, {failed_count} thất bại.")

# ---------------------------------------------------------
# 6. Tạo Tiến độ Học tập (LessonProgress)
# ---------------------------------------------------------
print("\n[6/10] Đang tạo Tiến độ Học tập (LessonProgress)...")

# Chỉ những Sinh viên thanh toán thành công mới có tiến độ học tập
progress_records_count = 0
for enrollment in enrollments:
    course = enrollment.course
    course_lessons = list(course.lessons.all())

    if not course_lessons:
        continue

    # Xác định mức độ học tập của sinh viên này:
    # 20% học cực kỳ chăm chỉ (hoàn thành 80-100% bài học)
    # 40% học bình thường (hoàn thành 30-79% bài học)
    # 30% học ít (hoàn thành 10-29% bài học)
    # 10% chưa học gì (0% bài học)
    r = random.random()
    if r < 0.20:
        lessons_to_study = random.sample(course_lessons, k=int(len(course_lessons) * random.uniform(0.8, 1.0)))
    elif r < 0.60:
        lessons_to_study = random.sample(course_lessons, k=int(len(course_lessons) * random.uniform(0.3, 0.79)))
    elif r < 0.90:
        lessons_to_study = random.sample(course_lessons, k=max(1, int(len(course_lessons) * random.uniform(0.1, 0.29))))
    else:
        lessons_to_study = []

    for l_idx, lesson in enumerate(lessons_to_study):
        # 80% đã học xong (COMPLETED), 20% đang học (IN_PROGRESS)
        status = 'COMPLETED' if random.random() < 0.8 else 'IN_PROGRESS'
        watched = lesson.video_seconds if status == 'COMPLETED' else random.randint(10, lesson.video_seconds - 10)

        progress = LessonProgress.objects.create(
            enrollment=enrollment,
            lesson=lesson,
            status=status,
            watched_seconds=watched
        )

        # Ghi đè ngày tạo tiến độ học (khoảng vài ngày sau khi đăng ký học)
        study_date = enrollment.created_date + timedelta(days=random.randint(1, 10))
        if study_date > now:
            study_date = now
        LessonProgress.objects.filter(pk=progress.pk).update(created_date=study_date, updated_date=study_date)

        progress_records_count += 1

    # Cập nhật lại tiến độ tổng thể của enrollment
    enrollment.update_progress()

print(f" -> Đã tạo thành công {progress_records_count} bản ghi tiến độ học tập chi tiết.")

# ---------------------------------------------------------
# 7. Tạo Bình luận & Phản hồi (Comments & Replies)
# ---------------------------------------------------------
print("\n[7/10] Đang tạo Bình luận & Phản hồi trong các Bài học...")

student_comments = [
    "Bài giảng hay quá thầy ơi! Rất chi tiết và dễ hiểu.",
    "Thưa thầy, chỗ khai báo này em chạy bị lỗi SyntaxError ở dòng 5 là sao ạ?",
    "Video chất lượng cao, bài học rất cô đọng và thực tế.",
    "Phần thực hành này hay quá, em làm một phát chạy được luôn.",
    "Cho em hỏi tài liệu tham khảo và slide bài giảng tải ở đâu ạ?",
    "Kiến thức cực kỳ bổ ích, áp dụng được ngay vào công việc của em.",
    "Thầy giải thích rất chi tiết phần thuật toán này, em cảm ơn thầy nhiều ạ.",
    "Em gặp khó khăn ở bước cấu hình môi trường, thầy hỗ trợ em với ạ.",
    "Khóa học rất chất lượng, hình ảnh sắc nét âm thanh rõ ràng.",
    "Học đến bài này mới thấy vỡ ra nhiều điều, cảm ơn giảng viên!",
]

instructor_replies = {
    "SyntaxError": "Em kiểm tra lại xem có bị thiếu dấu ngoặc đơn hoặc dấu hai chấm ':' ở cuối dòng 4 không nhé.",
    "tài liệu": "Tài liệu và mã nguồn mẫu thầy đã đính kèm trong phần mô tả của Bài 1 rồi nhé em.",
    "cấu hình": "Em hãy cài đặt lại phiên bản Python mới nhất, hoặc chụp ảnh lỗi gửi lên group Discord để trợ giảng hỗ trợ nhé.",
    "default": "Cảm ơn em đã ủng hộ khóa học! Chúc em học tốt và nhớ thực hành đầy đủ nha."
}

comments_created = 0

# Duyệt qua các khóa học và bài học để bình luận ngẫu nhiên
for course in courses:
    all_lessons = list(course.lessons.all())
    if not all_lessons:
        continue

    # Chọn ngẫu nhiên khoảng 3-4 bài học trong khóa học để bình luận
    commented_lessons = random.sample(all_lessons, k=min(4, len(all_lessons)))
    for lesson in commented_lessons:
        # Lấy danh sách học viên đăng ký học khóa này để comment cho thực tế
        active_enrollments = list(course.enrollments.filter(payment__is_successful=True))
        if not active_enrollments:
            continue

        # Sinh 2-3 bình luận gốc từ các học viên khác nhau
        commenters = random.sample(active_enrollments, k=min(3, len(active_enrollments)))
        for en in commenters:
            student_user = en.student
            content = random.choice(student_comments)

            # Tạo Comment gốc
            cmt_goc = Comment.objects.create(
                user=student_user,
                lesson=lesson,
                content=content,
                parent=None
            )
            # Ghi đè ngày tạo comment
            cmt_date = en.created_date + timedelta(days=random.randint(1, 5))
            if cmt_date > now:
                cmt_date = now
            Comment.objects.filter(pk=cmt_goc.pk).update(created_date=cmt_date, updated_date=cmt_date)
            comments_created += 1

            # Giảng viên trả lời (60% cơ hội)
            if random.random() < 0.60:
                reply_content = instructor_replies["default"]
                if "SyntaxError" in content:
                    reply_content = instructor_replies["SyntaxError"]
                elif "tài liệu" in content or "slide" in content:
                    reply_content = instructor_replies["tài liệu"]
                elif "cấu hình" in content or "cài đặt" in content:
                    reply_content = instructor_replies["cấu hình"]

                reply = Comment.objects.create(
                    user=course.instructor,
                    lesson=lesson,
                    content=reply_content,
                    parent=cmt_goc
                )
                # Trả lời sau comment gốc vài giờ
                reply_date = cmt_date + timedelta(hours=random.randint(1, 12))
                if reply_date > now:
                    reply_date = now
                Comment.objects.filter(pk=reply.pk).update(created_date=reply_date, updated_date=reply_date)
                comments_created += 1

print(f" -> Đã tạo thành công {comments_created} bình luận và phản hồi thảo luận.")

# ---------------------------------------------------------
# 8. Tạo Lượt thích Bài học (Likes)
# ---------------------------------------------------------
print("\n[8/10] Đang tạo Lượt thích Bài học (Likes)...")

likes_created = 0
created_likes_pairs = set()

# Sinh khoảng 80 lượt thích ngẫu nhiên của sinh viên trên các bài học
while len(created_likes_pairs) < 80:
    student_user = random.choice(students)
    random_course = random.choice(courses)
    # Lấy các bài học của khóa học này
    lessons_in_course = list(random_course.lessons.all())
    if not lessons_in_course:
        continue
    random_lesson = random.choice(lessons_in_course)

    pair = (random_lesson.pk, student_user.pk)
    if pair not in created_likes_pairs:
        created_likes_pairs.add(pair)

        like = Like.objects.create(
            user=student_user,
            lesson=random_lesson
        )
        # Thích ngẫu nhiên từ 1 đến 15 ngày trước
        like_date = now - timedelta(days=random.randint(1, 15))
        Like.objects.filter(pk=like.pk).update(created_date=like_date, updated_date=like_date)
        likes_created += 1

print(f" -> Đã tạo thành công {likes_created} lượt thích bài học.")

# ---------------------------------------------------------
# 9. Tạo Đánh giá Khóa học (CourseReviews)
# ---------------------------------------------------------
print("\n[9/10] Đang tạo Đánh giá Khóa học (CourseReviews)...")

reviews_pool = {
    5: [
        "Khóa học tuyệt vời! Nội dung cực kỳ chi tiết và dễ học. Thầy hỗ trợ rất nhiệt tình.",
        "Quá xuất sắc! Tài liệu đầy đủ, video sắc nét, học xong áp dụng được ngay vào dự án.",
        "Rất đáng đồng tiền bát gạo. Lộ trình khoa học từ con số 0 đến làm được việc thực chiến.",
        "Giảng viên giải thích vô cùng dễ hiểu, ví dụ thực tế và sinh động. Cảm ơn thầy cô nhiều!",
        "Khóa học hay nhất mình từng học. Đội ngũ trợ giảng hỗ trợ giải đáp lỗi nhanh chóng.",
        "Nội dung chuẩn chỉ, chất lượng video và âm thanh tuyệt hảo. Đánh giá 5 sao không cần bàn cãi."
    ],
    4: [
        "Khóa học rất chất lượng, bài tập thực hành phong phú. Tuy nhiên thầy giảng hơi nhanh một chút ở bài 4.",
        "Nội dung phong phú và thực tế. Hy vọng khóa học sẽ cập nhật thêm các phần nâng cao mới.",
        "Video rõ nét, thầy dạy rất có tâm. Chỗ cấu hình hơi phức tạp một chút nhưng xem kỹ vẫn làm được.",
        "Bài giảng rất tốt, đầy đủ tài liệu đi kèm. Sẽ giới thiệu cho bạn bè cùng học."
    ],
    3: [
        "Nội dung ở mức cơ bản thì tốt, nhưng phần nâng cao hơi lướt nhanh quá. Cần chi tiết thêm.",
        "Chất lượng âm thanh thỉnh thoảng hơi nhỏ ở một số bài học. Kiến thức truyền đạt ở mức tạm ổn."
    ],
    2: [
        "Khóa học hơi sơ sài, ít bài tập thực hành và lý thuyết hơi khó hiểu.",
        "Giảng viên giải thích chưa được sâu, tốc độ giảng quá nhanh khiến mình không theo kịp.",
        "Video thỉnh thoảng bị đứng hình và giật lag, tài liệu đính kèm thì thiếu thốn."
    ],
    1: [
        "Khóa học quá tệ, nội dung cực kỳ sơ sài và không cập nhật, không đáng tiền mua.",
        "Bài giảng hời hợt, không có sự chuẩn bị chu đáo, support của trợ giảng cũng rất chậm.",
        "Thất vọng hoàn toàn. Video chất lượng rất kém và âm thanh thì rè khó nghe."
    ]
}

reviews_created_count = 0

# Duyệt qua các enrollment thành công để xem ai đủ điều kiện đánh giá
# Điều kiện: Thanh toán thành công và Tiến độ (progress) >= 20.0%
eligible_enrollments = Enrollment.objects.filter(
    payment__is_successful=True,
    progress__gte=20.0
)

print(f" -> Tìm thấy {eligible_enrollments.count()} lượt đăng ký đủ điều kiện viết đánh giá (>20% tiến độ).")

for enrollment in eligible_enrollments:
    # 85% Cơ hội viết đánh giá
    if random.random() < 0.85:
        student_user = enrollment.student
        course = enrollment.course

        # Giảng viên không thể đánh giá khóa học do ràng buộc limit_choices_to={'role': 'STUDENT'} ở CourseReview
        if student_user.role != 'STUDENT':
            continue

        # Tránh trùng lặp đánh giá của học viên trên khóa học
        if CourseReview.objects.filter(course=course, user=student_user).exists():
            continue

        # Phân bổ rating ngẫu nhiên thực tế: 45% 5 sao, 25% 4 sao, 15% 3 sao, 10% 2 sao, 5% 1 sao
        r = random.random()
        if r < 0.45:
            rating = 5
        elif r < 0.70:
            rating = 4
        elif r < 0.85:
            rating = 3
        elif r < 0.95:
            rating = 2
        else:
            rating = 1

        comment = random.choice(reviews_pool[rating])

        try:
            review = CourseReview.objects.create(
                user=student_user,
                course=course,
                rating=rating,
                comment=comment
            )

            # Ghi đè ngày tạo review (sau khi học xong)
            rev_date = enrollment.created_date + timedelta(days=random.randint(10, 20))
            if rev_date > now:
                rev_date = now
            CourseReview.objects.filter(pk=review.pk).update(created_date=rev_date, updated_date=rev_date)

            # Cập nhật điểm đánh giá trung bình của khóa học
            course.update_rating()
            reviews_created_count += 1
        except ValidationError as e:
            # Bỏ qua nếu có lỗi validation bất ngờ
            print(f"   [Validation Error Bỏ Qua] {e}")
            pass

print(f" -> Đã tạo thành công {reviews_created_count} đánh giá khóa học chất lượng cao.")

# ---------------------------------------------------------
# 10. Đồng bộ và tính toán lại thống kê lần cuối
# ---------------------------------------------------------
print("\n[10/10] Đang đồng bộ và tính toán lại toàn bộ số liệu thống kê...")

for course in courses:
    course.update_duration()
    course.update_rating()
    course.update_stats()
    print(
        f" -> Cập nhật thống kê Course '{course.subject}': Duration={course.total_duration_video}s, Students={course.total_students}, Revenue={course.total_revenue}đ, Rating={course.average_rating}")

print("\n=========================================================")
print("=== HOÀN TẤT! DỮ LIỆU ĐÃ ĐƯỢC NẠP VÀ ĐỒNG BỘ THÀNH CÔNG ===")
print("=========================================================")
