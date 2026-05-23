import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../configs/Contexts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// === Import các màn hình chính (Screens) ===
import Home from '../screens/Home/Home';
import CourseDetail from '../screens/Home/CourseDetail';
import LessonDetail from '../screens/Home/LessonDetail';
import CourseCompare from '../screens/Home/CourseCompare';
import MyCourses from '../screens/Home/MyCourses';
import CourseForm from '../screens/Home/CourseForm';
import CourseReviews from '../screens/Home/CourseReviews';
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

// Helper hook to get unified header options with clean premium look
const useHeaderOptions = () => {
  return {
    headerStyle: {
      backgroundColor: '#ffffff',
    },
    headerTintColor: '#212529',
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 18,
    },
    headerShadowVisible: false,
  };
}

// =========================================================================
// 1. HOME STACK: Luồng màn hình Trang chủ (Tìm kiếm, Chi tiết, So sánh)
// =========================================================================
const HomeStackNavigator = () => {
  const headerOptions = useHeaderOptions();

  return (
    <HomeStack.Navigator screenOptions={headerOptions}>
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
      <HomeStack.Screen
        name="CourseReviews"
        component={CourseReviews}
        options={{ title: 'Đánh giá khóa học' }}
      />
    </HomeStack.Navigator>
  );
}

// =========================================================================
// 2. MY COURSES STACK: Tiến độ học tập & Giảng dạy
// =========================================================================
const MyCoursesStackNavigator = () => {
  const headerOptions = useHeaderOptions();

  return (
    <MyCoursesStack.Navigator screenOptions={headerOptions}>
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
      <MyCoursesStack.Screen
        name="CourseCompare"
        component={CourseCompare}
        options={{ title: 'So sánh khóa học' }}
      />
      <MyCoursesStack.Screen
        name="CourseReviews"
        component={CourseReviews}
        options={{ title: 'Đánh giá khóa học' }}
      />
      <MyCoursesStack.Screen 
        name="CourseForm" 
        component={CourseForm} 
        options={{ title: 'Thông tin khóa học' }} 
    />
    </MyCoursesStack.Navigator>
  );
}

// =========================================================================
// 3. CHAT STACK: Trao đổi trực tuyến qua Firebase Realtime Database
// =========================================================================
const ChatStackNavigator = () => {
  const headerOptions = useHeaderOptions();

  return (
    <ChatStack.Navigator screenOptions={headerOptions}>
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
const StatsStackNavigator = () => {
  const headerOptions = useHeaderOptions();

  return (
    <StatsStack.Navigator screenOptions={headerOptions}>
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
const AccountStackNavigator = () => {
  const headerOptions = useHeaderOptions();

  return (
    <AccountStack.Navigator screenOptions={headerOptions}>
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
const MainTabNavigator = () => {
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyCoursesTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'StatsTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'AccountTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0d6efd',
        tabBarInactiveTintColor: '#adb5bd',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#dee2e6',
          borderTopWidth: 1,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 8,
          paddingTop: 8,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      {/* 1. Tab Trang chủ (Mọi người dùng) */}
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Trang chủ' }}
      />

      {/* 2. Tab Khóa học của tôi */}
      <Tab.Screen
        name="MyCoursesTab"
        component={MyCoursesStackNavigator}
        options={{ tabBarLabel: 'Khóa học' }}
      />

      {/* 3. Tab Nhắn tin */}
      <Tab.Screen
        name="ChatTab"
        component={ChatStackNavigator}
        options={{ tabBarLabel: 'Nhắn tin' }}
      />

      {/* 4. Tab Thống kê (Chỉ giảng viên hoặc admin) */}
      {(user?.role?.toUpperCase() === 'INSTRUCTOR' || user?.role?.toUpperCase() === 'ADMIN') && (
        <Tab.Screen
          name="StatsTab"
          component={StatsStackNavigator}
          options={{ tabBarLabel: 'Thống kê' }}
        />
      )}

      {/* 5. Tab Tài khoản */}
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
const AppNavigator = () => {
  const headerOptions = useHeaderOptions();

  return (
    <Stack.Navigator screenOptions={headerOptions}>
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

export default AppNavigator;