import { Image, Text, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import Styles from './Styles';
import { Button, HelperText, TextInput } from "react-native-paper";
import { useContext, useState, useRef } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from "../../configs/Contexts";
import { Ionicons } from '@expo/vector-icons';

const Login = ({ route }) => {

    const userInfo = [{
        field: 'username',
        title: 'Tên tài khoản',
        icon: 'account',
        placeholder: 'Nhập tên tài khoản'
    }, {
        field: 'password',
        title: 'Mật khẩu',
        icon: 'lock',
        placeholder: 'Nhập mật khẩu',
        secureTextEntry: true
    }];

    const [user, setUser] = useState({});
    const [err, setErr] = useState(null);
    const scrollViewRef = useRef(null);
    const inputPositions = useRef({});
    const nav = useNavigation();
    const [loading, setLoading] = useState(false);
    const [, dispatch] = useContext(MyUserContext);
    const next = route.params?.next;

    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        if (!user.username) {
            setErr('Vui lòng nhập tên đăng nhập');
            return false;
        } else if (!user.password) {
            setErr('Vui lòng nhập mật khẩu!');
            return false;
        } else {
            setErr(null);
            return true;
        }
    }

    const login = async () => {
        if (validate()) {
            try {
                setLoading(true);
                setErr(null);

                let res = await Apis.post(endpoints['login'], {
                    username: user.username,
                    password: user.password,
                    grant_type: 'password'
                });

                await AsyncStorage.setItem('token', res.data.access_token);

                let u = await authApis(res.data.access_token).get(endpoints['current-user']);

                dispatch({
                    "type": "login",
                    "payload": u.data
                });

                if (next) {
                    nav.navigate(next, route.params?.params);
                } else if (nav.canGoBack()) {
                    nav.goBack();
                } else {
                    nav.navigate("Main");
                }

            } catch (ex) {
                console.error(ex);
                let errorMsg = 'Đăng nhập thất bại! Vui lòng kiểm tra lại kết nối mạng.';
                if (ex.response && ex.response.data) {
                    const data = ex.response.data;
                    if (data.error_description) {
                        if (data.error_description === "Invalid credentials given.") {
                            errorMsg = "Tên đăng nhập hoặc mật khẩu không chính xác!";
                        } else {
                            errorMsg = data.error_description;
                        }
                    } else if (data.error) {
                        errorMsg = `Lỗi hệ thống: ${data.error}`;
                    }
                }
                setErr(errorMsg);
            } finally {
                setLoading(false);
            }
        }
    }

    const loginWithGoogle = () => {
        Alert.alert(
            "Đăng nhập bằng Google",
            "Chức năng đăng nhập thông qua tài khoản Google hiện đang được tích hợp phát triển.",
            [{ text: "Đã hiểu", style: "default" }]
        );
    };

    const loginWithFacebook = () => {
        Alert.alert(
            "Đăng nhập bằng Facebook",
            "Chức năng đăng nhập thông qua tài khoản Facebook hiện đang được tích hợp phát triển.",
            [{ text: "Đã hiểu", style: "default" }]
        );
    };

    return (
        <ScrollView ref={scrollViewRef} style={Styles.loginContainer} contentContainerStyle={Styles.loginScrollContent} keyboardShouldPersistTaps="handled">
            <View style={Styles.logoWrapper}>
                <View style={Styles.logoCircle}>
                    <Ionicons name="school" size={44} color="#ffffff" />
                </View>
                <Text style={Styles.appName}>eCourse App</Text>
                <Text style={Styles.appSubtitle}>Cổng tri thức trực tuyến hàng đầu</Text>
            </View>

            <View style={Styles.loginCard}>
                <Text style={Styles.cardTitle}>Đăng nhập</Text>

                {userInfo.map(u => (
                    <View 
                        key={u.field} 
                        style={Styles.inputGroup}
                        onLayout={(event) => {
                            inputPositions.current[u.field] = event.nativeEvent.layout.y;
                        }}
                    >
                        <Text style={Styles.inputLabel}>{u.title}</Text>
                        <TextInput
                            value={user[u.field] || ''}
                            onChangeText={(t) => setUser({ ...user, [u.field]: t })}
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollTo({ 
                                        y: inputPositions.current[u.field] || 0,
                                        animated: true 
                                    });
                                }, 200);
                            }}
                            mode="outlined"
                            style={Styles.paperInput}
                            placeholder={u.placeholder}
                            placeholderTextColor="#adb5bd"
                            secureTextEntry={u.secureTextEntry && !showPassword}
                            outlineColor="#dee2e6"
                            activeOutlineColor="#1976d2"
                            left={<TextInput.Icon icon={u.field === 'username' ? 'account-outline' : 'lock-outline'} />}
                            right={u.secureTextEntry ? (
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
                <Button loading={loading} disabled={loading} mode="contained" onPress={login} style={Styles.btnLogin} labelStyle={Styles.btnLoginLabel}>
                    ĐĂNG NHẬP
                </Button>

                <View style={Styles.dividerContainer}>
                    <View style={Styles.dividerLine} />
                    <Text style={Styles.dividerText}>Hoặc</Text>
                    <View style={Styles.dividerLine} />
                </View>

                <TouchableOpacity style={Styles.btnGoogle} onPress={loginWithGoogle}>
                    <Image
                        source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                        style={{ width: 18, height: 18, resizeMode: 'contain' }}
                    />
                    <Text style={Styles.btnGoogleText}>Đăng nhập bằng Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[Styles.btnGoogle, { marginTop: 12 }]} onPress={loginWithFacebook}>
                    <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                    <Text style={Styles.btnGoogleText}>Đăng nhập bằng Facebook</Text>
                </TouchableOpacity>
            </View>

            <View style={Styles.registerLinkWrapper}>
                <Text style={Styles.registerText}>Chưa có tài khoản? </Text>
                <TouchableOpacity onPress={() => nav.navigate("Register")}>
                    <Text style={Styles.registerLink}>Đăng ký ngay</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

export default Login;