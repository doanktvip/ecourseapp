import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { authApis, endpoints } from '../../../configs/Apis';
import Styles from '../Styles';
import theme from '../../../styles/theme';

const TagsModal = ({ visible, onClose, lessonId, currentTags = [], user, onSaved }) => {
    const [allTags, setAllTags] = useState([]);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (visible) {
            const currentTagIds = currentTags.map(t => t.id);
            setSelectedTagIds(currentTagIds);
            loadAllTags();
        }
    }, [visible]);

    const loadAllTags = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const res = token
                ? await authApis(token).get(endpoints['tags'])
                : await Apis.get(endpoints['tags']);
            setAllTags(res.data.results || res.data || []);
        } catch (err) {
            console.error("Lỗi tải danh sách nhãn:", err);
            Alert.alert("Lỗi", "Không thể tải danh sách nhãn.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTag = (tagId) => {
        setSelectedTagIds(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    const handleSave = async () => {
        if (selectedTagIds.length === 0) {
            Alert.alert("Lưu ý", "Vui lòng chọn ít nhất một nhãn.");
            return;
        }
        try {
            setSaving(true);
            const token = await AsyncStorage.getItem('token');
            if (token) {
                await authApis(token).post(endpoints['lesson-tags'](lessonId), {
                    tags: selectedTagIds,
                });
                onClose();
                onSaved?.();
                Alert.alert("Đã cập nhật", "Gán nhãn cho bài học thành công!");
            }
        } catch (err) {
            console.error("Lỗi gán nhãn:", err);
            Alert.alert("Lỗi", "Không thể cập nhật nhãn bài học.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={Styles.modalOverlay}>
                <View style={[Styles.modalContainer, { maxHeight: '75%' }]}>

                    {/* Header */}
                    <View style={Styles.modalHeader}>
                        <Text style={Styles.modalTitle}>Gán nhãn bài học</Text>
                        <TouchableOpacity onPress={onClose} disabled={saving}>
                            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Nội dung */}
                    {loading ? (
                        <ActivityIndicator size="large" color={theme.colors.primary} style={{ paddingVertical: 30 }} />
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 10 }}
                        >
                            <Text style={[Styles.small, { color: theme.colors.textSecondary, marginBottom: 12 }]}>
                                Chọn các nhãn phù hợp cho bài học. Nhấp để chọn/bỏ chọn.
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {allTags.map(tag => {
                                    const isSelected = selectedTagIds.includes(tag.id);
                                    return (
                                        <TouchableOpacity
                                            key={tag.id}
                                            style={{
                                                paddingHorizontal: 14,
                                                paddingVertical: 7,
                                                borderRadius: 20,
                                                backgroundColor: isSelected ? '#e8f0fe' : theme.colors.secondary,
                                                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                                                borderWidth: 1.5,
                                                marginBottom: 10,
                                                marginRight: 8,
                                            }}
                                            onPress={() => handleToggleTag(tag.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={{
                                                color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                                                fontWeight: isSelected ? 'bold' : 'normal',
                                                fontSize: 13,
                                            }}>
                                                #{tag.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                                {allTags.length === 0 && (
                                    <Text style={[Styles.small, { color: '#adb5bd', paddingVertical: 12 }]}>
                                        Chưa có nhãn nào trong hệ thống.
                                    </Text>
                                )}
                            </View>
                        </ScrollView>
                    )}

                    {/* Nút Lưu */}
                    <View style={{ marginTop: 16 }}>
                        <TouchableOpacity
                            style={[
                                Styles.btnPrimary,
                                { borderRadius: 10, height: 48 },
                                (saving || loading) && Styles.btnPrimaryDisabled,
                            ]}
                            onPress={handleSave}
                            disabled={saving || loading}
                            activeOpacity={0.8}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color={theme.colors.white} />
                            ) : (
                                <Text style={Styles.btnPrimaryText}>
                                    Lưu nhãn ({selectedTagIds.length})
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

export default TagsModal;
