import uuid
import random
import sys
sys.stdout.reconfigure(encoding='utf-8')
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
        'image': 'image/upload/v1779855802/wjizamoiegwrhw4pnjxg.jpg',
        'fee': 990000.00,
        'category_idx': 0,
        'instructor_idx': 0,  # gv_trang
        'tag_names': ['Python', 'HTML/CSS']
    },
    {
        'subject': 'Lập trình Web với ReactJS và Django',
        'description': 'Học cách xây dựng một ứng dụng web Fullstack hiện đại sử dụng Django REST Framework ở Back-end và ReactJS ở Front-end.',
        'image': 'image/upload/v1779855802/aor1lzwojsmh4zi6kapf.jpg',
        'fee': 1500000.00,
        'category_idx': 0,
        'instructor_idx': 1,  # gv_phong
        'tag_names': ['Django', 'ReactJS', 'Javascript', 'HTML/CSS']
    },
    {
        'subject': 'Xây dựng App Mobile với React Native',
        'description': 'Hướng dẫn tự tay thiết kế và lập trình ứng dụng di động đa nền tảng iOS & Android với React Native và Expo từ đầu.',
        'image': 'image/upload/v1779855803/oj7uhxuqxn86cslbgtww.jpg',
        'fee': 1800000.00,
        'category_idx': 0,
        'instructor_idx': 2,  # gv_duc
        'tag_names': ['React Native', 'Javascript', 'UI/UX']
    },
    {
        'subject': 'Nhập môn lập trình Javascript',
        'description': 'Học nền tảng lập trình Javascript căn bản, các khái niệm biến, hàm, mảng, bất đồng bộ và tương tác với DOM trình duyệt.',
        'image': 'image/upload/v1779855804/z9p5fiqew5oncnaysxc3.jpg',
        'fee': 0.00,
        'category_idx': 0,
        'instructor_idx': 0,  # gv_trang
        'tag_names': ['Javascript']
    },
    # Ngoại ngữ
    {
        'subject': 'Luyện thi IELTS 6.5+ toàn diện',
        'description': 'Khóa học cung cấp lộ trình, phương pháp và đề thi thử trọn vẹn cả 4 kỹ năng Nghe, Nói, Đọc, Viết đạt mục tiêu IELTS 6.5+.',
        'image': 'image/upload/v1779855805/i2ke9kwkfhxb5um9qkpl.jpg',
        'fee': 2200000.00,
        'category_idx': 1,
        'instructor_idx': 3,  # gv_ha
        'tag_names': ['IELTS']
    },
    {
        'subject': 'Tiếng Anh giao tiếp công sở thực chiến',
        'description': 'Trang bị tiếng Anh giao tiếp chuyên nghiệp trong môi trường doanh nghiệp: viết email, họp hành, đàm phán, gọi điện thoại.',
        'image': 'image/upload/v1779855806/l2vkwuslorrur2v3u23x.jpg',
        'fee': 650000.00,
        'category_idx': 1,
        'instructor_idx': 3,  # gv_ha
        'tag_names': ['IELTS']
    },
    {
        'subject': 'Tự học Tiếng Nhật N5 cấp tốc',
        'description': 'Khóa học dành cho người mới bắt đầu chinh phục tiếng Nhật: thuộc bảng chữ cái, giao tiếp cơ bản và thi đỗ N5.',
        'image': 'image/upload/v1779855806/nzkylzj0aag6irvnkbpm.jpg',
        'fee': 0.00,
        'category_idx': 1,
        'instructor_idx': 4,  # gv_tuan
        'tag_names': ['Tiếng Nhật']
    },
    # Thiết kế đồ họa
    {
        'subject': 'Thiết kế đồ họa chuyên nghiệp với Photoshop & Illustrator',
        'description': 'Làm chủ hai công cụ thiết kế đồ họa đỉnh cao để tự tay thiết kế logo, banner quảng cáo, poster, và chỉnh sửa ảnh chuyên nghiệp.',
        'image': 'image/upload/v1779855807/rcwkvkhotmx1yt5v5ffu.jpg',
        'fee': 1200000.00,
        'category_idx': 2,
        'instructor_idx': 5,  # gv_anh
        'tag_names': ['Photoshop', 'Illustrator']
    },
    {
        'subject': 'UI/UX Design cho thiết kế Web/App di động',
        'description': 'Học tư duy trải nghiệm người dùng (UX) và thiết kế giao diện (UI) hiện đại với Figma. Quy trình thiết kế sản phẩm hoàn chỉnh.',
        'image': 'image/upload/v1779855808/vfc4bl5c6ywqxvsnaxqy.jpg',
        'fee': 1600000.00,
        'category_idx': 2,
        'instructor_idx': 5,  # gv_anh
        'tag_names': ['UI/UX', 'Photoshop']
    },
    # Kỹ năng mềm
    {
        'subject': 'Kỹ năng giao tiếp và thuyết trình trước đám đông',
        'description': 'Giúp bạn tự tin nói trước đám đông, rèn luyện giọng nói cuốn hút, sử dụng ngôn ngữ cơ thể và thiết kế cấu trúc bài thuyết trình đỉnh cao.',
        'image': 'image/upload/v1779855809/se9aehh7d7ingwmnbxip.jpg',
        'fee': 350000.00,
        'category_idx': 3,
        'instructor_idx': 4,  # gv_tuan
        'tag_names': ['Kỹ năng giao tiếp', 'Thuyết trình']
    },
    {
        'subject': 'Quản lý thời gian và làm việc hiệu quả',
        'description': 'Làm chủ thời gian của bạn bằng cách thiết lập mục tiêu thông minh, phân bổ công việc theo ma trận tầm quan trọng và phương pháp Pomodoro.',
        'image': 'image/upload/v1779855810/t5riku3c9myvqbrrhu7q.jpg',
        'fee': 0.00,
        'category_idx': 3,
        'instructor_idx': 4,  # gv_tuan
        'tag_names': ['Thuyết trình']
    },
    # Kinh doanh
    {
        'subject': 'Khởi nghiệp kinh doanh online từ con số 0',
        'description': 'Lộ trình từng bước tìm kiếm nguồn hàng, nghiên cứu thị trường, lập gian hàng trên Shopee, TikTok Shop và tối ưu hóa quy trình bán hàng.',
        'image': 'image/upload/v1779855810/qilyarsguosagjuobo91.jpg',
        'fee': 850000.00,
        'category_idx': 4,
        'instructor_idx': 1,  # gv_phong
        'tag_names': ['SEO']
    },
    {
        'subject': 'Kỹ năng đàm phán và chốt sale đỉnh cao',
        'description': 'Học cách nắm bắt tâm lý khách hàng, xây dựng kịch bản bán hàng qua điện thoại, xử lý các từ chối và nghệ thuật chốt hợp đồng nhanh chóng.',
        'image': 'image/upload/v1779855811/hfbuohoszniyw6wrn6bi.jpg',
        'fee': 950000.00,
        'category_idx': 4,
        'instructor_idx': 1,  # gv_phong
        'tag_names': ['Kỹ năng giao tiếp']
    },
    # Marketing
    {
        'subject': 'Tiếp thị kỹ thuật số và chạy quảng cáo Facebook/Google',
        'description': 'Học tổng quan về Digital Marketing, thực chiến thiết lập chiến dịch quảng cáo tối ưu ngân sách trên Facebook Ads và Google Ads.',
        'image': 'image/upload/v1779855812/s6fmze6mhtadfoeduneh.jpg',
        'fee': 1400000.00,
        'category_idx': 5,
        'instructor_idx': 2,  # gv_duc
        'tag_names': ['Google Ads', 'SEO']
    },
    {
        'subject': 'SEO Website nâng cao - Thống trị thứ hạng tìm kiếm',
        'description': 'Chiến lược đưa website của bạn lên trang 1 Google. Nghiên cứu từ khóa, tối ưu SEO Onpage, SEO Technical và xây dựng liên kết an toàn.',
        'image': 'image/upload/v1779855813/mul4efkaehhnis0abplw.jpg',
        'fee': 1100000.00,
        'category_idx': 5,
        'instructor_idx': 2,  # gv_duc
        'tag_names': ['SEO']
    },
    # Khoa học dữ liệu
    {
        'subject': 'Nhập môn Trí tuệ nhân tạo (AI) và Học máy (Machine Learning)',
        'description': 'Làm quen với các thuật toán học máy phổ biến như Linear Regression, Decision Trees, K-Means và mạng thần kinh nhân tạo bằng Python.',
        'image': 'image/upload/v1779855872/nhap-mon-tri-tue-nhan-tao-ai-va-hoc-may-machine-learning_hovpwr.png',
        'fee': 2500000.00,
        'category_idx': 6,
        'instructor_idx': 0,  # gv_trang
        'tag_names': ['Python', 'Machine Learning']
    },
    {
        'subject': 'Data Analysis với SQL và Power BI',
        'description': 'Học viết các câu lệnh truy vấn dữ liệu từ CSDL SQL, kết nối dữ liệu và thiết kế các Dashboard báo cáo tương tác trực quan với Power BI.',
        'image': 'image/upload/v1779855813/syq08ldzmraztr5l1yl6.jpg',
        'fee': 1750000.00,
        'category_idx': 6,
        'instructor_idx': 1,  # gv_phong
        'tag_names': ['Machine Learning']
    },
    {
        'subject': 'Python cho phân tích dữ liệu ứng dụng',
        'description': 'Sử dụng thư viện Pandas, NumPy, Matplotlib và Seaborn để làm sạch, trực quan hóa và khai thác giá trị từ các tệp dữ liệu thực tế.',
        'image': 'image/upload/v1779855814/is0cd7nasimx8kxgyvvm.jpg',
        'fee': 0.00,
        'category_idx': 6,
        'instructor_idx': 0,  # gv_trang
        'tag_names': ['Python', 'Machine Learning']
    },
    # Nhiếp ảnh
    {
        'subject': 'Nghệ thuật nhiếp ảnh và bố cục chụp hình bằng Smartphone',
        'description': 'Bí quyết căn chỉnh ánh sáng, áp dụng các quy tắc bố cục kinh điển và chỉnh sửa ảnh nhanh chóng để có những bức ảnh triệu like bằng điện thoại.',
        'image': 'image/upload/v1779855815/v0z6bvuyvesch09zjuit.jpg',
        'fee': 450000.00,
        'category_idx': 7,
        'instructor_idx': 5,  # gv_anh
        'tag_names': ['UI/UX']
    },
    {
        'subject': 'Quay dựng phim và biên tập video ngắn bằng Premiere & CapCut',
        'description': 'Lộ trình biên kịch, kỹ thuật quay và chỉnh sửa video ngắn chuyên nghiệp thu hút người xem trên các nền tảng TikTok, Reels, Shorts.',
        'image': 'image/upload/v1779855815/oiecds0u7kt3nls05gsx.jpg',
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
    "Lập trình Python từ Zero đến Hero": [
        "Giới thiệu và Cài đặt Python",
        "image/upload/v1779849776/wxgygfmgfqebti7oo5oc.webp",
        "video/upload/v1779849781/lohbwzapll7smpvys5et.mp4",
        764,
        "Biến, Kiểu dữ liệu và Phép toán",
        "image/upload/v1779849784/hxjsl4ojizid36amittr.webp",
        "video/upload/v1779849786/v0n8hy1b4kwpeg3dt9lo.mp4",
        199,
        "Cấu trúc điều kiện và Vòng lặp",
        "image/upload/v1779849790/auiqesjb1v4fwg60hjea.webp",
        "video/upload/v1779849791/xkarzrwwqmcue51i4ugb.mp4",
        108,
        "Hàm (Function) và Module trong Python",
        "image/upload/v1779849794/av4qewluem156128shq2.webp",
        "video/upload/v1779849796/tphpoh04l1yfn2symhol.mp4",
        228,
        "Xử lý file và Biểu thức chính quy",
        "image/upload/v1779849808/fblagutiazcd5h9h5mzj.webp",
        "video/upload/v1779849810/jmni2cuqjdcinntk13qh.mp4",
        571,
        "Lập trình hướng đối tượng (OOP) cơ bản",
        "image/upload/v1779849817/u5g7mhhg4v8jeusere97.webp",
        "video/upload/v1779849822/ekxsdcy2dmftt8pwn1ey.mp4",
        794
    ],
    "Lập trình Web với ReactJS và Django": [
        "Tổng quan về kiến trúc Web Front-end & Back-end",
        "image/upload/v1779849828/bqxmnkpemk3rmytjwtdk.webp",
        "video/upload/v1779849832/wdo3jqswnbenrkw7zual.mp4",
        624,
        "Cài đặt và cấu hình Django REST Framework",
        "image/upload/v1779849837/ohwdrt7tlkirz0ujjvtm.webp",
        "video/upload/v1779849840/icrd7xd4mg7n8ycjmxrk.mp4",
        372,
        "Thiết kế API và Serializers trong Django",
        "image/upload/v1779849846/gsfeagred1jzrq3taaxc.webp",
        "video/upload/v1779849850/qqzyllktvf7qpa1btwyg.mp4",
        705,
        "Khởi tạo Project ReactJS và Cài đặt Axios",
        "image/upload/v1779849856/awhqfyewyn5c4moqygvd.webp",
        "video/upload/v1779849862/yukpppv90grufwyfohik.mp4",
        397,
        "Quản lý State với Context API và Kết nối API",
        "image/upload/v1779849866/yay2u4rg7vcfeht9ecds.webp",
        "video/upload/v1779849868/y2bahldzg52xjdtpyy6c.mp4",
        185,
        "Xây dựng giao diện Responsive với Bootstrap/CSS",
        "image/upload/v1779849874/yoyk7au50bkhuxhroxwf.webp",
        "video/upload/v1779849879/parzeuo5gznybje6xypv.mp4",
        644,
        "Đăng nhập OAuth2 và Quản lý quyền truy cập",
        "image/upload/v1779849886/e78u1ep1un4ofz2kthgl.webp",
        "video/upload/v1779849890/zxqfwzjzgbgdjph2yxey.mp4",
        658,
        "Triển khai dự án lên Render và Vercel",
        "image/upload/v1779849899/hqy9weqwhzne3cmyrmtt.webp",
        "video/upload/v1779849902/kyzdhetexwdhzymb6wi2.mp4",
        557
    ],
    "Xây dựng App Mobile với React Native": [
        "Giới thiệu về Expo và Cấu trúc dự án React Native",
        "image/upload/v1779849910/vy9wjezfquxneazvitdx.webp",
        "video/upload/v1779849915/azo9n6hslrii4w0lldh8.mp4",
        608,
        "Các Components cơ bản: View, Text, Image, StyleSheet",
        "image/upload/v1779849920/izagkr9kjxsojh7yx1k9.webp",
        "video/upload/v1779849921/v52ybmmlq5fzymj5bio3.mp4",
        554,
        "Xử lý cuộn trang với ScrollView và FlatList",
        "image/upload/v1779849929/py0upu2tojzx2oelqzlz.webp",
        "video/upload/v1779849932/rhfbhl4oitahk1jv8llm.mp4",
        367,
        "Điều hướng ứng dụng với React Navigation (Stack & Tab)",
        "image/upload/v1779849941/biqntohf4u1nqsnoxati.webp",
        "video/upload/v1779849944/ol432qsjsovccredhkv8.mp4",
        571,
        "Quản lý State toàn cục bằng Redux Toolkit",
        "image/upload/v1779849954/gumsqsqab6zuw37p4w8i.webp",
        "video/upload/v1779849957/em6woxzciimj3wcmndmb.mp4",
        636,
        "Tích hợp API và Quản lý đăng ký/đăng nhập",
        "image/upload/v1779849968/vgvrn2dsspqup2sb6dch.webp",
        "video/upload/v1779849971/rsnpkmy9yk0zwuinb7jl.mp4",
        300,
        "Tích hợp cổng thanh toán MoMo và ZaloPay mẫu",
        "image/upload/v1779849989/qdajy3mmdfffkqekv7a3.webp",
        "video/upload/v1779849993/jqgwvif5koz9gfouaya2.mp4",
        803,
        "Đóng gói và phát hành ứng dụng lên Google Play & App Store",
        "image/upload/v1779849999/j0qldtlxu7o1vtfpv6nx.webp",
        "video/upload/v1779850005/vxoftyma75uchgu3hrue.mp4",
        782
    ],
    "Nhập môn lập trình Javascript": [
        "Javascript là gì? Nhúng Javascript vào HTML",
        "image/upload/v1779850011/kk3bsbou90fpaaepfcuh.webp",
        "video/upload/v1779850013/jairbhdtcevdlwdjztwl.mp4",
        298,
        "Biến, Hằng số và Các kiểu dữ liệu cơ bản",
        "image/upload/v1779850021/yk4zafn1ld9xxda9z4jy.webp",
        "video/upload/v1779850023/yvxiwzbb4knpdw9lurkp.mp4",
        412,
        "Hàm (Functions) và Arrow Functions trong ES6",
        "image/upload/v1779850030/ocx0ozuwkiwiutukqaf6.webp",
        "video/upload/v1779850033/bmzzhzjweeppwbb7dqd1.mp4",
        481,
        "Làm việc với Array và các hàm map, filter, reduce",
        "image/upload/v1779850036/a3zhzsjz44mljuxpkpte.webp",
        "video/upload/v1779850037/lggghfwoluxgxiu7m5ts.mp4",
        707,
        "Lập trình bất đồng bộ: Callback, Promise và Async/Await",
        "image/upload/v1779850057/wour3gfexrzkrotvauez.webp",
        "video/upload/v1779850063/csfuvgw8o4lioeqt9tcg.mp4",
        835,
        "Thao tác với DOM trong trình duyệt",
        "image/upload/v1779850074/jdxz2kli63lfuass3wo5.webp",
        "video/upload/v1779850078/o6bdxxit7gyjvelzlno0.mp4",
        789
    ],
    "Luyện thi IELTS 6.5+ toàn diện": [
        "Cấu trúc đề thi IELTS và Chiến thuật làm bài tổng quan",
        "image/upload/v1779850086/csxtkcfoxgzcvfx5oteo.webp",
        "video/upload/v1779850091/qmlani5vzz0nnd1zadvn.mp4",
        546,
        "Listening: Phương pháp nghe chép chính tả và nhận diện bẫy",
        "image/upload/v1779850096/zznaq8x4hkqyvxt1q83s.webp",
        "video/upload/v1779850100/fsb43wmiipavcehywgoo.mp4",
        592,
        "Reading: Kỹ thuật Skimming, Scanning và định vị thông tin",
        "image/upload/v1779850106/mqnbwfzb3xu4qpkqzght.webp",
        "video/upload/v1779850108/iaw0gxqcuuapabsejdsq.mp4",
        204,
        "Writing Task 1: Cách viết biểu đồ đường, cột và bảng số liệu",
        "image/upload/v1779850114/wjoanhbzhkujgwvuul3e.webp",
        "video/upload/v1779850116/cadsetkpmperqhlsorsr.mp4",
        752,
        "Writing Task 2: Cấu trúc bài luận nghị luận xã hội chuẩn 4 đoạn",
        "image/upload/v1779850122/wpxynq30ldbu8bo6o2xo.webp",
        "video/upload/v1779850125/x6rptnhkroews4gjs0mx.mp4",
        337,
        "Speaking Part 1 & 2: Cách triển khai ý tưởng và kéo dài câu trả lời",
        "image/upload/v1779850131/yryzmmygjrnh6iwerrsv.webp",
        "video/upload/v1779850135/fvhmtafpu3pntqgo65et.mp4",
        301,
        "Speaking Part 3: Tư duy phản biện và diễn đạt học thuật",
        "image/upload/v1779850142/ysnqsssulvqpwv30wt78.webp",
        "video/upload/v1779850149/mh15fdj0k5k1vowm4gzy.mp4",
        547,
        "Thi thử và Review lỗi sai phổ biến",
        "image/upload/v1779850160/cq8l0mupwfedzaldss4m.webp",
        "video/upload/v1779850166/ax5yy8pywwtzi4tu6akp.mp4",
        386
    ],
    "Tiếng Anh giao tiếp công sở thực chiến": [
        "Chào hỏi, tự giới thiệu bản thân và đồng nghiệp chuyên nghiệp",
        "image/upload/v1779850172/rvlydswbjhotesrzxusx.webp",
        "video/upload/v1779850176/na2hy4q1aoxvdyfk4xmw.mp4",
        562,
        "Cách viết Email công việc lịch thiệp bằng Tiếng Anh",
        "image/upload/v1779850183/tbdihxzkzevlfkuxb8xb.webp",
        "video/upload/v1779850186/of2kwshy3bvixb2nd1lv.mp4",
        492,
        "Giao tiếp qua điện thoại và đặt lịch hẹn với đối tác",
        "image/upload/v1779850199/wtlv9nnrzu5minfb3it9.webp",
        "video/upload/v1779850204/mqupolpwpu28tcnpzdxp.mp4",
        538,
        "Tham gia và trình bày ý kiến trong các cuộc họp",
        "image/upload/v1779850211/i3fhrazqagxsfa2gva8h.webp",
        "video/upload/v1779850214/qmj6qwjlymxzfosgtuch.mp4",
        369,
        "Kỹ năng thuyết phục khách hàng và đàm phán hợp đồng sơ bộ",
        "image/upload/v1779850235/jjsbmuvjsw4rdae1f3gc.webp",
        "video/upload/v1779850242/quhivksvgttcih51qzqy.mp4",
        765,
        "Xử lý phàn nàn của khách hàng bằng tiếng Anh khéo léo",
        "image/upload/v1779850256/ud98nn7tanog1mlcuoxr.webp",
        "video/upload/v1779850261/qyhvrcikiwecdwxmjzdu.mp4",
        866
    ],
    "Tự học Tiếng Nhật N5 cấp tốc": [
        "Học bảng chữ cái Hiragana toàn diện",
        "image/upload/v1779850268/fgkdlqwhcxqwknxdafm1.webp",
        "video/upload/v1779850275/fbwiibvrbb2ycrdau5px.mp4",
        439,
        "Học bảng chữ cái Katakana và từ mượn",
        "image/upload/v1779850281/vysdsztcpgpvedvgozmc.webp",
        "video/upload/v1779850285/fweyvmdtgwscrov6vpex.mp4",
        674,
        "Các chữ Kanji cơ bản của trình độ N5 (Phần 1)",
        "image/upload/v1779850292/mj9c8n8becuezm6jqqlx.webp",
        "video/upload/v1779850295/wtbcuai47c3ljk9eyirk.mp4",
        350,
        "Ngữ pháp N5: Cách giới thiệu bản thân và chỉ định từ",
        "image/upload/v1779850300/kjbfgi0gcmzl9fetbmsk.webp",
        "video/upload/v1779850302/jrmskblxgiq4ldigr5g2.mp4",
        263,
        "Ngữ pháp N5: Động từ chia thể Masu và các hoạt động hàng ngày",
        "image/upload/v1779850308/hveecwyegwnbkybuuzoa.webp",
        "video/upload/v1779850310/wjlkpiar0jycpavphcd3.mp4",
        99,
        "Luyện nghe hội thoại chào hỏi cơ bản hàng ngày",
        "image/upload/v1779850316/xnavgipnxw2dmv8gtbmh.webp",
        "video/upload/v1779850318/fp9si09hzjo2plv9qzff.mp4",
        425
    ],
    "Thiết kế đồ họa chuyên nghiệp với Photoshop & Illustrator": [
        "Làm quen với giao diện và hệ màu trong Photoshop",
        "image/upload/v1779850324/bt8ga704z1z7zjhqqw6f.webp",
        "video/upload/v1779850327/df8emnjm6bk37vwiloox.mp4",
        272,
        "Kỹ thuật cắt ghép ảnh và loại bỏ nền chuyên nghiệp",
        "image/upload/v1779850335/fiyxnndo5kkwmllu0sbs.webp",
        "video/upload/v1779850338/jf9cudjfztacwkt2hmgs.mp4",
        677,
        "Sử dụng Adjustment Layers và Blend Modes để blend màu",
        "image/upload/v1779850346/teuglhhyil9rxjdoksbc.webp",
        "video/upload/v1779850349/scf7n2vux3aeai7mofit.mp4",
        417,
        "Khởi tạo Workspace và công cụ Pen Tool trong Illustrator",
        "image/upload/v1779850359/zw3o9uith86e8mdelrqj.webp",
        "video/upload/v1779850362/slmq2xtbkbgxulovpunq.mp4",
        784,
        "Thiết kế Logo dạng Vector và Typography cơ bản",
        "image/upload/v1779850370/xu2td4vvjlewvwwi5wdq.webp",
        "video/upload/v1779850375/twcllnk3e1jjubzmerxv.mp4",
        626,
        "Thiết kế ấn phẩm truyền thông (Banner/Poster) hoàn chỉnh",
        "image/upload/v1779850384/btlg5jawfu6ojhewvztc.webp",
        "video/upload/v1779850389/gjapjaawiycny993spet.mp4",
        659,
        "Quy trình xuất bản file in ấn và hiển thị digital",
        "image/upload/v1779850400/yppyfnlvtlrcwrjvyozi.webp",
        "video/upload/v1779850409/xim3uzoie3g0etebohmp.mp4",
        621
    ],
    "UI/UX Design cho thiết kế Web/App di động": [
        "Khái niệm UI/UX và Quy trình thiết kế sản phẩm số",
        "image/upload/v1779850421/julg7r6ccbqflfnjcidr.webp",
        "video/upload/v1779850426/yqljfdcjcrqxpljm0zum.mp4",
        435,
        "Nghiên cứu người dùng (User Research) và Xây dựng Persona",
        "image/upload/v1779850434/jjqxanenzpyqejfxoxba.webp",
        "video/upload/v1779850438/e9leuqec9j9pmszuqks3.mp4",
        456,
        "Vẽ phác thảo cấu trúc thông tin (Information Architecture) & Wireframes",
        "image/upload/v1779850448/txzaz8pmqx4l4qzmjg6j.webp",
        "video/upload/v1779850453/klpr9mhmww48eyi7en6f.mp4",
        404,
        "Sử dụng Figma: Components, Auto Layout và Variants",
        "image/upload/v1779850458/mvbxmkhz9x5oa0zu9rbj.webp",
        "video/upload/v1779850460/ob5u0n2mxmosrbioizbs.mp4",
        328,
        "Thiết kế giao diện Web/Mobile responsive (Visual Design)",
        "image/upload/v1779850465/qyaanmsj2mpe4cxejbf6.webp",
        "video/upload/v1779850467/k5sunylg6dxdk10stuxe.mp4",
        370,
        "Tạo mẫu thử tương tác (Interactive Prototyping) và chuyển tiếp",
        "image/upload/v1779850475/gndiopcqqslai0wcjtek.webp",
        "video/upload/v1779850478/vddezdmhpurjyfedeqae.mp4",
        587,
        "Kiểm thử tính khả dụng (Usability Testing) và bàn giao cho Developer",
        "image/upload/v1779850487/fn5hvq0jffxjcdvby61n.webp",
        "video/upload/v1779850494/zxmozzxoihxko3u4smjy.mp4",
        244
    ],
    "Kỹ năng giao tiếp và thuyết trình trước đám đông": [
        "Vượt qua nỗi sợ hãi đứng trước đám đông",
        "image/upload/v1779850512/yzmfu2o45uyhesrrdcrv.webp",
        "video/upload/v1779850529/ghhwjhbn2jsxcto3ibct.mp4",
        775,
        "Làm chủ ngôn ngữ cơ thể (Body Language) và ánh mắt",
        "image/upload/v1779850544/tkoleshzsz2f8uquaxsf.webp",
        "video/upload/v1779850557/ps8zwiww7rqfztdsme1o.mp4",
        808,
        "Luyện giọng nói: Tông giọng, tốc độ và cách nhả chữ",
        "image/upload/v1779850566/aebjx7qe4eluxtvzmsmz.webp",
        "video/upload/v1779850574/qnqkummkti6ozna1mt8o.mp4",
        588,
        "Thiết kế cấu trúc bài thuyết trình thu hút (Mở - Thân - Kết)",
        "image/upload/v1779850580/ssaoifysf6auclwsz2as.webp",
        "video/upload/v1779850588/ta6276x6il8tb1omxna7.mp4",
        606,
        "Sử dụng slide thuyết trình hiệu quả hỗ trợ bài nói",
        "image/upload/v1779850595/jysjbxr9fvwfkjkfqjca.webp",
        "video/upload/v1779850601/acjup8vrhsj9iikfwgyt.mp4",
        547,
        "Kỹ năng xử lý câu hỏi hóc búa từ khán giả",
        "image/upload/v1779850606/oac0wbin2if8z2m1hr3z.webp",
        "video/upload/v1779850608/r3sthqehsf4vcaykhcjy.mp4",
        169
    ],
    "Quản lý thời gian và làm việc hiệu quả": [
        "Nhận diện kẻ cắp thời gian và đánh giá hiện trạng bản thân",
        "image/upload/v1779850616/mc1acg0dwfa8ri6kismt.webp",
        "video/upload/v1779850623/ntiv1jmielui63zzjybp.mp4",
        558,
        "Thiết lập mục tiêu thông minh theo nguyên tắc SMART",
        "image/upload/v1779850629/dj1cjpaukx7qqtv6zyk0.webp",
        "video/upload/v1779850633/kipnqcvn4k0uaejjwf20.mp4",
        366,
        "Quy tắc Ma trận Eisenhower: Phân loại việc khẩn cấp và quan trọng",
        "image/upload/v1779850645/ak0fdzoware7l6tc1vs6.webp",
        "video/upload/v1779850650/gi1f6clxdyij8gmuplc1.mp4",
        490,
        "Kỹ thuật Pomodoro giúp tập trung cao độ",
        "image/upload/v1779850661/orqjy2cx081oumhwisiq.webp",
        "video/upload/v1779850669/gfx7hmsoilx9y7drihhe.mp4",
        676,
        "Cách từ chối khéo léo để bảo vệ quỹ thời gian của bản thân",
        "image/upload/v1779850683/sib8fd7z4sbzctqc2rkv.webp",
        "video/upload/v1779850690/jaxsd1nrnmqzwnwb1zkw.mp4",
        530,
        "Sử dụng các ứng dụng quản lý công việc: Notion, Trello",
        "image/upload/v1779850696/cenomeptd5bwws3blxs8.webp",
        "video/upload/v1779850699/xjowfvc6bdcvdpf5ynj1.mp4",
        672
    ],
    "Khởi nghiệp kinh doanh online từ con số 0": [
        "Lựa chọn ngách kinh doanh và Nghiên cứu đối thủ cạnh tranh",
        "image/upload/v1779850711/nlhszo8d6oock0wxhr5w.webp",
        "video/upload/v1779850719/rps8dzqhuggwnw8adh4q.mp4",
        576,
        "Tìm kiếm nguồn hàng chất lượng và đàm phán giá sỉ",
        "image/upload/v1779850727/kh4knixsnfjmwcrijo0r.webp",
        "video/upload/v1779850731/jbcyveftmcmxtzb1jm3x.mp4",
        415,
        "Xây dựng thương hiệu cá nhân và Fanpage bán hàng chuyên nghiệp",
        "image/upload/v1779850741/n5hbcdotgsufo2ieuzzn.webp",
        "video/upload/v1779850751/shumqztnhhqay24swtre.mp4",
        618,
        "Thiết lập gian hàng trên Shopee, TikTok Shop tối ưu chuẩn SEO",
        "image/upload/v1779850757/mkr3exukgfljlaqsl9sa.webp",
        "video/upload/v1779850762/gxqgszgnvvs7hzkbfjwr.mp4",
        861,
        "Quy trình đóng gói, vận chuyển và quản lý tồn kho",
        "image/upload/v1779850769/ulj5tquoginyvgdo0eah.webp",
        "video/upload/v1779850771/em54uj2ou2uc1tlgcfxn.mp4",
        162,
        "Chăm sóc khách hàng và xây dựng tập khách hàng trung thành",
        "image/upload/v1779850784/erd8biwjcebzvuzgyzp7.webp",
        "video/upload/v1779850791/jnk4jcvyzecshnechtmu.mp4",
        551
    ],
    "Kỹ năng đàm phán và chốt sale đỉnh cao": [
        "Tâm lý học trong bán hàng: Hiểu người mua để bán dễ dàng",
        "image/upload/v1779850800/rixyqqtpdrmiaagtkzgh.webp",
        "video/upload/v1779850806/givf4lxrc7q4anaxxmn9.mp4",
        768,
        "Chuẩn bị kịch bản gọi điện (Telesales) và tiếp cận khách hàng",
        "image/upload/v1779850813/yxovhm2w5f35fdds9phf.webp",
        "video/upload/v1779850816/m55fkigdfka3gtjpmqyu.mp4",
        367,
        "Kỹ thuật khai thác nhu cầu thực tế của khách hàng",
        "image/upload/v1779850824/iva43tgwewd7tjkrh4cw.webp",
        "video/upload/v1779850828/lndnvcagd7qnim9ephzd.mp4",
        317,
        "Trình bày giải pháp sản phẩm vượt trội so với đối thủ",
        "image/upload/v1779850837/eihcnmcwe9zxvms7na9b.webp",
        "video/upload/v1779850841/e9knjggup2s9u4z2eekm.mp4",
        736,
        "Xử lý từ chối (Handling Objections) về giá cả và chất lượng",
        "image/upload/v1779850848/fegoz7hftk0bzjvtg4ks.webp",
        "video/upload/v1779850854/ontfgyb5gphh3o02ad6u.mp4",
        728,
        "Các đòn tâm lý chốt sale thần tốc và chăm sóc sau bán",
        "image/upload/v1779850860/cclibwakuotnvze2k5v7.webp",
        "video/upload/v1779850863/iea7okbt0v71xfgk2xlw.mp4",
        458
    ],
    "Tiếp thị kỹ thuật số và chạy quảng cáo Facebook/Google": [
        "Tổng quan về Digital Marketing và các kênh truyền thông chính",
        "image/upload/v1779850869/uwta1wxgpneoz2msr5w3.webp",
        "video/upload/v1779850873/jmsuc6lmzhrbrunu7sfz.mp4",
        482,
        "Thiết lập Trình quản lý doanh nghiệp (BM) trên Facebook Ads",
        "image/upload/v1779850877/segwjvl2yzpr2vxg6nty.webp",
        "video/upload/v1779850880/fpnlchftdhngm0hnfhpx.mp4",
        335,
        "Kỹ thuật Target đối tượng mục tiêu và tối ưu ngân sách quảng cáo",
        "image/upload/v1779850887/epv6rhpu9lmbwbkx67hc.webp",
        "video/upload/v1779850890/lnmbz4rkmttyjuvovrs4.mp4",
        331,
        "Tạo tài khoản Google Ads và nghiên cứu từ khóa quảng cáo",
        "image/upload/v1779850895/bhbmb60fwh8jshkaj9d3.webp",
        "video/upload/v1779850899/fltiajzdkcfpylyffban.mp4",
        318,
        "Lập chiến dịch quảng cáo tìm kiếm (Search Ads) và hiển thị (GDN)",
        "image/upload/v1779850912/mqk0mncdjmargdpze2eg.webp",
        "video/upload/v1779850915/natp5rmqjou0gnnq8ev3.mp4",
        413,
        "Viết nội dung quảng cáo (Copywriting) thu hút tỷ lệ click cao",
        "image/upload/v1779850925/tcwhihgkfa0jforpwcvy.webp",
        "video/upload/v1779850928/iiwpul93fwmsbo2fkvvo.mp4",
        501,
        "Đo lường, đọc chỉ số báo cáo CTR, CPC, ROAS và tối ưu hóa chiến dịch",
        "image/upload/v1779850934/nhglo46nz0t1xo2kri9q.webp",
        "video/upload/v1779850938/ebf8gnztb5id26hyq6ka.mp4",
        378
    ],
    "SEO Website nâng cao - Thống trị thứ hạng tìm kiếm": [
        "Cơ chế hoạt động của Google Search Engine",
        "image/upload/v1779850953/w5fakipomznskp9s2mcp.webp",
        "video/upload/v1779850956/rj88reim2lb3ulnimrn8.mp4",
        304,
        "Nghiên cứu từ khóa chuyên sâu bằng Ahrefs and SEMrush",
        "image/upload/v1779850975/bm1xurbyevdntifd0zqm.webp",
        "video/upload/v1779850978/r9cmekcdquakilpagemi.mp4",
        630,
        "Tối ưu SEO Onpage: Tiêu đề, Thẻ Heading, Hình ảnh, URL",
        "image/upload/v1779850994/gfwkgov81pbqstmnj7ye.webp",
        "video/upload/v1779850999/dq9mrtanuxv0yjl2scix.mp4",
        577,
        "Viết bài chuẩn SEO chuẩn cấu trúc thu hút người đọc",
        "image/upload/v1779851010/clquxypufanmih5r2bzn.webp",
        "video/upload/v1779851016/yqlkeh0su0a9asc9sm3t.mp4",
        580,
        "Kỹ thuật SEO Technical: Sơ đồ trang web, robots.txt, tốc độ load",
        "image/upload/v1779851027/plt00cjuzva2t5birxi2.webp",
        "video/upload/v1779851035/vb4zvv62g70ncjni6alw.mp4",
        697,
        "Xây dựng liên kết (Link Building) và SEO Offpage an toàn",
        "image/upload/v1779851042/hikkfq880jsq8vs5cx9n.webp",
        "video/upload/v1779851045/lmrsbrswpocunphtqyyb.mp4",
        299,
        "Đánh giá hiệu quả bằng Google Analytics và Search Console",
        "image/upload/v1779851057/y78hjkkbjphkc21nrtws.webp",
        "video/upload/v1779851064/t5jjlwbkoba8tuiju5gq.mp4",
        796
    ],
    "Nhập môn Trí tuệ nhân tạo (AI) và Học máy (Machine Learning)": [
        "Khái niệm AI, Machine Learning và Deep Learning",
        "image/upload/v1779851070/cnqihbaeounythfvsnad.webp",
        "video/upload/v1779851072/hkapndgqsvcptbeosk0y.mp4",
        287,
        "Cài đặt Jupyter Notebook và làm quen thư viện NumPy, Pandas",
        "image/upload/v1779851083/cflq8gvcvegilbkz8bfb.webp",
        "video/upload/v1779851087/mm9jqcs5ryq3q70qo4vy.mp4",
        573,
        "Học máy có giám sát (Supervised Learning): Hồi quy tuyến tính",
        "image/upload/v1779851103/ylytxmueo2fmdxhlmwky.webp",
        "video/upload/v1779851107/gjphsbacgzifcpudpej7.mp4",
        520,
        "Thuật toán phân loại: Logistic Regression và Decision Tree",
        "image/upload/v1779851117/tou2t3amfmt3ahcs1uda.webp",
        "video/upload/v1779851121/nvq3shxvscelnqyqspiu.mp4",
        836,
        "Học máy không giám sát (Unsupervised Learning): Phân cụm K-Means",
        "image/upload/v1779851127/eschtghvkwx81xd0i9me.webp",
        "video/upload/v1779851130/cxqihbjuoox62xavycgd.mp4",
        280,
        "Tổng quan về Mạng thần kinh nhân tạo (Artificial Neural Networks)",
        "image/upload/v1779851137/tzbugh4wfctjc3q5mdqh.webp",
        "video/upload/v1779851145/fhwclxekqv3o4hgapqvr.mp4",
        873,
        "Thực hành xây dựng mô hình dự báo giá nhà đơn giản",
        "image/upload/v1779851151/hy4my8tbao647zjxtupz.webp",
        "video/upload/v1779851154/uii9djp7kxo7erplada6.mp4",
        395
    ],
    "Data Analysis với SQL và Power BI": [
        "Vai trò của Phân tích dữ liệu trong doanh nghiệp",
        "image/upload/v1779851167/pyizrb6tdb7tckn0dihl.webp",
        "video/upload/v1779851171/drwm8o1heudrhhlethcg.mp4",
        713,
        "SQL cơ bản: Viết truy vấn SELECT, WHERE, GROUP BY",
        "image/upload/v1779851181/lsdaiog0xzjum07zmv3r.webp",
        "video/upload/v1779851187/r4zgllvkyoxlckvy4eka.mp4",
        589,
        "Liên kết các bảng dữ liệu bằng SQL JOIN",
        "image/upload/v1779851202/brysi9an39ummav42sbr.webp",
        "video/upload/v1779851211/vgcaw0iyjwp7pwtddzxm.mp4",
        692,
        "Làm sạch và chuẩn hóa dữ liệu bằng Power Query",
        "image/upload/v1779851218/zlrqqqapipe2yzkurori.webp",
        "video/upload/v1779851219/w9syamnylko5ultbpkb5.mp4",
        76,
        "Thiết lập mối quan hệ dữ liệu (Data Modeling) trong Power BI",
        "image/upload/v1779851223/fsnnfqsnhdik3bceogix.webp",
        "video/upload/v1779851225/k9a9ewxvfvein0mpi26w.mp4",
        223,
        "Viết công thức phân tích DAX cơ bản",
        "image/upload/v1779851230/s6svunpx1qnk51fymc4g.webp",
        "video/upload/v1779851233/arkr9vhq4n5hpyijftlr.mp4",
        256,
        "Thiết kế Dashboard tương tác trực quan sinh động báo cáo doanh số",
        "image/upload/v1779851239/ybnvqzlehmgdwojrtyrr.webp",
        "video/upload/v1779851241/tr9xugs5sel49hogxnsr.mp4",
        147
    ],
    "Python cho phân tích dữ liệu ứng dụng": [
        "Cài đặt Anaconda và Jupyter Lab",
        "image/upload/v1779851251/lj1k4eu1p14jbvyxxaf5.webp",
        "video/upload/v1779851256/eyyoujr3bng1auew6a4v.mp4",
        846,
        "Thao tác với cấu trúc Series và DataFrame trong Pandas",
        "image/upload/v1779851267/yhxvyg0tap2viibddevs.webp",
        "video/upload/v1779851270/fdsuqlpbkkch0lj4g9jf.mp4",
        515,
        "Đọc/Ghi dữ liệu từ các file CSV, Excel, SQL database",
        "image/upload/v1779851275/d0yvdkkjy3le6fzozfbv.webp",
        "video/upload/v1779851278/l8umsqfmsswaocjxnkay.mp4",
        280,
        "Xử lý dữ liệu khuyết thiếu (Null) và chuẩn hóa dữ liệu",
        "image/upload/v1779851289/ojdlg5zi2oxyw0nsqyf9.webp",
        "video/upload/v1779851293/mikdl2g2kseicradj4rp.mp4",
        804,
        "Trực quan hóa dữ liệu với Matplotlib và Seaborn",
        "image/upload/v1779851299/hub35nu6zhvaaanghtmg.webp",
        "video/upload/v1779851301/bcyc2qxr51zqyboum4ki.mp4",
        208,
        "Phân tích thống kê mô tả cơ bản trên tập dữ liệu thực tế",
        "image/upload/v1779851306/wxwijjkuohv359hxsa0s.webp",
        "video/upload/v1779851308/rhtspp7x0q8easkjkhyl.mp4",
        65
    ],
    "Nghệ thuật nhiếp ảnh và bố cục chụp hình bằng Smartphone": [
        "Hiểu về camera trên Smartphone và cách làm sạch ống kính",
        "image/upload/v1779851316/pawf6vgndt6yz94fxsyp.webp",
        "video/upload/v1779851323/uaizfy0c4vwnrq4qo4lm.mp4",
        581,
        "Làm chủ ánh sáng tự nhiên và hướng sáng chụp ảnh đẹp",
        "image/upload/v1779851328/drejh4vw1z5kocwcdso8.webp",
        "video/upload/v1779851329/vtqwjcvopnzpkoj3fsxs.mp4",
        79,
        "Các quy tắc bố cục kinh đoán: 1/3, đường dẫn, đối xứng",
        "image/upload/v1779851337/llzvuslcebfaekkfe4vl.webp",
        "video/upload/v1779851344/voiut5qri9ekdsx3ogjn.mp4",
        503,
        "Kỹ thuật chụp ảnh chân dung xóa phông tự nhiên",
        "image/upload/v1779851352/yewqq2wcg2kfadstnypd.webp",
        "video/upload/v1779851355/z0cmviewxkwzwqhzwgoi.mp4",
        183,
        "Kỹ thuật chụp ảnh phong cảnh và đồ ăn bắt mắt",
        "image/upload/v1779851363/xvvoqfg3dximg1tcvuks.webp",
        "video/upload/v1779851369/tpo1sdu4g6uj7luobvoi.mp4",
        438,
        "Chỉnh sửa ảnh nhanh bằng ứng dụng Lightroom Mobile và Snapseed",
        "image/upload/v1779851376/cnmfwz3s628bdtsyjpgl.webp",
        "video/upload/v1779851381/oranrif4liox0do5tqch.mp4",
        244
    ],
    "Quay dựng phim và biên tập video ngắn bằng Premiere & CapCut": [
        "Tư duy biên kịch và xây dựng Storyboard cho video ngắn",
        "image/upload/v1779851387/f0olrk3dqzxq6jrsaz7l.webp",
        "video/upload/v1779851393/voylx1amoba7aeqxadx7.mp4",
        152,
        "Thiết lập cỡ khung hình dọc (9:16) cho TikTok/Reels",
        "image/upload/v1779851402/usg0lqx33kvh0vrvuh3s.webp",
        "video/upload/v1779851409/sjd1t0dhmhmnkuchdodx.mp4",
        362,
        "Kỹ thuật cắt ghép và khớp nhạc (BGM) tạo nhịp điệu trên CapCut",
        "image/upload/v1779851415/rva8zewqfmcg5ofwdovv.webp",
        "video/upload/v1779851421/iqa9ltl4jykbxpupntm8.mp4",
        445,
        "Làm quen giao diện và công cụ cắt ghép chuyên sâu trên Premiere",
        "image/upload/v1779851427/rnrlkttnwbo6e6ftjpqz.webp",
        "video/upload/v1779851431/d0crsgykdtx6res9jrzf.mp4",
        339,
        "Thiết kế hiệu ứng chuyển cảnh (Transitions) mượt mà",
        "image/upload/v1779851437/d4n307cvhoad4xahtzlm.webp",
        "video/upload/v1779851439/aopplnxqlc03bz5lyuqt.mp4",
        123,
        "Chèn phụ đề tự động (Auto Captions) và hiệu ứng chữ độc đáo",
        "image/upload/v1779851442/ufte9aejg8fc26pqes2f.webp",
        "video/upload/v1779851443/jedts9428etcsq9mitei.mp4",
        82,
        "Phối màu cơ bản và xuất video chất lượng cao không bị mờ",
        "image/upload/v1779851449/ryymsmkzuaj7jeu6fpsu.webp",
        "video/upload/v1779851454/lw1s5eebs2awr7umgrnx.mp4",
        655
    ]
}

lessons_created_count = 0
for course in courses:
    lessons_data = COURSE_LESSONS.get(course.subject, [])
    for idx in range(0, len(lessons_data), 4):
        subject = lessons_data[idx]
        img = lessons_data[idx + 1]
        vid = lessons_data[idx + 2]
        vid_sec = lessons_data[idx + 3]

        # Bài đầu tiên sẽ luôn là preview
        is_preview = (idx == 0)

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
    all_lessons = list(course.lessons.all().order_by('order'))
    if not all_lessons:
        continue

    # Đảm bảo bài học đầu tiên (bài giới thiệu/preview) luôn luôn được chọn để nạp bình luận
    first_lesson = all_lessons[0]
    other_lessons = all_lessons[1:]
    
    # Chọn ngẫu nhiên thêm tối đa 3 bài học khác trong khóa học
    sampled_others = random.sample(other_lessons, k=min(3, len(other_lessons)))
    commented_lessons = [first_lesson] + sampled_others
    for lesson in commented_lessons:
        # Lấy danh sách học viên đăng ký học khóa này để comment cho thực tế
        active_enrollments = list(course.enrollments.filter(payment__is_successful=True))

        # Nếu là bài học giới thiệu Python, sinh nhiều bình luận từ mọi sinh viên để kích hoạt phân trang (comment pagination)
        is_python_intro = (course.subject == 'Lập trình Python từ Zero đến Hero' and lesson.subject == 'Giới thiệu và Cài đặt Python')
        num_comments = 15 if is_python_intro else 3

        if is_python_intro:
            commenters = random.sample(students, k=min(num_comments, len(students)))
        elif active_enrollments:
            commenters = [en.student for en in random.sample(active_enrollments, k=min(num_comments, len(active_enrollments)))]
        else:
            # Fallback nếu khóa học chưa có học viên đăng ký thành công
            commenters = random.sample(students, k=min(num_comments, len(students)))

        for idx_cmt, student_user in enumerate(commenters):
            content = random.choice(student_comments)
            if is_python_intro:
                # Tạo nội dung phong phú thêm cho nhiều comment
                additional_student_comments = [
                    "Em rất thích cách truyền đạt của thầy cô, slide đẹp quá.",
                    "Hi vọng sẽ hoàn thành tốt khóa học Python này!",
                    "Kiến thức chuẩn chỉnh, thực hành rất đã tay.",
                    "Chào cả lớp, chúc mọi người cùng hoàn thành khóa học xuất sắc nhé.",
                    "Em đã cài đặt thành công Python 3.11 rồi ạ.",
                    "Khóa học tuyệt vời ngoài mong đợi luôn ạ!",
                    "Có bài tập nâng cao thêm không thầy cô?",
                    "Bài giảng cực kỳ chi tiết, rất phù hợp cho người mới bắt đầu.",
                    "Em đã xem hết video và làm bài tập xong rồi nha."
                ]
                content = random.choice(student_comments + additional_student_comments)

            # Tạo Comment gốc
            cmt_goc = Comment.objects.create(
                user=student_user,
                lesson=lesson,
                content=content,
                parent=None
            )
            # Ghi đè ngày tạo comment
            if is_python_intro:
                # Phân bổ các mốc thời gian gần thời điểm chạy (để hiển thị đẹp mắt như Facebook)
                recent_offsets = [
                    timedelta(seconds=15),       # 15 giây trước
                    timedelta(minutes=2),        # 2 phút trước
                    timedelta(minutes=15),       # 15 phút trước
                    timedelta(minutes=45),       # 45 phút trước
                    timedelta(hours=1, minutes=30), # 1 giờ trước
                    timedelta(hours=3),          # 3 giờ trước
                    timedelta(hours=8),          # 8 giờ trước
                    timedelta(days=1),           # 1 ngày trước
                    timedelta(days=2),           # 2 ngày trước
                    timedelta(days=3, hours=4),  # 3 ngày trước
                    timedelta(days=5),           # 5 ngày trước
                    timedelta(days=8),           # 1 tuần trước
                    timedelta(days=14),          # 2 tuần trước
                    timedelta(days=20),          # 2 tuần trước
                    timedelta(days=30)           # 1 tháng trước
                ]
                cmt_date = now - recent_offsets[idx_cmt % len(recent_offsets)]
            else:
                base_enrollment_date = active_enrollments[0].created_date if active_enrollments else now - timedelta(days=30)
                cmt_date = base_enrollment_date + timedelta(days=random.randint(1, 5), hours=idx_cmt)
                if cmt_date > now:
                    cmt_date = now

            Comment.objects.filter(pk=cmt_goc.pk).update(created_date=cmt_date, updated_date=cmt_date)
            comments_created += 1

            # Giảng viên trả lời (60% cơ hội, hoặc 80% đối với Python intro để tăng thêm số lượng comment)
            reply_chance = 0.8 if is_python_intro else 0.6
            if random.random() < reply_chance:
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
                # Trả lời sau comment gốc vài giờ (hoặc vài phút đối với Python intro)
                if is_python_intro:
                    reply_date = cmt_date + timedelta(minutes=random.randint(1, 10))
                    if reply_date > now:
                        reply_date = now
                else:
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

    # --- SINH THÊM ĐÁNH GIÁ KIỂM THỬ PHÂN TRANG (PAGINATION TEST) CHO KHÓA HỌC PYTHON ---
    python_course = Course.objects.filter(subject='Lập trình Python từ Zero đến Hero').first()
    if python_course:
        python_lessons = list(python_course.lessons.all())
        existing_reviewer_ids = CourseReview.objects.filter(course=python_course).values_list('user_id', flat=True)
        potential_reviewers = [s for s in students if s.id not in existing_reviewer_ids]

        reviews_needed = 15 - CourseReview.objects.filter(course=python_course).count()
        if reviews_needed > 0:
            for idx in range(min(reviews_needed, len(potential_reviewers))):
                student_user = potential_reviewers[idx]
                
                # 1. Đăng ký học
                enrollment, created = Enrollment.objects.get_or_create(
                    student=student_user,
                    course=python_course
                )
                
                # 2. Thanh toán thành công
                payment, p_created = Payment.objects.get_or_create(
                    enrollment=enrollment,
                    defaults={
                        'amount': python_course.fee,
                        'payment_method': 'CASH',
                        'is_successful': True,
                        'transaction_id': str(uuid.uuid4())
                    }
                )
                if not p_created and not payment.is_successful:
                    payment.is_successful = True
                    payment.save()

                # 3. Tiến độ học tập >= 20% (Hoàn thành 2 bài học)
                for lesson in python_lessons[:2]:
                    LessonProgress.objects.get_or_create(
                        enrollment=enrollment,
                        lesson=lesson,
                        defaults={
                            'status': 'COMPLETED',
                            'watched_seconds': lesson.video_seconds
                        }
                    )
                enrollment.update_progress()
                
                # 4. Đánh giá
                r = random.random()
                if r < 0.60:
                    rating = 5
                elif r < 0.90:
                    rating = 4
                else:
                    rating = 3
                    
                comment = random.choice(reviews_pool[rating])
                
                try:
                    review = CourseReview.objects.create(
                        user=student_user,
                        course=python_course,
                        rating=rating,
                        comment=comment
                    )
                    
                    # Ghi đè ngày tạo review ngẫu nhiên lùi về trước
                    rev_date = now - timedelta(days=random.randint(1, 10), hours=random.randint(1, 23))
                    CourseReview.objects.filter(pk=review.pk).update(created_date=rev_date, updated_date=rev_date)
                    reviews_created_count += 1
                except ValidationError as e:
                    print(f"   [Validation Error Bỏ Qua trong seed Python] {e}")
                    pass

            print(f" -> Đã gieo thêm thành công. Tổng số đánh giá hiện tại của '{python_course.subject}': {python_course.reviews.count()}")

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
