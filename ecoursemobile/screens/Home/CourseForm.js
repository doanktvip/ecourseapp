import React, { useState, useMemo } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert
} from 'react-native';
import { useTheme } from '../../configs/Contexts';
import { getGlobalStyles } from '../../styles/Styles';
import { Ionicons } from '@expo/vector-icons';

export default function CourseForm({ route, navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);
  const { course } = route.params || {};

  const [subject, setSubject] = useState(course?.subject || '');
  const [description, setDescription] = useState(course?.description || '');
  const [fee, setFee] = useState(course?.fee ? course.fee.toString() : '');

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên khóa học và mô tả.');
      return;
    }

    Alert.alert(
      'Thành công',
      course 
        ? 'Cập nhật thông tin khóa học thành công!' 
        : 'Khóa học mới đã được đăng ký và sẵn sàng tạo bài học!',
      [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.h1}>{course ? 'Chỉnh sửa khóa học ✏️' : 'Tạo khóa học mới 🎓'}</Text>
      <Text style={[styles.small, { marginBottom: 16 }]}>
        Biên soạn giáo trình trực tuyến hấp dẫn, giúp sinh viên nâng cao năng lực và trải nghiệm học tập tuyệt vời.
      </Text>

      <View style={styles.card}>
        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginBottom: 4 }]}>Tên khóa học *</Text>
        <TextInput
          placeholder="Ví dụ: Lập trình di động nâng cao"
          placeholderTextColor={theme.textTertiary}
          value={subject}
          onChangeText={setSubject}
          style={styles.input}
        />

        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginTop: 8 + 4, marginBottom: 4 }]}>Mô tả chi tiết *</Text>
        <TextInput
          placeholder="Mô tả mục tiêu, kiến thức đạt được sau khóa học..."
          placeholderTextColor={theme.textTertiary}
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { minHeight: 120, textAlignVertical: 'top' }]}
          multiline={true}
        />

        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginTop: 8 + 4, marginBottom: 4 }]}>Học phí (VNĐ) - Nhập 0 nếu miễn phí *</Text>
        <TextInput
          placeholder="Ví dụ: 499000"
          placeholderTextColor={theme.textTertiary}
          value={fee}
          onChangeText={setFee}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity style={[styles.btnPrimary, { marginTop: 24 }]} onPress={handleSubmit}>
          <Text style={styles.btnPrimaryText}>{course ? 'CẬP NHẬT KHÓA HỌC' : 'TẠO MỚI KHÓA HỌC'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
