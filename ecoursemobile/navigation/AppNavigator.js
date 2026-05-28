import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../configs/Contexts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Home from '../screens/Home/Home';
import CourseDetail from '../screens/Home/CourseDetail';
import LessonDetail from '../screens/Home/LessonDetail';
import CourseCompare from '../screens/Home/CourseCompare';
import MyCourses from '../screens/Home/MyCourses';
import CourseForm from '../screens/Home/CourseForm';
import CourseReviews from '../screens/Home/CourseReviews';
import StudentProgress from '../screens/Home/StudentProgress';
import LessonForm from '../screens/Home/LessonForm';

import Login from '../screens/User/Login';
import Register from '../screens/User/Register';
import Profile from '../screens/User/Profile';
import ApplyInstructor from '../screens/User/ApplyInstructor';

import ChatList from '../screens/Chat/ChatList';
import ChatRoom from '../screens/Chat/ChatRoom';

import StatsDashboard from '../screens/Stats/StatsDashboard';
import VerifyInstructors from '../screens/Admin/VerifyInstructors';
import PaymentProcess from '../screens/Payment/PaymentProcess';
import PaymentHistory from '../screens/Payment/PaymentHistory';
import PaymentDetail from '../screens/Payment/PaymentDetail';

import CategoryManage from '../screens/Admin/CategoryManage';
import TagManage from '../screens/Admin/TagManage';
import theme from '../styles/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = createNativeStackNavigator();
const MyCoursesStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const StatsStack = createNativeStackNavigator();
const PaymentStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();

const useHeaderOptions = () => {
  return {
    headerStyle: {
      backgroundColor: theme.colors.white,
    },
    headerTintColor: theme.colors.text,
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 18,
    },
    headerShadowVisible: false,
  };
}

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
      <HomeStack.Screen
        name="LessonForm"
        component={LessonForm}
        options={{ title: 'Thêm bài học mới' }}
      />
      <HomeStack.Screen
        name="CourseForm"
        component={CourseForm}
        options={{ title: 'Thông tin khóa học' }}
      />
      <HomeStack.Screen
        name="StudentProgress"
        component={StudentProgress}
        options={{ title: 'Tiến độ học viên' }}
      />
    </HomeStack.Navigator>
  );
}

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
      <MyCoursesStack.Screen
        name="LessonForm"
        component={LessonForm}
        options={{ title: 'Thêm bài học mới' }}
      />
    </MyCoursesStack.Navigator>
  );
}

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
        options={{ headerShown: false }}
      />
    </ChatStack.Navigator>
  );
}


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

const PaymentStackNavigator = () => {
  const headerOptions = useHeaderOptions();

  return (
    <PaymentStack.Navigator screenOptions={headerOptions}>
      <PaymentStack.Screen
        name="PaymentHistory"
        component={PaymentHistory}
        options={{ title: 'Lịch sử giao dịch' }}
      />
      <PaymentStack.Screen
        name="PaymentDetail"
        component={PaymentDetail}
        options={{ title: 'Chi tiết hóa đơn' }}
      />
    </PaymentStack.Navigator>
  );
}

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
      <AccountStack.Screen
        name="CategoryManage"
        component={CategoryManage}
        options={({ route }) => ({
          title: 'Quản lý danh mục khóa học'
        })}
      />
      <AccountStack.Screen
        name="TagManage"
        component={TagManage}
        options={({ route }) => ({
          title: 'Quản lý thẻ Tag'
        })}
      />
    </AccountStack.Navigator>
  );
}

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
          } else if (route.name === 'PaymentTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'AccountTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#adb5bd',
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.border,
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
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Trang chủ', unmountOnBlur: true }}
      />

      <Tab.Screen
        name="MyCoursesTab"
        component={MyCoursesStackNavigator}
        options={{ tabBarLabel: 'Khóa học' }}
      />

      <Tab.Screen
        name="ChatTab"
        component={ChatStackNavigator}
        options={{ tabBarLabel: 'Nhắn tin' }}
      />

      {user?.role?.toUpperCase() === 'INSTRUCTOR' && (
        <Tab.Screen
          name="StatsTab"
          component={StatsStackNavigator}
          options={{ tabBarLabel: 'Thống kê' }}
        />
      )}

      {user && (
        <Tab.Screen
          name="PaymentTab"
          component={PaymentStackNavigator}
          options={{ tabBarLabel: 'Giao dịch' }}
        />
      )}

      <Tab.Screen
        name="AccountTab"
        component={AccountStackNavigator}
        options={{ tabBarLabel: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
}

const AppNavigator = () => {
  const headerOptions = useHeaderOptions();

  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />

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

      <Stack.Screen
        name="PaymentProcess"
        component={PaymentProcess}
        options={{ title: 'Thanh toán học phí' }}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;