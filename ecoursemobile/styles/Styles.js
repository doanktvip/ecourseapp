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
        padding: 10, 
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
    }
});
