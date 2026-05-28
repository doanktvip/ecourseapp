import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Switch, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextInput, HelperText } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import Apis, { endpoints } from '../../configs/Apis';
import Styles from './Styles';
import theme from '../../styles/theme';

const Register = () => {
  const registerFields = [
    {
      field: 'lastName',
      title: 'Họ *',
      placeholder: 'Ví dụ: Nguyễn Văn',
      icon: 'account-outline'
    },
    {
      field: 'firstName',
      title: 'Tên *',
      placeholder: 'Ví dụ: Anh',
      icon: 'account-outline'
    },
    {
      field: 'email',
      title: 'Email *',
      placeholder: 'Ví dụ: email@domain.com',
      icon: 'email-outline',
      keyboardType: 'email-address'
    },
    {
      field: 'username',
      title: 'Tên đăng nhập *',
      placeholder: 'Tên tài khoản',
      icon: 'account'
    },
    {
      field: 'password',
      title: 'Mật khẩu *',
      placeholder: 'Mật khẩu bảo mật',
      icon: 'lock-outline',
      secureTextEntry: true
    },
    {
      field: 'confirmPassword',
      title: 'Xác nhận mật khẩu *',
      placeholder: 'Nhập lại mật khẩu trên',
      icon: 'lock-check-outline',
      secureTextEntry: true
    }
  ];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    isInstructor: false
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState(null);

  const scrollViewRef = useRef(null);
  const inputPositions = useRef({});

  const nav = useNavigation();

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Chúng tôi cần quyền truy cập thư viện ảnh để thêm ảnh đại diện.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const validate = () => {
    const { firstName, lastName, email, username, password, confirmPassword } = formData;
    if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
      setErr('Vui lòng nhập đầy đủ các trường bắt buộc (*)');
      return false;
    }
    if (password !== confirmPassword) {
      setErr('Mật khẩu và xác nhận mật khẩu không khớp!');
      return false;
    }
    setErr(null);
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setErr(null);

      const body = new FormData();
      body.append('first_name', formData.firstName);
      body.append('last_name', formData.lastName);
      body.append('email', formData.email);
      body.append('username', formData.username);
      body.append('password', formData.password);
      body.append('role', formData.isInstructor ? 'INSTRUCTOR' : 'STUDENT');

      if (avatar) {
        const filename = avatar.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        body.append('avatar', {
          uri: avatar,
          name: filename,
          type: type
        });
      }

      await Apis.post(endpoints['register'], body, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Alert.alert(
        "Đăng ký thành công",
        "Chúc mừng! Bạn đã đăng ký tài khoản thành công.",
        [{ text: "Đăng nhập ngay", onPress: () => nav.navigate('Login') }]
      );
    } catch (ex) {
      console.error(ex);
      let errorMsg = "Đăng ký thất bại! Vui lòng thử lại.";
      if (ex.response && ex.response.data) {
        const data = ex.response.data;
        if (typeof data === 'object') {
          const errors = [];
          for (const key in data) {
            if (Array.isArray(data[key])) {
              errors.push(data[key].join("\n"));
            } else if (typeof data[key] === 'string') {
              errors.push(data[key]);
            } else if (typeof data[key] === 'object') {
              errors.push(Object.values(data[key]).join("\n"));
            }
          }
          errorMsg = errors.join("\n") || errorMsg;
        } else {
          errorMsg = data.detail || errorMsg;
        }
      }
      setErr(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView ref={scrollViewRef} style={Styles.loginContainer} contentContainerStyle={Styles.loginScrollContent} keyboardShouldPersistTaps="handled">
        <View style={Styles.loginCard}>
          <Text style={Styles.cardTitle}>Đăng ký tài khoản mới</Text>

          <TouchableOpacity
            style={Styles.avatarSelectContainer}
            onPress={handlePickAvatar}
            disabled={loading}
          >
            <View style={Styles.avatarSelectCircle}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={Styles.avatarSelectImage} />
              ) : (
                <View style={Styles.avatarSelectPlaceholder}>
                  <Ionicons name="camera-outline" size={32} color={theme.colors.primary} />
                  <Text style={Styles.avatarSelectPlaceholderText}>Chọn ảnh</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Vòng lặp map qua mảng cấu hình để render các input */}
          {registerFields.map((field) => (
            <View
              key={field.field}
              style={Styles.inputGroup}
              onLayout={(event) => {
                inputPositions.current[field.field] = event.nativeEvent.layout.y;
              }}
            >
              <Text style={Styles.inputLabel}>{field.title}</Text>
              <TextInput
                value={formData[field.field] || ''}
                onChangeText={(t) => setFormData({ ...formData, [field.field]: t })}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({
                      y: inputPositions.current[field.field] || 0,
                      animated: true
                    });
                  }, 200);
                }}
                mode="outlined"
                style={Styles.paperInput}
                placeholder={field.placeholder}
                placeholderTextColor="#adb5bd"
                secureTextEntry={field.secureTextEntry && !showPassword}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
                disabled={loading}
                left={<TextInput.Icon icon={field.icon} />}
                right={field.secureTextEntry ? (
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                ) : null}
              />
            </View>
          ))}
          {err && (
            <HelperText style={Styles.errText} type="error" visible={!!err}>
              {err}
            </HelperText>
          )}
          <Button mode="contained" onPress={handleRegister} style={Styles.btnLogin}
            labelStyle={Styles.btnLoginLabel} loading={loading} disabled={loading}>
            ĐĂNG KÝ HỒ SƠ
          </Button>
        </View>
        <View style={Styles.registerLinkWrapper}>
          <Text style={Styles.registerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => nav.navigate('Login')}>
            <Text style={Styles.registerLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;