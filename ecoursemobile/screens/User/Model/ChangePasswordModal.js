import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextInput } from 'react-native-paper';
import { authApis, endpoints } from '../../../configs/Apis';
import Styles from '../Styles';

const ChangePasswordModal = ({ visible, onClose, token }) => {
    const passwordFields = [
        {
            field: 'oldPassword',
            title: 'Mật khẩu cũ',
            placeholder: 'Nhập mật khẩu hiện tại',
            icon: 'lock-outline',
            secureTextEntry: true
        },
        {
            field: 'newPassword',
            title: 'Mật khẩu mới',
            placeholder: 'Nhập mật khẩu mới',
            icon: 'lock-reset',
            secureTextEntry: true
        },
        {
            field: 'confirmNewPassword',
            title: 'Xác nhận mật khẩu mới',
            placeholder: 'Nhập lại mật khẩu mới',
            icon: 'lock-check-outline',
            secureTextEntry: true
        }
    ];

    const [passwordData, setPasswordData] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!visible) {
            setPasswordData({});
            setShowPassword(false);
        }
    }, [visible]);

    const handleChangePassword = async () => {
        const { oldPassword, newPassword, confirmNewPassword } = passwordData;

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tất cả các trường.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Lỗi", "Mật khẩu mới và xác nhận mật khẩu không trùng khớp.");
            return;
        }

        try {
            setLoading(true);
            await authApis(token).post(endpoints['change-password'], {
                old_password: oldPassword,
                new_password: newPassword,
            });

            Alert.alert("Thành công", "Đổi mật khẩu thành công!");
            onClose();
        } catch (error) {
            console.error(error);
            let errMsg = "Không thể đổi mật khẩu.";
            if (error.response && error.response.data) {
                const data = error.response.data;
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
                    errMsg = errors.join("\n") || errMsg;
                } else {
                    errMsg = data.detail || errMsg;
                }
            }
            Alert.alert("Đổi mật khẩu thất bại", errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={() => !loading && onClose()}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={Styles.modalOverlay}>
                <View style={Styles.modalContainer}>
                    <View style={Styles.modalHeader}>
                        <Text style={Styles.modalTitle}>Đổi mật khẩu</Text>
                        {!loading && (
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {passwordFields.map((field) => (
                        <View key={field.field} style={Styles.modalInputGroup}>
                            <Text style={Styles.modalLabel}>{field.title}</Text>
                            <TextInput
                                value={passwordData[field.field] || ''}
                                onChangeText={(t) => setPasswordData({ ...passwordData, [field.field]: t })}
                                mode="outlined"
                                style={Styles.modalInput}
                                placeholder={field.placeholder}
                                secureTextEntry={field.secureTextEntry && !showPassword}
                                outlineColor="#dee2e6"
                                activeOutlineColor="#1976d2"
                                disabled={loading}
                                left={<TextInput.Icon icon={field.icon} />}
                                right={
                                    <TextInput.Icon
                                        icon={showPassword ? 'eye-off' : 'eye'}
                                        onPress={() => setShowPassword(!showPassword)}
                                    />
                                }
                            />
                        </View>
                    ))}

                    <View style={Styles.modalBtnGroup}>
                        <Button mode="outlined" onPress={onClose} style={Styles.modalBtnCancel} disabled={loading}>
                            Hủy
                        </Button>
                        <Button mode="contained" onPress={handleChangePassword} style={Styles.modalBtnSubmit} loading={loading} disabled={loading}>
                            Xác nhận
                        </Button>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default ChangePasswordModal;
