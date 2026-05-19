import React, { useMemo } from 'react';
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

export default function StudentProgress({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);

  const students = [
    { id: 1, name: 'Nguyễn Văn Học Sinh', email: 'hocsinh@gmail.com', progress: 65, completedLessons: 8, totalLessons: 12, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150' },
    { id: 2, name: 'Phạm Thị Mỹ Lệ', email: 'myle.pham@gmail.com', progress: 91, completedLessons: 11, totalLessons: 12, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150' },
    { id: 3, name: 'Lê Hoàng Dương', email: 'duongle@yahoo.com', progress: 25, completedLessons: 3, totalLessons: 12, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150' }
  ];

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.h1}>Quản lý Học viên & Tiến độ 📈</Text>
      <Text style={[styles.small, { marginBottom: 16 }]}>
        Theo dõi tiến độ hoàn thành bài giảng chi tiết của từng sinh viên đã đăng ký tham gia khóa học của bạn.
      </Text>

      {students.map((student) => (
        <View key={student.id} style={styles.card}>
          <View style={[styles.row, { marginBottom: 8 + 4 }]}>
            <Image 
              source={{ uri: student.avatar }} 
              style={[styles.avatar, { marginRight: 12 }]} 
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { fontSize: 16 }]}>{student.name}</Text>
              <Text style={styles.small}>{student.email}</Text>
            </View>
            <TouchableOpacity 
              style={{ padding: 8 }}
              onPress={() => navigation.navigate('ChatRoom', { recipient: student })}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.btnPrimaryBg} />
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={styles.cardFooter}>
            <View style={[styles.spaceBetween, { marginBottom: 4 }]}>
              <Text style={styles.small}>Số bài đã học: {student.completedLessons}/{student.totalLessons} bài</Text>
              <Text style={[styles.small, { fontWeight: 'bold', color: theme.btnPrimaryBg }]}>{student.progress}%</Text>
            </View>
            <View style={[styles.progressBarTrack, { width: '100%', height: 6, borderRadius: 3 }]}>
              <View style={[styles.progressBarFill, { width: `${student.progress}%` }]} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
