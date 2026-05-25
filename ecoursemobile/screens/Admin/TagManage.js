import { View, Text, TextInput, TouchableOpacity,  FlatList,  Alert, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import Styles from "../../styles/Styles";

const TagManage = ({ navigation }) => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTag, setEditingTag] = useState(null);
    const [tagName, setTagName] = useState('');

    const loadTags = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert("Lỗi", "Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
                return;
            }

            const res = await authApis(token).get(endpoints['tags']);
            setTags(res.data || []);
        } catch (ex) {
            console.error("Lỗi lấy danh sách tag:", ex);
            Alert.alert("Lỗi", "Không thể tải danh sách thẻ lúc này.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTags();
    }, []);

    const openModal = (tag = null) => {
        if (tag) {
            setEditingTag(tag);
            setTagName(tag.name);
        } else {
            setEditingTag(null);
            setTagName('');
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingTag(null);
        setTagName('');
    };

    //Add or update tag
    const handleSave = async () => {
        if (!tagName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên thẻ (tag).');
            return;
        }

        try {
            setSubmitting(true);
            const token = await AsyncStorage.getItem('token');
            
            if (!token) {
                Alert.alert("Lỗi xác thực", "Vui lòng đăng nhập lại.");
                return;
            }
            
            if (editingTag) {
                await authApis(token).patch(endpoints['tag-details'](editingTag.id), { 
                    name: tagName.trim() 
                });
                Alert.alert('Thành công', 'Đã cập nhật tên Tag.');
        } else {
            await authApis(token).post(endpoints['tags'], { 
                name: tagName.trim() 
            });
            Alert.alert('Thành công', 'Đã thêm Tag mới.');
        }
        
        closeModal();
        loadTags(); 

        } catch (error) {
        console.error("Lỗi lưu tag:", error);
        Alert.alert('Thất bại', 'Không thể lưu thẻ lúc này. Có thể tên thẻ đã tồn tại.');
        } finally {
        setSubmitting(false);
        }
    };

    // Delete tag
    const handleDelete = (id) => {
        Alert.alert(
        'Xóa thẻ (Tag)',
        'Bạn có chắc chắn muốn xóa thẻ này? Các khóa học liên quan có thể bị ảnh hưởng.',
        [
            { text: 'Hủy', style: 'cancel' },
            { 
            text: 'Xóa', 
            style: 'destructive',
            onPress: async () => {
                try {
                    const token = await AsyncStorage.getItem('token');
                    await authApis(token).delete(endpoints['tag-details'](id));
                    Alert.alert('Thành công', 'Đã xóa thẻ.');
                    loadTags(); 
                } catch (error) {
                    console.error("Lỗi xóa tag:", error);
                    Alert.alert('Lỗi', 'Không thể xóa thẻ này.');
                }
            } 
            }
        ]
        );
    };

    // Render item cho FlatList
    const renderTagItem = ({ item }) => (
        <View style={Styles.tagItem}>
            <View style={Styles.row}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#e7f0fd', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <Ionicons name="pricetag" size={16} color="#1877F2" />
                </View>
                <Text style={Styles.tagText}>{item.name}</Text>
            </View>
            <View style={Styles.row}>
                <TouchableOpacity style={Styles.actionBtn} onPress={() => openModal(item)}>
                <Ionicons name="pencil" size={20} color="#17a2b8" />
                </TouchableOpacity>
                <TouchableOpacity style={Styles.actionBtn} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={20} color="#dc3545" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={Styles.container}>
            <View style={{ padding: 16, paddingBottom: 0 }}>
                <TouchableOpacity style={Styles.btnAdd} onPress={() => openModal()}>
                <Ionicons name="add" size={24} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={Styles.btnAddText}>THÊM TAG MỚI</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#1877F2" style={{ marginTop: 20 }} />
            ) : (
            <FlatList
                data={tags}
                keyExtractor={item => item.id.toString()}
                renderItem={renderTagItem}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                ListEmptyComponent={
                <View style={Styles.emptyContainer}>
                    <Ionicons name="pricetags-outline" size={64} color="#adb5bd" />
                    <Text style={Styles.emptyText}>Chưa có thẻ (tag) nào được tạo.</Text>
                </View>
                }
            />
            )}

            {/* Modal Create/Update */}
            <Modal visible={modalVisible} animationType="fade" transparent={true} onRequestClose={closeModal}>
                <View style={Styles.modalOverlay}>
                    {/* 1. Sửa modalContent thành modalContainer */}
                    <View style={Styles.modalContainer}>
                        <View style={Styles.modalHeader}>
                            <Text style={Styles.h2}>{editingTag ? 'Cập nhật Tag' : 'Thêm Tag mới'}</Text>
                            <TouchableOpacity onPress={closeModal} disabled={submitting}>
                                <Ionicons name="close" size={28} color="#333333" />
                            </TouchableOpacity>
                        </View>

                        {/* 2. Sửa labelText thành formLabel */}
                        <Text style={Styles.formLabel}>
                            Tên Tag <Text style={Styles.requiredStar}>*</Text>
                        </Text>
                        
                        {/* 3. Sửa input thành customInput */}
                        <TextInput
                            style={Styles.customInput}
                            placeholder="VD: Lập trình, Tiếng Anh..."
                            placeholderTextColor="#adb5bd"
                            value={tagName}
                            onChangeText={setTagName}
                            editable={!submitting}
                        />

                        <View style={Styles.modalActions}>
                            {/* Thêm marginTop: 0 để 2 nút không bị so le */}
                            <TouchableOpacity style={[Styles.btnSecondary, { flex: 1, marginTop: 0 }]} onPress={closeModal} disabled={submitting}>
                                <Text style={Styles.btnSecondaryText}>HỦY BỎ</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[Styles.btnPrimary, { flex: 1, marginTop: 0, opacity: submitting ? 0.7 : 1 }]}
                                onPress={handleSave}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={Styles.btnPrimaryText}>LƯU LẠI</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
export default TagManage;


