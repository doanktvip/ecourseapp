from rest_framework import permissions

class CourseOwner(permissions.IsAuthenticated):
    def has_object_permission(self,request,view,course):
        return super().has_permission(request,view) and request.user == course.instructor
