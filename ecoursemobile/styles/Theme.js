export const LIGHT_THEME = {
  // 1. Hệ thống màu nền & Bố cục (Background & Surface)
  bgPrimary: '#F8F9FA',         // Toàn bộ màn hình chính
  bgSecondary: '#FFFFFF',       // Màn hình phụ, vùng cài đặt
  surfacePrimary: '#FFFFFF',    // Thẻ (Cards), danh sách mục
  surfaceSecondary: '#F1F3F4',  // Vùng chứa nổi bật bên trong thẻ
  surfaceVariant: '#E8EAED',    // Banner, khối thông báo nội bộ
  overlay: 'rgba(0, 0, 0, 0.4)', // Làm mờ nền khi hiện Pop-up

  // 2. Hệ thống màu chữ (Typography)
  textPrimary: '#111111',       // Tiêu đề lớn (Headers), nội dung chính
  textSecondary: '#5F6368',     // Phụ đề (Subtitles), nhãn mô tả, ngày tháng
  textTertiary: '#8C9199',      // Văn bản gợi ý (Placeholder), bản quyền
  textDisabled: '#BCC1CA',      // Văn bản của nút hoặc ô nhập bị khóa
  textOnColor: '#FFFFFF',       // Màu chữ hiển thị trên nền nút đậm

  // 3. Hệ thống màu phân tách (Borders & Dividers)
  borderLight: '#F0F0F0',       // Đường kẻ mờ phân chia các dòng text
  borderDefault: '#E0E0E0',     // Đường viền quanh ô nhập liệu, viền thẻ
  borderStrong: '#999999',      // Viền của thành phần cần nhấn mạnh

  // 4. Thành phần nút bấm (Buttons)
  btnPrimaryBg: '#1A73E8',      // Nền nút bấm chính kêu gọi hành động (CTA)
  btnPrimaryText: '#FFFFFF',    // Màu chữ nằm trên nút bấm chính
  btnSecondaryBg: '#F0F2F5',    // Nền nút bấm phụ (Hủy, Bỏ qua)
  btnSecondaryText: '#1A73E8',  // Chữ nằm trên nút bấm phụ
  btnDisabledBg: '#E4E6EB',     // Nền nút khi chưa điền đủ thông tin

  // 5. Thành phần ô nhập liệu (Input Fields)
  inputBg: '#FFFFFF',           // Nền mặc định của ô nhập dữ liệu
  inputBorder: '#CCCCCC',       // Đường viền mặc định khi chưa chạm vào
  inputFocusBorder: '#1A73E8',  // Đường viền khi người dùng đang gõ chữ
  inputErrorBorder: '#C5221F',  // Đường viền khi người dùng nhập sai

  // 6. Thanh điều hướng & Điều khiển (Navigation & Controls)
  navBarBg: '#FFFFFF',          // Nền của Header bar và Bottom Tab bar
  navIconDefault: '#757575',    // Màu Icon khi chưa được chọn
  navIconActive: '#1A73E8',     // Màu Icon khi đang ở màn hình đó
  controlTrack: '#E0E0E0',      // Thanh ray của nút gạt (Switch), Slider
  controlThumb: '#FFFFFF',      // Núm tròn di chuyển của Switch, Slider

  // 7. Hệ thống màu trạng thái thông báo (Semantic / Feedback)
  successBg: '#E6F4EA',
  successText: '#137333',
  errorBg: '#FCE8E6',
  errorText: '#C5221F',
  warningBg: '#FEF7E0',
  warningText: '#B06000',
  infoBg: '#E8F0FE',
  infoText: '#1A73E8',

  // 8. Hệ thống kích thước & khoảng đệm chuẩn (Spacing & Sizing Tokens)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  iconSizes: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    huge: 48,
  },
};

// Định nghĩa mã màu cho chế độ Tối (Dark Mode)
export const DARK_THEME = {
  // 1. Hệ thống màu nền & Bố cục (Background & Surface)
  bgPrimary: '#121212',         // Toàn bộ màn hình chính
  bgSecondary: '#1C1C1E',       // Màn hình phụ, vùng cài đặt
  surfacePrimary: '#252528',    // Thẻ (Cards), danh sách mục
  surfaceSecondary: '#2C2C2E',  // Vùng chứa nổi bật bên trong thẻ
  surfaceVariant: '#3A3A3C',    // Banner, khối thông báo nội bộ
  overlay: 'rgba(0, 0, 0, 0.6)', // Làm mờ nền khi hiện Pop-up

  // 2. Hệ thống màu chữ (Typography)
  textPrimary: '#E4E6EB',       // Tiêu đề lớn (Headers), nội dung chính
  textSecondary: '#A0A5B1',     // Phụ đề (Subtitles), nhãn mô tả, ngày tháng
  textTertiary: '#727782',      // Văn bản gợi ý (Placeholder), bản quyền
  textDisabled: '#4E525A',      // Văn bản của nút hoặc ô nhập bị khóa
  textOnColor: '#FFFFFF',       // Màu chữ hiển thị trên nền nút đậm

  // 3. Hệ thống màu phân tách (Borders & Dividers)
  borderLight: '#252528',       // Đường kẻ mờ phân chia các dòng text
  borderDefault: '#3A3A3C',     // Đường viền quanh ô nhập liệu, viền thẻ
  borderStrong: '#55555A',      // Viền của thành phần cần nhấn mạnh

  // 4. Thành phần nút bấm (Buttons)
  btnPrimaryBg: '#8AB4F8',      // Nền nút bấm chính kêu gọi hành động (CTA)
  btnPrimaryText: '#121212',    // Màu chữ nằm trên nút bấm chính
  btnSecondaryBg: '#2C2C2E',    // Nền nút bấm phụ (Hủy, Bỏ qua)
  btnSecondaryText: '#8AB4F8',  // Chữ nằm trên nút bấm phụ
  btnDisabledBg: '#2D2D2D',     // Nền nút khi chưa điền đủ thông tin

  // 5. Thành phần ô nhập liệu (Input Fields)
  inputBg: '#1C1C1E',           // Nền mặc định của ô nhập dữ liệu
  inputBorder: '#3A3A3C',       // Đường viền mặc định khi chưa chạm vào
  inputFocusBorder: '#8AB4F8',  // Đường viền khi người dùng đang gõ chữ
  inputErrorBorder: '#F28B82',  // Đường viền khi người dùng nhập sai

  // 6. Thanh điều hướng & Điều khiển (Navigation & Controls)
  navBarBg: '#121212',          // Nền của Header bar và Bottom Tab bar
  navIconDefault: '#9AA0A6',    // Màu Icon khi chưa được chọn
  navIconActive: '#8AB4F8',     // Màu Icon khi đang ở màn hình đó
  controlTrack: '#3A3A3C',      // Thanh ray của nút gạt (Switch), Slider
  controlThumb: '#E4E6EB',      // Núm tròn di chuyển của Switch, Slider

  // 7. Hệ thống màu trạng thái thông báo (Semantic / Feedback)
  successBg: 'rgba(19, 115, 51, 0.2)',
  successText: '#81C995',
  errorBg: 'rgba(197, 34, 31, 0.2)',
  errorText: '#F28B82',
  warningBg: 'rgba(176, 96, 0, 0.2)',
  warningText: '#FDD663',
  infoBg: 'rgba(26, 115, 232, 0.2)',
  infoText: '#8AB4F8',

  // 8. Hệ thống kích thước & khoảng đệm chuẩn (Spacing & Sizing Tokens)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  iconSizes: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    huge: 48,
  },
};

// Xuất mặc định đối tượng chứa cả 2 chế độ màu
export default {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};
