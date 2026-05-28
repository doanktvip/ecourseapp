import React, { useState, useEffect, useContext } from 'react';
import { Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';
import { MyUserContext } from '../../configs/Contexts';
import Styles from './Styles';
import theme from '../../styles/theme';

const StatsTab = () => {
  const [user] = useContext(MyUserContext);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Lỗi", "Vui lòng đăng nhập lại để xem thống kê.");
          return;
        }

        let res = await authApis(token).get(endpoints['stats']);
        setStatsData(res.data.results || res.data);
      } catch (ex) {
        console.error("Lỗi khi tải thống kê:", ex);
        Alert.alert("Lỗi", "Không thể tải dữ liệu thống kê lúc này.");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'INSTRUCTOR') {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);
  const totalRevenue = statsData?.stat_course?.reduce((sum, item) => sum + Number(item.total_revenue || 0), 0) || 0;
  const totalStudents = statsData?.stat_course?.reduce((sum, item) => sum + Number(item.total_students || 0), 0) || 0;

  const timeSeriesData = period === 'month' ? statsData?.by_month : period === 'quarter' ? statsData?.by_quarter : statsData?.by_year;

  return (
    <View style={Styles.statsContainer}>
      {loading ? (
        <View style={Styles.statsCenterContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={Styles.statsEmptyText}>Đang tải dữ liệu thống kê...</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={Styles.statsScrollContent}
          showsVerticalScrollIndicator={false}>

          {/* --- THỐNG KÊ THEO THỜI GIAN --- */}
          <Text style={[Styles.h2, { marginBottom: 8 }]}>Thống kê theo thời gian</Text>

          <View style={Styles.statsTabContainer}>
            {['month', 'quarter', 'year'].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  Styles.statsTabButton,
                  period === p && Styles.statsTabButtonActive
                ]}
                onPress={() => setPeriod(p)}
              >
                <Text style={period === p ? Styles.statsTabTextActive : Styles.statsTabText}>
                  {p === 'month' ? 'Theo Tháng' : p === 'quarter' ? 'Theo Quý' : 'Theo Năm'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={Styles.card}>
            {/* Hiển thị danh sách dữ liệu dựa theo loại thời gian */}
            {timeSeriesData?.length > 0 ? (
              timeSeriesData.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    Styles.statsListRow,
                    idx === timeSeriesData.length - 1 && Styles.statsListRowLast
                  ]}
                >
                  <View style={Styles.statsListLeft}>
                    <Text style={[Styles.title, { fontSize: 15 }]}>{item.period}</Text>
                    <Text style={Styles.statsListSubtitle}>{item.total_students} lượt đăng ký</Text>
                  </View>
                  <Text style={Styles.statsListValueBlue}>
                    +{Number(item.total_revenue).toLocaleString()} đ
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[Styles.statsEmptyText, { paddingVertical: 10 }]}>Không có biến động giao dịch trong chu kỳ này.</Text>
            )}
          </View>
          {/* --- KHỐI KPI TỔNG QUAN --- */}
          <View style={Styles.statsKpiWrapper}>
            <View style={Styles.statsKpiCard}>
              <View style={Styles.statsKpiIconWrapper}>
                <Ionicons name="people" size={24} color={theme.colors.primary} />
              </View>
              <Text style={Styles.small}>Tổng học viên</Text>
              <Text style={Styles.statsKpiValueTotal}>
                {totalStudents}
              </Text>
            </View>

            <View style={Styles.statsKpiCard}>
              <View style={Styles.statsKpiIconWrapper}>
                <Ionicons name="cash" size={24} color={theme.colors.success} />
              </View>
              <Text style={Styles.small}>Tổng doanh thu</Text>
              <Text style={Styles.statsKpiValueMoney}>
                {totalRevenue.toLocaleString()} đ
              </Text>
            </View>
          </View>

          {/* --- THỐNG KÊ THEO KHÓA HỌC --- */}
          <Text style={[Styles.h2, { marginBottom: 8, marginTop: 10 }]}>Doanh thu chi tiết theo khóa học</Text>
          <View style={Styles.card}>
            {statsData?.stat_course?.length > 0 ? (
              statsData.stat_course.map((course, idx) => (
                <View
                  key={idx}
                  style={[
                    Styles.statsListRow, idx === statsData.stat_course.length - 1 && Styles.statsListRowLast]} >
                  <View style={Styles.statsListLeft}>
                    <Text style={[Styles.title, { fontSize: 15 }]} numberOfLines={2}>
                      {course.enrollment__course__subject}
                    </Text>
                    <Text style={Styles.statsListSubtitle}>
                      {course.total_students} lượt mua
                    </Text>
                  </View>
                  <Text style={Styles.statsListValueGreen}>
                    {Number(course.total_revenue).toLocaleString()} đ
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[Styles.statsEmptyText, { paddingVertical: 10 }]}>
                Bạn hiện chưa có khóa học nào đang giảng dạy hoặc chưa phát sinh doanh thu.
              </Text>
            )}
          </View>


        </ScrollView>
      )}
    </View>
  );
};

export default StatsTab;