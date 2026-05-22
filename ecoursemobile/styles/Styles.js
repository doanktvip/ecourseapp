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
    categoryItemSelected: {
        backgroundColor: '#1877F2',
        borderColor: '#1877F2',
    },
    // ĐỔI MÀU CHỮ KHI ĐƯỢC CHỌN
    categoryTextSelected: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    //Khóa học
    cardContainer: {
        marginBottom: 20,
        backgroundColor: '#fff',
        marginLeft:20,
        marginRight:20,
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
    // ==========================================
    // STYLES DÀNH CHO TRANG COURSE DETAIL
    // ==========================================

    detailBannerImage: {
        width: '100%',
        height: 220,
        resizeMode: 'cover',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        // Hiệu ứng đổ bóng cho iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Hiệu ứng đổ bóng cho Android
        elevation: 3,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    h1: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
    },
    h2: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    body: {
        fontSize: 15,
        color: '#555555',
        lineHeight: 22,
    },
    small: {
        fontSize: 13,
        color: '#888888',
    },

    // 5. Ảnh đại diện (Avatar) của giảng viên
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eeeeee',
    },

    // ==========================================
    // STYLES DÀNH CHO TRANG APPLY INSTRUCTOR
    // ==========================================
    applyHeader: {
        marginBottom: 20,
    },
    applyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    applySubtitle: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
    applyBenefitList: {
        marginVertical: 15,
    },
    applyBenefitItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    applyBenefitIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    applyBenefitText: {
        flex: 1,
    },
    applyBenefitTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    applyBenefitDesc: {
        fontSize: 13,
        color: '#666666',
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 20,
    },
    filePickerBox: {
        borderWidth: 2,
        borderColor: '#cccccc',
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 24,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
        marginBottom: 20,
    },
    filePickerBoxActive: {
        borderColor: '#1877F2',
        backgroundColor: '#f0f7ff',
        borderStyle: 'solid',
    },
    pickerPlaceholder: {
        alignItems: 'center',
    },
    pickerTextBold: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    pickerTextSubtitle: {
        fontSize: 12,
        color: '#888888',
    },
    selectedFileWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    fileDetails: {
        flex: 1,
        marginLeft: 12,
    },
    fileName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 2,
    },
    fileSize: {
        fontSize: 12,
        color: '#666666',
    },
    btnChangeFile: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#1877F2',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    btnChangeFileText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1877F2',
    },
    btnPrimary: {
        backgroundColor: '#1877F2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        width: '100%',
    },
    btnPrimaryDisabled: {
        backgroundColor: '#cccccc',
    },
    btnPrimaryText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    btnSecondary: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cccccc',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        width: '100%',
        marginTop: 12,
    },
    btnSecondaryText: {
        color: '#333333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusMainLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
    },
    statusBadgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusMessageCard: {
        backgroundColor: '#fafafa',
        borderLeftWidth: 4,
        borderRadius: 6,
        padding: 16,
        marginBottom: 20,
    },
    statusMessageText: {
        fontSize: 14,
        color: '#555555',
        lineHeight: 20,
    },
    submittedCvCard: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    submittedCvTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#888888',
        marginBottom: 8,
    },
    submittedFileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
        padding: 12,
        marginBottom: 8,
    },
    submittedFileName: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#1877F2',
        fontWeight: '500',
    },
    submittedDateText: {
        fontSize: 12,
        color: '#888888',
        textAlign: 'right',
    },
    applyLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    applyLoadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666666',
    },
    illustrationWrapper: {
        marginBottom: 20,
        backgroundColor: '#e8f5e9',
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    // Styles dành riêng cho các Tab phân đoạn trong MyCourses
    segmentedContainer: {
        flexDirection: 'row',
        backgroundColor: '#e9ecef',
        borderRadius: 12,
        padding: 4,
        marginHorizontal: 20,
        marginBottom: 16,
        marginTop: 10,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    segmentButtonActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
    },
    segmentTextActive: {
        color: '#1877F2',
        fontWeight: 'bold',
    },
    // 6. Styles cho phần đánh giá từ học viên
     reviewSectionTitle: {
     fontSize: 18,
     fontWeight: 'bold',
     color: '#333333',
     marginTop: 20,
     marginBottom: 10,
     marginLeft: 20,
     marginRight: 20,
    },
    reviewContainer: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 16,
    },
    reviewItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    reviewUserAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    reviewUserRole: {
        fontSize: 10,
        color: '#1877F2',
        fontWeight: 'bold',
        backgroundColor: '#e8f0fe',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    reviewRatingStars: {
        flexDirection: 'row',
        marginVertical: 4,
    },
    reviewCommentText: {
        fontSize: 14,
        color: '#555555',
        lineHeight: 20,
        marginTop: 4,
    },
    reviewDateText: {
        fontSize: 11,
        color: '#999999',
        marginTop: 4,
    },
    noReviewsText: {
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
        paddingVertical: 20,
    },
    ratingSelectorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 12,
    },
    writeReviewTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
        textAlign: 'center',
    },
    reviewTextInput: {
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
        backgroundColor: '#fafafa',
        marginBottom: 12,
    },
    // Style cho nút Gửi đánh giá (Trạng thái bình thường)
    btnSubmitReview: {
        alignSelf: 'flex-end',   // Neo chuẩn ở góc dưới bên phải giống trong ảnh
        flexDirection: 'row',    
        alignItems: 'center',    
        paddingHorizontal: 20,   // Thu gọn chiều ngang lại một chút cho thanh thoát
        paddingVertical: 10,     // Giảm chiều dọc để nút không bị quá mập
        borderRadius: 30,        // Bo tròn góc tuyệt đối (pill-shape)
        marginTop: 8,            // Tạo một khoảng thở vừa đủ với ô nhập chữ phía trên
        backgroundColor: '#1877F2',
        
        // Hiệu ứng đổ bóng (Shadow) tinh tế hơn
        shadowColor: '#1877F2',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4, 
    },

    // Style ghi đè khi nút đang ở trạng thái xử lý (Disabled)
    btnSubmitReviewDisabled: {
        backgroundColor: '#a0c4ff', 
        shadowOpacity: 0,        // Tắt đổ bóng để nút chìm xuống tự nhiên khi đang load
        elevation: 0,
    },

    // Chữ bên trong nút
    btnSubmitReviewText: {
        color: '#ffffff',
        fontSize: 15, 
        fontWeight: 'bold',
    },
    // === Form Styles for Course Creation ===
    formContainer: {
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    formGroup: {
        marginBottom: 18,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#495057',
        marginBottom: 6,
    },
    categorySelector: {
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categorySelectorText: {
        fontSize: 15,
        color: '#212529',
    },
    categoryPlaceholderText: {
        fontSize: 15,
        color: '#adb5bd',
    },
    imagePickerBox: {
        borderWidth: 2,
        borderColor: '#cccccc',
        borderStyle: 'dashed',
        borderRadius: 12,
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
        marginBottom: 20,
        overflow: 'hidden',
    },
    imagePickerActive: {
        borderColor: '#1877F2',
        backgroundColor: '#f0f7ff',
        borderStyle: 'solid',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    // === Shared Modal Styles ===
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        padding: 24,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
    },
    modalItem: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
    },
    modalItemText: {
        fontSize: 15,
        color: '#495057',
    },
    modalItemTextActive: {
        color: '#1877F2',
        fontWeight: 'bold',
    },
});
