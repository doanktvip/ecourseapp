from rest_framework import permissions

from courses.models import User, Enrollment


class IsStudent(permissions.BasePermission):

    def has_permission(self, request, view):
        return bool(request.user and
                    request.user.is_authenticated and
                    request.user.role == User.Role.STUDENT)


class IsAdmin(permissions.BasePermission):

    def has_permission(self, request, view):
        return bool(request.user and
                    request.user.is_authenticated and
                    request.user.role == User.Role.ADMIN)


class IsInstructor(permissions.BasePermission):

    def has_permission(self, request, view):
        return bool(request.user and
                    request.user.is_authenticated and
                    request.user.role == User.Role.INSTRUCTOR)


class IsCourseOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'instructor'):
            return obj.instructor == request.user

        elif hasattr(obj, 'course'):
            return obj.course.instructor == request.user

        return False


class IsEnrolled(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role == User.Role.ADMIN:
            return True

        course = obj if hasattr(obj, 'instructor') else getattr(obj, 'course', None)

        if not course:
            return False

        if user.role == User.Role.INSTRUCTOR and course.instructor == user:
            return True

        return Enrollment.objects.filter(student=user, course=course, payment__is_successful=True).exists()
