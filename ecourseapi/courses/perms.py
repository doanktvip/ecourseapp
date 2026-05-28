from rest_framework import permissions
from courses.models import User, Enrollment, Payment


# Phân quyền cơ bản: User đã đăng nhập
class IsAuthenticatedUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


# Phân quyền: User là Sinh viên
class IsStudent(IsAuthenticatedUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == User.Role.STUDENT


# Phân quyền: User là Giảng viên
class IsInstructor(IsAuthenticatedUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == User.Role.INSTRUCTOR


# Phân quyền: User là Quản trị viên
class IsAdmin(IsAuthenticatedUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == User.Role.ADMIN


# Phân quyền: User là chủ sở hữu khóa học (hoặc Admin)
class IsCourseOwner(IsAuthenticatedUser):
    def has_object_permission(self, request, view, obj):
        instructor = getattr(obj, 'instructor', getattr(getattr(obj, 'course', None), 'instructor', None))
        user = request.user
        if user.role == User.Role.ADMIN:
            return True
        return instructor == request.user


# Phân quyền: User là sinh viên sở hữu Enrollment này
class IsStudentEnrollmentOwner(IsAuthenticatedUser):
    def has_object_permission(self, request, view, obj):
        return isinstance(obj, Enrollment) and obj.student == request.user


# Phân quyền: Đã mua khóa học và thanh toán thành công (hoặc là giảng viên khóa đó, hoặc admin)
class IsEnrolled(IsAuthenticatedUser):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == User.Role.ADMIN:
            return True

        if type(obj).__name__ == 'Course':
            course = obj
        else:
            course = getattr(obj, 'course', None)

        if not course:
            return False

        if user.role == User.Role.INSTRUCTOR and course.instructor == user:
            return True

        return Enrollment.objects.filter(student=user, course=course, payment__is_successful=True).exists()


# Phân quyền: Đã mua khóa học HOẶC bài học này cho phép xem thử
class IsEnrolledOrPreview(IsEnrolled):
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        if type(obj).__name__ == 'Lesson' and getattr(obj, 'is_preview', False):
            return True

        if not (request.user and request.user.is_authenticated):
            return False

        return super().has_object_permission(request, view, obj)


# Phân quyền: Có bản ghi đăng ký khóa học (dù thanh toán thành công hay chưa)
class HasEnrollmentRecord(IsAuthenticatedUser):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == User.Role.ADMIN:
            return True

        if type(obj).__name__ == 'Course':
            course = obj
        else:
            course = getattr(obj, 'course', None)

        if not course:
            return False

        if user.role == User.Role.INSTRUCTOR and course.instructor == user:
            return True

        return Enrollment.objects.filter(student=user, course=course).exists()


# Phân quyền: Là sinh viên thanh toán cho hóa đơn này
class IsPaymentStudentOwner(IsAuthenticatedUser):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.enrollment.student


# Phân quyền: Là giảng viên của khóa học mà hóa đơn này thanh toán cho
class IsPaymentCourseInstructor(IsAuthenticatedUser):
    def has_object_permission(self, request, view, obj):
        if request.user.role == User.Role.ADMIN:
            return True
        return request.user == obj.enrollment.course.instructor
