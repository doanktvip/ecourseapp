import { StyleSheet } from "react-native";
import theme from "./theme";

// Các style chung được sử dụng ở nhiều màn hình khác nhau
export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        marginTop: 20,
    },
    header: {
        backgroundColor: theme.colors.white,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 20,
    },
    content_header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
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
        flexDirection: 'row',
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
        marginRight: 10,
    },
    // Style cho các Dialog/Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: theme.colors.white,
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
        borderBottomColor: theme.colors.border,
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    modalItem: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
    },
    modalItemText: {
        fontSize: 15,
        color: theme.colors.textSecondary,
    },
    modalItemTextActive: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    // Style cho các khối thông tin (Card)
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    iconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f1f3f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    unauthTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 10,
    },
    unauthSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    // Nút bấm chính
    btnPrimary: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },
    btnPrimaryText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Nút bấm phụ
    btnSecondary: {
        backgroundColor: theme.colors.white,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    btnSecondaryText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    }
});
