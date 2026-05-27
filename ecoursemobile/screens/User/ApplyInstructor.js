import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from '../../configs/Contexts';
import { authApis, endpoints } from '../../configs/Apis';
import Styles from './Styles';

const ApplyInstructor = ({ navigation }) => {
    const [user] = useContext(MyUserContext);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [cvFile, setCvFile] = useState(null);

    const loadApplication = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        if (user.role !== 'STUDENT') {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const res = await authApis(token).get(endpoints['apply-instructor']);
                setApplication(res.data);
            }
        } catch (ex) {
            if (ex.response && ex.response.status === 404) {
                setApplication(null);
            } else {
                console.error("Lỗi lấy thông tin ứng tuyển:", ex);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplication();
    }, [user]);

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ],
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                // Kiểm tra kích thước file (tối đa 10MB)
                if (file.size && file.size > 10 * 1024 * 1024) {
                    Alert.alert("Lỗi tệp tin", "Kích thước tệp tin không được vượt quá 10MB.");
                    return;
                }
                setCvFile(file);
            }
        } catch (err) {
            console.error("Lỗi chọn tài liệu:", err);
            Alert.alert("Lỗi", "Không thể chọn tài liệu. Vui lòng thử lại.");
        }
    };

    const handleUploadCV = async () => {
        if (!cvFile) {
            Alert.alert("Lỗi", "Vui lòng chọn tệp CV trước khi nộp đơn.");
            return;
        }

        try {
            setSubmitting(true);
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const formData = new FormData();

                // Trích xuất tên tệp và định dạng tệp phù hợp cho React Native FormData
                const fileUri = cvFile.uri;
                const fileName = cvFile.name || 'cv.pdf';
                let fileType = cvFile.mimeType;

                if (!fileType) {
                    const ext = fileName.split('.').pop().toLowerCase();
                    if (ext === 'pdf') fileType = 'application/pdf';
                    else if (ext === 'doc') fileType = 'application/msword';
                    else if (ext === 'docx') fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    else fileType = 'application/octet-stream';
                }

                formData.append('cv_file', {
                    uri: fileUri,
                    name: fileName,
                    type: fileType
                });

                const res = await authApis(token).post(endpoints['apply-instructor'], formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                Alert.alert(
                    "Thành công",
                    "Đơn đăng ký làm giảng viên của bạn đã được gửi thành công. Vui lòng chờ quản trị viên phê duyệt.",
                    [{ text: "Đồng ý", onPress: () => loadApplication() }]
                );
                setCvFile(null);
            }
        } catch (ex) {
            console.error("Lỗi nộp CV:", ex);
            let msg = "Gửi hồ sơ thất bại. Vui lòng thử lại.";
            if (ex.response && ex.response.data && ex.response.data.detail) {
                msg = ex.response.data.detail;
            }
            Alert.alert("Lỗi", msg);
        } finally {
            setSubmitting(false);
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING':
                return 'Đang chờ duyệt';
            case 'APPROVED':
                return 'Đã duyệt';
            case 'REJECTED':
                return 'Đã từ chối';
            default:
                return 'Chưa xác định';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return '#ff9800'; // Amber
            case 'APPROVED':
                return '#4caf50'; // Green
            case 'REJECTED':
                return '#f44336'; // Red
            default:
                return '#9e9e9e';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return 'time-outline';
            case 'APPROVED':
                return 'checkmark-circle-outline';
            case 'REJECTED':
                return 'close-circle-outline';
            default:
                return 'help-circle-outline';
        }
    };

    if (loading) {
        return (
            <View style={Styles.applyLoadingContainer}>
                <ActivityIndicator size="large" color="#1877F2" />
                <Text style={Styles.applyLoadingText}>Đang tải thông tin hồ sơ...</Text>
            </View>
        );
    }

    // Trường hợp đã là Giảng viên hoặc Admin
    if (user && user.role !== 'STUDENT') {
        return (
            <ScrollView style={[Styles.container, { padding: 20 }]}>
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <View style={Styles.illustrationWrapper}>
                        <Ionicons name="ribbon-outline" size={60} color="#4caf50" />
                    </View>
                    <Text style={[Styles.h1, { textAlign: 'center', marginTop: 20, marginBottom: 10 }]}>Tài khoản đặc quyền</Text>
                    <Text style={[Styles.body, { textAlign: 'center', marginBottom: 20, paddingHorizontal: 10 }]}>
                        Tài khoản của bạn đang giữ vai trò là <Text style={{ fontWeight: 'bold', color: '#4caf50' }}>{user.role === 'INSTRUCTOR' ? 'Giảng viên' : 'Quản trị viên'}</Text>. Bạn có toàn bộ quyền giảng dạy trên hệ thống.
                    </Text>
                    <TouchableOpacity style={Styles.btnSecondary} onPress={() => navigation.goBack()}>
                        <Text style={Styles.btnSecondaryText}>Quay lại trang cá nhân</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={[Styles.container, { padding: 20 }]} showsVerticalScrollIndicator={false}>
            {/* Header giới thiệu */}
            <View style={Styles.applyHeader}>
                <Text style={Styles.applySubtitle}>
                    Hãy đồng hành cùng eCourse để chia sẻ tri thức và xây dựng cộng đồng học tập trực tuyến năng động.
                </Text>
            </View>

            {/* CHƯA NỘP CV NÀO (application === null do API GET trả về 404) */}
            {application === null ? (
                <View style={Styles.card}>
                    <Text style={[Styles.title, { marginBottom: 12 }]}>Quyền lợi giảng viên</Text>

                    <View style={Styles.applyBenefitList}>
                        <View style={Styles.applyBenefitItem}>
                            <Ionicons name="cash-outline" size={20} color="#1877F2" style={Styles.applyBenefitIcon} />
                            <View style={Styles.applyBenefitText}>
                                <Text style={Styles.applyBenefitTitle}>Thu nhập hấp dẫn</Text>
                                <Text style={Styles.applyBenefitDesc}>Nhận chia sẻ doanh thu từ các học viên đăng ký tham gia khóa học của bạn.</Text>
                            </View>
                        </View>

                        <View style={Styles.applyBenefitItem}>
                            <Ionicons name="people-outline" size={20} color="#1877F2" style={Styles.applyBenefitIcon} />
                            <View style={Styles.applyBenefitText}>
                                <Text style={Styles.applyBenefitTitle}>Xây dựng danh tiếng</Text>
                                <Text style={Styles.applyBenefitDesc}>Tiếp cận hàng nghìn học viên và định hình thương hiệu giảng dạy cá nhân.</Text>
                            </View>
                        </View>

                        <View style={Styles.applyBenefitItem}>
                            <Ionicons name="easel-outline" size={20} color="#1877F2" style={Styles.applyBenefitIcon} />
                            <View style={Styles.applyBenefitText}>
                                <Text style={Styles.applyBenefitTitle}>Công cụ quản lý bài bản</Text>
                                <Text style={Styles.applyBenefitDesc}>Hệ thống đăng bài giảng, thống kê doanh thu và bài học trực quan chuyên nghiệp.</Text>
                            </View>
                        </View>
                    </View>

                    <View style={Styles.divider} />

                    <Text style={[Styles.body, { marginBottom: 16, fontSize: 13 }]}>
                        * Vui lòng tải lên hồ sơ CV cá nhân dạng PDF hoặc Word (tối đa 10MB) mô tả kinh nghiệm giảng dạy và kỹ năng của bạn.
                    </Text>

                    {/* Hộp chọn File CV */}
                    <TouchableOpacity
                        style={[Styles.filePickerBox, cvFile && Styles.filePickerBoxActive]}
                        onPress={handlePickDocument}
                        disabled={submitting}
                    >
                        {cvFile ? (
                            <View style={Styles.selectedFileWrapper}>
                                <Ionicons name="document-text" size={40} color="#1877F2" />
                                <View style={Styles.fileDetails}>
                                    <Text style={Styles.fileName} numberOfLines={1}>{cvFile.name}</Text>
                                    <Text style={Styles.fileSize}>{formatBytes(cvFile.size)}</Text>
                                </View>
                                <TouchableOpacity style={Styles.btnChangeFile} onPress={handlePickDocument} disabled={submitting}>
                                    <Text style={Styles.btnChangeFileText}>Đổi file</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={Styles.pickerPlaceholder}>
                                <Ionicons name="cloud-upload-outline" size={40} color="#888888" style={{ marginBottom: 8 }} />
                                <Text style={Styles.pickerTextBold}>Chọn tệp tin CV</Text>
                                <Text style={Styles.pickerTextSubtitle}>Hỗ trợ PDF, DOC, DOCX tối đa 10MB</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Nút gửi CV */}
                    <TouchableOpacity
                        style={[Styles.btnPrimary, !cvFile && Styles.btnPrimaryDisabled]}
                        onPress={handleUploadCV}
                        disabled={!cvFile || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <>
                                <Ionicons name="send" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                                <Text style={Styles.btnPrimaryText}>Gửi hồ sơ ứng tuyển</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                /* ĐÃ NỘP ĐƠN (application !== null) */
                <View style={Styles.card}>
                    <View style={Styles.statusHeaderRow}>
                        <Text style={Styles.statusMainLabel}>Thông tin đơn ứng tuyển</Text>
                        <View style={[Styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                            <Ionicons name={getStatusIcon(application.status)} size={14} color="#ffffff" style={{ marginRight: 4 }} />
                            <Text style={Styles.statusBadgeText}>{getStatusText(application.status)}</Text>
                        </View>
                    </View>

                    <View style={[Styles.statusMessageCard, { borderLeftColor: getStatusColor(application.status) }]}>
                        {application.status === 'PENDING' && (
                            <Text style={Styles.statusMessageText}>
                                eCourse đã nhận được hồ sơ CV đăng ký của bạn và đang tiến hành xem xét. Kết quả xét duyệt sẽ sớm được cập nhật tại màn hình này. Cảm ơn sự nhiệt huyết của bạn!
                            </Text>
                        )}
                        {application.status === 'APPROVED' && (
                            <Text style={Styles.statusMessageText}>
                                Chúc mừng! Hồ sơ ứng tuyển làm Giảng viên của bạn đã được phê duyệt. Vui lòng đăng xuất và đăng nhập lại tài khoản để hệ thống kích hoạt đầy đủ các tính năng giảng dạy của bạn.
                            </Text>
                        )}
                        {application.status === 'REJECTED' && (
                            <Text style={Styles.statusMessageText}>
                                Rất tiếc, hồ sơ của bạn chưa đáp ứng đủ điều kiện chuyên môn hiện tại của eCourse. Bạn có thể liên hệ admin@ecourse.com nếu có bất kỳ thắc mắc nào.
                            </Text>
                        )}
                    </View>

                    <View style={Styles.submittedCvCard}>
                        <Text style={Styles.submittedCvTitle}>Hồ sơ của bạn:</Text>
                        <TouchableOpacity
                            style={Styles.submittedFileRow}
                            onPress={() => application.cv_file && Linking.openURL(application.cv_file)}
                        >
                            <Ionicons name="document-attach-outline" size={20} color="#1877F2" />
                            <Text style={Styles.submittedFileName} numberOfLines={1}>
                                {application.cv_file ? application.cv_file.split('/').pop() : 'CV_GiangVien.pdf'}
                            </Text>
                            <Ionicons name="open-outline" size={14} color="#1877F2" />
                        </TouchableOpacity>
                        <Text style={Styles.submittedDateText}>
                            Nộp ngày: {new Date(application.created_date).toLocaleDateString('vi-VN')}
                        </Text>
                    </View>

                    <TouchableOpacity style={Styles.btnSecondary} onPress={() => navigation.goBack()}>
                        <Text style={Styles.btnSecondaryText}>Quay lại trang cá nhân</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

export default ApplyInstructor;