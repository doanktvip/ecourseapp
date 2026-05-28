import React, { useEffect, useState, useContext } from 'react';
import { Text, View, TouchableOpacity, Alert, ActivityIndicator, TextInput, FlatList, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import { MyUserContext } from '../../configs/Contexts';
import Styles from './Styles';
import theme from '../../styles/theme';

const CourseReviews = ({ route, navigation }) => {
    const { courseId, courseSubject } = route.params;
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [user] = useContext(MyUserContext);
    const [page, setPage] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);


    const handleSubmitReview = async () => {
        // BƯỚC 1: Kiểm tra nội dung nhập trống 
        if (!comment.trim()) {
            Alert.alert("Thông báo", "Vui lòng nhập nội dung đánh giá của bạn.");
            return;
        }

        if (!user) {
            Alert.alert(
                "Yêu cầu đăng nhập",
                "Bạn cần đăng nhập hệ thống để thực hiện đánh giá khóa học này.",
                [
                    { text: "Hủy", style: "cancel" },
                    { text: "Đăng nhập ngay", onPress: () => navigation.navigate('Login') }
                ]
            );
            return;
        }

        if (user.role !== 'STUDENT') {
            Alert.alert("Quyền truy cập bị từ chối", "Hệ thống chỉ cho phép tài khoản thuộc vai trò Sinh viên viết đánh giá khóa học.");
            return;
        }

        setSubmittingReview(true);
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Lỗi xác thực", "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
                setSubmittingReview(false);
                return;
            }

            let enrollRes = await authApis(token).get(endpoints['my-courses']);
            const myCoursesList = enrollRes.data || [];

            const currentCourseData = myCoursesList.find(c => c.id === courseId);

            if (!currentCourseData || !currentCourseData.enrollment) {
                Alert.alert("Chặn quyền đánh giá", "Bạn chưa đăng ký khóa học này hoặc trạng thái giao dịch thanh toán chưa thành công.");
                setSubmittingReview(false);
                return;
            }

            const currentProgress = currentCourseData.enrollment.progress || 0;
            if (currentProgress < 20) {
                Alert.alert(
                    "Tiến độ không đủ điều kiện",
                    `Tiến độ học hiện tại của bạn mới đạt ${currentProgress}%. Bạn cần hoàn thành tối thiểu 20% thời lượng khóa học để gửi đánh giá.`
                );
                setSubmittingReview(false);
                return;
            }

            let reviewRes = await authApis(token).post(endpoints['course-reviews'](courseId), {
                'rating': rating,
                'comment': comment
            });

            // Nếu Backend trả về thành công, làm mới lại form đánh giá
            if (reviewRes.status === 201 || reviewRes.status === 200) {
                Alert.alert("Thành công", "Cảm ơn bạn đã gửi đánh giá đóng góp cho khóa học!");
                setComment("");
                setRating(5);

                if (page === 1) {
                    loadReviews();
                } else {
                    setPage(1);
                }
            }
        } catch (ex) {
            console.error("Lỗi xử lý gửi đánh giá:", ex);
            if (ex.response && ex.response.data && ex.response.data.non_field_errors) {
                Alert.alert("Thất bại", ex.response.data.non_field_errors[0]);
            } else {
                Alert.alert("Lỗi", "Không thể gửi đánh giá lúc này. Mỗi học viên chỉ được đánh giá một khóa học một lần.");
            }
        } finally {
            setSubmittingReview(false);
        }
    };

    const loadReviews = async () => {
        if (page === 0) return;
        try {
            setLoadingReviews(true);
            let url = `${endpoints['course-reviews'](courseId)}?page=${page}`;
            let res = await Apis.get(url);

            const newReviews = res.data.results || res.data;

            if (page === 1) {
                setReviews(newReviews);
            } else if (page > 1) {
                // cơ chế callback để cập nhật reviews tránh mất dữ liệu khi bất đồng bộ
                setReviews(prev => [...prev, ...newReviews]);
            }

            if (res.data.count !== undefined) {
                setTotalReviews(res.data.count);
            } else {
                setTotalReviews(newReviews.length);
            }

            if (res.data.next === null) {
                setPage(0);
            }
        } catch (ex) {
            console.error(ex);
            setPage(0);
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        if (page > 0) {
            loadReviews();
        }
    }, [page]);

    const loadMoreReviews = () => {
        if (page > 0 && !loadingReviews) {
            setPage(page + 1);
        }
    };

    const renderReviewItem = ({ item: rev }) => (
        <View style={[Styles.card, Styles.reviewItemContainer, { marginHorizontal: 16, marginBottom: 10, padding: 12 }]}>
            <View style={[Styles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                <View style={Styles.row}>
                    <Image source={{ uri: rev.user?.avatar }} style={Styles.reviewAvatar} />
                    <View style={{ marginLeft: 10 }}>
                        <Text style={Styles.reviewUserText}>
                            {rev.user?.last_name} {rev.user?.first_name}
                        </Text>
                        <View style={Styles.reviewRatingStars}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <Ionicons key={s} name={s <= rev.rating ? "star" : "star-outline"} size={13} color="gold" style={{ marginRight: 2 }} />
                            ))}
                        </View>
                    </View>
                </View>
                <Text style={Styles.reviewDateText}>
                    {rev.created_date ? new Date(rev.created_date).toLocaleDateString('vi-VN') : ''}
                </Text>
            </View>
            <Text style={Styles.reviewCommentText}>{rev.comment}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.colors.white }}
            behavior='padding'
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80} >
            <FlatList
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 20 }}
                data={reviews}
                renderItem={renderReviewItem}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                showsVerticalScrollIndicator={false}

                ListHeaderComponent={() => (
                    <Text style={[Styles.reviewSectionTitle, { marginTop: 16, paddingHorizontal: 16 }]}>
                        Tất cả đánh giá về khóa học ({totalReviews})
                    </Text>
                )}

                ListEmptyComponent={!loadingReviews && <Text style={[Styles.noReviewsText, { textAlign: 'center', marginTop: 20 }]}>Khóa học này chưa có lượt đánh giá nào.</Text>}
                onEndReached={loadMoreReviews}
                onEndReachedThreshold={0.2}
                ListFooterComponent={loadingReviews ? <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 15 }} /> : null}
            />

            {/* 2. VIEW: FORM ĐÁNH GIÁ (Nằm ngoài FlatList để cố định dưới đáy) */}
            <View style={{ backgroundColor: theme.colors.white, borderTopWidth: 1, borderColor: theme.colors.border }}>
                {/* Chọn số sao */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                        <TouchableOpacity key={s} onPress={() => setRating(s)} style={{ paddingHorizontal: 4 }}>
                            <Ionicons name={s <= rating ? "star" : "star-outline"} size={26} color="gold" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Thanh nhập đánh giá giống comment bài học */}
                <View style={Styles.commentBarContainer}>
                    <TextInput
                        style={Styles.commentBarInput}
                        placeholder={user ? "Viết đánh giá khóa học..." : "Đăng nhập để đánh giá"}
                        value={comment}
                        onChangeText={setComment}
                        editable={!!user && !submittingReview}
                        multiline
                    />
                    <TouchableOpacity
                        style={[Styles.commentBarSendBtn, (!comment.trim() || submittingReview || !user) && Styles.commentBarSendBtnDisabled]}
                        onPress={handleSubmitReview}
                        disabled={!comment.trim() || submittingReview || !user}
                        activeOpacity={0.8}
                    >
                        {submittingReview ? (
                            <ActivityIndicator size="small" color={theme.colors.white} />
                        ) : (
                            <Ionicons name="send" size={16} color={theme.colors.white} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default CourseReviews;