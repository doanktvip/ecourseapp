import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        marginTop: 20,
    },
    header: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 20,
    },
    content_header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    profile_home: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 30,
        padding: 20,
    },
    profile_info: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 14,
        marginLeft: 5,
    },
    searchContainer: {
        flexDirection: 'row',     // Xếp kính lúp và chỗ nhập chữ nằm ngang
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        margin: 15,
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 10
    },
    searchIcon: {
        marginRight: 10, // Cách ô nhập chữ ra một chút
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 5,
    },
    // / Khung nền của Banner
    bannerContainer: {

        borderRadius: 12,
        padding: 20,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 5,
    },
    // Chữ tiêu đề lớn của Banner
    bannerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    // Dòng chữ phụ nhỏ hơn
    bannerSubtitle: {
        fontSize: 14,
    },
    //Danh mục
    sectionContainer: {
        marginTop: 30,
        paddingHorizontal: 20, // Nếu container ngoài cùng chưa lùi vào thì dùng cái này
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    categoryItem: {
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginRight: 12,

    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    //Khóa học
    cardContainer: {
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    cardContent: {
        marginTop: 10,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },

    courseInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    // Chữ tên giảng viên
    courseInstructor: {
        fontSize: 14,
        color: '#666',
    },
    // Chữ giá tiền (Màu đỏ nổi bật)
    coursePrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
    },
    // Điểm rating 
    courseRating: {
        fontSize: 14,
        fontWeight: 'bold',

    },
    // Số bài học
    courseLessons: {
        fontSize: 14,
        color: '#555',
    },
    priceBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#3064df',
        paddingHorizontal: 12, // Rộng hai bên trái phải
        paddingVertical: 6,    // Cao trên dưới
        borderRadius: 8,

    },
    priceBadgeText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    // === Styles for MyCourses Screen ===
    myCoursesHeader: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: '#f5f5f5',
    },
    myCoursesTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 8,
    },
    myCoursesSubtitle: {
        fontSize: 14,
        color: '#6c757d',
        lineHeight: 20,
    },
    myCourseList: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    myCourseCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    myCourseHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    myCourseImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginRight: 12,
    },
    myCourseInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    myCourseTitleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 4,
        lineHeight: 22,
    },
    myCourseInstructorText: {
        fontSize: 13,
        color: '#6c757d',
    },
    myCourseChevron: {
        marginLeft: 8,
    },
    progressSection: {
        marginTop: 4,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    progressLabelText: {
        fontSize: 13,
        color: '#6c757d',
    },
    progressPercentText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0d6efd',
    },
    progressBarTrack: {
        height: 6,
        backgroundColor: '#e9ecef',
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#0d6efd',
        borderRadius: 3,
    },
});
