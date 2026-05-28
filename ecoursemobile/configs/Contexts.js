import React, { createContext, useContext, useReducer } from 'react';
import MyUserReducer from '../reducers/reducers';

// Khởi tạo context dùng để lưu trữ dữ liệu người dùng toàn cục
export const UserContext = createContext();
export const MyUserContext = UserContext;

// Provider bọc lấy các component con để truyền state (user) xuống
export const UserProvider = ({ children }) => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  const contextValue = [user, dispatch];
  // Cho phép lấy giá trị thông qua object property để tiện lợi hơn
  contextValue.user = user;
  contextValue.dispatch = dispatch;

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook tùy chỉnh để truy cập nhanh state của User
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    return { user: null, dispatch: () => { } };
  }
  return context;
};