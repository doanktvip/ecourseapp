import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useUser } from '../configs/Contexts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// === Import các màn hình chính (Screens) ===
import Home from '../screens/Home/Home';
import CourseDetail from '../screens/Home/CourseDetail';
import LessonDetail from '../screens/Home/LessonDetail';
import CourseCompare from '../screens/Home/CourseCompare';
import MyCourses from '../screens/Home/MyCourses';
import CourseForm from '../screens/Home/CourseForm';
import StudentProgress from '../screens/Home/StudentProgress';

import Login from '../screens/User/Login';
import Register from '../screens/User/Register';
import Profile from '../screens/User/Profile';
import ApplyInstructor from '../screens/User/ApplyInstructor';

import ChatList from '../screens/Chat/ChatList';
import ChatRoom from '../screens/Chat/ChatRoom';

import StatsDashboard from '../screens/Stats/StatsDashboard';
import VerifyInstructors from '../screens/Admin/VerifyInstructors';
import PaymentProcess from '../screens/Payment/PaymentProcess';

// Khởi tạo Stack và Tab Navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = createNativeStackNavigator();
const MyCoursesStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const StatsStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();

// =========================================================================
// 1. HOME STACK: Luồng màn hình Trang chủ (Tìm kiếm, Chi tiết, So sánh)
// =========================================================================
function HomeStackNavigator() {
  const { theme } = useTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.navBarBg },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <HomeStack.Screen 
        name="HomeMain" 
        component={Home} 
        options={{ title: 'eCourse' }} 
      />
      <HomeStack.Screen 
        name="CourseDetail" 
        component={CourseDetail} 
        options={{ title: 'Chi tiết khóa học' }} 
      />
      <HomeStack.Screen 
        name="LessonDetail" 
        component={LessonDetail} 
        options={{ title: 'Bài học trực tuyến' }} 
      />
      <HomeStack.Screen 
        name="CourseCompare" 
        component={CourseCompare} 
        options={{ title: 'So sánh khóa học' }} 
      />
    </HomeStack.Navigator>
  );
}

// =========================================================================
// 2. MY COURSES STACK: Tiến độ học tập & Giảng dạy
// =========================================================================
function MyCoursesStackNavigator() {
  const { theme } = useTheme();
  return (
    <MyCoursesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.navBarBg },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <MyCoursesStack.Screen 
        name="MyCoursesMain" 
        component={MyCourses} 
        options={{ title: 'Khóa học của tôi' }} 
      />
      <MyCoursesStack.Screen 
        name="CourseDetail" 
        component={CourseDetail} 
        options={{ title: 'Chi tiết khóa học' }} 
      />
      <MyCoursesStack.Screen 
        name="LessonDetail" 
        component={LessonDetail} 
        options={{ title: 'Bài học trực tuyến' }} 
      />
      <MyCoursesStack.Screen 
        name="StudentProgress" 
        component={StudentProgress} 
        options={{ title: 'Tiến độ học viên' }} 
      />
    </MyCoursesStack.Navigator>
  );
}

// =========================================================================
// 3. CHAT STACK: Trao đổi trực tuyến qua Firebase Realtime Database
// =========================================================================
function ChatStackNavigator() {
  const { theme } = useTheme();
  return (
    <ChatStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.navBarBg },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <ChatStack.Screen 
        name="ChatListMain" 
        component={ChatList} 
        options={{ title: 'Hộp thư hỗ trợ' }} 
      />
      <ChatStack.Screen 
        name="ChatRoom" 
        component={ChatRoom} 
        options={{ headerShown: false }} // Ẩn header mặc định để dùng Custom Header trong ChatRoom
      />
    </ChatStack.Navigator>
  );
}

// =========================================================================
// 4. STATS STACK: Thống kê và Báo cáo (Giảng viên & Admin)
// =========================================================================
function StatsStackNavigator() {
  const { theme } = useTheme();
  return (
    <StatsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.navBarBg },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <StatsStack.Screen 
        name="StatsMain" 
        component={StatsDashboard} 
        options={{ title: 'Báo cáo thống kê' }} 
      />
    </StatsStack.Navigator>
  );
}

// =========================================================================
// 5. ACCOUNT STACK: Thông tin cá nhân, cài đặt & Duyệt của Admin
// =========================================================================
function AccountStackNavigator() {
  const { theme } = useTheme();
  return (
    <AccountStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.navBarBg },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <AccountStack.Screen 
        name="ProfileMain" 
        component={Profile} 
        options={{ title: 'Tài khoản' }} 
      />
      <AccountStack.Screen 
        name="ApplyInstructor" 
        component={ApplyInstructor} 
        options={{ title: 'Đăng ký giảng viên' }} 
      />
      <AccountStack.Screen 
        name="CourseForm" 
        component={CourseForm} 
        options={({ route }) => ({ 
          title: route.params?.course ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới' 
        })} 
      />
      <AccountStack.Screen 
        name="StudentProgress" 
        component={StudentProgress} 
        options={{ title: 'Tiến độ học viên' }} 
      />
      <AccountStack.Screen 
        name="AdminVerifyDetails" 
        component={VerifyInstructors} 
        options={{ title: 'Duyệt đơn giảng viên' }} 
      />
    </AccountStack.Navigator>
  );
}

// =========================================================================
// 6. MAIN BOTTOM TAB: Thanh điều hướng chính ở đáy màn hình
// =========================================================================
function MainTabNavigator() {
  const { theme } = useTheme();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Ẩn header của Tab để sử dụng header của từng Stack con bên trong
        tabBarStyle: {
          backgroundColor: theme.navBarBg,
          borderTopWidth: 1,
          borderTopColor: theme.borderLight,
          height: 60 + (insets.bottom > 0 ? insets.bottom - 8 : 0),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          shadowOpacity: 0.05,
          elevation: 8,
        },
        tabBarActiveTintColor: theme.navIconActive,
        tabBarInactiveTintColor: theme.navIconDefault,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyCoursesTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'StatsTab') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'AccountTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={focused ? 24 : 22} color={color} />;
        },
      })}
    >
      {/* 1. Tab Trang chủ (Mọi người dùng) */}
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator} 
        options={{ tabBarLabel: 'Trang chủ' }} 
      />

      {/* 2. Tab Khóa học của tôi (Chỉ hiển thị hoặc hữu ích nhất khi đã đăng nhập) */}
      <Tab.Screen 
        name="MyCoursesTab" 
        component={MyCoursesStackNavigator} 
        options={{ tabBarLabel: 'Khóa học' }} 
      />

      {/* 3. Tab Nhắn tin (Chỉ dành cho Học sinh & Giảng viên trao đổi) */}
      <Tab.Screen 
        name="ChatTab" 
        component={ChatStackNavigator} 
        options={{ tabBarLabel: 'Nhắn tin' }} 
      />

      {/* 4. Tab Thống kê (Chỉ hiển thị hoặc có nội dung khi vai trò là Giảng viên hoặc Admin) */}
      {(user?.role === 'instructor' || user?.role === 'admin') && (
        <Tab.Screen 
          name="StatsTab" 
          component={StatsStackNavigator} 
          options={{ tabBarLabel: 'Thống kê' }} 
        />
      )}

      {/* 5. Tab Tài khoản (Mọi người dùng để thiết lập Profile / Đăng nhập) */}
      <Tab.Screen 
        name="AccountTab" 
        component={AccountStackNavigator} 
        options={{ tabBarLabel: 'Tài khoản' }} 
      />
    </Tab.Navigator>
  );
}

// =========================================================================
// 7. ROOT NATIVE STACK: Navigator gốc bao quát toàn bộ ứng dụng
// =========================================================================
export default function AppNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.navBarBg },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* Luồng chính chứa thanh Bottom Tabs */}
      <Stack.Screen 
        name="Main" 
        component={MainTabNavigator} 
        options={{ headerShown: false }} 
      />

      {/* Luồng xác thực đăng nhập (Khi đẩy lên dạng Modals hoặc đè lên Bottom Tabs) */}
      <Stack.Screen 
        name="Login" 
        component={Login} 
        options={{ title: 'Đăng nhập' }} 
      />
      <Stack.Screen 
        name="Register" 
        component={Register} 
        options={{ title: 'Đăng ký tài khoản' }} 
      />

      {/* Luồng thanh toán học phí (Đẩy đè toàn màn hình để học viên thao tác tập trung) */}
      <Stack.Screen 
        name="PaymentProcess" 
        component={PaymentProcess} 
        options={{ title: 'Thanh toán học phí' }} 
      />
    </Stack.Navigator>
  );
}
