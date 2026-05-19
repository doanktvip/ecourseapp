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

export default function VerifyInstructors({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);

  const [applications, setApplications] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn Giảng Viên',
      email: 'instructor@ecourse.edu.vn',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250',
      reason: 'Tôi muốn dạy lập trình React Native, Expo và kiến trúc di động chuyên sâu cho sinh viên ngành Công nghệ thông tin.',
      date: '19-05-2026',
    },
    {
      id: 2,
      name: 'Trần Vũ Phương Pháp',
      email: 'phuongphap.tv@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
      reason: 'Đã có 5 năm kinh nghiệm dạy lập trình Backend Django, muốn xây dựng các giáo án RESTful API nâng cao.',
      date: '18-05-2026',
    }
  ]);

  const handleApprove = (id, name) => {
    // Call endpoints['application-details'](id) PATCH with status approved
    Alert.alert(
      'Phê duyệt giảng viên',
      `Bạn đã phê duyệt yêu cầu giảng dạy của ${name}. Tài khoản này bây giờ đã được cấp quyền tạo khóa học.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setApplications(applications.filter((app) => app.id !== id));
          }
        }
      ]
    );
  };

  const handleReject = (id, name) => {
    Alert.alert(
      'Từ chối hồ sơ',
      `Bạn có chắc chắn từ chối hồ sơ giảng dạy của ${name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          onPress: () => {
            setApplications(applications.filter((app) => app.id !== id));
            Alert.alert('Đã từ chối', `Đã từ chối hồ sơ của ${name}.`);
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.h1}>Duyệt đơn giảng viên 📋</Text>
      <Text style={[styles.small, { marginBottom: 16 }]}>
        Xét duyệt hồ sơ lý lịch, nội dung đăng ký của giảng viên trước khi mở khóa chức năng tạo bài học trong hệ thống.
      </Text>

      {applications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="checkmark-circle-outline" size={80} color="#137333" />
          <Text style={[styles.title, { marginTop: 16, marginBottom: 8 }]}>Đã hoàn thành hết!</Text>
          <Text style={[styles.body, { textAlign: 'center', fontSize: 14 }]}>
            Không còn hồ sơ giảng viên nào đang chờ phê duyệt. Bạn đã làm việc rất xuất sắc!
          </Text>
        </View>
      ) : (
        applications.map((app) => (
          <View key={app.id} style={styles.card}>
            {/* Header info */}
            <View style={[styles.row, { marginBottom: 8 + 4 }]}>
              <Image 
                source={{ uri: app.avatar }} 
                style={[styles.avatar, { marginRight: 12 }]} 
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { fontSize: 16 }]}>{app.name}</Text>
                <Text style={styles.small}>Ngày nộp: {app.date} • {app.email}</Text>
              </View>
            </View>

            {/* Application description */}
            <View style={[styles.cardVariant, { marginVertical: 4, padding: 10 }]}>
              <Text style={[styles.small, { fontWeight: '700', marginBottom: 2 }]}>Lý do đăng ký giảng dạy:</Text>
              <Text style={[styles.body, { fontSize: 14, color: theme.textPrimary }]}>{app.reason}</Text>
            </View>

            {/* Action buttons */}
            <View style={styles.cardActionRow}>
              <TouchableOpacity 
                style={[styles.btnSecondary, { flex: 1, paddingVertical: 8, borderColor: theme.errorText }]} 
                onPress={() => handleReject(app.id, app.name)}
              >
                <Text style={[styles.btnSecondaryText, { color: theme.errorText, fontSize: 14 }]}>TỪ CHỐI</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.btnPrimary, { flex: 1, paddingVertical: 8 }]} 
                onPress={() => handleApprove(app.id, app.name)}
              >
                <Text style={[styles.btnPrimaryText, { fontSize: 14 }]}>PHÊ DUYỆT</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
