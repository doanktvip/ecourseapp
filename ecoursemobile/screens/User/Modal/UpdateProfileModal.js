import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextInput } from 'react-native-paper';
import { authApis, endpoints } from '../../../configs/Apis';
import Styles from '../Styles';
import theme from '../../../styles/theme';

const UpdateProfileModal = ({ visible, onClose, user, token, onUpdate }) => {
    const profileFields = [
        {
            field: 'lastName',
            title: 'Họ và tên đệm',
            placeholder: 'Nhập họ và tên đệm',
            icon: 'card-account-details-outline'
        },
        {
            field: 'firstName',
            title: 'Tên của bạn',
            placeholder: 'Nhập tên',
            icon: 'account-outline'
        },
        {
            field: 'email',
            title: 'Địa chỉ Email',
            placeholder: 'Nhập email',
            icon: 'email-outline',
            keyboardType: 'email-address'
        }
    ];

    const [profileData, setProfileData] = useState({});
    const [loading, setLoading] = useState(false);

    const scrollViewRef = useRef(null);
    const inputPositions = useRef({});

    useEffect(() => {
        if (visible && user) {
            setProfileData({
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                email: user.email || ''
            });
        }
    }, [visible, user]);

    const handleUpdateProfile = async () => {
        const { firstName, lastName, email } = profileData;

        if (!firstName || !lastName || !email) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Họ, Tên và Email.");
            return;
        }

        try {
            setLoading(true);
            const response = await authApis(token).patch(endpoints['current-user'], {
                first_name: firstName,
                last_name: lastName,
                email: email,
            });

            onUpdate(response.data);
            Alert.alert("Thành công", "Cập nhật thông tin cá nhân thành công!");
            onClose();
        } catch (error) {
            console.error(error);
            let errMsg = "Không thể cập nhật thông tin.";
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
            Alert.alert("Cập nhật thất bại", errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={() => !loading && onClose()}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={Styles.modalOverlay}>
                <View style={Styles.modalContainer}>
                    <View style={Styles.modalHeader}>
                        <Text style={Styles.modalTitle}>Cập nhật thông tin</Text>
                        {!loading && (
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        {profileFields.map((field) => (
                            <View
                                key={field.field}
                                style={Styles.modalInputGroup}
                                onLayout={(e) => inputPositions.current[field.field] = e.nativeEvent.layout.y}
                            >
                                <Text style={Styles.modalLabel}>{field.title}</Text>
                                <TextInput
                                    value={profileData[field.field] || ''}
                                    onChangeText={(t) => setProfileData({ ...profileData, [field.field]: t })}
                                    onFocus={() => {
                                        setTimeout(() => {
                                            scrollViewRef.current?.scrollTo({
                                                y: inputPositions.current[field.field] || 0,
                                                animated: true
                                            });
                                        }, 200);
                                    }}
                                    mode="outlined"
                                    style={Styles.modalInput}
                                    placeholder={field.placeholder}
                                    keyboardType={field.keyboardType || 'default'}
                                    outlineColor={theme.colors.border}
                                    activeOutlineColor={theme.colors.primary}
                                    disabled={loading}
                                    left={<TextInput.Icon icon={field.icon} />}
                                />
                            </View>
                        ))}
                    </ScrollView>

                    <View style={Styles.modalBtnGroup}>
                        <Button mode="outlined" onPress={onClose} style={Styles.modalBtnCancel} disabled={loading}>
                            Hủy
                        </Button>
                        <Button mode="contained" onPress={handleUpdateProfile} style={Styles.modalBtnSubmit} loading={loading} disabled={loading}>
                            Cập nhật
                        </Button>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default UpdateProfileModal;
