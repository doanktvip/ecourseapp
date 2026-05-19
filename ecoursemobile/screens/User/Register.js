import React, { useState, useMemo } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Alert,
  Switch
} from 'react-native';
import { useTheme } from '../../configs/Contexts';
import { getGlobalStyles } from '../../styles/Styles';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function Register({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isInstructor, setIsInstructor] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [cvFile, setCvFile] = useState(null);

  const pickCVFile = () => {
    // Giả lập chọn file PDF/Docx từ điện thoại
    Alert.alert(
      'Chọn hồ sơ CV',
      'Chọn một tài liệu giới thiệu năng lực của bạn (PDF, DOCX)',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Chọn CV_GiangVien_NguyenVanA.pdf', 
          onPress: () => setCvFile({ name: 'CV_GiangVien_NguyenVanA.pdf', size: '2.4 MB' }) 
        },
        { 
          text: 'Chọn Profile_ChuyenMon.docx', 
          onPress: () => setCvFile({ name: 'Profile_ChuyenMon.docx', size: '1.8 MB' }) 
        }
      ]
    );
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleRegister = () => {
    if (!username || !password || !confirmPassword || !firstName || !lastName || !email) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ các trường thông tin bắt buộc.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    Alert.alert(
      'Đăng ký thành công',
      isInstructor 
        ? 'Tài khoản giảng viên đã được khởi tạo. Vui lòng chờ quản trị viên phê duyệt đơn giảng dạy.' 
        : 'Tài khoản sinh viên đã được khởi tạo thành công! Bạn có thể đăng nhập ngay.',
      [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]
    );
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      contentContainerStyle={{ padding: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.h1, { textAlign: 'center', marginTop: 10 }]}>Tạo tài khoản</Text>
      <Text style={[styles.small, { textAlign: 'center', marginBottom: 24 }]}>
        Tham gia học tập và chia sẻ kiến thức cùng hàng triệu người học
      </Text>

      {/* Avatar Picker */}
      <View style={styles.avatarPickerContainer}>
        <TouchableOpacity onPress={pickImage} style={{ position: 'relative' }}>
          {avatar ? (
            <Image 
              source={{ uri: avatar }} 
              style={styles.largeAvatar} 
            />
          ) : (
            <View style={styles.largeAvatarFallback}>
              <Ionicons name="camera-outline" size={theme.iconSizes.huge} color={theme.textTertiary} />
            </View>
          )}
          <View style={[styles.avatarBadge, styles.avatarBadgeLarge, { borderColor: theme.bgPrimary }]}>
            <Ionicons name="pencil" size={16} color={theme.btnPrimaryText} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.small, { marginTop: 8 }]}>Ảnh đại diện (Avatar)</Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginBottom: 4 }]}>Họ và Tên đệm *</Text>
        <TextInput
          placeholder="Ví dụ: Nguyễn Văn"
          placeholderTextColor={theme.textTertiary}
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />

        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginBottom: 4 }]}>Tên *</Text>
        <TextInput
          placeholder="Ví dụ: Anh"
          placeholderTextColor={theme.textTertiary}
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />

        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginBottom: 4 }]}>Email *</Text>
        <TextInput
          placeholder="Ví dụ: email@domain.com"
          placeholderTextColor={theme.textTertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginBottom: 4 }]}>Tên đăng nhập *</Text>
        <TextInput
          placeholder="Tên tài khoản viết liền không dấu"
          placeholderTextColor={theme.textTertiary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginBottom: 4 }]}>Mật khẩu *</Text>
        <TextInput
          placeholder="Mật khẩu bảo mật"
          placeholderTextColor={theme.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginBottom: 4 }]}>Xác nhận mật khẩu *</Text>
        <TextInput
          placeholder="Nhập lại mật khẩu trên"
          placeholderTextColor={theme.textTertiary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
          autoCapitalize="none"
          style={styles.input}
        />

        {/* Role Picker (Student / Instructor Toggle) */}
        <View style={[styles.spaceBetween, { marginVertical: 15, paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.borderLight }]}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[styles.title, { fontSize: 16 }]}>Đăng ký giảng dạy</Text>
            <Text style={styles.small}>Bật nếu bạn muốn đăng ký làm Giảng viên giảng dạy các khóa học trực tuyến</Text>
          </View>
          <Switch
            value={isInstructor}
            onValueChange={setIsInstructor}
            trackColor={{ false: theme.controlTrack, true: theme.btnPrimaryBg }}
            thumbColor={isInstructor ? theme.btnPrimaryText : theme.controlThumb}
          />
        </View>

        {isInstructor && (
          <View style={{ marginBottom: 15 }}>
            <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginBottom: 6 }]}>Hồ sơ năng lực (CV) *</Text>
            
            <TouchableOpacity 
              style={[styles.dashedUploadContainer, { gap: theme.spacing.sm }]}
              onPress={pickCVFile}
            >
              {cvFile ? (
                <>
                  <Ionicons name="document-text" size={32} color={theme.btnPrimaryBg} />
                  <Text style={[styles.title, { fontSize: 14, color: theme.textPrimary, textAlign: 'center' }]} numberOfLines={1}>
                    {cvFile.name}
                  </Text>
                  <Text style={styles.small}>{cvFile.size}</Text>
                  <TouchableOpacity 
                    style={{ marginTop: theme.spacing.xs, paddingHorizontal: 8 + 4, paddingVertical: 4, backgroundColor: theme.errorBg, borderRadius: 4 }}
                    onPress={(e) => {
                      e.stopPropagation();
                      setCvFile(null);
                    }}
                  >
                    <Text style={{ color: theme.errorText, fontSize: 11, fontWeight: 'bold' }}>Xóa file</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={32} color={theme.textTertiary} />
                  <Text style={[styles.title, { fontSize: 14, color: theme.textSecondary }]}>Nhấp để tải lên CV của bạn</Text>
                  <Text style={[styles.small, { textAlign: 'center' }]}>Định dạng PDF, DOCX (Tối đa 5MB)</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={[styles.warningBox, { marginTop: 8 + 4 }]}>
              <Text style={styles.warningBoxText}>⚠️ Lưu ý duyệt giảng viên</Text>
              <Text style={[styles.small, { color: theme.warningText, marginTop: 4 }]}>
                Hồ sơ giảng viên cần được Quản trị viên hệ thống (Admin) xét duyệt thủ công dựa trên năng lực trước khi bạn được phép tạo khóa học.
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.btnPrimary, { marginTop: 10, height: 48 }]} 
          onPress={handleRegister}
        >
          <Text style={styles.btnPrimaryText}>ĐĂNG KÝ HỒ SƠ</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 40 }}>
        <Text style={styles.body}>Đã có tài khoản? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.body, { color: theme.btnPrimaryBg, fontWeight: 'bold' }]}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
