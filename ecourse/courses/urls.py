from django.urls import path, include
from rest_framework.routers import DefaultRouter
from courses import views


router = DefaultRouter()
router.register('categories',views.CategoryViewSet,basename='category')
router.register('courses',views.CourseViewSet,basename='course')

urlpatterns = [
    path('',include(router.urls))
]
