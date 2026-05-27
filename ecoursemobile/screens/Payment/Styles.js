import { StyleSheet } from "react-native";
import GlobalStyles from "../../styles/Styles";
import theme from "../../styles/theme";

const localStyles = StyleSheet.create({
    // === Styles for Payment Screen ===
    paymentContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    paymentBillingCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    paymentCardTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#888888',
        letterSpacing: 1,
        marginBottom: 16,
    },
    paymentCourseRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentCourseImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 14,
    },
    paymentCourseDetails: {
        flex: 1,
    },
    paymentCourseSubject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212529',
        lineHeight: 22,
        marginBottom: 4,
    },
    paymentCourseInstructor: {
        fontSize: 13,
        color: '#6c757d',
    },
    paymentDivider: {
        height: 1,
        backgroundColor: '#e9ecef',
        marginVertical: 16,
    },
    paymentPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentPriceLabel: {
        fontSize: 14,
        color: '#495057',
    },
    paymentPriceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1877F2',
    },
    paymentSectionContainer: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    paymentSectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#888888',
        letterSpacing: 1,
        marginBottom: 16,
    },
    paymentMethodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderColor: '#e9ecef',
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 1,
    },
    paymentIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    paymentMethodDetails: {
        flex: 1,
    },
    paymentMethodName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 2,
    },
    paymentMethodDesc: {
        fontSize: 12,
        color: '#6c757d',
    },
    paymentRadioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ced4da',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    paymentRadioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    paymentActionContainer: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    paymentBtnConfirm: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    paymentBtnConfirmText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    paymentMethodLogo: {
        width: 32,
        height: 32,
        borderRadius: 6,
        resizeMode: 'contain',
    },
    // Tiến độ Student Progress
    progressBarTrack: {
        width: 80,
        height: 8,
        backgroundColor: '#e9ecef',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#1877F2',
    },
    // ==========================================
    // STYLES DÀNH CHO TRANG LỊCH SỬ GIAO DỊCH (PAYMENT HISTORY)
    // ==========================================
    paymentSummaryCard: {
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    paymentSummaryTitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    paymentSummaryValue: {
        color: '#ffffff',
        fontSize: 26,
        fontWeight: '800',
        marginTop: 4,
    },
    paymentSummaryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    paymentSummaryFooterItem: {
        alignItems: 'center',
        flex: 1,
    },
    paymentSummaryFooterLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11,
        marginBottom: 2,
    },
    paymentSummaryFooterValue: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    paymentFilterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    paymentFilterButton: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: '#e9ecef',
        marginRight: 8,
    },
    paymentFilterButtonActive: {
        backgroundColor: '#0d6efd',
    },
    paymentFilterText: {
        fontSize: 12,
        color: '#495057',
        fontWeight: '600',
    },
    paymentFilterTextActive: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    paymentSearchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        height: 44,
    },
    paymentSearchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#212529',
    },
});

export default { ...GlobalStyles, ...localStyles };
