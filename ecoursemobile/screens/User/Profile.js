import React, { useMemo } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert
} from 'react-native';
import { useTheme, useUser } from '../../configs/Contexts';
import { getGlobalStyles } from '../../styles/Styles';
import { Ionicons } from '@expo/vector-icons';

export default function Profile({ navigation }) {
  const { themeMode, toggleTheme, theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);
  const { user, dispatch } = useUser();

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          onPress: () => {
            dispatch({ type: 'logout' });
            Alert.alert('Đã đăng xuất', 'Bạn đã đăng xuất thành công.');
          }
        }
      ]
    );
  };

  // If user is guest
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="person-circle-outline" size={80} color={theme.textTertiary} />
        <Text style={[styles.title, { marginTop: 16, marginBottom: 8 }]}>Bạn chưa đăng nhập</Text>
        <Text style={[styles.body, { textAlign: 'center', marginBottom: 24, fontSize: 14 }]}>
          Đăng nhập ngay để theo dõi tiến trình học tập, trò chuyện trực tiếp với giảng viên và tham gia các khóa học chất lượng.
        </Text>
        <TouchableOpacity
          style={[styles.btnPrimary, { width: '80%' }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.btnPrimaryText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnSecondary, { width: '80%', marginTop: 8 + 4 }]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.btnSecondaryText}>Đăng ký tài khoản</Text>
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
      {/* Header Profile Info */}
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
        <View style={{ position: 'relative', marginBottom: 8 + 4 }}>
          <Image
            source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250' }}
            style={styles.profileAvatar}
          />
          <TouchableOpacity 
            style={[styles.avatarBadge, styles.avatarBadgeSmall]}
            onPress={() => Alert.alert('Cập nhật ảnh đại diện', 'Tính năng đang được phát triển.')}
          >
            <Ionicons name="camera" size={16} color={theme.btnPrimaryText} />
          </TouchableOpacity>
        </View>
        <Text style={styles.h1}>{`${user.first_name} ${user.last_name}`}</Text>
        <Text style={[styles.body, { fontSize: 14, color: theme.textTertiary, marginBottom: 8 }]}>{user.email}</Text>

        {/* Role Badge */}
        <View style={{
          backgroundColor:
            user.role === 'admin' ? theme.errorText :
              user.role === 'instructor' ? theme.successText : theme.btnPrimaryBg,
          paddingHorizontal: 16,
          paddingVertical: 4,
          borderRadius: 20,
          marginTop: theme.spacing.xs
        }}>
          <Text style={{ color: theme.textOnColor || '#FFFFFF', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' }}>
            {user.role === 'admin' ? 'Quản trị viên' :
              user.role === 'instructor' ? 'Giảng viên' : 'Học sinh'}
          </Text>
        </View>
      </View>

      {/* Role-Based Operations Panel */}
      <Text style={[styles.h2, { marginTop: 8 + 4, marginBottom: 8 }]}>Quản trị & Tiện ích</Text>

      {user.role === 'student' && (
        <View style={styles.card}>
          <Text style={[styles.title, { fontSize: 16, marginBottom: 6 }]}>Cổng đào tạo giảng viên</Text>
          <Text style={[styles.small, { marginBottom: 8 + 4 }]}>
            Bạn có chuyên môn và muốn chia sẻ kiến thức? Hãy gửi hồ sơ ứng tuyển làm giảng viên trực tuyến ngay hôm nay.
          </Text>
          <TouchableOpacity
            style={[styles.btnSecondary, { flexDirection: 'row', justifyContent: 'center' }]}
            onPress={() => navigation.navigate('ApplyInstructor')}
          >
            <Ionicons name="school-outline" size={18} color={theme.btnSecondaryText} style={{ marginRight: 6 }} />
            <Text style={styles.btnSecondaryText}>Nộp đơn xin giảng dạy</Text>
          </TouchableOpacity>
        </View>
      )}

      {user.role === 'instructor' && (
        <View style={styles.card}>
          <Text style={[styles.title, { fontSize: 16, marginBottom: 8 }]}>Hành động giảng viên</Text>

          <TouchableOpacity
            style={[styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderLight }]}
            onPress={() => navigation.navigate('CourseForm')}
          >
            <Ionicons name="add-circle-outline" size={22} color={theme.btnPrimaryBg} style={{ marginRight: 12 }} />
            <Text style={[styles.body, { flex: 1 }]}>Tạo khóa học mới</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderLight }]}
            onPress={() => navigation.navigate('StudentProgress')}
          >
            <Ionicons name="people-outline" size={22} color={theme.btnPrimaryBg} style={{ marginRight: 12 }} />
            <Text style={[styles.body, { flex: 1 }]}>Quản lý học viên & Tiến độ</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { paddingVertical: 12 }]}
            onPress={() => navigation.navigate('Stats')}
          >
            <Ionicons name="bar-chart-outline" size={22} color={theme.btnPrimaryBg} style={{ marginRight: 12 }} />
            <Text style={[styles.body, { flex: 1 }]}>Thống kê thu nhập & Đăng ký</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

      {user.role === 'admin' && (
        <View style={styles.card}>
          <Text style={[styles.title, { fontSize: 16, marginBottom: 8 }]}>Hành động Quản trị viên</Text>

          <TouchableOpacity
            style={[styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderLight }]}
            onPress={() => navigation.navigate('AdminVerifyDetails')}
          >
            <Ionicons name="checkbox-outline" size={22} color="#C5221F" style={{ marginRight: 12 }} />
            <Text style={[styles.body, { flex: 1 }]}>Duyệt đơn giảng viên</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { paddingVertical: 12 }]}
            onPress={() => navigation.navigate('Stats')}
          >
            <Ionicons name="analytics" size={22} color="#C5221F" style={{ marginRight: 12 }} />
            <Text style={[styles.body, { flex: 1 }]}>Báo cáo doanh thu chung trường</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

      {/* General Settings */}
      <Text style={[styles.h2, { marginTop: 8 + 4, marginBottom: 8 }]}>Cài đặt hệ thống</Text>
      <View style={styles.card}>
        {/* Update profile info */}
        <TouchableOpacity
          style={[styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderLight }]}
          onPress={() => Alert.alert('Cập nhật thông tin cá nhân', 'Tính năng đang được phát triển.')}
        >
          <Ionicons name="person-circle-outline" size={22} color={theme.textPrimary} style={{ marginRight: 12 }} />
          <Text style={[styles.body, { flex: 1 }]}>Cập nhật thông tin cá nhân</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
        </TouchableOpacity>

        {/* Dark Mode Switch */}
        <View style={[styles.spaceBetween, { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.borderLight }]}>
          <View style={[styles.row]}>
            <Ionicons name={themeMode === 'dark' ? "moon-outline" : "sunny-outline"} size={22} color={theme.textPrimary} style={{ marginRight: 12 }} />
            <Text style={styles.body}>Chế độ giao diện tối (Dark Mode)</Text>
          </View>
          <Switch
            value={themeMode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.controlTrack, true: theme.btnPrimaryBg }}
            thumbColor={themeMode === 'dark' ? theme.btnPrimaryText : theme.controlThumb}
          />
        </View>

        {/* Change password */}
        <TouchableOpacity
          style={[styles.row, { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderLight }]}
          onPress={() => Alert.alert('Đổi mật khẩu', 'Tính năng đang được phát triển.')}
        >
          <Ionicons name="key-outline" size={22} color={theme.textPrimary} style={{ marginRight: 12 }} />
          <Text style={[styles.body, { flex: 1 }]}>Đổi mật khẩu</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
        </TouchableOpacity>

        {/* Help Center */}
        <TouchableOpacity
          style={[styles.row, { paddingVertical: 12 }]}
          onPress={() => Alert.alert('Hỗ trợ', 'Vui lòng liên hệ support@ecourse.edu.vn.')}
        >
          <Ionicons name="help-circle-outline" size={22} color={theme.textPrimary} style={{ marginRight: 12 }} />
          <Text style={[styles.body, { flex: 1 }]}>Trung tâm hỗ trợ</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Logout button */}
      <TouchableOpacity
        style={[styles.btnSecondary, { marginTop: 24, borderColor: theme.errorText, backgroundColor: 'transparent' }]}
        onPress={handleLogout}
      >
        <Text style={[styles.btnSecondaryText, { color: theme.errorText }]}>ĐĂNG XUẤT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
