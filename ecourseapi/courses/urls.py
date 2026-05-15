from django.urls import path, include
from rest_framework.routers import DefaultRouter
from courses import views, webhooks

router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('courses', views.CourseViewSet, basename='course')
router.register('users', views.UserViewSet, basename='user')
router.register('applies', views.ApplicationViewSet, basename='apply')
router.register('lessons', views.LessonViewSet, basename='lesson')
router.register('tags', views.TagViewSet, basename='tag')
router.register('payments', views.PaymentViewSet, basename='payment')
router.register('stats', views.StatsViewSet, basename='stat')

urlpatterns = [
    path('', include(router.urls)),
    path('webhooks/momo/', webhooks.MomoWebhookView.as_view(), name='momo-webhook'),
    path('webhooks/zalopay/', webhooks.ZaloPayWebhookView.as_view(), name='zalopay-webhook'),
    path('webhooks/stripe/', webhooks.StripeWebhookView.as_view(), name='stripe-webhook'),
    path('webhooks/paypal/', webhooks.PayPalWebhookView.as_view(), name='paypal-webhook'),
]
