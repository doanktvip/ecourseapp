import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Searchbar } from 'react-native-paper';
import { authApis, endpoints } from '../../configs/Apis';
import { MyUserContext } from '../../configs/Contexts';
import Styles from './Styles';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [user] = useContext(MyUserContext);
    const isFocused = useIsFocused();
    const navigation = useNavigation();

    // Phân trang
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);

    // Bộ lọc và tìm kiếm từ Backend
    const [filter, setFilter] = useState('ALL'); // ALL, SUCCESS, PENDING
    const [searchQuery, setSearchQuery] = useState('');

    // Thống kê toàn cục nhận được từ Backend
    const [stats, setStats] = useState({
        totalAmount: 0,
        totalCount: 0,
        totalSuccessfulCount: 0,
        totalPendingCount: 0
    });

    const loadPayments = async (pageNumber = 1, isRefresh = false) => {
        try {
            if (pageNumber === 1) {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }
            } else {
                setLoadingMore(true);
            }

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
                return;
            }

            // Build query params: page, search, and is_successful filter
            let url = `${endpoints['payments']}?page=${pageNumber}`;
            if (searchQuery.trim() !== '') {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }
            if (filter === 'SUCCESS') {
                url += `&is_successful=true`;
            } else if (filter === 'PENDING') {
                url += `&is_successful=false`;
            }

            const res = await authApis(token).get(url);

            // Django DRF paginated response
            const results = res.data.results !== undefined ? res.data.results : (Array.isArray(res.data) ? res.data : []);
            const next = res.data.next;

            if (pageNumber === 1) {
                setPayments(results);
            } else {
                setPayments(prev => [...prev, ...results]);
            }

            setPage(pageNumber);
            setHasNext(!!next);

            // Lưu thống kê toàn cục
            setStats({
                totalAmount: res.data.total_successful_amount || 0,
                totalCount: res.data.count || 0,
                totalSuccessfulCount: res.data.total_successful_count || 0,
                totalPendingCount: res.data.total_pending_count || 0
            });

        } catch (ex) {
            console.error("Lỗi tải lịch sử giao dịch:", ex);
            Alert.alert("Lỗi", "Không thể tải danh sách giao dịch lúc này.");
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    // Tải lại trang 1 mỗi khi thay đổi bộ lọc, tìm kiếm hoặc load lại màn hình
    // Có chế độ trễ 500ms để tránh spam API khi đang gõ phím giống hệt màn hình Home.js
    useEffect(() => {
        if (!isFocused || !user) return;

        const timer = setTimeout(() => {
            loadPayments(1, false);
        }, 500);

        return () => clearTimeout(timer);
    }, [isFocused, user, filter, searchQuery]);

    const handleLoadMore = () => {
        if (!loading && !loadingMore && hasNext) {
            loadPayments(page + 1, false);
        }
    };

    const handleRefresh = () => {
        if (!loading && !refreshing) {
            loadPayments(1, true);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Nếu chưa đăng nhập, hiển thị màn hình cảnh báo đồng bộ với Profile.js
    if (!user) {
        return (
            <View style={Styles.centerContainer}>
                <View style={Styles.iconWrapper}>
                    <Ionicons name="receipt-outline" size={120} color="#adb5bd" />
                </View>
                <Text style={Styles.unauthTitle}>Bạn chưa đăng nhập</Text>
                <Text style={Styles.unauthSubtitle}>
                    Đăng nhập ngay để xem chi tiết lịch sử thanh toán học phí và các giao dịch khóa học của bạn.
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

    // Vai trò người dùng hiện tại
    const role = user?.role?.toUpperCase() || 'STUDENT';
    const isAdmin = role === 'ADMIN';
    const isInstructor = role === 'INSTRUCTOR';

    // 2. Render Header hiển thị thống kê đẹp mắt dựa trên Vai trò người dùng
    const renderHeader = () => {
        const totalOverall = stats.totalSuccessfulCount + stats.totalPendingCount;

        let cardTitle = "Tổng số tiền giao dịch";
        let cardIcon = "wallet-outline";
        let cardColor = ['#0d6efd', '#0043a8']; // Xanh nước biển premium
        let footerLabelLeft = "Số giao dịch";
        let footerValLeft = totalOverall;
        let footerLabelRight = "Thành công";
        let footerValRight = stats.totalSuccessfulCount;

        if (isAdmin) {
            cardTitle = "Tổng doanh thu hệ thống";
            cardIcon = "bar-chart-outline";
            cardColor = ['#198754', '#0f5132']; // Xanh lá cây đậm sang trọng
            footerLabelLeft = "Số giao dịch";
            footerValLeft = totalOverall;
            footerLabelRight = "Tỷ lệ duyệt";
            footerValRight = totalOverall > 0
                ? `${((stats.totalSuccessfulCount / totalOverall) * 100).toFixed(0)}%`
                : '100%';
        } else if (isInstructor) {
            cardTitle = "Tổng thu nhập nhận được";
            cardIcon = "analytics-outline";
            cardColor = ['#6f42c1', '#49108b']; // Tím hoàng gia sang trọng
            footerLabelLeft = "Học viên mua";
            footerValLeft = stats.totalSuccessfulCount;
            footerLabelRight = "Đang chờ duyệt";
            footerValRight = stats.totalPendingCount;
        } else {
            // Học viên
            cardTitle = "Tổng học phí đã thanh toán";
            cardIcon = "receipt-outline";
            cardColor = ['#0d6efd', '#0052cc'];
            footerLabelLeft = "Khóa học đã mua";
            footerValLeft = stats.totalSuccessfulCount;
            footerLabelRight = "Hóa đơn chờ";
            footerValRight = stats.totalPendingCount;
        }

        return (
            <View style={{ backgroundColor: '#f8f9fa' }}>
                {/* Banner Thống kê */}
                <View style={[Styles.paymentSummaryCard, { backgroundColor: cardColor[0] }]}>
                    <View style={[Styles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                        <View>
                            <Text style={Styles.paymentSummaryTitle}>{cardTitle}</Text>
                            <Text style={Styles.paymentSummaryValue}>{formatCurrency(stats.totalAmount)}</Text>
                        </View>
                        <Ionicons name={cardIcon} size={40} color="rgba(255, 255, 255, 0.7)" />
                    </View>

                    <View style={Styles.paymentSummaryFooter}>
                        <View style={Styles.paymentSummaryFooterItem}>
                            <Text style={Styles.paymentSummaryFooterLabel}>{footerLabelLeft}</Text>
                            <Text style={Styles.paymentSummaryFooterValue}>{footerValLeft}</Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                        <View style={Styles.paymentSummaryFooterItem}>
                            <Text style={Styles.paymentSummaryFooterLabel}>{footerLabelRight}</Text>
                            <Text style={Styles.paymentSummaryFooterValue}>{footerValRight}</Text>
                        </View>
                    </View>
                </View>

                {/* Thanh Tìm kiếm (Search bar) bọc thống nhất giống Home.js */}
                {(isAdmin || isInstructor) && (
                    <View style={Styles.searchContainer}>
                        <Searchbar
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={Styles.searchInput}
                            placeholder="Tìm kiếm giao dịch, khóa học, học sinh..."
                        />
                    </View>
                )}

                {/* Thanh bộ lọc trạng thái (ALL, SUCCESS, PENDING) */}
                <View style={Styles.paymentFilterContainer}>
                    <TouchableOpacity
                        style={[Styles.paymentFilterButton, filter === 'ALL' && Styles.paymentFilterButtonActive]}
                        onPress={() => setFilter('ALL')}
                    >
                        <Text style={[Styles.paymentFilterText, filter === 'ALL' && Styles.paymentFilterTextActive]}>
                            Tất cả ({stats.totalSuccessfulCount + stats.totalPendingCount})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.paymentFilterButton, filter === 'SUCCESS' && Styles.paymentFilterButtonActive]}
                        onPress={() => setFilter('SUCCESS')}
                    >
                        <Text style={[Styles.paymentFilterText, filter === 'SUCCESS' && Styles.paymentFilterTextActive]}>
                            Thành công ({stats.totalSuccessfulCount})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.paymentFilterButton, filter === 'PENDING' && Styles.paymentFilterButtonActive]}
                        onPress={() => setFilter('PENDING')}
                    >
                        <Text style={[Styles.paymentFilterText, filter === 'PENDING' && Styles.paymentFilterTextActive]}>
                            Chờ/Thất bại ({stats.totalPendingCount})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderPaymentItem = ({ item }) => {
        const isSuccess = item.is_successful;
        const iconName = isSuccess ? "checkmark-circle" : "time";
        const iconColor = isSuccess ? "#198754" : "#f59e0b";
        const statusText = isSuccess ? "Giao dịch thành công" : "Đang chờ thanh toán / Thất bại";

        // Hiển thị tên học sinh mua nếu người dùng đăng nhập là Giảng viên hoặc Admin
        const showStudentName = (isAdmin || isInstructor) && item.student_name;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PaymentDetail', { paymentId: item.id })}
                style={[Styles.card, { padding: 16, marginBottom: 12, marginHorizontal: 16 }]}
            >
                {/* Header item: Số tiền và ngày giờ */}
                <View style={[Styles.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
                    <View style={Styles.row}>
                        <Ionicons name={iconName} size={22} color={iconColor} style={{ marginRight: 8 }} />
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#212529' }}>
                            {formatCurrency(item.amount)}
                        </Text>
                    </View>
                    <Text style={[Styles.small, { color: '#6c757d' }]}>
                        {moment(item.created_date).format('DD/MM/YYYY HH:mm')}
                    </Text>
                </View>

                {/* Thông tin khóa học */}
                <View style={{ marginBottom: 6 }}>
                    <Text style={{ fontSize: 14, color: '#495057' }}>
                        <Text style={{ fontWeight: '600', color: '#212529' }}>Khóa học: </Text>
                        {item.course_subject || 'Đang cập nhật...'}
                    </Text>
                </View>

                {/* Thông tin người mua (chỉ hiển thị cho Giảng viên / Admin xem) */}
                {showStudentName && (
                    <View style={{ marginBottom: 6 }}>
                        <Text style={{ fontSize: 14, color: '#495057' }}>
                            <Text style={{ fontWeight: '600', color: '#212529' }}>Học viên mua: </Text>
                            {item.student_name}
                        </Text>
                    </View>
                )}

                {/* Phương thức thanh toán */}
                <View style={{ marginBottom: 6 }}>
                    <Text style={{ fontSize: 14, color: '#495057' }}>
                        <Text style={{ fontWeight: '600', color: '#212529' }}>Phương thức: </Text>
                        {item.payment_method || 'Chưa xác định'}
                    </Text>
                </View>

                {/* Mã giao dịch */}
                {item.transaction_id && (
                    <View style={{ marginBottom: 6 }}>
                        <Text style={{ fontSize: 13, color: '#6c757d' }}>
                            <Text style={{ fontWeight: '600', color: '#495057' }}>Mã GD: </Text>
                            {item.transaction_id}
                        </Text>
                    </View>
                )}

                {/* Trạng thái giao dịch */}
                <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f3f5', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#6c757d', fontStyle: 'italic' }}>Bấm để xem chi tiết</Text>
                    <Text style={{ fontSize: 13, color: iconColor, fontWeight: 'bold' }}>
                        {statusText}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[Styles.container, { backgroundColor: '#f8f9fa', marginTop: 0 }]}>
            {loading && payments.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0d6efd" />
                    <Text style={{ marginTop: 10, color: '#6c757d' }}>Đang tải danh sách giao dịch...</Text>
                </View>
            ) : (
                <FlatList
                    data={payments}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderPaymentItem}
                    ListHeaderComponent={renderHeader()}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    ListFooterComponent={() =>
                        loadingMore ? (
                            <ActivityIndicator style={{ marginVertical: 16 }} size="small" color="#0d6efd" />
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 30 }}>
                            <Ionicons name="receipt-outline" size={64} color="#dee2e6" />
                            <Text style={{ marginTop: 16, color: '#6c757d', textAlign: 'center', fontSize: 15 }}>
                                Không tìm thấy lịch sử giao dịch nào phù hợp.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default PaymentHistory;
