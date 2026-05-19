import React, { useMemo } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert
} from 'react-native';
import { useTheme, useUser } from '../../configs/Contexts';
import { getGlobalStyles } from '../../styles/Styles';
import { Ionicons } from '@expo/vector-icons';

export default function CourseDetail({ route, navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);
  const { user } = useUser();
  const { course } = route.params || {};

  // Default course if none provided (for safety/demo)
  const defaultCourse = {
    id: 1,
    subject: 'Lập trình React Native nâng cao',
    description: 'Khóa học cung cấp kiến thức toàn diện về React Native, Expo, React Navigation 7, Quản lý trạng thái Redux, Context API, và tích hợp API RESTful trong dự án thực tế.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600',
    fee: 499000,
    lessons_count: 12,
    instructor_name: 'ThS. Nguyễn Văn Giảng Viên',
    instructor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250',
    rating: 4.8,
    reviews_count: 24,
  };

  const currentCourse = course || defaultCourse;

  const lessons = [
    { id: 1, title: 'Bài 1: Giới thiệu kiến trúc React Native & Expo', duration: '15:20', free: true },
    { id: 2, title: 'Bài 2: Thiết kế giao diện với Flexbox & Custom Components', duration: '24:45', free: true },
    { id: 3, title: 'Bài 3: Cài đặt và sử dụng React Navigation 7 chuyên nghiệp', duration: '32:10', free: false },
    { id: 4, title: 'Bài 4: Quản lý trạng thái với Context API & Reducer', duration: '28:15', free: false },
  ];

  const handleEnroll = () => {
    if (!user) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản sinh viên để đăng ký tham gia khóa học.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    if (currentCourse.fee > 0) {
      navigation.navigate('PaymentProcess', { course: currentCourse });
    } else {
      Alert.alert('Thành công', 'Đã đăng ký khóa học thử thành công! Bắt đầu học ngay.');
      navigation.navigate('MyCourses');
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Course Banner Image */}
      <Image 
        source={{ uri: currentCourse.image }} 
        style={styles.detailBannerImage} 
      />

      <View style={{ padding: 16 }}>
        {/* Course Info Header */}
        <View style={styles.card}>
          <Text style={[styles.h1, { fontSize: 22, lineHeight: 28 }]}>{currentCourse.subject}</Text>
          
          <View style={[styles.row, { marginVertical: 8 }]}>
            <Ionicons name="star" size={18} color="#FEF7E0" style={{ marginRight: 4 }} />
            <Text style={[styles.body, { fontSize: 14, fontWeight: '700', color: theme.textPrimary }]}>
              {currentCourse.rating} ({currentCourse.reviews_count} đánh giá)
            </Text>
            <Text style={[styles.small, { marginHorizontal: 8 }]}>•</Text>
            <Text style={[styles.small, { fontSize: 14 }]}>{currentCourse.lessons_count} Bài học</Text>
          </View>

          <Text style={[styles.h1, { color: theme.btnPrimaryBg, fontSize: 24, marginVertical: 4 }]}>
            {currentCourse.fee === 0 ? 'Miễn phí' : `${currentCourse.fee.toLocaleString()} VNĐ`}
          </Text>
        </View>

        {/* Instructor Section */}
        <View style={[styles.card, styles.row]}>
          <Image 
            source={{ uri: currentCourse.instructor_avatar }} 
            style={[styles.avatar, { width: 48, height: 48, borderRadius: 24, marginRight: 12 }]} 
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.small}>Giảng viên phụ trách</Text>
            <Text style={[styles.title, { fontSize: 16 }]}>{currentCourse.instructor_name}</Text>
          </View>
          <TouchableOpacity 
            style={{ padding: 8 }}
            onPress={() => navigation.navigate('ChatRoom', { recipient: { name: currentCourse.instructor_name, id: 'instructor' } })}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.btnPrimaryBg} />
          </TouchableOpacity>
        </View>

        {/* Course Comparison Promotion */}
        <TouchableOpacity 
          style={[styles.infoBox, styles.row, { justifyContent: 'space-between', marginVertical: 4 }]}
          onPress={() => navigation.navigate('CourseCompare', { courseA: currentCourse })}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.infoBoxText}>📊 So sánh khóa học</Text>
            <Text style={[styles.small, { color: theme.infoText }]}>
              Nhấp để so sánh chi tiết, thời lượng, học phí với các khóa học cùng chủ đề.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.infoText} />
        </TouchableOpacity>

        {/* Course Description */}
        <Text style={[styles.h2, { marginTop: 16, marginBottom: 8 }]}>Giới thiệu khóa học</Text>
        <View style={styles.card}>
          <Text style={styles.body}>{currentCourse.description}</Text>
        </View>

        {/* Lessons List */}
        <Text style={[styles.h2, { marginTop: 16, marginBottom: 8 }]}>Nội dung bài học ({lessons.length})</Text>
        <View style={styles.card}>
          {lessons.map((lesson, idx) => (
            <TouchableOpacity 
              key={lesson.id} 
              style={[
                styles.row, 
                { 
                  paddingVertical: 12, 
                  borderBottomWidth: idx === lessons.length - 1 ? 0 : 1, 
                  borderBottomColor: theme.borderLight 
                }
              ]}
              onPress={() => {
                if (lesson.free || user) {
                  navigation.navigate('LessonDetail', { lesson: lesson, courseTitle: currentCourse.subject });
                } else {
                  Alert.alert('Nội dung bị khóa', 'Vui lòng đăng nhập và đăng ký khóa học để mở khóa bài học này.');
                }
              }}
            >
              <Ionicons 
                name={lesson.free ? "play-circle" : "lock-closed"} 
                size={24} 
                color={lesson.free ? theme.successText : theme.textTertiary} 
                style={{ marginRight: 12 }} 
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.body, { fontSize: 15, color: theme.textPrimary }]}>{lesson.title}</Text>
                <Text style={styles.small}>Thời lượng: {lesson.duration} {lesson.free && '• Học thử miễn phí'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={[styles.btnPrimary, { marginTop: 24 }]} 
          onPress={handleEnroll}
        >
          <Text style={styles.btnPrimaryText}>
            {currentCourse.fee > 0 ? 'ĐĂNG KÝ & THANH TOÁN NGAY' : 'HỌC MIỄN PHÍ NGAY'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
