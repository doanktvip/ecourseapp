from rest_framework import permissions
from courses.models import User, Enrollment, Payment


class IsAuthenticatedUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsStudent(IsAuthenticatedUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == User.Role.STUDENT


class IsInstructor(IsAuthenticatedUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == User.Role.INSTRUCTOR


class IsAdmin(IsAuthenticatedUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == User.Role.ADMIN


class IsCourseOwner(IsAuthenticatedUser):
    def has_object_permission(self, request, view, obj):
        instructor = getattr(obj, 'instructor', getattr(getattr(obj, 'course', None), 'instructor', None))
        user = request.user
        if user.role == User.Role.ADMIN:
            return True
        return instructor == request.user


class IsStudentEnrollmentOwner(IsAuthenticatedUser):
    def has_object_permission(self, request, view, obj):
        return isinstance(obj, Enrollment) and obj.student == request.user


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


class IsEnrolledOrPreview(IsEnrolled):
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        if type(obj).__name__ == 'Lesson' and getattr(obj, 'is_preview', False):
            return True

        if not (request.user and request.user.is_authenticated):
            return False

        return super().has_object_permission(request, view, obj)


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


class IsPaymentStudentOwner(IsAuthenticatedUser):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.enrollment.student


class IsPaymentCourseInstructor(IsAuthenticatedUser):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.enrollment.course.instructor
