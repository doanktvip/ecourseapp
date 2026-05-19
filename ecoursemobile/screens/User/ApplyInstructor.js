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

export default function ApplyInstructor({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);

  const [experience, setExperience] = useState('');
  const [subject, setSubject] = useState('');
  const [credentials, setCredentials] = useState('');

  const handleSubmit = () => {
    if (!experience.trim() || !subject.trim() || !credentials.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin hồ sơ.');
      return;
    }

    Alert.alert(
      'Gửi hồ sơ thành công',
      'Đơn xin làm giảng viên của bạn đã được chuyển tới Admin phê duyệt. Trạng thái sẽ được cập nhật sớm nhất!',
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
      <Text style={styles.h1}>Đăng ký Giảng viên 🎓</Text>
      <Text style={[styles.small, { marginBottom: 16 }]}>
        Để đảm bảo chất lượng giảng dạy, bạn vui lòng khai báo kinh nghiệm và hồ sơ năng lực để chúng tôi xem xét.
      </Text>

      <View style={styles.card}>
        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginBottom: 4 }]}>Chuyên ngành đăng ký giảng dạy *</Text>
        <TextInput
          placeholder="Ví dụ: Công nghệ thông tin, Lập trình di động..."
          placeholderTextColor={theme.textTertiary}
          value={subject}
          onChangeText={setSubject}
          style={styles.input}
        />

        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginTop: 8 + 4, marginBottom: 4 }]}>Mô tả kinh nghiệm bản thân *</Text>
        <TextInput
          placeholder="Mô tả số năm kinh nghiệm, các dự án thực tế đã thực hiện..."
          placeholderTextColor={theme.textTertiary}
          value={experience}
          onChangeText={setExperience}
          style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
          multiline={true}
        />

        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginTop: 8 + 4, marginBottom: 4 }]}>Bằng cấp / Chứng chỉ chuyên môn *</Text>
        <TextInput
          placeholder="Ví dụ: Thạc sĩ Khoa học Máy tính, Chứng chỉ AWS..."
          placeholderTextColor={theme.textTertiary}
          value={credentials}
          onChangeText={setCredentials}
          style={styles.input}
        />

        <TouchableOpacity style={[styles.btnPrimary, { marginTop: 24 }]} onPress={handleSubmit}>
          <Text style={styles.btnPrimaryText}>GỬI HỒ SƠ ỨNG TUYỂN</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
