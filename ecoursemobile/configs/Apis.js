import axios from 'axios';

// Lấy địa chỉ IP/domain của backend từ biến môi trường
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

// Định nghĩa các endpoint (đường dẫn API) để tái sử dụng
export const endpoints = {
    'categories': '/categories/',
    'courses': '/courses/',
    'course-details': (courseId) => `/courses/${courseId}/`,
    'course-compare': '/courses/compare/',
    'course-lessons': (courseId) => `/courses/${courseId}/lessons/`,
    'course-enrolls': (courseId) => `/courses/${courseId}/enrolls/`,
    'course-students': (courseId) => `/courses/${courseId}/students/`,
    'course-reviews': (courseId) => `/courses/${courseId}/reviews/`,

    'register': '/users/',
    'login': '/o/token/',
    'current-user': '/users/me/',
    'change-password': '/users/me/change-password/',
    'apply-instructor': '/users/me/apply/',
    'my-courses': '/users/me/courses/',
    'my-enrolls': '/users/me/enrolls/',

    'applications': '/applies/',
    'application-details': (applyId) => `/applies/${applyId}/`,

    'lessons': '/lessons/',
    'lesson-details': (lessonId) => `/lessons/${lessonId}/`,
    'lesson-tags': (lessonId) => `/lessons/${lessonId}/tags/`,
    'lesson-complete': (lessonId) => `/lessons/${lessonId}/complete/`,
    'lesson-update-progress': (lessonId) => `/lessons/${lessonId}/update-progress/`,
    'lesson-comments': (lessonId) => `/lessons/${lessonId}/comments/`,
    'lesson-like': (lessonId) => `/lessons/${lessonId}/like/`,

    'tags': '/tags/',
    'tag-details': (tagId) => `/tags/${tagId}/`,

    'payments': '/payments/',
    'payment-details': (paymentId) => `/payments/${paymentId}/`,
    'payment-process': (paymentId) => `/payments/${paymentId}/process/`,
    'payment-confirm-cash': (paymentId) => `/payments/${paymentId}/confirm-cash/`,

    'stats': '/stats/',
};

// Hàm tạo axios instance có đính kèm sẵn token để gọi các API cần xác thực
export const authApi = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

export const authApis = authApi;

// Axios instance mặc định (không đính kèm token)
export default axios.create({
    baseURL: BASE_URL
});
