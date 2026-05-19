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

export default function MyCourses({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);
  const { user } = useUser();

  // Simulated enrolled courses (Students)
  const studentCourses = [
    {
      id: 1,
      subject: 'Lập trình React Native nâng cao',
      instructor_name: 'ThS. Nguyễn Văn Giảng Viên',
      progress: 65, // percent
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600',
    },
    {
      id: 2,
      subject: 'Nhập môn Lập trình Web với ReactJS',
      instructor_name: 'TS. Nguyễn Thị Khoa Học',
      progress: 20, // percent
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600',
    }
  ];

  // Simulated taught courses (Instructors)
  const instructorCourses = [
    {
      id: 1,
      subject: 'Lập trình React Native nâng cao',
      students_count: 85,
      revenue: 42415000,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600',
    }
  ];

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="book-outline" size={80} color={theme.textTertiary} />
        <Text style={[styles.title, { marginTop: 16, marginBottom: 8 }]}>Xem khóa học của bạn</Text>
        <Text style={[styles.body, { textAlign: 'center', marginBottom: 24, fontSize: 14 }]}>
          Vui lòng đăng nhập để bắt đầu tham gia các bài học, theo dõi tiến độ và tiếp tục học tập.
        </Text>
        <TouchableOpacity 
          style={[styles.btnPrimary, { width: '80%' }]} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.btnPrimaryText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.h1}>
        {user.role === 'instructor' ? 'Khóa học đang giảng dạy' : 'Khóa học của tôi 📚'}
      </Text>
      <Text style={[styles.small, { marginBottom: 16 }]}>
        {user.role === 'instructor' 
          ? 'Quản lý danh sách khóa học bạn đang phụ trách biên soạn và giảng dạy.'
          : 'Tiếp tục học tập để tích lũy kiến thức và hoàn thành mục tiêu nghề nghiệp.'}
      </Text>

      {/* Course List depending on role */}
      {user.role === 'instructor' ? (
        instructorCourses.map((course) => (
          <View key={course.id} style={styles.card}>
            <View style={[styles.row, { marginBottom: 10 }]}>
              <Image 
                source={{ uri: course.image }} 
                style={[styles.thumbnail, { marginRight: 12 }]} 
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { fontSize: 16 }]} numberOfLines={2}>{course.subject}</Text>
                <Text style={styles.small}>Sĩ số: {course.students_count} học viên</Text>
              </View>
            </View>

            <View style={[styles.spaceBetween, styles.cardFooter]}>
              <TouchableOpacity 
                style={[styles.row, { padding: 4 }]}
                onPress={() => navigation.navigate('StudentProgress', { courseId: course.id })}
              >
                <Ionicons name="analytics-outline" size={16} color={theme.btnPrimaryBg} style={{ marginRight: 4 }} />
                <Text style={[styles.small, { color: theme.btnPrimaryBg, fontWeight: '700' }]}>Xem tiến độ</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.row, { padding: 4 }]}
                onPress={() => navigation.navigate('CourseForm', { course: course })}
              >
                <Ionicons name="create-outline" size={16} color={theme.textPrimary} style={{ marginRight: 4 }} />
                <Text style={[styles.small, { color: theme.textPrimary, fontWeight: '700' }]}>Chỉnh sửa</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        studentCourses.map((course) => (
          <TouchableOpacity 
            key={course.id} 
            style={styles.card}
            onPress={() => navigation.navigate('CourseDetail', { course: course })}
          >
            <View style={[styles.row, { marginBottom: 10 }]}>
              <Image 
                source={{ uri: course.image }} 
                style={[styles.thumbnail, { marginRight: 12 }]} 
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { fontSize: 16 }]} numberOfLines={2}>{course.subject}</Text>
                <Text style={styles.small}>GV: {course.instructor_name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </View>

            {/* Learning Progress Bar */}
            <View style={{ marginTop: 8 }}>
              <View style={[styles.spaceBetween, { marginBottom: 4 }]}>
                <Text style={styles.small}>Tiến độ học tập</Text>
                <Text style={[styles.small, { fontWeight: 'bold', color: theme.btnPrimaryBg }]}>{course.progress}%</Text>
              </View>
              <View style={[styles.progressBarTrack, { width: '100%', height: 6, borderRadius: 3 }]}>
                <View style={[styles.progressBarFill, { width: `${course.progress}%` }]} />
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Guest/Empty State note */}
      {user.role === 'admin' && (
        <View style={styles.cardVariant}>
          <Text style={[styles.body, { textAlign: 'center', fontWeight: 'bold' }]}>Tài khoản Admin</Text>
          <Text style={[styles.small, { textAlign: 'center', marginTop: 4 }]}>
            Với vai trò Quản trị viên, vui lòng chuyển qua tab "Thống kê" hoặc "Tài khoản" để duyệt yêu cầu.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
