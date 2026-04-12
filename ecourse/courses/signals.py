from django.db.models import Avg, Sum
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import CompletedLesson, CourseReview, Lesson, StudentAnswer, Question, QuizResult


# TỰ ĐỘNG TÍNH PROGRESS CHO Enrollment
@receiver([post_save, post_delete], sender=CompletedLesson)
def update_enrollment_progress(sender, instance, **kwargs):
    enrollment = instance.enrollment
    course = enrollment.course

    total_lessons = course.lessons.count()

    completed_lessons = CompletedLesson.objects.filter(enrollment=enrollment).count()
    if total_lessons > 0:
        new_progress = (completed_lessons / total_lessons) * 100
        new_progress = round(new_progress, 2)
    else:
        new_progress = 0.0

    if enrollment.progress != new_progress:
        enrollment.progress = new_progress
        enrollment.save(update_fields=['progress'])


# TỰ ĐỘNG TÍNH RATING TRUNG BÌNH CHO Course
@receiver([post_save, post_delete], sender=CourseReview)
def update_course_rating(sender, instance, **kwargs):
    course = instance.course

    result = CourseReview.objects.filter(course=course).aggregate(rating_avg=Avg('rating'))
    avg_rating = result['rating_avg'] or 0.0
    course.average_rating = round(avg_rating, 1)
    course.save(update_fields=['average_rating'])


# TỰ ĐỘNG TÍNH TỔNG THỜI LƯỢNG CHO COURSE
@receiver([post_save, post_delete], sender=Lesson)
def update_course_duration(sender, instance, **kwargs):
    course = instance.course

    result = Lesson.objects.filter(course=course).aggregate(total=Sum('video_minutes'))
    total_mins = result['total'] or 0

    course.total_duration_video = total_mins
    course.save(update_fields=['total_duration_video'])


# TỰ ĐỘNG TÍNH TOÁN ĐIỂM SỐ KHI SINH VIEN CHỌN ĐÁP ÁN
@receiver(post_save, sender=StudentAnswer)
def update_quiz_score(sender, instance, **kwargs):
    enrollment = instance.enrollment
    lesson = instance.question.lesson

    # 1. Lấy tất cả câu hỏi của bài học này
    total_questions = Question.objects.filter(lesson=lesson).count()

    if total_questions > 0:
        # 2. Đếm số câu trả lời đúng của sinh viên trong bài học này
        correct_answers = StudentAnswer.objects.filter(
            enrollment=enrollment,
            question__lesson=lesson,
            selected_choice__is_correct=True
        ).count()

        # 3. Tính điểm trên thang điểm 10
        new_score = (correct_answers / total_questions) * 10

        # 4. Cập nhật hoặc tạo mới QuizResult
        quiz_result, created = QuizResult.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson,
            defaults={'score': new_score}
        )

        if not created:
            quiz_result.score = round(new_score, 2)
            quiz_result.save()
