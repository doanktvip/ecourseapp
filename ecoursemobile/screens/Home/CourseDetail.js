import React, { useMemo, useEffect, useState, useContext } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Apis, { endpoints } from '../../configs/Apis';
import Styles from "../../styles/Styles";
import { MyUserContext } from '../../configs/Contexts';

const CourseDetail = ({ route, navigation }) => {
  const { course } = route.params || {};
  const currentCourse = course || {};
  const [user] = useContext(MyUserContext);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const loadLessons = async () => {
    if (!currentCourse.id) return;
    try {
      setLoadingLessons(true);
      // Gọi API lấy danh sách bài học theo Id khóa học
      let url = endpoints['course-lessons'](currentCourse.id);
      let res = await Apis.get(url);
      setLessons(res.data.results || res.data);

    } catch (ex) {
      console.error("Lỗi khi tải danh sách bài học:", ex);
    } finally {
      setLoadingLessons(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, [currentCourse.id]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: currentCourse.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250' }} style={Styles.detailBannerImage} />
      <View style={{ padding: 16 }}>
        {/* Tổng quan */}
        <View style={Styles.card}>
          <Text style={[Styles.h1, { fontSize: 22, lineHeight: 28 }]}>
            {currentCourse.subject}
          </Text>

          <View style={[Styles.row, { marginVertical: 8 }]}>
            <Ionicons name="star" size={18} color="gold" style={{ marginRight: 4 }} />
            <Text style={[Styles.body, { fontSize: 14, fontWeight: '700' }]}>
              {currentCourse.rating || "0.0"} ({currentCourse.reviews_count || 0} đánh giá)
            </Text>
            <Text style={[Styles.small, { marginHorizontal: 8 }]}>•</Text>
            <Text style={[Styles.small, { fontSize: 14 }]}>
              {lessons.length || 0} Bài học
            </Text>
          </View>

          <Text style={[Styles.h1, { color: '#1877F2', fontSize: 24, marginVertical: 4 }]}>
            {currentCourse.fee && parseFloat(currentCourse.fee) > 0
              ? `${parseFloat(currentCourse.fee).toLocaleString()} VNĐ`
              : 'Miễn phí'}
          </Text>
        </View>
        {/* Giảng viên phụ trách */}
        <View style={[Styles.card, Styles.row]}>
          <Image
            source={{ uri: currentCourse.instructor_avatar }}
            style={[Styles.avatar, { width: 48, height: 48, borderRadius: 24, marginRight: 12 }]}
          />
          <View style={{ flex: 1 }}>
            <Text style={Styles.small}>Giảng viên phụ trách</Text>
            <Text style={[Styles.title, { fontSize: 16 }]}>{currentCourse.instructor_name}</Text>
          </View>
        </View>
      </View>
      {/* Tiến độ học của sinh viên  */}
      {user && user.role === ('INSTRUCTOR' || 'ADMIN') && currentCourse?.instructor && user.email === currentCourse.instructor.email && (
        <View style={[Styles.card, { marginLeft: 20, marginRight: 20, borderColor: '#1877F2', borderWidth: 1 }]}>
          <TouchableOpacity
            style={[Styles.infoBox, Styles.row, { justifyContent: 'center' }]}
            onPress={() => {
              // Điều hướng sang trang xem Tiến độ học viên (bạn cần tạo trang này trong Stack Navigator)
              if (navigation) navigation.navigate('StudentProgress', { 
                  courseId: currentCourse.id, 
                  courseSubject: currentCourse.subject 
              });
            }}
          ><Text style={[Styles.body, { color: '#1877F2', fontWeight: 'bold' }]}>Xem tiến độ học viên</Text></TouchableOpacity>
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
      <Text style={[Styles.h2, { marginTop: 16, marginBottom: 10, marginLeft: 20, marginRight: 20 }]}>
        Nội dung bài học ({lessons.length})
      </Text>
      <View style={[Styles.card, { marginLeft: 20, marginRight: 20 }]} >
        {lessons.map((lesson, idx) => {
          // Quy ước bài học đầu tiên (order === 1) cho phép học thử
          const isFreeLesson = lesson.order === 1;

          return (
            <TouchableOpacity
              key={lesson.id}
              style={[Styles.row, { paddingVertical: 12, borderBottomWidth: idx === lessons.length - 1 ? 0 : 1, borderBottomColor: '#eee' }]}
              onPress={() => {
                if (isFreeLesson || user) {
                  navigation.navigate('LessonDetail', { lesson: lesson, courseTitle: currentCourse.subject });
                } else {
                  Alert.alert('Nội dung bị khóa', 'Vui lòng đăng nhập và đăng ký khóa học để mở khóa bài học này.');
                }
              }}
            >
              <Ionicons
                name={isFreeLesson ? "play-circle" : "lock-closed"}
                size={24}
                color={isFreeLesson ? "#28a745" : "#999"}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[Styles.body, { fontSize: 15 }]}>
                  {lesson.subject}
                </Text>
                <Text style={Styles.small}>
                  Bài {lesson.order} {lesson.video_seconds ? `• ${Math.floor(lesson.video_seconds / 60)} phút` : ''} {isFreeLesson && '• Học thử miễn phí'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          );
        })}
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
            <Text style={{ color: '#1877F2', fontWeight: 'bold', marginRight: 20 }}>
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
      {/*So sánh khóa học */}
      <View style={[Styles.card, { marginLeft: 20, marginRight: 20 }]}>
        <TouchableOpacity
          style={[Styles.infoBox, Styles.row,]}
          onPress={() => {
            // Điều hướng sang trang So sánh (nếu bạn đã tạo)
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