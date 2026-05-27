/**
 * Reducer quản lý trạng thái đăng nhập của người dùng
 * @param {object|null} state - Thông tin người dùng hiện tại (hoặc null nếu chưa đăng nhập)
 * @param {object} action - Hành động thay đổi trạng thái (type: 'login' | 'logout', payload: dữ liệu user)
 */
const MyUserReducer = (state, action) => {
  switch (action.type) {
    case 'login':
      return action.payload;
    case 'logout':
      return null;
    default:
      return state;
  }
};

export default MyUserReducer;
