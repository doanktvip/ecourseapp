import { StyleSheet } from 'react-native';

/**
 * Hàm khởi tạo và sinh bộ Styles động dựa trên Theme hiện hành (Sáng hoặc Tối)
 * @param {object} theme - Bộ mã màu của Theme hiện tại (LIGHT_THEME hoặc DARK_THEME)
 */
export const getGlobalStyles = (theme) => StyleSheet.create({
  // === 1. Hệ thống Khung nền & Bố cục (Layout Containers) ===
  container: {
    flex: 1,
    backgroundColor: theme.bgPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: theme.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // === 2. Vùng chứa nổi bật & Thẻ nội dung (Surfaces & Cards) ===
  card: {
    backgroundColor: theme.surfacePrimary,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    shadowColor: theme.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Đổ bóng trên Android
  },
  cardVariant: {
    backgroundColor: theme.surfaceVariant,
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
  },
  subContainer: {
    backgroundColor: theme.surfaceSecondary,
    borderRadius: 8,
    padding: 10,
  },
  overlay: {
    backgroundColor: theme.overlay,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardBody: {
    padding: 16,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
    paddingTop: 10,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  floatingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  headerWrapper: {
    marginTop: 16,
    marginBottom: 20,
  },
  bold: {
    fontWeight: '600',
  },

  // === 3. Hệ thống chữ & Văn bản (Typography) ===
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  body: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  small: {
    fontSize: 12,
    color: theme.textTertiary,
  },
  disabledText: {
    color: theme.textDisabled,
    fontSize: 14,
  },
  h3: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  caption: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 16,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },

  // === 4. Thành phần nút bấm (Buttons) ===
  btnPrimary: {
    backgroundColor: theme.btnPrimaryBg,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  btnPrimaryText: {
    color: theme.btnPrimaryText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnSecondary: {
    backgroundColor: theme.btnSecondaryBg,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.borderDefault,
  },
  btnSecondaryText: {
    color: theme.btnSecondaryText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnDisabled: {
    backgroundColor: theme.btnDisabledBg,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surfacePrimary,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // === 5. Thành phần ô nhập liệu (Input Fields) ===
  input: {
    backgroundColor: theme.inputBg,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: theme.textPrimary,
    marginVertical: 8,
  },
  inputFocus: {
    borderColor: theme.inputFocusBorder,
  },
  inputError: {
    borderColor: theme.inputErrorBorder,
  },

  // === 6. Khối thông báo Trạng thái (Semantic / Feedback Boxes) ===
  successBox: {
    backgroundColor: theme.successBg,
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: theme.successText + '22',
  },
  successBoxText: {
    color: theme.successText,
    fontWeight: '600',
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: theme.errorBg,
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: theme.errorText + '22',
  },
  errorBoxText: {
    color: theme.errorText,
    fontWeight: '600',
    fontSize: 14,
  },
  warningBox: {
    backgroundColor: theme.warningBg,
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: theme.warningText + '22',
  },
  warningBoxText: {
    color: theme.warningText,
    fontWeight: '600',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: theme.infoBg,
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: theme.infoText + '22',
  },
  infoBoxText: {
    color: theme.infoText,
    fontWeight: '600',
    fontSize: 14,
  },
  // === 7. Tìm kiếm & Avatars (Search & Avatars) ===
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfacePrimary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.btnPrimaryBg,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // === 8. Logos & Avatars Nâng Cao (Advanced Logos & Avatars) ===
  largeLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.btnPrimaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarPickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: theme.btnPrimaryBg,
  },
  largeAvatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.borderDefault,
  },
  profileAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: theme.btnPrimaryBg,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.btnPrimaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.surfacePrimary,
  },
  avatarBadgeLarge: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarBadgeSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  dashedUploadContainer: {
    backgroundColor: theme.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  // === 9. Thành phần Khác (Miscellaneous & Helpers) ===
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  promoBanner: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabContainer: {
    backgroundColor: theme.surfaceSecondary,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  progressBarTrack: {
    width: 80,
    height: 8,
    backgroundColor: theme.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.btnPrimaryBg,
  },
  squareIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  videoPlayer: {
    width: '100%',
    height: 220,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarSmallFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMedium: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.btnPrimaryBg,
  },
  cardActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
    paddingTop: 12,
  },
  detailBannerImage: {
    width: '100%',
    height: 220,
  },
});
