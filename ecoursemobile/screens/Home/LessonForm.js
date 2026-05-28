import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from '../../configs/Contexts';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import Styles from './Styles';
import theme from '../../styles/theme';

// Màn hình thêm mới hoặc chỉnh sửa bài giảng (dành cho Giảng viên)
const LessonForm = ({ route, navigation }) => {
    const [user] = useContext(MyUserContext);
    const { courseId, lesson } = route?.params || {};

    const scrollViewRef = useRef(null);
    const formPositions = useRef({});

    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isPreview, setIsPreview] = useState(false);
    const [imageUri, setImageUri] = useState(null);
    const [videoUri, setVideoUri] = useState(null);

    const [tags, setTags] = useState([]);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [loadingTags, setLoadingTags] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const loadTags = async () => {
        try {
            setLoadingTags(true);
            const token = await AsyncStorage.getItem('token');
            let res;
            if (token) {
                res = await authApis(token).get(endpoints['tags']);
            } else {
                res = await Apis.get(endpoints['tags']);
            }
            setTags(res.data.results || res.data || []);
        } catch (ex) {
            console.error("Lỗi lấy danh sách nhãn:", ex);
            Alert.alert("Lỗi", "Không thể tải danh sách nhãn bài học.");
        } finally {
            setLoadingTags(false);
        }
    };

    useEffect(() => {
        if (user && (user.role === 'INSTRUCTOR' || user.role === 'ADMIN')) {
            setLoading(false);
            loadTags();
        } else {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (lesson) {
            setSubject(lesson.subject || '');
            setContent(lesson.content || '');
            setIsPreview(!!lesson.is_preview);
            if (lesson.image) setImageUri(lesson.image);
            if (lesson.video) setVideoUri(lesson.video);
            if (lesson.tags) setSelectedTagIds(lesson.tags.map(t => t.id));
        }
    }, [lesson]);

    useEffect(() => {
        navigation.setOptions({
            title: lesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'
        });
    }, [lesson, navigation]);

    // Hàm xử lý xin quyền và mở thư viện ảnh để chọn ảnh bìa minh họa cho bài học
    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Quyền truy cập', 'eCourse cần quyền truy cập thư viện ảnh để tải lên ảnh minh họa bài học.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.9,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImageUri(result.assets[0].uri);
            }
        } catch (err) {
            console.error("Lỗi chọn ảnh bài học:", err);
            Alert.alert("Lỗi", "Không thể chọn hình ảnh minh họa.");
        }
    };

    // Hàm xử lý xin quyền và mở thư viện video để tải lên video bài giảng
    const handlePickVideo = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Quyền truy cập', 'eCourse cần quyền truy cập thư viện để tải lên video bài học.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'videos',
                allowsEditing: true,
                quality: 0.9,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setVideoUri(result.assets[0].uri);
            }
        } catch (err) {
            console.error("Lỗi chọn video bài học:", err);
            Alert.alert("Lỗi", "Không thể chọn video bài học.");
        }
    };

    const handleToggleTag = (tagId) => {
        setSelectedTagIds(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    // Hàm xử lý tạo mới hoặc cập nhật thông tin bài học lên server
    const handleSaveLesson = async () => {
        if (!subject || !subject.trim()) {
            Alert.alert("Lỗi nhập liệu", "Vui lòng nhập tên bài học.");
            return;
        }

        if (!content || !content.trim()) {
            Alert.alert("Lỗi nhập liệu", "Vui lòng nhập mô tả chi tiết bài học.");
            return;
        }

        if (!lesson && !courseId) {
            Alert.alert("Lỗi", "Thiếu ID khóa học. Không thể thêm bài học.");
            return;
        }

        try {
            setSubmitting(true);
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const formData = new FormData();
                formData.append('subject', subject.trim());
                formData.append('content', content.trim());
                formData.append('is_preview', isPreview.toString());

                selectedTagIds.forEach(id => {
                    formData.append('tag_ids', id.toString());
                });

                if (imageUri && imageUri.startsWith('file://')) {
                    const filename = imageUri.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image/jpeg`;

                    formData.append('image', {
                        uri: imageUri,
                        name: filename || 'lesson_cover.jpg',
                        type: type,
                    });
                }

                if (videoUri && videoUri.startsWith('file://')) {
                    const filename = videoUri.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `video/${match[1]}` : `video/mp4`;

                    formData.append('video', {
                        uri: videoUri,
                        name: filename || 'lesson_video.mp4',
                        type: type,
                    });
                }

                if (lesson) {
                    await authApis(token).patch(endpoints['lesson-details'](lesson.id), formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });

                    Alert.alert("Thành công", "Cập nhật bài học thành công!", [
                        { text: "OK", onPress: () => navigation.goBack() }
                    ]);
                } else {
                    const response = await authApis(token).post(endpoints['course-lessons'](courseId), formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });

                    Alert.alert("Thành công", `Bài học "${response.data.subject}" đã được thêm thành công!`, [
                        { text: "OK", onPress: () => navigation.goBack() }
                    ]);
                }
            } else {
                Alert.alert("Lỗi xác thực", "Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
            }
        } catch (error) {
            console.error("Lỗi gửi dữ liệu bài học:", error);
            let errMsg = lesson ? "Không thể cập nhật bài học. Vui lòng kiểm tra lại." : "Không thể thêm bài học mới. Vui lòng kiểm tra lại.";

            if (error.response && error.response.data) {
                const data = error.response.data;
                if (typeof data === 'object') {
                    const errors = [];
                    for (const key in data) {
                        const errorLabel = key === 'subject' ? 'Tên bài học' : (key === 'content' ? 'Nội dung' : key);
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
            Alert.alert(lesson ? "Cập nhật thất bại" : "Thêm bài học thất bại", errMsg);
        } finally {
            setSubmitting(false);
        }
    };



    if (loading && !user) {
        return (
            <View style={Styles.applyLoadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={Styles.applyLoadingText}>Đang xác thực thông tin...</Text>
            </View>
        );
    }

    if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
        return (
            <ScrollView style={[Styles.container, { padding: 20 }]} showsVerticalScrollIndicator={false}>
                <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                    <View style={[Styles.illustrationWrapper, { backgroundColor: '#ffebee', width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="lock-closed-outline" size={60} color={theme.colors.danger} />
                    </View>
                    <Text style={[Styles.h1, { textAlign: 'center', marginTop: 24, marginBottom: 12, color: theme.colors.danger }]}>
                        Quyền truy cập bị từ chối
                    </Text>
                    <Text style={[Styles.body, { textAlign: 'center', marginBottom: 30, paddingHorizontal: 15 }]}>
                        Chức năng thêm bài học mới chỉ khả dụng đối với vai trò <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>Giảng viên</Text> hoặc <Text style={{ fontWeight: 'bold' }}>Quản trị viên</Text> của hệ thống eCourse.
                    </Text>
                    <TouchableOpacity style={Styles.btnSecondary} onPress={() => navigation.goBack()}>
                        <Text style={Styles.btnSecondaryText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={Styles.container}>
            <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
                <View style={Styles.formContainer}>
                    <Text style={[Styles.h2, { marginBottom: 20, color: theme.colors.text }]}>
                        {lesson ? 'Chỉnh sửa bài học 📝' : 'Bài học mới 📝'}
                    </Text>

                    <View
                        style={Styles.formGroup}
                        onLayout={(e) => formPositions.current['subject'] = e.nativeEvent.layout.y}
                    >
                        <Text style={Styles.formLabel}>Tên bài học <Text style={{ color: theme.colors.danger }}>*</Text></Text>
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
                            style={{ backgroundColor: theme.colors.white }}
                            placeholder="Ví dụ: Giới thiệu và thiết lập môi trường"
                            placeholderTextColor="#adb5bd"
                            outlineColor={theme.colors.border}
                            activeOutlineColor={theme.colors.primary}
                            disabled={submitting}
                            maxLength={255}
                            left={<TextInput.Icon icon="book-open-outline" />}
                        />
                    </View>

                    <View
                        style={Styles.formGroup}
                        onLayout={(e) => formPositions.current['content'] = e.nativeEvent.layout.y}
                    >
                        <Text style={Styles.formLabel}>Mô tả / Nội dung bài học <Text style={{ color: theme.colors.danger }}>*</Text></Text>
                        <TextInput
                            value={content}
                            onChangeText={setContent}
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollTo({
                                        y: formPositions.current['content'] || 0,
                                        animated: true
                                    });
                                }, 200);
                            }}
                            mode="outlined"
                            style={{ backgroundColor: theme.colors.white, minHeight: 120 }}
                            placeholder="Mô tả chi tiết nội dung của bài học..."
                            placeholderTextColor="#adb5bd"
                            outlineColor={theme.colors.border}
                            activeOutlineColor={theme.colors.primary}
                            multiline={true}
                            numberOfLines={5}
                            disabled={submitting}
                            left={<TextInput.Icon icon="text-box-outline" />}
                        />
                    </View>

                    <View style={[Styles.formGroup, {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: theme.colors.secondary,
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        marginBottom: 20
                    }]}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={[Styles.formLabel, { marginBottom: 2 }]}>Học thử miễn phí</Text>
                            <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Bài học này sẽ mở khóa công khai cho tất cả mọi người học thử.</Text>
                        </View>
                        <Switch
                            value={isPreview}
                            onValueChange={setIsPreview}
                            trackColor={{ false: theme.colors.border, true: "#a0c4ff" }}
                            thumbColor={isPreview ? theme.colors.primary : "#f4f3f4"}
                        />
                    </View>

                    {/* Gán nhãn cho bài học (Tags) */}
                    <View style={Styles.formGroup}>
                        <Text style={Styles.formLabel}>Gán nhãn bài học (Tags)</Text>
                        {loadingTags ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} style={{ paddingVertical: 10 }} />
                        ) : (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                                {tags.map(tag => {
                                    const isSelected = selectedTagIds.includes(tag.id);
                                    return (
                                        <TouchableOpacity
                                            key={tag.id}
                                            style={{
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                                borderRadius: 20,
                                                backgroundColor: isSelected ? '#e8f0fe' : theme.colors.secondary,
                                                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                                                borderWidth: 1,
                                                marginBottom: 8,
                                                marginRight: 8
                                            }}
                                            onPress={() => handleToggleTag(tag.id)}
                                            activeOpacity={0.7}
                                            disabled={submitting}
                                        >
                                            <Text style={{
                                                color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                                                fontWeight: isSelected ? 'bold' : 'normal',
                                                fontSize: 13
                                            }}>
                                                #{tag.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <View style={Styles.formGroup}>
                        <Text style={Styles.formLabel}>Ảnh minh họa bài học</Text>
                        <TouchableOpacity
                            style={[Styles.imagePickerBox, imageUri && Styles.imagePickerActive]}
                            onPress={handlePickImage}
                            disabled={submitting}
                        >
                            {imageUri ? (
                                <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                                    <Image source={{ uri: imageUri }} style={Styles.imagePreview} />
                                    <View style={{
                                        position: 'absolute', bottom: 10, right: 10,
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)', paddingHorizontal: 10,
                                        paddingVertical: 5, borderRadius: 6
                                    }}>
                                        <Text style={{ color: theme.colors.white, fontSize: 12, fontWeight: 'bold' }}>Thay đổi ảnh</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <Ionicons name="image-outline" size={40} color="#888888" style={{ marginBottom: 8 }} />
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text }}>Chọn ảnh minh họa</Text>
                                    <Text style={{ fontSize: 12, color: '#888888', marginTop: 2 }}>Tỷ lệ tối ưu 16:9</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={Styles.formGroup}>
                        <Text style={Styles.formLabel}>Video bài học</Text>
                        <TouchableOpacity
                            style={[Styles.imagePickerBox, videoUri && Styles.imagePickerActive]}
                            onPress={handlePickVideo}
                            disabled={submitting}
                        >
                            {videoUri ? (
                                <View style={{ alignItems: 'center', padding: 20 }}>
                                    <Ionicons name="videocam" size={40} color={theme.colors.success} style={{ marginBottom: 8 }} />
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.success, textAlign: 'center' }}>Video đã chọn thành công!</Text>
                                    <Text style={{ fontSize: 12, color: '#888888', marginTop: 4, textAlign: 'center' }} numberOfLines={1}>
                                        {videoUri.split('/').pop()}
                                    </Text>
                                    <View style={{
                                        marginTop: 12,
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)', paddingHorizontal: 12,
                                        paddingVertical: 6, borderRadius: 6
                                    }}>
                                        <Text style={{ color: theme.colors.white, fontSize: 12, fontWeight: 'bold' }}>Thay đổi video</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <Ionicons name="videocam-outline" size={40} color="#888888" style={{ marginBottom: 8 }} />
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text }}>Chọn video bài giảng</Text>
                                    <Text style={{ fontSize: 12, color: '#888888', marginTop: 2 }}>Hỗ trợ các định dạng mp4, mov, avi...</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginTop: 10 }}>
                        <Button
                            mode="contained"
                            onPress={handleSaveLesson}
                            style={{ backgroundColor: theme.colors.primary, borderRadius: 8, paddingVertical: 4 }}
                            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                            loading={submitting}
                            disabled={submitting}
                        >
                            {lesson ? 'Cập nhật bài học' : 'Tạo bài học mới'}
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LessonForm;
