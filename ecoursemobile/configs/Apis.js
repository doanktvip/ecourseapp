import axios from 'axios';

// Lấy thông tin cấu hình từ file môi trường (.env) hoặc dùng giá trị mặc định
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

// Định nghĩa toàn bộ danh sách các endpoints từ hệ thống ecourseapi
export const endpoints = {
    // === Danh mục & Khóa học ===
    'categories': '/categories/',                                      // Danh sách/Tạo danh mục
    'courses': '/courses/',                                            // Danh sách/Tạo khóa học
    'course-details': (courseId) => `/courses/${courseId}/`,          // Chi tiết/Cập nhật/Xóa khóa học
    'course-compare': '/courses/compare/',                              // So sánh các khóa học bằng danh sách ids
    'course-lessons': (courseId) => `/courses/${courseId}/lessons/`,    // Danh sách bài học của khóa học/Thêm bài học mới
    'course-enrolls': (courseId) => `/courses/${courseId}/enrolls/`,    // Đăng ký học (Được phép học thử / Tạo hóa đơn chờ)
    'course-enroll-detail': (courseId, enrollId) => `/courses/${courseId}/enrolls/${enrollId}/`, // Chi tiết đăng ký
    'course-students': (courseId) => `/courses/${courseId}/students/`,  // Danh sách học viên của khóa học (đã đóng tiền)
    'course-reviews': (courseId) => `/courses/${courseId}/reviews/`,    // Lấy/Viết đánh giá của khóa học

    // === Người dùng & Xác thực ===
    'register': '/users/',                                              // Đăng ký tài khoản (POST)
    'login': '/o/token/',                                               // Đăng nhập lấy OAuth2 Access Token (POST)
    'current-user': '/users/me/',                                       // Xem/Cập nhật thông tin tài khoản hiện tại (GET, PATCH)
    'change-password': '/users/me/change-password/',                    // Đổi mật khẩu (POST)
    'apply-instructor': '/users/me/apply/',                             // Nộp đơn/Xem đơn đăng ký làm giáo viên (GET, POST)
    'my-enrollments': '/users/me/enrollments/',                         // Danh sách khóa học đã đăng ký của học viên (GET)

    // === Quản lý Đơn đăng ký giảng dạy (Admin) ===
    'applications': '/applies/',                                        // Danh sách đơn xin giảng dạy (GET)
    'application-details': (applyId) => `/applies/${applyId}/`,        // Duyệt đơn xin giảng dạy (PATCH)

    // === Bài học & Tương tác ===
    'lessons': '/lessons/',                                             // Danh sách bài học chung (Admin)
    'lesson-details': (lessonId) => `/lessons/${lessonId}/`,            // Chi tiết bài học
    'lesson-tags': (lessonId) => `/lessons/${lessonId}/tags/`,          // Gán nhãn tags cho bài học (POST)
    'lesson-complete': (lessonId) => `/lessons/${lessonId}/complete/`,  // Đánh dấu đã hoàn thành bài học (POST)
    'lesson-comments': (lessonId) => `/lessons/${lessonId}/comments/`,  // Lấy danh sách/Viết bình luận bài học (GET, POST)
    'lesson-like': (lessonId) => `/lessons/${lessonId}/like/`,          // Thích/Bỏ thích bài học (POST)

    // === Quản lý nhãn (Tags) ===
    'tags': '/tags/',                                                   // Danh sách nhãn (GET, POST)
    'tag-details': (tagId) => `/tags/${tagId}/`,                        // Xem/Cập nhật/Xóa nhãn

    // === Thanh toán ===
    'payments': '/payments/',                                           // Danh sách lịch sử thanh toán (GET)
    'payment-details': (paymentId) => `/payments/${paymentId}/`,        // Chi tiết thanh toán (GET)
    'payment-process': (paymentId) => `/payments/${paymentId}/process/`, // Tiến hành thanh toán qua Gateway (Momo, ZaloPay, ...)
    'payment-confirm-cash': (paymentId) => `/payments/${paymentId}/confirm-cash/`, // Xác nhận đóng tiền mặt (POST - Instructor)

    // === Thống kê ===
    'stats': '/stats/',                                                 // Thống kê doanh thu, học viên (GET - Instructor)
};

export const authApi = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

export const authApis = authApi;

export default axios.create({
    baseURL: BASE_URL
});
