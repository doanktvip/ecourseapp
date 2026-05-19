import React, { useState, useMemo } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  FlatList,
  StyleSheet
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme, useUser } from '../../configs/Contexts';
import { getGlobalStyles } from '../../styles/Styles';
import { Ionicons } from '@expo/vector-icons';

// Danh sách các danh mục giả lập
const MOCK_CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'apps' },
  { id: 'web', name: 'Lập trình Web', icon: 'code-slash' },
  { id: 'design', name: 'Thiết kế đồ họa', icon: 'color-palette' },
  { id: 'data', name: 'Khoa học dữ liệu', icon: 'analytics' },
  { id: 'marketing', name: 'Marketing', icon: 'trending-up' }
];

// Danh sách các khóa học giả lập
const MOCK_COURSES = [
  {
    id: 1,
    title: 'Khóa học React Native toàn tập từ Zero đến Hero',
    instructor: 'TS. Nguyễn Văn A',
    rating: 4.8,
    reviews: 124,
    fee: 499000,
    category: 'web',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=300&auto=format&fit=crop',
    duration: '32 giờ',
    lessonsCount: 24
  },
  {
    id: 2,
    title: 'Lập trình Node.js & Express REST API thực chiến',
    instructor: 'ThS. Trần Thị B',
    rating: 4.7,
    reviews: 98,
    fee: 399000,
    category: 'web',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300&auto=format&fit=crop',
    duration: '28 giờ',
    lessonsCount: 20
  },
  {
    id: 3,
    title: 'UI/UX Design Masterclass cho người mới bắt đầu',
    instructor: 'Designer Lê Hoàng C',
    rating: 4.9,
    reviews: 215,
    fee: 599000,
    category: 'design',
    image: 'https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=300&auto=format&fit=crop',
    duration: '20 giờ',
    lessonsCount: 15
  },
  {
    id: 4,
    title: 'Khoa học Dữ liệu & Python cho người mới',
    instructor: 'TS. Phạm Minh D',
    rating: 4.6,
    reviews: 84,
    fee: 0,
    category: 'data',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=300&auto=format&fit=crop',
    duration: '18 giờ',
    lessonsCount: 12
  },
  {
    id: 5,
    title: 'Digital Marketing 4.0 - Đột phá doanh số bán hàng',
    instructor: 'Chuyên gia Vũ Tiến E',
    rating: 4.5,
    reviews: 67,
    fee: 299000,
    category: 'marketing',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=300&auto=format&fit=crop',
    duration: '15 giờ',
    lessonsCount: 10
  }
];

export default function Home({ navigation }) {
  const { themeMode, theme } = useTheme();
  const globalStyles = useMemo(() => getGlobalStyles(theme), [theme]);
  const { user } = useUser();

  // Trạng thái cho Tìm kiếm & Lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Lọc danh sách khóa học dựa trên ô tìm kiếm và danh mục đang chọn
  const filteredCourses = MOCK_COURSES.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Chuyển đổi hiển thị học phí định dạng tiền tệ VNĐ
  const formatCurrency = (value) => {
    if (value === 0) return 'Miễn phí';
    return value.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header người dùng */}
        <View style={[globalStyles.spaceBetween, globalStyles.headerWrapper]}>
          <View style={globalStyles.row}>
            {user && user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={[globalStyles.avatar, { marginRight: 12 }]}
              />
            ) : (
              <View style={[globalStyles.avatarFallback, { marginRight: 12 }]}>
                <Ionicons name="person" size={22} color={theme.textSecondary} />
              </View>
            )}
            <View>
              <Text style={[globalStyles.small, { color: theme.textSecondary }]}>Chào mừng quay lại,</Text>
              <Text style={[globalStyles.title, { fontWeight: '700', color: theme.textPrimary }]}>
                {user ? (user.first_name || user.username) : 'Chào bạn'} 👋
              </Text>
            </View>
          </View>
        </View>

        {/* Thanh tìm kiếm */}
        <View style={globalStyles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={theme.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Tìm khóa học, giảng viên..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, color: theme.textPrimary, fontSize: 16 }}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Khối Banner Khuyến Mại */}
        <View style={[globalStyles.promoBanner, { backgroundColor: theme.infoBg, borderColor: theme.infoText + '22' }]}>
          <View style={{ flex: 1 }}>
            <Text style={[globalStyles.labelText, { color: theme.infoText }]}>BỨT PHÁ KỸ NĂNG</Text>
            <Text style={[globalStyles.title, { fontWeight: '800', marginBottom: 6 }]}>Giảm 20% Học Phí</Text>
            <Text style={globalStyles.caption}>Đăng ký các khóa học lập trình Web & Thiết kế ngay hôm nay!</Text>
          </View>
          <Ionicons name="school" size={48} color={theme.infoText} style={{ opacity: 0.8 }} />
        </View>

        {/* Tiêu đề & Danh mục */}
        <Text style={[globalStyles.h2, { marginBottom: 12, color: theme.textPrimary }]}>Danh mục nổi bật</Text>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 8, marginBottom: 24 }}
        >
          {MOCK_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                globalStyles.categoryPill,
                {
                  backgroundColor: selectedCategory === category.id ? theme.btnPrimaryBg : theme.surfacePrimary,
                  borderColor: selectedCategory === category.id ? theme.btnPrimaryBg : theme.borderDefault,
                }
              ]}
            >
              <Ionicons
                name={category.icon}
                size={16}
                color={selectedCategory === category.id ? theme.btnPrimaryText : theme.btnPrimaryBg}
                style={{ marginRight: 6 }}
              />
              <Text style={[
                globalStyles.labelText,
                {
                  marginBottom: 0,
                  color: selectedCategory === category.id ? theme.btnPrimaryText : theme.textPrimary
                }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tiêu đề Khóa học */}
        <View style={[globalStyles.spaceBetween, { marginBottom: 12 }]}>
          <Text style={[globalStyles.h2, { marginBottom: 0, color: theme.textPrimary }]}>Khóa học trực tuyến</Text>
          <Text style={[globalStyles.small, { color: theme.btnPrimaryBg, fontWeight: 'bold' }]}>
            {filteredCourses.length} khóa học
          </Text>
        </View>

        {/* Danh sách khóa học */}
        {filteredCourses.length === 0 ? (
          <View style={[globalStyles.centerContainer, { backgroundColor: 'transparent', height: 200 }]}>
            <Ionicons name="search" size={48} color={theme.textTertiary} style={{ marginBottom: 12 }} />
            <Text style={[globalStyles.body, { color: theme.textTertiary }]}>Không tìm thấy khóa học nào phù hợp</Text>
          </View>
        ) : (
          filteredCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              onPress={() => navigation.navigate('CourseDetail', { courseId: course.id, course })}
              style={[globalStyles.card, globalStyles.courseCard]}
            >
              <Image
                source={{ uri: course.image }}
                style={globalStyles.cardImage}
              />

              {/* Badge học phí nổi trên góc ảnh */}
              <View style={[
                globalStyles.floatingBadge,
                {
                  backgroundColor: course.fee === 0 ? theme.successBg : theme.btnPrimaryBg,
                  borderColor: course.fee === 0 ? theme.successText + '22' : 'transparent',
                }
              ]}>
                <Text style={[
                  globalStyles.badgeText,
                  { color: course.fee === 0 ? theme.successText : theme.btnPrimaryText }
                ]}>
                  {formatCurrency(course.fee)}
                </Text>
              </View>

              <View style={globalStyles.cardBody}>
                <Text style={[globalStyles.title, { fontWeight: '700', marginBottom: 6, color: theme.textPrimary }]} numberOfLines={2}>
                  {course.title}
                </Text>

                <Text style={[globalStyles.small, { color: theme.textSecondary, marginBottom: 10 }]}>
                  Giảng viên: <Text style={globalStyles.bold}>{course.instructor}</Text>
                </Text>

                <View style={[globalStyles.spaceBetween, globalStyles.cardFooter]}>
                  <View style={globalStyles.row}>
                    <Ionicons name="star" size={16} color="#FFD700" style={{ marginRight: 4 }} />
                    <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>{course.rating}</Text>
                    <Text style={[globalStyles.small, { color: theme.textTertiary }]}> ({course.reviews})</Text>
                  </View>

                  <View style={globalStyles.row}>
                    <Ionicons name="book-outline" size={16} color={theme.textTertiary} style={{ marginRight: 4 }} />
                    <Text style={[globalStyles.small, { color: theme.textSecondary }, globalStyles.bold]}>{course.lessonsCount} bài học</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Khối So sánh Khóa học */}
        <TouchableOpacity
          onPress={() => navigation.navigate('CourseCompare')}
          style={[globalStyles.promoBanner, { backgroundColor: theme.surfacePrimary, borderColor: theme.borderDefault, marginTop: 16 }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={globalStyles.h3}>So Sánh Các Khóa Học</Text>
            <Text style={globalStyles.caption}>Bạn đang phân vân giữa các khóa học? Hãy đối chiếu học phí và nội dung giảng dạy trực quan!</Text>
          </View>
          <Ionicons name="git-compare-outline" size={24} color={theme.btnPrimaryBg} style={{ marginLeft: 12 }} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}