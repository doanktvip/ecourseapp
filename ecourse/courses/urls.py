from django.urls import path, include
from rest_framework.routers import DefaultRouter
from courses import views

router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('courses', views.CourseViewSet, basename='course')
router.register('users', views.UserViewSet, basename='user')
router.register('applies', views.ApplicationViewSet, basename='apply')
router.register('lessons', views.LessonViewSet, basename='lesson')
router.register('tags', views.TagViewSet, basename='tag')
router.register('stats', views.StatsViewSet, basename='stat')

urlpatterns = [
    path('', include(router.urls))
]
