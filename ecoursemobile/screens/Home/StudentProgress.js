import React, { useEffect, useState, useContext } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import { MyUserContext } from '../../configs/Contexts';
import Styles from './Styles';
import theme from '../../styles/theme';

const StudentProgress = ({ route, navigation }) => {
  const { courseId, courseSubject } = route.params || {};
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useContext(MyUserContext);

  const loadProgress = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để xem thông tin.");
        return;
      }

      let url = `${endpoints['courses']}${courseId}/students/`;
      let res = await authApis(token).get(url);

      setEnrollments(res.data);
    } catch (ex) {
      console.error("Lỗi khi tải danh sách học viên:", ex);
      Alert.alert("Lỗi", "Không thể tải dữ liệu tiến độ lúc này.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [courseId]);

  const handleChatWithStudent = (student) => {
    if (!user) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để tiếp tục.");
      return;
    }
    const studentId = student.id;
    const instructorId = user.id;
    const roomId = `room_${studentId}_${instructorId}`;
    const receiverName = `${student.last_name} ${student.first_name}`;
    const receiverAvatar = student.avatar;

    navigation.navigate('ChatTab', {
      screen: 'ChatRoom',
      params: {
        roomId,
        receiverId: studentId,
        receiverName,
        receiverAvatar,
        studentId,
        instructorId,
      }
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[Styles.h1, { marginBottom: 8 }]}>
        Danh sách học viên và tiến độ
      </Text>
      <Text style={[Styles.small, { marginBottom: 8 }]}>
        Khóa học: <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{courseSubject}</Text>
      </Text>

      {loading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>Đang tải danh sách học viên...</Text>
        </View>
      ) : enrollments.length === 0 ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <Ionicons name="people-outline" size={60} color="#ccc" />
          <Text style={{ marginTop: 12, color: theme.colors.textSecondary }}>Chưa có học viên nào đăng ký khóa học này.</Text>
        </View>
      ) : (
        enrollments.map((enrollment, index) => {

          const student = enrollment.student;
          const progress = enrollment.progress || 0;
          const totalLessons = enrollment.course?.lesson_count || 0;
          const completedLessons = Math.round((progress / 100) * totalLessons);

          return (
            <View key={enrollment.id || index} style={Styles.card}>
              <View style={[Styles.row, { marginBottom: 12 }]}>
                <Image
                  source={{ uri: student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250' }}
                  style={[Styles.avatar, { marginRight: 12 }]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[Styles.title, { fontSize: 16 }]}>
                    {student?.last_name} {student?.first_name}
                  </Text>
                  <Text style={Styles.small}>{student?.email}</Text>
                </View>
                {/* Nút chat với học viên */}
                <TouchableOpacity
                  style={{ padding: 8, backgroundColor: '#e8f0fe', borderRadius: 8 }}
                  onPress={() => handleChatWithStudent(student)}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>

              <View>
                <View style={[Styles.row, { justifyContent: 'space-between', marginBottom: 6 }]}>
                  <Text style={Styles.small}>Đã học: {completedLessons}/{totalLessons} bài</Text>
                  <Text style={[Styles.small, { fontWeight: 'bold', color: theme.colors.primary }]}>{Math.round(progress)}%</Text>
                </View>
                <View style={Styles.progressBarTrack}>
                  <View style={[Styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

export default StudentProgress;