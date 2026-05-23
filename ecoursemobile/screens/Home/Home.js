import { ScrollView, View, TextInput, Text, Image, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import Styles from "../../styles/Styles";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { use, useEffect, useState } from "react";
import Apis, { endpoints } from "../../configs/Apis";
import { Card, Searchbar } from "react-native-paper";
import { useIsFocused } from '@react-navigation/native';



const Home = ({ navigation }) => {
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cateId, setCateId] = useState();
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    // Biến này sẽ có giá trị true nếu mở màn hình Home, false nếu ở màn hình khác
    const isFocused = useIsFocused();


    const loadCategories = async () => {
        let res = await Apis.get(endpoints['categories']);
        setCategories(res.data);
    }
    // Hàm load khóa học, isRefresh để ép làm mới từ trang 1
    const loadCourses = async (isRefresh = false) => {
        let currentPage = isRefresh ? 1 : page;
        
        // Nếu hết trang và không phải lệnh làm mới thì bỏ qua
        if (currentPage === 0 && !isRefresh) return; 

        try {
            setLoading(true);
            let url = `${endpoints['courses']}?page=${currentPage}`;
            if (q) url += `&search=${q}`;
            if (cateId) url += `&category_id=${cateId}`;

            let res = await Apis.get(url);

            if (currentPage === 1) {
                setCourses(res.data.results); // Nạp lại mới hoàn toàn nếu ở trang 1
            } else {
                 setCourses([...courses, ...res.data.results]);
            }

            // Xử lý cờ trang tiếp theo
            if (res.data.next === null) {
                setPage(0);
            } else if (isRefresh) {
                setPage(1); 
            } 
        } catch (ex) {
            console.error(ex);
            if (ex.response && ex.response.status === 404) {
                setPage(0);
            }
        } finally {
            setTimeout(() => { setLoading(false); }, 1000)
        }
    }

    useEffect(() => {
        loadCategories();
    }, []);

    // 2. RE-RENDER: màn hình Home hiển thị lên làm mới danh sách
   useEffect(() => {
        if (!isFocused) return; // Nếu đang ở màn hình khác

        let timer = setTimeout(() => {
            loadCourses(true); // Luôn làm mới về trang 1
        }, 500);

        return () => clearTimeout(timer);
    }, [q, cateId, isFocused]);

    // Xử lý riêng biệt cho việc cuộn trang
    useEffect(() => {
        if (page > 1 && isFocused) {
            loadCourses(false);
        }
    }, [page]);

    const loadMore = () => {
        if (page > 0 && !loading && courses.length > 0)
            setPage(page + 1);
    }

    const renderHeaderComponents = () => (
        <View>
            {/* Khối 1: Thông tin người dùng / Lời chào */}
            <View style={Styles.profile_home}>
                <View style={Styles.profile_info}>
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
                        style={Styles.avatar}
                    />
                    <View>
                        <Text style={Styles.greeting}>Chào mừng quay lại, </Text>
                        <Text style={Styles.userName}>Chào bạn !</Text>
                    </View>
                </View>
            </View>

            {/* Khối 2: Thanh tìm kiếm */}
            <View style={Styles.searchContainer}>
                <Searchbar
                    value={q}
                    onChangeText={setQ}
                    style={Styles.searchInput}
                    placeholder="Tìm kiếm khóa học, giảng viên,..."
                />
            </View>

            {/* Khối 3: Banner Khuyến mãi */}
            <LinearGradient
                colors={['#56CCF2', '#a1c1eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={Styles.bannerContainer}>
                <Text style={Styles.bannerTitle}>Khuyến mãi cực sốc!</Text>
                <Text style={Styles.bannerSubtitle}>Giảm liền 50% cho khóa học đầu tiên của bạn</Text>
            </LinearGradient>

            {/* Khối 4: Danh mục nổi bật (FlatList nằm ngang được bọc trong View) */}
            <View style={Styles.sectionContainer}>
                <Text style={Styles.sectionTitle}>Danh mục nổi bật</Text>
                <FlatList
                    data={[{ id: "", name: "Tất cả" }, ...categories]}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id ? item.id.toString() : "null"}
                    renderItem={({ item }) => {
                        const isSelected = cateId === item.id || (item.id === "" && !cateId);
                        return (
                            <TouchableOpacity
                                style={[Styles.categoryItem, isSelected && Styles.categoryItemSelected]}
                                onPress={() => setCateId(item.id)}
                            >
                                <Text style={[Styles.categoryText, isSelected && Styles.categoryTextSelected]}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* Tiêu đề đệm cho khối danh sách khóa học phía dưới */}
            <View style={[Styles.sectionContainer, { marginBottom: 10 }]}>
                <Text style={Styles.sectionTitle}>Khóa học trực tuyến</Text>
            </View>
        </View>
    );

    const renderCourseCard = ({ item: course }) => (
        <Card style={Styles.cardContainer} onPress={() => {
            navigation.navigate('CourseDetail', {
                course: {
                    ...course,
                    rating: course.average_rating,
                    lessons_count: course.lesson_count,
                    reviews_count: course.review_count,
                    instructor_name: course.instructor ? `${course.instructor.last_name} ${course.instructor.first_name}` : 'Đang cập nhật',
                    instructor_avatar: course.instructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250'
                }
            });
        }}>
            <View style={{ position: 'relative' }}>
                <Card.Cover source={{ uri: course.image }} />
                <View style={Styles.priceBadge}>
                    <Text style={Styles.priceBadgeText}>
                        {course.fee && parseFloat(course.fee) > 0
                            ? `${parseFloat(course.fee).toLocaleString()} đ`
                            : 'Miễn phí'}
                    </Text>
                </View>
            </View>

            <Card.Content style={Styles.cardContent}>
                <Text style={Styles.courseTitle} numberOfLines={2}>
                    {course.subject}
                </Text>

                <View style={Styles.courseInfoRow}>
                    <Text style={Styles.courseInstructor}>
                        Giảng viên: {course.instructor?.last_name + ' ' + course.instructor?.first_name || "Đang cập nhật"}
                    </Text>
                </View>

                <View style={Styles.courseInfoRow}>
                    <Text style={Styles.courseRating}>
                        <Ionicons name="star" size={15} color="gold" style={{ paddingRight: 5 }} />
                        {course.average_rating || "0.0"} ({course.review_count || "0"})
                    </Text>

                    <Text style={Styles.courseLessons}>
                        {course.lesson_count || "0"} bài học
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );
    return (
        <View style={Styles.container}>
            <FlatList
                data={courses}
                renderItem={renderCourseCard}
                keyExtractor={(course) => course.id.toString()}
                showsVerticalScrollIndicator={false}

                // Nạp toàn bộ các View thành phần phía trên vào đây
                ListHeaderComponent={renderHeaderComponents}

                // Cấu hình sự kiện cuộn xuống cuối để load trang tiếp theo
                onEndReached={loadMore}
                onEndReachedThreshold={0.2}

                // Khối hiển thị hiệu ứng xoay tròn Loading dưới đáy khi đang tải thêm dữ liệu
                ListFooterComponent={loading && <ActivityIndicator />}
            />
        </View>
    );
}

export default Home;