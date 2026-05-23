import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from '../../configs/Contexts';
import UserStyles from '../User/Styles';
import Styles from '../../styles/Styles';
import Apis, { authApis, endpoints } from '../../configs/Apis';

const MyCoursesMain = ({ navigation }) => {
    const [user] = useContext(MyUserContext);
    const [coursesList, setCoursesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' or 'teaching'
    const isFocused = useIsFocused();

    const loadCourses = async (tab = activeTab) => {
        if (!user) return;
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (token) {
                let url;
                if ((user.role === 'INSTRUCTOR' || user.role === 'ADMIN') && tab === 'teaching') {
                    url = endpoints['my-courses'];
                } else {
                    url = endpoints['my-enrolls'];
                }
                const res = await authApis(token).get(url);
                setCoursesList(res.data || []);
            }
        } catch (ex) {
            console.error("Lỗi tải khóa học:", ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused && user) {
            loadCourses(activeTab);
        }
    }, [isFocused, user, activeTab]);

    useEffect(() => {
        let title = "Khóa học của tôi";
        if (user) {
            if (user.role === 'INSTRUCTOR') {
                title = activeTab === 'enrolled' ? "Khóa học của tôi" : "Khóa học giảng dạy";
            } else if (user.role === 'ADMIN') {
                title = activeTab === 'enrolled' ? "Khóa học của tôi" : "Quản lý khóa học";
            } else {
                title = "Khóa học của tôi";
            }
        }
        navigation.setOptions({ title: title });
    }, [user, activeTab, navigation]);

    // Trường hợp CHƯA ĐĂNG NHẬP
    if (!user) {
        return (
            <View style={UserStyles.centerContainer}>
                <View style={UserStyles.iconWrapper}>
                    <Ionicons name="book-outline" size={120} color="#adb5bd" />
                </View>
                <Text style={UserStyles.unauthTitle}>Khóa học của tôi</Text>
                <Text style={UserStyles.unauthSubtitle}>
                    Đăng nhập ngay để xem danh sách khóa học của bạn, theo dõi tiến trình và tiếp tục hành trình học tập.
                </Text>

                <TouchableOpacity style={UserStyles.btnPrimary}
                    onPress={() => navigation.navigate('Login')}>
                    <Text style={UserStyles.btnPrimaryText}>Đăng nhập ngay</Text>
                </TouchableOpacity>

                <TouchableOpacity style={UserStyles.btnSecondary}
                    onPress={() => navigation.navigate('Register')}>
                    <Text style={UserStyles.btnSecondaryText}>Đăng ký tài khoản</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Thiết lập tiêu đề và mô tả động theo vai trò người dùng và tab đang chọn
    let screenDesc = "Tiếp tục học tập để tích lũy kiến thức và hoàn thành mục tiêu nghề nghiệp.";
    let emptyTitle = "Bạn chưa đăng ký khóa học nào";
    let emptyDesc = "Hãy khám phá và đăng ký các khóa học chất lượng trên hệ thống để nâng cao kỹ năng của mình nhé!";

    if (user.role === 'INSTRUCTOR') {
        if (activeTab === 'enrolled') {
            screenDesc = "Các khóa học bạn đã đăng ký tham gia học tập từ các giảng viên khác.";
            emptyTitle = "Bạn chưa đăng ký khóa học nào";
            emptyDesc = "Hãy khám phá và đăng ký học các khóa học của đồng nghiệp để cùng trao đổi kiến thức nhé!";
        } else {
            screenDesc = "Quản lý và cập nhật bài giảng cho các khóa học do bạn trực tiếp giảng dạy.";
            emptyTitle = "Bạn chưa giảng dạy khóa học nào";
            emptyDesc = "Hãy liên hệ quản trị viên hoặc tạo khóa học mới để bắt đầu giảng dạy trên hệ thống.";
        }
    } else if (user.role === 'ADMIN') {
        if (activeTab === 'enrolled') {
            screenDesc = "Các khóa học bạn đã đăng ký tham gia học tập.";
            emptyTitle = "Bạn chưa đăng ký khóa học nào";
            emptyDesc = "Hãy khám phá và đăng ký các khóa học chất lượng trên hệ thống để nâng cao kỹ năng của mình nhé!";
        } else {
            screenDesc = "Giám sát và kiểm tra toàn bộ danh sách các khóa học đang hoạt động trên hệ thống.";
            emptyTitle = "Hệ thống chưa có khóa học nào";
            emptyDesc = "Hiện tại chưa có khóa học nào được đăng tải trên hệ thống eCourse.";
        }
    }

    return (
        <ScrollView style={Styles.container}>
            {user && (user.role === 'INSTRUCTOR' || user.role === 'ADMIN') && (
                <View style={Styles.segmentedContainer}>
                    <TouchableOpacity
                        style={[Styles.segmentButton, activeTab === 'enrolled' && Styles.segmentButtonActive]}
                        onPress={() => setActiveTab('enrolled')}
                    >
                        <Text style={[Styles.segmentText, activeTab === 'enrolled' && Styles.segmentTextActive]}>
                            Khóa học của tôi
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.segmentButton, activeTab === 'teaching' && Styles.segmentButtonActive]}
                        onPress={() => setActiveTab('teaching')}
                    >
                        <Text style={[Styles.segmentText, activeTab === 'teaching' && Styles.segmentTextActive]}>
                            {user.role === 'INSTRUCTOR' ? 'Khóa học giảng dạy' : 'Tất cả khóa học'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            <View style={Styles.sectionContainer}>
                <Text style={[Styles.categoryText, { color: '#6c757d', marginBottom: 15 }]}>
                    {screenDesc}
                </Text>
            </View>

            {loading && coursesList.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0d6efd" />
                </View>
            ) : coursesList.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                    <Ionicons name="school-outline" size={80} color="#adb5bd" style={{ marginBottom: 16 }} />
                    <Text style={[Styles.courseTitle, { textAlign: 'center', marginBottom: 8 }]}>
                        {emptyTitle}
                    </Text>
                    <Text style={[Styles.courseInstructor, { textAlign: 'center', marginBottom: 20 }]}>
                        {emptyDesc}
                    </Text>
                    {activeTab === 'enrolled' && (
                        <TouchableOpacity
                            style={UserStyles.btnPrimary}
                            onPress={() => navigation.navigate('HomeTab')}
                        >
                            <Text style={UserStyles.btnPrimaryText}>Khám phá khóa học</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <View style={Styles.myCourseList}>
                    {coursesList.map((item) => {
                        if (!item) return null;

                        // Nhận diện xem item là Enrollment hay Course
                        const isEnrollment = item.progress !== undefined && item.course !== undefined;
                        const course = isEnrollment ? item.course : item;
                        const progress = isEnrollment ? item.progress : null;

                        if (!course) return null;

                        const instructorName = course.instructor
                            ? `GV: ${course.instructor.last_name || ''} ${course.instructor.first_name || ''}`
                            : 'GV: Giảng viên';

                        return (
                            <TouchableOpacity
                                key={isEnrollment ? `enroll-${item.id}` : `course-${course.id}`}
                                style={Styles.myCourseCard}
                                onPress={() => navigation.navigate('CourseDetail', {
                                    course: {
                                        ...course,
                                        rating: course.average_rating,
                                        lessons_count: course.lesson_count,
                                        reviews_count: course.review_count,
                                        instructor_name: course.instructor ? `${course.instructor.last_name} ${course.instructor.first_name}` : 'Đang cập nhật',
                                        instructor_avatar: course.instructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250'
                                    }
                                })}
                                activeOpacity={0.8}
                            >
                                <View style={Styles.myCourseHeaderRow}>
                                    <Image
                                        source={course.image ? { uri: course.image } : { uri: 'https://via.placeholder.com/150' }}
                                        style={Styles.myCourseImage}
                                    />
                                    <View style={Styles.myCourseInfo}>
                                        <Text style={Styles.myCourseTitleText} numberOfLines={2}>
                                            {course.subject || 'Khóa học không tên'}
                                        </Text>
                                        <Text style={Styles.myCourseInstructorText}>
                                            {instructorName}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward-outline"
                                        size={20}
                                        color="#adb5bd"
                                        style={Styles.myCourseChevron}
                                    />
                                    {activeTab === 'teaching' ? (
                                        <TouchableOpacity
                                            style={{
                                                padding: 8,
                                                backgroundColor: '#e8f0fe',
                                                borderRadius: 8,
                                                marginLeft: 8
                                            }}
                                            onPress={() => navigation.navigate('CourseForm', { course: course })}
                                        >
                                            <Ionicons name="pencil" size={20} color="#1877F2" />
                                        </TouchableOpacity>
                                    ) : (
                                        <Ionicons
                                            name="chevron-forward-outline"
                                            size={20}
                                            color="#adb5bd"
                                            style={Styles.myCourseChevron}
                                        />
                                    )}
                                </View>

                                {/* Chỉ hiển thị thanh tiến độ khi progress khác null */}
                                {progress !== null && (
                                    <View style={Styles.progressSection}>
                                        <View style={Styles.progressLabelRow}>
                                            <Text style={Styles.progressLabelText}>Tiến độ học tập</Text>
                                            <Text style={Styles.progressPercentText}>{Math.round(progress)}%</Text>
                                        </View>
                                        <View style={Styles.progressBarTrack}>
                                            <View style={[Styles.progressBarFill, { width: `${progress}%` }]} />
                                        </View>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )
            }
        </ScrollView >
    );
};

export default MyCoursesMain;