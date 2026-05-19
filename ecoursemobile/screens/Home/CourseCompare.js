import React, { useState, useMemo } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert
} from 'react-native';
import { useTheme } from '../../configs/Contexts';
import { getGlobalStyles } from '../../styles/Styles';
import { Ionicons } from '@expo/vector-icons';

export default function CourseCompare({ route, navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);
  const { courseA } = route.params || {};

  const defaultCourseA = courseA || {
    id: 1,
    subject: 'Lập trình React Native nâng cao',
    fee: 499000,
    lessons_count: 12,
    rating: 4.8,
    instructor_name: 'ThS. Nguyễn Văn Giảng Viên',
  };

  const courseOptions = [
    {
      id: 2,
      subject: 'Nhập môn Lập trình Web với ReactJS',
      fee: 299000,
      lessons_count: 8,
      rating: 4.5,
      instructor_name: 'TS. Nguyễn Thị Khoa Học',
      description: 'Làm quen với HTML/CSS, nền tảng JavaScript ES6, cách tạo Single Page App sử dụng ReactJS và tích hợp API backend.',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600',
    },
    {
      id: 3,
      subject: 'Phát triển API Backend với Django',
      fee: 599000,
      lessons_count: 15,
      rating: 4.9,
      instructor_name: 'TS. Lê Cao Backend',
      description: 'Tìm hiểu Python, Django Framework, Django Rest Framework (DRF), OAuth2 Authentication, CSDL PostgreSQL và Deploy dự án.',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600',
    }
  ];

  const [courseB, setCourseB] = useState(courseOptions[0]);

  const selectCourseB = (course) => {
    setCourseB(course);
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.h1}>So sánh khóa học 📊</Text>
      <Text style={[styles.small, { marginBottom: 16 }]}>
        Tìm kiếm khóa học phù hợp nhất bằng cách so sánh chi tiết các chỉ số trực quan dưới đây.
      </Text>

      {/* Comparison Grid */}
      <View style={styles.card}>
        <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: theme.borderLight, paddingBottom: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.small, { fontWeight: 'bold' }]}>Đặc tính</Text>
          </View>
          <View style={{ flex: 1, paddingHorizontal: 4 }}>
            <Text style={[styles.body, { fontSize: 13, fontWeight: '700', color: theme.btnPrimaryBg }]} numberOfLines={2}>
              {defaultCourseA.subject}
            </Text>
          </View>
          <View style={{ flex: 1, paddingHorizontal: 4 }}>
            <Text style={[styles.body, { fontSize: 13, fontWeight: '700', color: '#137333' }]} numberOfLines={2}>
              {courseB.subject}
            </Text>
          </View>
        </View>

        {/* Row 1: Fee */}
        <View style={[styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderLight }]}>
          <Text style={[styles.small, { flex: 1 }]}>Học phí</Text>
          <Text style={[styles.body, { flex: 1, fontSize: 14, fontWeight: 'bold', color: theme.textPrimary }]}>
            {defaultCourseA.fee === 0 ? 'Miễn phí' : `${defaultCourseA.fee.toLocaleString()} VNĐ`}
          </Text>
          <Text style={[styles.body, { flex: 1, fontSize: 14, fontWeight: 'bold', color: theme.textPrimary }]}>
            {courseB.fee === 0 ? 'Miễn phí' : `${courseB.fee.toLocaleString()} VNĐ`}
          </Text>
        </View>

        {/* Row 2: Lessons count */}
        <View style={[styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderLight }]}>
          <Text style={[styles.small, { flex: 1 }]}>Số bài học</Text>
          <Text style={[styles.body, { flex: 1, fontSize: 14, color: theme.textSecondary }]}>
            {defaultCourseA.lessons_count} bài
          </Text>
          <Text style={[styles.body, { flex: 1, fontSize: 14, color: theme.textSecondary }]}>
            {courseB.lessons_count} bài
          </Text>
        </View>

        {/* Row 3: Rating */}
        <View style={[styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderLight }]}>
          <Text style={[styles.small, { flex: 1 }]}>Đánh giá</Text>
          <View style={[styles.row, { flex: 1 }]}>
            <Ionicons name="star" size={14} color="#FEF7E0" style={{ marginRight: 4 }} />
            <Text style={[styles.body, { fontSize: 14, fontWeight: 'bold' }]}>{defaultCourseA.rating}</Text>
          </View>
          <View style={[styles.row, { flex: 1 }]}>
            <Ionicons name="star" size={14} color="#FEF7E0" style={{ marginRight: 4 }} />
            <Text style={[styles.body, { fontSize: 14, fontWeight: 'bold' }]}>{courseB.rating}</Text>
          </View>
        </View>

        {/* Row 4: Instructor */}
        <View style={[styles.row, { paddingVertical: 12 }]}>
          <Text style={[styles.small, { flex: 1 }]}>Giảng viên</Text>
          <Text style={[styles.body, { flex: 1, fontSize: 13, color: theme.textPrimary }]} numberOfLines={2}>
            {defaultCourseA.instructor_name}
          </Text>
          <Text style={[styles.body, { flex: 1, fontSize: 13, color: theme.textPrimary }]} numberOfLines={2}>
            {courseB.instructor_name}
          </Text>
        </View>
      </View>

      {/* Select B course */}
      <Text style={[styles.h2, { marginTop: 8 + 4, marginBottom: 8 }]}>Chọn khóa học so sánh đối chiếu</Text>
      {courseOptions.map((course) => (
        <TouchableOpacity 
          key={course.id} 
          style={[
            styles.card, 
            styles.row, 
            { 
              borderColor: courseB.id === course.id ? theme.btnPrimaryBg : theme.borderDefault,
              borderWidth: courseB.id === course.id ? 2 : 1
            }
          ]}
          onPress={() => selectCourseB(course)}
        >
          <Ionicons 
            name={courseB.id === course.id ? "checkmark-circle" : "ellipse-outline"} 
            size={24} 
            color={courseB.id === course.id ? theme.btnPrimaryBg : theme.textTertiary} 
            style={{ marginRight: 12 }} 
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.body, { fontWeight: 'bold', color: theme.textPrimary }]}>{course.subject}</Text>
            <Text style={styles.small}>Giảng viên: {course.instructor_name} • Phí: {course.fee.toLocaleString()} VNĐ</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity 
        style={[styles.btnPrimary, { marginTop: 24 }]}
        onPress={() => Alert.alert('Đăng ký', `Bạn đã chọn đăng ký khóa học ${defaultCourseA.subject}`)}
      >
        <Text style={styles.btnPrimaryText}>Đăng ký học khóa chính</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
