import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { authApis, endpoints } from '../../../configs/Apis';
import Styles from '../Styles';

const AvatarModal = ({ visible, onClose, user, token, onUpdate }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Quyền truy cập', 'Chúng tôi cần quyền truy cập thư viện ảnh để thay đổi avatar của bạn.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleUploadAvatar = async () => {
        if (!selectedImage) {
            Alert.alert("Lỗi", "Vui lòng chọn một hình ảnh để tải lên.");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            const filename = selectedImage.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('avatar', {
                uri: selectedImage,
                name: filename,
                type: type,
            });

            const response = await authApis(token).patch(endpoints['current-user'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onUpdate(response.data);
            Alert.alert("Thành công", "Đổi ảnh đại diện thành công!");
            onClose();
            setSelectedImage(null);
        } catch (error) {
            console.error(error);
            let errMsg = "Không thể tải lên ảnh đại diện.";
            if (error.response && error.response.data) {
                const data = error.response.data;
                if (typeof data === 'object') {
                    errMsg = Object.values(data).join("\n") || errMsg;
                } else {
                    errMsg = data.detail || errMsg;
                }
            }
            Alert.alert("Lỗi tải lên", errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => !loading && onClose()}
        >
            <View style={Styles.modalOverlay}>
                <View style={Styles.modalContainer}>
                    <View style={Styles.modalHeader}>
                        <Text style={Styles.modalTitle}>Cập nhật ảnh đại diện</Text>
                        {!loading && (
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={Styles.avatarSelectContainer}
                        onPress={handlePickImage}
                        disabled={loading}
                    >
                        <View style={Styles.avatarSelectCircle}>
                            {selectedImage ? (
                                <Image source={{ uri: selectedImage }} style={Styles.avatarSelectImage} />
                            ) : user?.avatar ? (
                                <Image source={{ uri: user.avatar }} style={Styles.avatarSelectImage} />
                            ) : (
                                <View style={Styles.avatarSelectPlaceholder}>
                                    <Ionicons name="cloud-upload-outline" size={40} color="#1976d2" />
                                    <Text style={Styles.avatarSelectPlaceholderText}>Chọn ảnh</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>

                    <View style={Styles.modalBtnGroup}>
                        <Button mode="outlined" onPress={onClose} style={Styles.modalBtnCancel} disabled={loading}>
                            Hủy
                        </Button>
                        <Button mode="contained" onPress={handleUploadAvatar} style={Styles.modalBtnSubmit}
                            loading={loading} disabled={loading || !selectedImage}>
                            Lưu ảnh
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AvatarModal;
