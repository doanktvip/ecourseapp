import { StyleSheet } from "react-native";
import GlobalStyles from "../../styles/Styles";
import theme from "../../styles/theme";

const localStyles = StyleSheet.create({
    // ==========================================
    // STYLES DÀNH CHO TRANG STATS DASHBOARD (THỐNG KÊ)
    // ==========================================
    statsContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    statsScrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    statsCenterContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    statsEmptyText: {
        textAlign: 'center',
        color: '#666666',
        marginTop: 12,
        fontSize: 15,
        lineHeight: 22,
    },
    // Khối chứa 2 thẻ KPI
    statsKpiWrapper: {
        flexDirection: 'row',
        gap: 12, // Tạo khoảng cách giữa 2 thẻ (Nếu lỗi trên máy cũ có thể đổi thành justifyContent: 'space-between')
        marginBottom: 16,
    },
    statsKpiCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsKpiIconWrapper: {
        marginBottom: 8,
    },
    statsKpiValueTotal: {
        fontSize: 24,
        marginVertical: 4,
        color: '#333333',
        fontWeight: 'bold',
    },
    statsKpiValueMoney: {
        fontSize: 18,
        marginVertical: 8,
        color: '#137333',
        fontWeight: 'bold',
    },
    // Bộ lọc Tab (Tháng/Quý/Năm)
    statsTabContainer: {
        flexDirection: 'row',
        backgroundColor: '#e9ecef',
        borderRadius: 8,
        padding: 4,
        marginBottom: 12,
    },
    statsTabButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: 6,
    },
    statsTabButtonActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        elevation: 2,
    },
    statsTabText: {
        fontWeight: 'normal',
        color: '#666666',
        fontSize: 13,
    },
    statsTabTextActive: {
        fontWeight: 'bold',
        color: '#1877F2',
        fontSize: 13,
    },
    // Danh sách dòng dữ liệu (List item)
    statsListRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee',
    },
    statsListRowLast: {
        borderBottomWidth: 0, // Dòng cuối cùng không có viền
    },
    statsListLeft: {
        flex: 1,
        paddingRight: 8,
    },
    statsListSubtitle: {
        fontSize: 13,
        color: '#888888',
        marginTop: 4,
    },
    statsListValueGreen: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#137333',
    },
    statsListValueBlue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1877F2',
    },
});

export default { ...GlobalStyles, ...localStyles };
