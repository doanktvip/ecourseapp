import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';
import Styles from './Styles';

const VerifyInstructors = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'
  const [token, setToken] = useState(null);

  // Lấy Access Token từ AsyncStorage
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const tk = await AsyncStorage.getItem('token');
        if (tk) {
          setToken(tk);
        } else {
          Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          navigation.goBack();
        }
      } catch (err) {
        console.error('Error fetching token:', err);
      }
    };
    fetchToken();
  }, [navigation]);

  // Load danh sách đơn đăng ký
  const loadApplications = useCallback(async (tk = token, status = filterStatus) => {
    if (!tk) return;
    try {
      setLoading(true);
      const params = {};
      if (status !== 'ALL') {
        params.status = status;
      }

      const api = authApis(tk);
      const response = await api.get(endpoints['applications'], { params });

      // Response từ API list view có thể trả về array trực tiếp hoặc kết quả phân trang
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        data = response.data.results;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      }

      setApplications(data);
    } catch (err) {
      console.error('Error loading applications:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn đăng ký. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus]);

  // Gọi tải khi token hoặc bộ lọc thay đổi
  useEffect(() => {
    if (token) {
      loadApplications(token, filterStatus);
    }
  }, [token, filterStatus, loadApplications]);

  // Xử lý kéo xuống để làm mới
  const handleRefresh = async () => {
    setRefreshing(true);
    if (token) {
      await loadApplications(token, filterStatus);
    }
    setRefreshing(false);
  };

  // Mở CV bằng trình duyệt
  const handleOpenCV = async (url) => {
    if (!url) {
      Alert.alert('Thông báo', 'Đơn này chưa đính kèm tệp CV.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Lỗi', 'Thiết bị của bạn không thể mở liên kết này.');
      }
    } catch (err) {
      console.error('Error opening CV link:', err);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi cố gắng mở tệp CV.');
    }
  };

  // Cập nhật trạng thái đơn (Duyệt/Từ chối)
  const handleUpdateStatus = async (id, newStatus, candidateName) => {
    const actionText = newStatus === 'APPROVED' ? 'DUYỆT' : 'TỪ CHỐI';

    Alert.alert(
      'Xác nhận hành động',
      `Bạn có chắc chắn muốn ${actionText} đơn đăng ký làm giảng viên của "${candidateName}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: newStatus === 'APPROVED' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const api = authApis(token);
              await api.patch(endpoints['application-details'](id), { status: newStatus });

              Alert.alert('Thành công', `Đã ${newStatus === 'APPROVED' ? 'duyệt' : 'từ chối'} đơn đăng ký thành công.`);
              // Reload lại danh sách
              loadApplications(token, filterStatus);
            } catch (err) {
              console.error('Error updating application status:', err);
              const errorMsg = err.response?.data?.detail || 'Lỗi hệ thống khi cập nhật trạng thái đơn.';
              Alert.alert('Lỗi', errorMsg);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Format ngày tháng hiển thị
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Lấy chi tiết trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Chờ duyệt', bg: '#fff3e0', color: '#ff9800', icon: 'hourglass-outline' };
      case 'APPROVED':
        return { text: 'Đã duyệt', bg: '#e8f5e9', color: '#4caf50', icon: 'checkmark-circle-outline' };
      case 'REJECTED':
        return { text: 'Bị từ chối', bg: '#ffebee', color: '#f44336', icon: 'close-circle-outline' };
      default:
        return { text: 'Không rõ', bg: '#f5f5f5', color: '#757575', icon: 'help-circle-outline' };
    }
  };

  // Render từng thẻ đơn
  const renderItem = ({ item }) => {
    const candidateName = item.user
      ? `${item.user.last_name} ${item.user.first_name}`.trim()
      : 'Ứng viên không tên';
    const candidateEmail = item.user?.email || 'Chưa cung cấp email';
    const avatarUrl = item.user?.avatar;
    const badge = getStatusBadge(item.status);

    return (
      <View style={Styles.card}>
        <View style={Styles.cardHeader}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={Styles.avatar} />
          ) : (
            <View style={Styles.avatarPlaceholder}>
              <Text style={Styles.avatarPlaceholderText}>
                {candidateName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={Styles.headerInfo}>
            <Text style={Styles.name}>{candidateName}</Text>
            <Text style={Styles.email}>{candidateEmail}</Text>
          </View>
          <View style={[Styles.badge, { backgroundColor: badge.bg }]}>
            <Ionicons name={badge.icon} size={14} color={badge.color} style={{ marginRight: 4 }} />
            <Text style={[Styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
          </View>
        </View>

        <View style={Styles.cardBody}>
          <View style={Styles.dateRow}>
            <Ionicons name="calendar-outline" size={16} color="#757575" />
            <Text style={Styles.dateText}>Ngày nộp: {formatDate(item.created_date)}</Text>
          </View>

          {item.cv_file ? (
            <TouchableOpacity
              style={Styles.cvButton}
              onPress={() => handleOpenCV(item.cv_file)}
            >
              <Ionicons name="document-text-outline" size={18} color="#1976d2" />
              <Text style={Styles.cvButtonText}>Xem / Tải file hồ sơ CV</Text>
              <Ionicons name="chevron-forward" size={16} color="#1976d2" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ) : (
            <View style={[Styles.cvButton, { opacity: 0.5 }]}>
              <Ionicons name="document-text-outline" size={18} color="#757575" />
              <Text style={[Styles.cvButtonText, { color: '#757575' }]}>Không có tệp CV đính kèm</Text>
            </View>
          )}
        </View>

        {item.status === 'PENDING' && (
          <View style={Styles.cardFooter}>
            <TouchableOpacity
              style={[Styles.actionButton, Styles.rejectBtn]}
              onPress={() => handleUpdateStatus(item.id, 'REJECTED', candidateName)}
            >
              <Ionicons name="close-circle-outline" size={20} color="#fff" />
              <Text style={Styles.actionBtnText}>Từ chối</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[Styles.actionButton, Styles.approveBtn]}
              onPress={() => handleUpdateStatus(item.id, 'APPROVED', candidateName)}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={Styles.actionBtnText}>Duyệt làm giảng viên</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={Styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      {/* Segmented Filter Control */}
      <View style={Styles.filterContainer}>
        {[
          { label: 'Tất cả', val: 'ALL' },
          { label: 'Chờ duyệt', val: 'PENDING' },
          { label: 'Đã duyệt', val: 'APPROVED' },
          { label: 'Từ chối', val: 'REJECTED' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.val}
            style={[
              Styles.filterTab,
              filterStatus === tab.val && Styles.activeFilterTab
            ]}
            onPress={() => setFilterStatus(tab.val)}
          >
            <Text
              style={[
                Styles.filterTabText,
                filterStatus === tab.val && Styles.activeFilterTabText
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List content */}
      {loading && !refreshing ? (
        <View style={Styles.center}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={Styles.loadingText}>Đang tải dữ liệu hồ sơ...</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={Styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1976d2']}
            />
          }
          ListEmptyComponent={
            <View style={Styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={80} color="#adb5bd" />
              <Text style={Styles.emptyTitle}>Danh sách trống</Text>
              <Text style={Styles.emptyText}>
                {filterStatus === 'ALL'
                  ? 'Chưa có ứng viên nào nộp đơn đăng ký làm giáo viên.'
                  : `Không tìm thấy đơn nào ở trạng thái "${filterStatus === 'PENDING'
                    ? 'Chờ duyệt'
                    : filterStatus === 'APPROVED'
                      ? 'Đã duyệt'
                      : 'Bị từ chối'
                  }".`}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default VerifyInstructors;