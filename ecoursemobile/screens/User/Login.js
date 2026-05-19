import React, { useState, useMemo } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useTheme, useUser } from '../../configs/Contexts';
import { getGlobalStyles } from '../../styles/Styles';
import { endpoints, authApi } from '../../configs/Apis';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function Login({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);
  const { dispatch } = useUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ tài khoản và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      // Demo authentication simulation or API fetch
      // In a real flow, you would make an OAuth2 call to endpoints['login']
      // For this structural demonstration, we support both dummy testing and structured token calls.
      
      // Let's create a simulated login that logs in the user with different roles for testing:
      // - admin / 123 -> Admin
      // - instructor / 123 -> Instructor (Giảng viên)
      // - student / 123 -> Student (Sinh viên)
      
      setTimeout(() => {
        let role = 'student';
        let name = 'Nguyễn Văn Học Sinh';
        
        if (username.toLowerCase() === 'admin') {
          role = 'admin';
          name = 'Quản trị viên Hệ thống';
        } else if (username.toLowerCase() === 'instructor' || username.toLowerCase() === 'teacher') {
          role = 'instructor';
          name = 'ThS. Nguyễn Văn Giảng Viên';
        }

        const mockUser = {
          id: 1,
          username: username,
          first_name: name.split(' ').slice(0, -1).join(' '),
          last_name: name.split(' ').pop(),
          email: `${username}@ecourse.edu.vn`,
          role: role, // 'admin' | 'instructor' | 'student'
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250',
          is_active: true
        };

        dispatch({
          type: 'login',
          payload: mockUser
        });

        setLoading(false);
        navigation.navigate('Main');
      }, 1000);

    } catch (error) {
      setLoading(false);
      Alert.alert('Lỗi đăng nhập', 'Tài khoản hoặc mật khẩu không chính xác.');
      console.error(error);
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoWrapper}>
        <View style={styles.largeLogoContainer}>
          <Ionicons name="school" size={theme.iconSizes.huge} color={theme.btnPrimaryText} />
        </View>
        <Text style={[styles.h1, { marginBottom: theme.spacing.xs }]}>eCourse App</Text>
        <Text style={styles.small}>Cổng tri thức trực tuyến hàng đầu</Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.title, { marginBottom: 16 + 4 }]}>Đăng nhập</Text>

        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginBottom: theme.spacing.xs }]}>Tên đăng nhập</Text>
        <View style={[styles.row, styles.input, { paddingVertical: 0 }]}>
          <Ionicons name="person-outline" size={20} color={theme.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Nhập username (admin / instructor / student)"
            placeholderTextColor={theme.textTertiary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={{ flex: 1, color: theme.textPrimary, height: 48 }}
          />
        </View>

        <Text style={[styles.body, { fontSize: 14, fontWeight: '600', marginTop: 8 + 4, marginBottom: theme.spacing.xs }]}>Mật khẩu</Text>
        <View style={[styles.row, styles.input, { paddingVertical: 0 }]}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Nhập mật khẩu (123)"
            placeholderTextColor={theme.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            style={{ flex: 1, color: theme.textPrimary, height: 48 }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color={theme.textTertiary} 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.btnPrimary, { marginTop: 24, height: 48 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.btnPrimaryText} />
          ) : (
            <Text style={styles.btnPrimaryText}>ĐĂNG NHẬP</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
        <Text style={styles.body}>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.body, { color: theme.btnPrimaryBg, fontWeight: 'bold' }]}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.cardVariant, { marginTop: theme.spacing.xl, alignItems: 'center' }]}>
        <Text style={[styles.small, { fontWeight: '700', marginBottom: theme.spacing.xs }]}>💡 HƯỚNG DẪN DEMO PHÂN QUYỀN:</Text>
        <Text style={[styles.small, { textAlign: 'center' }]}>
          Nhập username là:{"\n"}
          - <Text style={{fontWeight: '700'}}>"student"</Text> để trải nghiệm vai trò Sinh Viên.{"\n"}
          - <Text style={{fontWeight: '700'}}>"instructor"</Text> để trải nghiệm vai trò Giảng Viên.{"\n"}
          - <Text style={{fontWeight: '700'}}>"admin"</Text> để trải nghiệm vai trò Quản Trị Viên.{"\n"}
          Mật khẩu bất kỳ (ví dụ: 123)
        </Text>
      </View>
    </ScrollView>
  );
}
