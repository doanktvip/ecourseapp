import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from '../../configs/Contexts';
import Styles from './Styles';

// Import các Modals từ folder Model
import AvatarModal from './Model/AvatarModal';
import UpdateProfileModal from './Model/UpdateProfileModal';
import ChangePasswordModal from './Model/ChangePasswordModal';

const ProfileMain = ({ navigation }) => {
    const [user, dispatch] = useContext(MyUserContext);
    const [token, setToken] = useState(null);

    // Modal Visibility States
    const [changeAvatarVisible, setChangeAvatarVisible] = useState(false);
    const [updateProfileVisible, setUpdateProfileVisible] = useState(false);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);

    // Lấy Token khi user thay đổi hoặc component được mount
    useEffect(() => {
        const fetchToken = async () => {
            const tk = await AsyncStorage.getItem('token');
            setToken(tk);
        };
        fetchToken();
    }, [user]);

    const logout = async () => {
        Alert.alert(
            "Đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đăng xuất",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.removeItem('token');
                        dispatch({ type: 'logout' });
                    }
                }
            ]
        );
    };

    const handleUpdateUserContext = (updatedUserData) => {
        dispatch({
            type: 'login',
            payload: updatedUserData
        });
    };

    if (!user) {
        return (
            <View style={Styles.centerContainer}>
                <View style={Styles.iconWrapper}>
                    <Ionicons name="person-circle" size={120} color="#adb5bd" />
                </View>
                <Text style={Styles.unauthTitle}>Bạn chưa đăng nhập</Text>
                <Text style={Styles.unauthSubtitle}>
                    Đăng nhập ngay để theo dõi tiến trình học tập, trò chuyện trực tiếp với giảng viên và tham gia các khóa học chất lượng.
                </Text>

                <TouchableOpacity style={Styles.btnPrimary}
                    onPress={() => navigation.navigate('Login')}>
                    <Text style={Styles.btnPrimaryText}>Đăng nhập ngay</Text>
                </TouchableOpacity>

                <TouchableOpacity style={Styles.btnSecondary}
                    onPress={() => navigation.navigate('Register')}>
                    <Text style={Styles.btnSecondaryText}>Đăng ký tài khoản</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const role = user.role;
    return (
        <ScrollView style={Styles.profileContainer} contentContainerStyle={Styles.profileScroll}>
            {/* Header thông tin tài khoản */}
            <View style={Styles.headerCard}>
                <TouchableOpacity style={Styles.avatarCircle} onPress={() => setChangeAvatarVisible(true)} activeOpacity={0.85}>
                    {user.avatar ? (
                        <Image
                            source={{ uri: user.avatar }}
                            style={{ width: 80, height: 80, borderRadius: 40 }}
                        />
                    ) : (
                        <Ionicons name="person" size={50} color="#ffffff" />
                    )}
                    <View style={Styles.avatarEditBadge}>
                        <Ionicons name="camera" size={14} color="#ffffff" />
                    </View>
                </TouchableOpacity>
                {user.last_name && user.first_name ? <Text style={Styles.headerName}>{user.last_name + ' ' + user.first_name}</Text> : <Text style={Styles.headerName}>{user.username}</Text>}
                <Text style={Styles.headerEmail}>{user.email}</Text>

                {/* Badge phân biệt Role của người dùng */}
                {role === 'STUDENT' && (
                    <View style={Styles.badgeStudent}>
                        <Text style={Styles.badgeText}>HỌC SINH</Text>
                    </View>
                )}
                {role === 'INSTRUCTOR' && (
                    <View style={Styles.badgeInstructor}>
                        <Text style={Styles.badgeText}>GIẢNG VIÊN</Text>
                    </View>
                )}
                {role === 'ADMIN' && (
                    <View style={Styles.badgeAdmin}>
                        <Text style={Styles.badgeText}>QUẢN TRỊ VIÊN</Text>
                    </View>
                )}
            </View>

            {/* PHẦN 1: QUẢN TRỊ & TIỆN ÍCH */}
            <View style={Styles.sectionWrapper}>
                <Text style={Styles.sectionTitle}>Quản trị & Tiện ích</Text>

                {/* 1A: GIAO DIỆN HỌC SINH (Student) */}
                {role === 'STUDENT' && (
                    <View style={Styles.cardPortal}>
                        <Text style={Styles.portalTitle}>Cổng đào tạo giảng viên</Text>
                        <Text style={Styles.portalSubtitle}>
                            Bạn có chuyên môn và muốn chia sẻ kiến thức? Hãy gửi hồ sơ ứng tuyển làm giảng viên trực tuyến ngay hôm nay.
                        </Text>
                        <TouchableOpacity
                            style={Styles.btnApply}
                            onPress={() => navigation.navigate('ApplyInstructor')}
                        >
                            <Ionicons name="school-outline" size={18} color="#1976d2" />
                            <Text style={Styles.btnApplyText}>Nộp đơn xin giảng dạy</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* GIAO DIỆN GIÁO VIÊN */}
                {role === 'INSTRUCTOR' && (
                    <View style={Styles.listCard}>
                        <Text style={Styles.listHeader}>Hành động giảng viên</Text>
                        <TouchableOpacity style={Styles.listItem} onPress={() => navigation.navigate('CourseForm')}>
                            <View style={Styles.listItemLeft}>
                                <Ionicons name="add-circle-outline" size={22} color="#1976d2" />
                                <Text style={Styles.listItemText}>Tạo khóa học mới</Text>
                            </View>
                            <Ionicons name="chevron-forward-outline" size={18} color="#adb5bd" />
                        </TouchableOpacity>

                        <TouchableOpacity style={[Styles.listItem, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('StudentProgress')}>
                            <View style={Styles.listItemLeft}>
                                <Ionicons name="people-outline" size={22} color="#1976d2" />
                                <Text style={Styles.listItemText}>Quản lý học viên & Tiến độ</Text>
                            </View>
                            <Ionicons name="chevron-forward-outline" size={18} color="#adb5bd" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[Styles.listItem, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('ApplyInstructor')}>
                            <View style={Styles.listItemLeft}>
                                <Ionicons name="school-outline" size={22} color="#1976d2" />
                                <Text style={Styles.listItemText}>Xem đơn xin giảng dạy đã nộp</Text>
                            </View>
                            <Ionicons name="chevron-forward-outline" size={18} color="#adb5bd" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* GIAO DIỆN ADMIN */}
                {role === 'ADMIN' && (
                    <View style={Styles.listCard}>
                        <Text style={Styles.listHeader}>Hành động Quản trị viên</Text>
                        <TouchableOpacity style={Styles.listItem} onPress={() => navigation.navigate('AdminVerifyDetails')}>
                            <View style={Styles.listItemLeft}>
                                <Ionicons name="checkbox-outline" size={22} color="#1976d2" />
                                <Text style={Styles.listItemText}>Duyệt đơn giảng viên</Text>
                            </View>
                            <Ionicons name="chevron-forward-outline" size={18} color="#adb5bd" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* PHẦN 2: CÀI ĐẶT HỆ THỐNG */}
            <View style={Styles.sectionWrapper}>
                <Text style={Styles.sectionTitle}>Cài đặt hệ thống</Text>

                <View style={Styles.listCard}>
                    <TouchableOpacity style={Styles.listItem} onPress={() => setUpdateProfileVisible(true)}>
                        <View style={Styles.listItemLeft}>
                            <Ionicons name="person-outline" size={20} color="#212529" />
                            <Text style={Styles.listItemText}>Cập nhật thông tin cá nhân</Text>
                        </View>
                        <Ionicons name="chevron-forward-outline" size={18} color="#adb5bd" />
                    </TouchableOpacity>

                    <TouchableOpacity style={Styles.listItem} onPress={() => setChangePasswordVisible(true)}>
                        <View style={Styles.listItemLeft}>
                            <Ionicons name="key-outline" size={20} color="#212529" />
                            <Text style={Styles.listItemText}>Đổi mật khẩu</Text>
                        </View>
                        <Ionicons name="chevron-forward-outline" size={18} color="#adb5bd" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[Styles.listItem, { borderBottomWidth: 0 }]} onPress={() => Alert.alert("Trợ giúp", "Trung tâm hỗ trợ liên hệ email: support@ecourse.edu.vn")}>
                        <View style={Styles.listItemLeft}>
                            <Ionicons name="help-circle-outline" size={20} color="#212529" />
                            <Text style={Styles.listItemText}>Trung tâm hỗ trợ</Text>
                        </View>
                        <Ionicons name="chevron-forward-outline" size={18} color="#adb5bd" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* NÚT ĐĂNG XUẤT */}
            <View style={Styles.btnLogoutOuter}>
                <TouchableOpacity style={Styles.btnLogout} onPress={logout}>
                    <Text style={Styles.btnLogoutText}>ĐĂNG XUẤT</Text>
                </TouchableOpacity>
            </View>

            {/* ========================================================================= */}
            {/* CÁC COMPONENT MODAL TÁCH BIỆT (XỬ LÝ Ở THƯ MỤC MODEL) */}
            {/* ========================================================================= */}

            {/* 1. Modal Thay đổi Avatar */}
            <AvatarModal
                visible={changeAvatarVisible}
                onClose={() => setChangeAvatarVisible(false)}
                user={user}
                token={token}
                onUpdate={handleUpdateUserContext}
            />

            {/* 2. Modal Cập nhật thông tin cá nhân */}
            <UpdateProfileModal
                visible={updateProfileVisible}
                onClose={() => setUpdateProfileVisible(false)}
                user={user}
                token={token}
                onUpdate={handleUpdateUserContext}
            />

            {/* 3. Modal Đổi mật khẩu */}
            <ChangePasswordModal
                visible={changePasswordVisible}
                onClose={() => setChangePasswordVisible(false)}
                token={token}
            />

        </ScrollView>
    );
};

export default ProfileMain;