import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { authApis, endpoints } from '../../configs/Apis';
import { MyUserContext } from '../../configs/Contexts';
import Styles from './Styles';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const PaymentDetail = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const [user] = useContext(MyUserContext);
    const { paymentId } = route.params;

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const loadPaymentDetail = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
                return;
            }
            const res = await authApis(token).get(endpoints['payment-details'](paymentId));
            setPayment(res.data);
        } catch (ex) {
            console.error("Lỗi tải chi tiết giao dịch:", ex);
            Alert.alert("Lỗi", "Không thể tải thông tin chi tiết giao dịch lúc này.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPaymentDetail();
    }, [paymentId]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleConfirmCash = async () => {
        Alert.alert(
            "Xác nhận đóng tiền",
            "Bạn có chắc chắn đã thu tiền mặt của học viên cho khóa học này?",
            [
                { text: "Hủy bỏ", style: "cancel" },
                {
                    text: "Đã thu tiền",
                    onPress: async () => {
                        try {
                            setSubmitting(true);
                            const token = await AsyncStorage.getItem('token');
                            if (!token) {
                                Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
                                return;
                            }
                            
                            await authApis(token).post(endpoints['payment-confirm-cash'](paymentId));
                            Alert.alert("Thành công", "Đã xác nhận thanh toán tiền mặt thành công. Học viên hiện có thể truy cập khóa học.");
                            loadPaymentDetail(); // Reload lại dữ liệu mới nhất
                        } catch (ex) {
                            console.error("Lỗi xác nhận tiền mặt:", ex);
                            Alert.alert("Thất bại", ex.response?.data?.detail || "Không thể xác nhận đóng tiền mặt lúc này.");
                        } finally {
                            setSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                <ActivityIndicator size="large" color="#0d6efd" />
                <Text style={{ marginTop: 10, color: '#6c757d' }}>Đang tải hóa đơn chi tiết...</Text>
            </View>
        );
    }

    if (!payment) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 20 }}>
                <Ionicons name="alert-circle-outline" size={64} color="#dc3545" />
                <Text style={{ marginTop: 16, color: '#212529', fontSize: 16, fontWeight: 'bold' }}>Không tìm thấy hóa đơn</Text>
                <Text style={{ color: '#6c757d', textAlign: 'center', marginTop: 8 }}>Hóa đơn này hoàn toàn không tồn tại hoặc bạn không có quyền xem.</Text>
                <TouchableOpacity style={[Styles.btnPrimary, { marginTop: 20, width: '60%' }]} onPress={() => navigation.goBack()}>
                    <Text style={Styles.btnPrimaryText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isSuccess = payment.is_successful;
    const statusColor = isSuccess ? '#198754' : '#f59e0b';
    const statusText = isSuccess ? 'Thành công' : 'Đang chờ thanh toán / Thất bại';
    const iconName = isSuccess ? 'checkmark-circle' : 'time';

    const role = user?.role?.toUpperCase() || 'STUDENT';
    const isAdmin = role === 'ADMIN';
    const isInstructor = role === 'INSTRUCTOR';

    // Điều kiện hiển thị nút xác nhận tiền mặt (Chỉ dành cho Giảng viên/Admin và Giao dịch chưa thành công)
    const canConfirmPayment = (isAdmin || isInstructor) && !isSuccess;

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header Hóa đơn (Status) */}
            <View style={localStyles.headerSection}>
                <Ionicons name={iconName} size={64} color={statusColor} />
                <Text style={[localStyles.statusLabel, { color: statusColor }]}>{statusText}</Text>
                <Text style={localStyles.amountText}>{formatCurrency(payment.amount)}</Text>
                <Text style={{ fontSize: 13, color: '#888888', marginTop: 4 }}>
                    Ngày tạo: {moment(payment.created_date).format('DD/MM/YYYY HH:mm')}
                </Text>
            </View>

            {/* Chi tiết Khóa học */}
            <View style={[Styles.card, { marginHorizontal: 16, padding: 16 }]}>
                <Text style={localStyles.sectionTitle}>Thông tin khóa học</Text>
                <View style={Styles.row}>
                    {payment.course_image ? (
                        <Image source={{ uri: payment.course_image }} style={localStyles.courseImage} />
                    ) : (
                        <View style={[localStyles.courseImage, { backgroundColor: '#e9ecef', justifyContent: 'center', alignItems: 'center' }]}>
                            <Ionicons name="book-outline" size={24} color="#adb5bd" />
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={localStyles.courseSubject}>{payment.course_subject || 'Đang cập nhật...'}</Text>
                        <Text style={{ fontSize: 13, color: '#6c757d', marginTop: 2 }}>
                            Giảng viên: {payment.instructor_name || 'Đang cập nhật...'}
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0d6efd', marginTop: 4 }}>
                            Học phí gốc: {formatCurrency(payment.course_fee || payment.amount)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Chi tiết Người mua (Chỉ hiển thị cho Giảng viên / Admin) */}
            {(isAdmin || isInstructor) && (
                <View style={[Styles.card, { marginHorizontal: 16, padding: 16 }]}>
                    <Text style={localStyles.sectionTitle}>Thông tin học viên</Text>
                    <View style={localStyles.infoRow}>
                        <Text style={localStyles.infoLabel}>Họ và tên</Text>
                        <Text style={localStyles.infoValue}>{payment.student_name || 'Chưa xác định'}</Text>
                    </View>
                    <View style={localStyles.infoRow}>
                        <Text style={localStyles.infoLabel}>Email</Text>
                        <Text style={localStyles.infoValue}>{payment.student_email || 'Chưa xác định'}</Text>
                    </View>
                </View>
            )}

            {/* Chi tiết Giao dịch */}
            <View style={[Styles.card, { marginHorizontal: 16, padding: 16 }]}>
                <Text style={localStyles.sectionTitle}>Thông tin giao dịch</Text>
                <View style={localStyles.infoRow}>
                    <Text style={localStyles.infoLabel}>Phương thức</Text>
                    <Text style={localStyles.infoValue}>{payment.payment_method || 'Chưa xác định'}</Text>
                </View>
                <View style={localStyles.infoRow}>
                    <Text style={localStyles.infoLabel}>Mã giao dịch</Text>
                    <Text style={[localStyles.infoValue, { color: '#6c757d' }]}>{payment.transaction_id || 'Chưa phát sinh'}</Text>
                </View>
                <View style={[localStyles.infoRow, { borderBottomWidth: 0 }]}>
                    <Text style={localStyles.infoLabel}>Mã hóa đơn</Text>
                    <Text style={localStyles.infoValue}>#INV-{payment.id}</Text>
                </View>
            </View>

            {/* Nút hành động xác nhận Tiền mặt */}
            {canConfirmPayment && (
                <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
                    <TouchableOpacity 
                        style={[Styles.btnPrimary, { backgroundColor: '#198754', flexDirection: 'row', justifyContent: 'center' }, submitting && { opacity: 0.7 }]}
                        onPress={handleConfirmCash}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                        ) : (
                            <Ionicons name="cash-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                        )}
                        <Text style={Styles.btnPrimaryText}>Xác nhận đóng tiền mặt</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const localStyles = StyleSheet.create({
    headerSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderColor: '#dee2e6',
        marginBottom: 20,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    amountText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#212529',
        marginTop: 6,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#888888',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
    },
    courseImage: {
        width: 75,
        height: 75,
        borderRadius: 8,
        marginRight: 14,
    },
    courseSubject: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#212529',
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6c757d',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212529',
    },
});

export default PaymentDetail;
