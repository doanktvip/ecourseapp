import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, Image, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from '../../configs/Contexts';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import Styles from './Styles';

const CourseForm = ({ route, navigation }) => {
    const [user] = useContext(MyUserContext);

    const scrollViewRef = useRef(null);
    const formPositions = useRef({});

    // Nhận dữ liệu khóa học truyền sang khi là chế độ CHỈNH SỬA
    const { course } = route?.params || {};

    // Form state variables
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [fee, setFee] = useState('');
    const [categoryId, setCategoryId] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [imageUri, setImageUri] = useState(null);

    // UI state variables
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Tải danh mục từ API
    const loadCategories = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints['categories']);
            setCategories(res.data || []);
        } catch (ex) {
            console.error("Lỗi lấy danh mục:", ex);
            Alert.alert("Lỗi hệ thống", "Không thể tải danh mục khóa học.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Chỉ tải danh mục nếu user đăng nhập và có quyền giảng dạy
        if (user && (user.role === 'INSTRUCTOR' || user.role === 'ADMIN')) {
            loadCategories();
        } else {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (course) {
            setSubject(course.subject || '');
            setDescription(course.description || '');
            setFee(course.fee ? course.fee.toString() : '');
            if (course.category) {
                setCategoryId(course.category.id);
                setCategoryName(course.category.name);
            }
            if (course.image) {
                setImageUri(course.image);
            }
        }
    }, [course]);

    // Chọn ảnh bìa từ thư viện thiết bị
    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Quyền truy cập', 'eCourse cần quyền truy cập thư viện ảnh để tải lên ảnh bìa khóa học.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [16, 9], // Định dạng ảnh bìa nằm ngang chuẩn
                quality: 0.9,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImageUri(result.assets[0].uri);
            }
        } catch (err) {
            console.error("Lỗi chọn ảnh bìa:", err);
            Alert.alert("Lỗi", "Không thể chọn hình ảnh bìa.");
        }
    };

    // Chọn một danh mục từ Modal
    const handleSelectCategory = (cat) => {
        setCategoryId(cat.id);
        setCategoryName(cat.name);
        setCategoryModalVisible(false);
    };

    // Gửi biểu mẫu tạo khóa học lên API hay cập nhật khóa học 
    const handleCreateCourse = async () => {
        if (!subject || !subject.trim()) {
            Alert.alert("Lỗi nhập liệu", "Vui lòng nhập tên khóa học.");
            return;
        }

        if (!categoryId) {
            Alert.alert("Lỗi nhập liệu", "Vui lòng chọn danh mục khóa học.");
            return;
        }

        // Kiểm tra và xử lý trường Học phí
        let parsedFee = 0;
        if (fee && fee.trim()) {
            parsedFee = parseFloat(fee.trim());
            if (isNaN(parsedFee) || parsedFee < 0) {
                Alert.alert("Lỗi nhập liệu", "Học phí phải là một số lớn hơn hoặc bằng 0.");
                return;
            }
        }

        try {
            setSubmitting(true);
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const formData = new FormData();
                formData.append('subject', subject.trim());
                formData.append('description', (description || '').trim());
                formData.append('fee', parsedFee.toString());
                formData.append('category_id', categoryId.toString());

                if (imageUri && imageUri.startsWith('file://')) {
                    const filename = imageUri.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image/jpeg`;

                    formData.append('image', {
                        uri: imageUri,
                        name: filename || 'course_cover.jpg',
                        type: type,
                    });
                }

               if (course) {
                    // Lệnh PATCH: CẬP NHẬT KHÓA HỌC HIỆN TẠI
                    await authApis(token).patch(endpoints['course-details'](course.id), formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    Alert.alert("Thành công", "Cập nhật thông tin khóa học thành công!", [
                        { text: "OK", onPress: () => navigation.goBack() }
                    ]);
                } else {
                    // Lệnh POST: TẠO KHÓA HỌC MỚI (Gửi POST request dạng multipart/form-data)
                    const response = await authApis(token).post(endpoints['courses'], formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    Alert.alert("Thành công", `Khóa học "${response.data.subject}" đã được tạo thành công!`, [
                        { text: "OK", onPress: () => navigation.goBack() }
                    ]);
                
                }
            } else {
                Alert.alert("Lỗi xác thực", "Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
            }
        } catch (error) {
            console.error("Lỗi gửi dữ liệu tạo khóa học:", error);
            let errMsg = "Không thể tạo khóa học mới. Vui lòng kiểm tra lại.";

            if (error.response && error.response.data) {
                const data = error.response.data;
                if (typeof data === 'object') {
                    const errors = [];
                    for (const key in data) {
                        const errorLabel = key === 'category_id' ? 'Danh mục' : (key === 'subject' ? 'Tên khóa học' : (key === 'fee' ? 'Học phí' : key));
                        if (Array.isArray(data[key])) {
                            errors.push(`${errorLabel}: ${data[key].join(", ")}`);
                        } else if (typeof data[key] === 'string') {
                            errors.push(`${errorLabel}: ${data[key]}`);
                        }
                    }
                    errMsg = errors.join("\n") || errMsg;
                } else {
                    errMsg = data.detail || errMsg;
                }
            }
            Alert.alert("Tạo khóa học thất bại", errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // XỬ LÝ XÓA KHÓA HỌC
    const handleDelete = () => {
        Alert.alert('Xác nhận xóa','Bạn có chắc chắn muốn vô hiệu hóa khóa học này không? Các dữ liệu liên quan sẽ bị ảnh hưởng.',
            [
                { text: 'Hủy', style: 'cancel' },
                { 
                    text: 'Xóa khóa học', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setDeleteLoading(true);
                            const token = await AsyncStorage.getItem('token');
                            await authApis(token).delete(endpoints['course-details'](course.id));
                            
                            Alert.alert('Thành công', 'Khóa học đã được vô hiệu hóa!', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error("Lỗi khi xóa khóa học:", error);
                            Alert.alert('Thất bại', 'Không thể xóa khóa học lúc này.');
                        } finally {
                            setDeleteLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // 1. Trường hợp: Đang tải xác thực ban đầu
    if (loading && !user) {
        return (
            <View style={Styles.applyLoadingContainer}>
                <ActivityIndicator size="large" color="#1877F2" />
                <Text style={Styles.applyLoadingText}>Đang xác thực thông tin...</Text>
            </View>
        );
    }

    // 2. Trường hợp: PHÂN QUYỀN SAI (Học sinh cố tình truy cập hoặc chưa đăng nhập)
    if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
        return (
            <ScrollView style={[Styles.container, { padding: 20 }]} showsVerticalScrollIndicator={false}>
                <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                    <View style={[Styles.illustrationWrapper, { backgroundColor: '#ffebee', width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="lock-closed-outline" size={60} color="#dc3545" />
                    </View>
                    <Text style={[Styles.h1, { textAlign: 'center', marginTop: 24, marginBottom: 12, color: '#dc3545' }]}>
                        Quyền truy cập bị từ chối
                    </Text>
                    <Text style={[Styles.body, { textAlign: 'center', marginBottom: 30, paddingHorizontal: 15 }]}>
                        Tài khoản hiện tại của bạn là <Text style={{ fontWeight: 'bold' }}>Học viên</Text>. Chức năng tạo khóa học mới chỉ khả dụng đối với vai trò <Text style={{ fontWeight: 'bold', color: '#1877F2' }}>Giảng viên</Text> của hệ thống eCourse.
                    </Text>
                    <TouchableOpacity style={Styles.btnSecondary} onPress={() => navigation.goBack()}>
                        <Text style={Styles.btnSecondaryText}>Quay lại trang cá nhân</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    // 3. Trường hợp: Giảng viên hợp lệ -> Hiển thị biểu mẫu Tạo Khóa học
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={Styles.container}>
            <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
                <View style={Styles.formContainer}>
                    <Text style={[Styles.h2, { marginBottom: 20, color: '#212529' }]}>
                        {course ? 'Chỉnh sửa khóa học ' : 'Thông tin khóa học mới 🎓'}
                    </Text>

                    <View 
                        style={Styles.formGroup}
                        onLayout={(e) => formPositions.current['subject'] = e.nativeEvent.layout.y}
                    >
                        <Text style={Styles.formLabel}>Tên khóa học <Text style={{ color: '#dc3545' }}>*</Text></Text>
                        <TextInput
                            value={subject}
                            onChangeText={setSubject}
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollTo({ 
                                        y: formPositions.current['subject'] || 0,
                                        animated: true 
                                    });
                                }, 200);
                            }}
                            mode="outlined"
                            style={{ backgroundColor: '#ffffff' }}
                            placeholder="Ví dụ: React Native cơ bản"
                            placeholderTextColor="#adb5bd"
                            outlineColor="#dee2e6"
                            activeOutlineColor="#1877F2"
                            disabled={submitting || deleteLoading}
                            maxLength={255}
                            left={<TextInput.Icon icon="book-open-variant" />}
                        />
                    </View>

                    <View style={Styles.formGroup}>
                        <Text style={Styles.formLabel}>Danh mục khóa học <Text style={{ color: '#dc3545' }}>*</Text></Text>
                        <TouchableOpacity
                            style={Styles.categorySelector}
                            onPress={() => !(submitting || deleteLoading) && setCategoryModalVisible(true)}
                            activeOpacity={0.8}
                            disabled={submitting || deleteLoading}
                        >
                            {categoryId ? (
                                <Text style={Styles.categorySelectorText}>{categoryName}</Text>
                            ) : (
                                <Text style={Styles.categoryPlaceholderText}>Chọn danh mục đào tạo</Text>
                            )}
                            <Ionicons name="chevron-down-outline" size={20} color="#6c757d" />
                        </TouchableOpacity>
                    </View>

                    <View 
                        style={Styles.formGroup}
                        onLayout={(e) => formPositions.current['fee'] = e.nativeEvent.layout.y}
                    >
                        <Text style={Styles.formLabel}>Học phí (VND)</Text>
                        <TextInput
                            value={fee}
                            onChangeText={setFee}
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollTo({ 
                                        y: formPositions.current['fee'] || 0,
                                        animated: true 
                                    });
                                }, 200);
                            }}
                            mode="outlined"
                            style={{ backgroundColor: '#ffffff' }}
                            placeholder="Nhập số tiền hoặc bỏ trống nếu miễn phí"
                            placeholderTextColor="#adb5bd"
                            keyboardType="numeric"
                            outlineColor="#dee2e6"
                            activeOutlineColor="#1877F2"
                            disabled={submitting || deleteLoading}
                            left={<TextInput.Icon icon="cash-multiple" />}
                        />
                    </View>

                    <View 
                        style={Styles.formGroup}
                        onLayout={(e) => formPositions.current['description'] = e.nativeEvent.layout.y}
                    >
                        <Text style={Styles.formLabel}>Mô tả khóa học</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollTo({ 
                                        y: formPositions.current['description'] || 0,
                                        animated: true 
                                    });
                                }, 200);
                            }}
                            mode="outlined"
                            style={{ backgroundColor: '#ffffff', minHeight: 100 }}
                            placeholder="Mô tả tóm tắt nội dung khóa học và đối tượng người học..."
                            placeholderTextColor="#adb5bd"
                            outlineColor="#dee2e6"
                            activeOutlineColor="#1877F2"
                            multiline={true}
                            numberOfLines={4}
                            disabled={submitting || deleteLoading}
                            left={<TextInput.Icon icon="text-box-outline" />}
                        />
                    </View>

                    <View style={Styles.formGroup}>
                        <Text style={Styles.formLabel}>Ảnh bìa khóa học</Text>
                        <TouchableOpacity
                            style={[Styles.imagePickerBox, imageUri && Styles.imagePickerActive]}
                            onPress={handlePickImage}
                            disabled={submitting || deleteLoading}
                        >
                            {imageUri ? (
                                <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                                    <Image source={{ uri: imageUri }} style={Styles.imagePreview} />
                                    <View style={{
                                        position: 'absolute', bottom: 10, right: 10,
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)', paddingHorizontal: 10,
                                        paddingVertical: 5, borderRadius: 6
                                    }}>
                                        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>Thay đổi ảnh</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <Ionicons name="image-outline" size={40} color="#888888" style={{ marginBottom: 8 }} />
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333333' }}>Chọn ảnh bìa thiết kế</Text>
                                    <Text style={{ fontSize: 12, color: '#888888', marginTop: 2 }}>Tỷ lệ tối ưu 16:9</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginTop: 10 }}>
                        <Button
                            mode="contained"
                            onPress={handleCreateCourse}
                            style={{ backgroundColor: '#1877F2', borderRadius: 8, paddingVertical: 4 }}
                            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                            loading={submitting}
                            disabled={submitting || deleteLoading}
                        >
                            {course ? 'Cập nhật khóa học' : 'Tạo khóa học mới'}
                        </Button>
                    </View>

                    {/* Chỉ hiện nút XÓA khi đang ở chế độ CHỈNH SỬA (có tồn tại course) */}
                    {course && (
                        <View style={{ marginTop: 16 }}>
                            <Button
                                mode="contained"
                                onPress={handleDelete}
                                style={{ backgroundColor: '#dc3545', borderRadius: 8, paddingVertical: 4 }}
                                labelStyle={{ fontSize: 16, fontWeight: 'bold', color: '#ffffff' }}
                                loading={deleteLoading}
                                disabled={submitting || deleteLoading}
                                icon="delete-outline"
                            >
                                Xóa khóa học
                            </Button>
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal visible={categoryModalVisible} transparent={true} animationType="fade" onRequestClose={() => setCategoryModalVisible(false)}>
                <View style={Styles.modalOverlay}>
                    <View style={Styles.modalContainer}>
                        <View style={Styles.modalHeader}>
                            <Text style={Styles.modalTitle}>Chọn danh mục</Text>
                            <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </TouchableOpacity>
                        </View>
                        {loading ? (
                            <ActivityIndicator size="small" color="#1877F2" style={{ paddingVertical: 20 }} />
                        ) : (
                            <FlatList
                                data={categories}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => {
                                    const isSelected = categoryId === item.id;
                                    return (
                                        <TouchableOpacity style={Styles.modalItem} onPress={() => handleSelectCategory(item)}>
                                            <Text style={[Styles.modalItemText, isSelected && Styles.modalItemTextActive]}>
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                                contentContainerStyle={{ paddingBottom: 10 }}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

export default CourseForm;