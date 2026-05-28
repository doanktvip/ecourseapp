import React, { useMemo, useEffect, useState, useContext } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import Styles from './Styles';
import { MyUserContext } from '../../configs/Contexts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import theme from '../../styles/theme';

const CourseDetail = ({ route, navigation }) => {
  const { course } = route.params || {};
  const currentCourse = course || {};
  const [user] = useContext(MyUserContext);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [nextLessonsUrl, setNextLessonsUrl] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);
  const isFocused = useIsFocused();
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentRecord, setEnrollmentRecord] = useState(null);
  const [totalLessons, setTotalLessons] = useState(currentCourse.lesson_count || 0);

  const formatVideoDuration = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds)) return '0 phút';

    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  const shouldShowEnrollButton = useMemo(() => {
    if (isEnrolled) return false;
    if (user) {
      if (user.role === 'ADMIN') return false;
      if (user.role === 'INSTRUCTOR' && currentCourse.instructor?.email === user.email) return false;
    }
    return true;
  }, [isEnrolled, user, currentCourse]);

  const loadLessons = async () => {
    if (!currentCourse.id) return;
    try {
      setLoadingLessons(true);
      let url = endpoints['course-lessons'](currentCourse.id);

      let res;
      const token = await AsyncStorage.getItem('token');
      if (token) {
        res = await authApis(token).get(url);
      } else {
        res = await Apis.get(url);
      }

      const data = res.data;
      if (data && data.results !== undefined) {
        setLessons(data.results);
        setNextLessonsUrl(data.next || null);
        setTotalLessons(data.count || 0);
      } else {
        setLessons(data || []);
        setNextLessonsUrl(null);
        setTotalLessons(data ? data.length : 0);
      }
    } catch (ex) {
      console.error("Lỗi khi tải danh sách bài học:", ex);
    } finally {
      setLoadingLessons(false);
    }
  };

  const loadMoreLessons = async () => {
    if (!nextLessonsUrl || loadingLessons) return;
    try {
      setLoadingLessons(true);
      let url = nextLessonsUrl;
      if (url.includes('/courses/')) {
        url = url.substring(url.indexOf('/courses/'));
      }

      let res;
      const token = await AsyncStorage.getItem('token');
      if (token) {
        res = await authApis(token).get(url);
      } else {
        res = await Apis.get(url);
      }

      const data = res.data;
      if (data && data.results !== undefined) {
        setLessons(prev => [...prev, ...data.results]);
        setNextLessonsUrl(data.next || null);
      }
    } catch (ex) {
      console.error("Lỗi khi tải thêm bài học:", ex);
    } finally {
      setLoadingLessons(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!user || !currentCourse.id) {
      setEnrollmentRecord(null);
      setIsEnrolled(false);
      return;
    }
    try {
      setLoadingEnrollment(true);
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await authApis(token).get(endpoints['my-enrolls']);
        const enrollments = res.data || [];
        const record = enrollments.find(e => e.course?.id === currentCourse.id);

        setEnrollmentRecord(record || null);
        setIsEnrolled(!!record && record.payment?.is_successful === true);
      } else {
        setEnrollmentRecord(null);
        setIsEnrolled(false);
      }
    } catch (err) {
      console.error("Lỗi kiểm tra trạng thái đăng ký:", err);
      setEnrollmentRecord(null);
      setIsEnrolled(false);
    } finally {
      setLoadingEnrollment(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigation.navigate('Login', {
        next: 'Main',
        params: {
          screen: 'HomeTab',
          params: {
            screen: 'CourseDetail',
            params: { course: currentCourse }
          }
        }
      });
      return;
    }

    if (enrollmentRecord && !isEnrolled) {
      navigation.navigate('PaymentProcess', { course: currentCourse, payment: enrollmentRecord.payment });
      return;
    }

    try {
      setEnrolling(true);
      const token = await AsyncStorage.getItem('token');
      if (token) {
        let url = endpoints['course-enrolls'](currentCourse.id);
        const res = await authApis(token).post(url);

        if (currentCourse.fee && parseFloat(currentCourse.fee) > 0) {
          const enrollmentData = res.data || {};
          navigation.navigate('PaymentProcess', { course: currentCourse, payment: enrollmentData.payment });
          checkEnrollmentStatus();
          loadLessons();
        } else {
          Alert.alert(
            "Đăng ký thành công",
            `Chúc mừng! Bạn đã đăng ký khóa học miễn phí "${currentCourse.subject}" thành công. Bây giờ bạn có thể bắt đầu học tập ngay lập tức!`,
            [{
              text: "Bắt đầu học ngay", onPress: () => {
                checkEnrollmentStatus();
                loadLessons();
              }
            }]
          );
        }
      }
    } catch (err) {
      console.error("Lỗi đăng ký khóa học:", err);
      let errMsg = "Đăng ký khóa học thất bại. Vui lòng thử lại sau.";
      if (err.response && err.response.data && err.response.data.detail) {
        errMsg = err.response.data.detail;
      }
      Alert.alert("Đăng ký thất bại", errMsg);
    } finally {
      setEnrolling(false);
    }
  };

  const handleChatWithInstructor = () => {
    if (!user) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Vui lòng đăng nhập để liên hệ trực tiếp với Giảng viên giải đáp thắc mắc.",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập ngay", onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    const studentId = user.id;
    const instructorId = currentCourse.instructor?.id;
    if (!instructorId) {
      Alert.alert("Lỗi", "Thông tin Giảng viên không khả dụng lúc này.");
      return;
    }

    const roomId = `room_${studentId}_${instructorId}`;
    const receiverName = currentCourse.instructor_name || `${currentCourse.instructor?.last_name} ${currentCourse.instructor?.first_name}`;
    const receiverAvatar = currentCourse.instructor_avatar || currentCourse.instructor?.avatar;

    navigation.navigate('ChatTab', {
      screen: 'ChatRoom',
      params: {
        roomId,
        receiverId: instructorId,
        receiverName,
        receiverAvatar,
        studentId,
        instructorId,
      }
    });
  };

  useEffect(() => {
    if (isFocused) {
      loadLessons();
      checkEnrollmentStatus();
    }
  }, [currentCourse.id, user, isFocused]);

  const getLessonSubtitle = (lesson, isUnlocked) => {
    if (lesson.completed) return '• Đã hoàn thành';
    if (lesson.is_preview) return '• Học thử miễn phí';
    if (!isUnlocked) return '• Chưa mở khóa';
    if (user) {
      if (user.role === 'ADMIN') return '• Quyền Admin';
      if (user.role === 'INSTRUCTOR' && currentCourse.instructor?.email === user.email) {
        return '• Bài giảng của bạn';
      }
    }
    return '• Đã mở khóa';
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.white }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: currentCourse.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250' }} style={Styles.detailBannerImage} />
      <View style={{ padding: 16 }}>
        {/* Tổng quan */}
        <View style={Styles.card}>
          <View style={[Styles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={[Styles.h1, { fontSize: 22, lineHeight: 28, flex: 1, marginRight: 8 }]}>
              {currentCourse.subject}
            </Text>
            {user && (user.role === 'ADMIN' || (user.role === 'INSTRUCTOR' && currentCourse.instructor?.email === user.email)) && (
              <TouchableOpacity
                style={[Styles.row, { backgroundColor: '#e8f0fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }]}
                onPress={() => navigation.navigate('CourseForm', { course: currentCourse })}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 13, marginLeft: 4 }}>Sửa</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[Styles.row, { marginVertical: 8, flexWrap: 'wrap' }]}>
            <Ionicons name="star" size={18} color="gold" style={{ marginRight: 4 }} />
            <Text style={[Styles.body, { fontSize: 14, fontWeight: '700' }]}>
              {currentCourse.rating || "0.0"}
            </Text>
            <Text style={[Styles.small, { marginHorizontal: 8 }]}>•</Text>
            <Text style={[Styles.small, { fontSize: 14 }]}>
              {totalLessons} Bài học
            </Text>
            <Text style={[Styles.small, { marginHorizontal: 8 }]}>•</Text>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[Styles.small, { fontSize: 14 }]}>
              {formatVideoDuration(currentCourse.total_duration_video)}
            </Text>
          </View>

          <Text style={[Styles.h1, { color: theme.colors.primary, fontSize: 24, marginVertical: 4 }]}>
            {currentCourse.fee && parseFloat(currentCourse.fee) > 0
              ? `${parseFloat(currentCourse.fee).toLocaleString()} VNĐ`
              : 'Miễn phí'}
          </Text>
        </View>
        {/* Giảng viên phụ trách */}
        <View style={[Styles.card, Styles.row, { alignItems: 'center' }]}>
          <Image
            source={{ uri: currentCourse.instructor_avatar }}
            style={[Styles.avatar, { width: 48, height: 48, borderRadius: 24, marginRight: 12 }]}
          />
          <View style={{ flex: 1 }}>
            <Text style={Styles.small}>Giảng viên phụ trách</Text>
            <Text style={[Styles.title, { fontSize: 16 }]}>{currentCourse.instructor_name}</Text>
          </View>
          {/* Nút chat với Giảng viên - Ẩn nếu là chính giáo viên đó vào xem khóa học của mình hoặc là Admin */}
          {(!user || (user.role !== 'ADMIN' && currentCourse.instructor?.id !== user.id && currentCourse.instructor?.email !== user.email)) && (
            <TouchableOpacity
              style={{ padding: 8, backgroundColor: '#e8f0fe', borderRadius: 8 }}
              onPress={handleChatWithInstructor}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Nút Đăng ký / Thanh toán khóa học */}
        {shouldShowEnrollButton && (
          <TouchableOpacity
            style={[
              Styles.btnPrimary,
              {
                marginVertical: 8,
                backgroundColor: user ? theme.colors.primary : '#65676b',
                borderRadius: 10,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: user ? theme.colors.primary : '#65676b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4
              }
            ]}
            onPress={handleEnroll}
            disabled={enrolling}
            activeOpacity={0.8}
          >
            {enrolling ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Text style={{ color: theme.colors.white, fontSize: 16, fontWeight: 'bold' }}>
                {user
                  ? (enrollmentRecord ? "THANH TOÁN KHÓA HỌC" : "ĐĂNG KÝ & THANH TOÁN KHÓA HỌC")
                  : "ĐĂNG NHẬP ĐỂ ĐĂNG KÝ HỌC"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      {/* Tiến độ học của sinh viên  */}
      {user && user.role === ('INSTRUCTOR' || 'ADMIN') && currentCourse?.instructor && user.email === currentCourse.instructor.email && (
        <View style={[Styles.card, { marginLeft: 20, marginRight: 20, borderColor: theme.colors.primary, borderWidth: 1 }]}>
          <TouchableOpacity
            style={[Styles.infoBox, Styles.row, { justifyContent: 'center' }]}
            onPress={() => {
              if (navigation) navigation.navigate('StudentProgress', {
                courseId: currentCourse.id,
                courseSubject: currentCourse.subject
              });
            }}
          ><Text style={[Styles.body, { color: theme.colors.primary, fontWeight: 'bold' }]}>Xem tiến độ học viên</Text></TouchableOpacity>
        </View>
      )}

      {/* 4. Giới thiệu khóa học */}
      <Text style={[Styles.h2, { marginTop: 16, marginBottom: 10, marginLeft: 20, marginRight: 20 }]}>Giới thiệu khóa học</Text>
      <View style={[Styles.card, { marginLeft: 20, marginRight: 20 }]}>
        <Text style={Styles.body}>
          {currentCourse.description || "Chưa có mô tả chi tiết cho khóa học này."}
        </Text>
      </View>
      {/* Danh sách các bài học của khóa học */}
      <View style={[Styles.row, { justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 10, marginLeft: 20, marginRight: 20 }]}>
        <Text style={[Styles.h2, { marginTop: 0, marginBottom: 0 }]}>
          Nội dung bài học ({totalLessons})
        </Text>
        {user && (user.role === 'ADMIN' || (user.role === 'INSTRUCTOR' && currentCourse.instructor?.email === user.email)) && (
          <TouchableOpacity
            style={[Styles.row, { backgroundColor: '#e8f0fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }]}
            onPress={() => navigation.navigate('LessonForm', { courseId: currentCourse.id })}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={16} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 13, marginLeft: 4 }}>Thêm bài học</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[Styles.card, { marginLeft: 20, marginRight: 20 }]} >
        {lessons.map((lesson, idx) => {
          const isUnlocked = !!lesson.is_preview ||
            (!!user && (
              user.role === 'ADMIN' ||
              (user.role === 'INSTRUCTOR' && currentCourse.instructor?.email === user.email) ||
              isEnrolled
            ));

          return (
            <TouchableOpacity
              key={lesson.id}
              style={[Styles.row, { paddingVertical: 12, borderBottomWidth: (idx === lessons.length - 1 && !nextLessonsUrl) ? 0 : 1, borderBottomColor: theme.colors.border }]}
              onPress={() => {
                if (isUnlocked) {
                  navigation.navigate('LessonDetail', {
                    lesson: lesson,
                    courseTitle: currentCourse.subject,
                    courseInstructorEmail: currentCourse.instructor?.email
                  });
                } else {
                  if (!user) {
                    Alert.alert('Nội dung bị khóa', 'Vui lòng đăng nhập để học thử bài học miễn phí hoặc đăng ký để học toàn bộ khóa học.');
                  } else {
                    Alert.alert('Nội dung bị khóa', 'Vui lòng thanh toán khóa học để mở khóa học tập bài học này.');
                  }
                }
              }}
            >
              <Ionicons
                name={lesson.completed ? "checkmark-circle" : (isUnlocked ? "play-circle" : "lock-closed")}
                size={24}
                color={lesson.completed ? theme.colors.success : (isUnlocked ? theme.colors.success : "#999")}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[Styles.body, { fontSize: 15 }]}>
                  {lesson.subject}
                </Text>
                <Text style={Styles.small}>
                  Bài {lesson.order} {lesson.video_seconds ? `• ${Math.floor(lesson.video_seconds / 60)} phút` : ''} {getLessonSubtitle(lesson, isUnlocked)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          );
        })}

        {nextLessonsUrl && (
          <TouchableOpacity
            style={{
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              borderTopWidth: 1,
              borderTopColor: '#f1f3f5',
              marginTop: 4
            }}
            onPress={loadMoreLessons}
            disabled={loadingLessons}
            activeOpacity={0.7}
          >
            {loadingLessons ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 }}>Xem thêm bài học</Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.primary} style={{ marginLeft: 4 }} />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
      {/* 5. Đánh giá từ học viên */}
      <View>
        <View style={[Styles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
          {/* 1 */}
          <Text style={Styles.reviewSectionTitle}>Đánh giá từ học viên</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('CourseReviews', {
              courseId: currentCourse.id,
              courseSubject: currentCourse.subject
            })}>
            {/* Bổ sung marginRight: 20 để đối xứng với marginLeft 20 của Tiêu đề bên trái */}
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold', marginRight: 20 }}>
              Xem tất cả
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2 */}
        <TouchableOpacity
          style={[Styles.card, Styles.row, Styles.reviewContainer, { padding: 15 }]}
          onPress={() => navigation.navigate('CourseReviews', {
            courseId: currentCourse.id,
            courseSubject: currentCourse.subject
          })}>
          <View style={{ flex: 1 }}>
            <View style={Styles.row}>
              <Ionicons name="star" size={20} color="gold" />
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 5 }}>
                {currentCourse.rating || "0.0"} / 5.0
              </Text>
            </View>
            <Text style={Styles.small}>{currentCourse.reviews_count || 0} lượt đánh giá thực tế</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>
      <View style={[Styles.card, { marginLeft: 20, marginRight: 20 }]}>
        <TouchableOpacity
          style={[Styles.infoBox, Styles.row,]}
          onPress={() => {
            if (navigation) navigation.navigate('CourseCompare', { courseA: currentCourse });
          }}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[Styles.h2, { marginTop: 16, marginBottom: 10 }]}>So sánh với khóa học khác</Text>
            <Text style={[Styles.small]}>
              Nhấp để so sánh chi tiết, thời lượng, học phí với các khóa học cùng chủ đề.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

export default CourseDetail;