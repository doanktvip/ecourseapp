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
});
