import { StyleSheet } from "react-native";
import GlobalStyles from "../../styles/Styles";
import theme from "../../styles/theme";

const localStyles = StyleSheet.create({
    statsContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
        color: theme.colors.textSecondary,
        marginTop: 12,
        fontSize: 15,
        lineHeight: 22,
    },
    statsKpiWrapper: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statsKpiCard: {
        flex: 1,
        backgroundColor: theme.colors.white,
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
        color: theme.colors.text,
        fontWeight: 'bold',
    },
    statsKpiValueMoney: {
        fontSize: 18,
        marginVertical: 8,
        color: '#137333',
        fontWeight: 'bold',
    },
    statsTabContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.border,
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
        backgroundColor: theme.colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        elevation: 2,
    },
    statsTabText: {
        fontWeight: 'normal',
        color: theme.colors.textSecondary,
        fontSize: 13,
    },
    statsTabTextActive: {
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontSize: 13,
    },
    statsListRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    statsListRowLast: {
        borderBottomWidth: 0,
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
        color: theme.colors.primary,
    },
});

export default { ...GlobalStyles, ...localStyles };
