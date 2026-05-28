import { StyleSheet } from "react-native";
import GlobalStyles from "../../styles/Styles";
import theme from "../../styles/theme";

const localStyles = StyleSheet.create({
    chatContainer: {
        flex: 1,
        backgroundColor: theme.colors.secondary,
    },
    chatSearchBar: {
        margin: 12,
        backgroundColor: theme.colors.white,
        elevation: 1,
    },
    chatSegmentedButtons: {
        marginHorizontal: 12,
        marginBottom: 12,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
        alignItems: 'center',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatPartnerName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    chatTime: {
        fontSize: 12,
        color: '#868e96',
    },
    chatLastMessage: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    chatRoleLabel: {
        fontSize: 12,
        color: theme.colors.primary,
        marginTop: 4,
        fontWeight: '500',
    },
    chatEmptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    chatEmptyText: {
        color: '#868e96',
        fontSize: 14,
    },
    chatCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    chatWarningText: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    chatRoomHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        elevation: 2,
    },
    chatRoomBackButton: {
        marginRight: 12,
        padding: 4,
    },
    chatRoomHeaderTitleContainer: {
        flex: 1,
        marginLeft: 12,
    },
    chatRoomHeaderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    chatRoomHeaderSubtitle: {
        fontSize: 12,
        color: theme.colors.success,
        fontWeight: '500',
    },
    chatMessageList: {
        paddingHorizontal: 12,
        paddingVertical: 16,
    },
    chatMessageContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-end',
        maxWidth: '80%',
    },
    chatMyMessageContainer: {
        alignSelf: 'flex-end',
    },
    chatPartnerMessageContainer: {
        alignSelf: 'flex-start',
    },
    chatAvatar: {
        marginRight: 8,
        marginBottom: 2,
    },
    chatBubble: {
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1,
        elevation: 1,
    },
    chatMyBubble: {
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 2,
    },
    chatPartnerBubble: {
        backgroundColor: theme.colors.white,
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    chatMessageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    chatMyMessageText: {
        color: theme.colors.white,
    },
    chatPartnerMessageText: {
        color: theme.colors.text,
    },
    chatTimestamp: {
        fontSize: 9,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    chatMyTimestamp: {
        color: theme.colors.border,
    },
    chatPartnerTimestamp: {
        color: '#868e96',
    },
    chatInputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        alignItems: 'center',
    },
    chatInput: {
        flex: 1,
        backgroundColor: '#f1f3f5',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 15,
        maxHeight: 100,
        color: theme.colors.text,
    },
    chatSendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    }
});

export default { ...GlobalStyles, ...localStyles };
