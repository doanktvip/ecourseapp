import React, { useState, useMemo } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions
} from 'react-native';
import { useTheme, useUser } from '../../configs/Contexts';
import { getGlobalStyles } from '../../styles/Styles';
import { Ionicons } from '@expo/vector-icons';

export default function StatsDashboard() {
  const { theme } = useTheme();
  const styles = useMemo(() => getGlobalStyles(theme), [theme]);
  const { user } = useUser();

  const [period, setPeriod] = useState('month'); // 'month' | 'quarter' | 'year'

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="bar-chart-outline" size={80} color={theme.textTertiary} />
        <Text style={[styles.title, { marginTop: 16, marginBottom: 8 }]}>Thống kê & Báo cáo</Text>
        <Text style={[styles.body, { textAlign: 'center', marginBottom: 24, fontSize: 14 }]}>
          Vui lòng đăng nhập với tài khoản Giảng viên hoặc Quản trị viên để tra cứu dữ liệu thống kê chuyên sâu.
        </Text>
      </View>
    );
  }

  // Instructor Stats Simulation
  const instructorStats = {
    students: 124,
    revenue: 42415000,
    courses_stats: [
      { id: 1, name: 'Lập trình React Native nâng cao', students: 85, revenue: 42415000 },
      { id: 2, name: 'UI/UX Design di động cơ bản', students: 39, revenue: 0 }
    ]
  };

  // Admin Stats Simulation
  const adminStats = {
    active_courses: 18,
    enrollments_count: 524,
    total_revenue: 185490000,
    registrations_by_month: [
      { label: 'Tháng 3', count: 120 },
      { label: 'Tháng 4', count: 215 },
      { label: 'Tháng 5', count: 189 }
    ]
  };

  const currentStats = user.role === 'admin' ? adminStats : instructorStats;

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.bgPrimary }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.h1}>Báo cáo Thống kê 📈</Text>
      <Text style={[styles.small, { marginBottom: 16 }]}>
        {user.role === 'admin' 
          ? 'Báo cáo tổng quan hoạt động kinh doanh, học tập và số lượng bài giảng trong trường học.'
          : 'Báo cáo hiệu quả giảng dạy, sĩ số học viên tích cực và doanh số doanh thu khóa học của bạn.'}
      </Text>

      {/* Filter Tabs */}
      <View style={[styles.row, styles.tabContainer]}>
        {['month', 'quarter', 'year'].map((p) => (
          <TouchableOpacity 
            key={p}
            style={[
              styles.tabButton,
              { 
                backgroundColor: period === p ? theme.surfacePrimary : 'transparent',
                elevation: period === p ? 1 : 0
              }
            ]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.small, { 
              fontWeight: 'bold', 
              color: period === p ? theme.btnPrimaryBg : theme.textSecondary 
            }]}>
              {p === 'month' ? 'Theo Tháng' : p === 'quarter' ? 'Theo Quý' : 'Theo Năm'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main KPI Stats Cards */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        {/* KPI 1 */}
        <View style={[styles.card, { flex: 1, marginVertical: 0 }]}>
          <View style={[styles.row, { marginBottom: 8 }]}>
            <Ionicons 
              name={user.role === 'admin' ? "book" : "people"} 
              size={20} 
              color={theme.btnPrimaryBg} 
            />
          </View>
          <Text style={styles.small}>
            {user.role === 'admin' ? 'Khóa học hoạt động' : 'Học viên tham gia'}
          </Text>
          <Text style={[styles.h1, { fontSize: 24, marginVertical: 4 }]}>
            {user.role === 'admin' ? adminStats.active_courses : instructorStats.students}
          </Text>
          <Text style={[styles.small, { color: theme.successText }]}>🟢 +12% so với trước</Text>
        </View>

        {/* KPI 2 */}
        <View style={[styles.card, { flex: 1, marginVertical: 0 }]}>
          <View style={[styles.row, { marginBottom: 8 }]}>
            <Ionicons name="cash" size={20} color="#137333" />
          </View>
          <Text style={styles.small}>Tổng doanh thu</Text>
          <Text style={[styles.h1, { fontSize: 18, marginVertical: 8, color: '#137333' }]}>
            {user.role === 'admin' 
              ? `${adminStats.total_revenue.toLocaleString()} VNĐ` 
              : `${instructorStats.revenue.toLocaleString()} VNĐ`}
          </Text>
          <Text style={[styles.small, { color: theme.successText }]}>🟢 +8% tháng này</Text>
        </View>
      </View>

      {/* Stats Breakdown list */}
      <Text style={[styles.h2, { marginBottom: 8 }]}>
        {user.role === 'admin' ? 'Tần suất đăng ký học' : 'Doanh thu chi tiết khóa học'}
      </Text>
      
      <View style={styles.card}>
        {user.role === 'admin' ? (
          adminStats.registrations_by_month.map((item, idx) => (
            <View 
              key={idx} 
              style={[
                styles.spaceBetween, 
                { 
                  paddingVertical: 12, 
                  borderBottomWidth: idx === adminStats.registrations_by_month.length - 1 ? 0 : 1, 
                  borderBottomColor: theme.borderLight 
                }
              ]}
            >
              <Text style={styles.body}>{item.label}</Text>
              <View style={[styles.row]}>
                <Text style={[styles.body, { fontWeight: 'bold', marginRight: 8 }]}>{item.count} lượt</Text>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${(item.count / 250) * 100}%` }]} />
                </View>
              </View>
            </View>
          ))
        ) : (
          instructorStats.courses_stats.map((course, idx) => (
            <View 
              key={course.id} 
              style={[
                styles.spaceBetween, 
                { 
                  paddingVertical: 12, 
                  borderBottomWidth: idx === instructorStats.courses_stats.length - 1 ? 0 : 1, 
                  borderBottomColor: theme.borderLight 
                }
              ]}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.body, { fontWeight: '600' }]} numberOfLines={1}>{course.name}</Text>
                <Text style={styles.small}>{course.students} sinh viên học</Text>
              </View>
              <Text style={[styles.body, { fontWeight: 'bold', color: '#137333' }]}>
                {course.revenue === 0 ? '0 VNĐ' : `${course.revenue.toLocaleString()} VNĐ`}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* PDF export button simulation */}
      <TouchableOpacity 
        style={[styles.btnSecondary, { marginTop: 16, flexDirection: 'row', justifyContent: 'center' }]}
        onPress={() => Alert.alert('Xuất báo cáo', 'Đã lưu báo cáo thống kê PDF vào bộ nhớ máy!')}
      >
        <Ionicons name="download-outline" size={20} color={theme.btnSecondaryText} style={{ marginRight: 8 }} />
        <Text style={styles.btnSecondaryText}>Xuất báo cáo PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
