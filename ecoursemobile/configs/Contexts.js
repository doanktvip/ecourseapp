import React, { createContext, useState, useContext, useEffect, useReducer } from 'react';
import { useColorScheme } from 'react-native';
import Theme from '../styles/Theme';
import MyUserReducer from '../reducers/reducers';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Khởi tạo Context cho hệ thống giao diện Sáng/Tối
export const ThemeContext = createContext({
  themeMode: 'light',
  toggleTheme: () => {},
  theme: Theme.light,
});

// Khởi tạo Context cho người dùng hiện tại
export const MyUserContext = createContext();

/**
 * Component Provider bao bọc toàn bộ ứng dụng để chia sẻ trạng thái Theme
 */
export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); // Tự động phát hiện cài đặt hệ thống (light / dark)
  const [themeMode, setThemeMode] = useState(systemScheme || 'light');

  // Đọc giao diện đã lưu từ bộ nhớ máy khi ứng dụng khởi chạy
  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('user_theme');
        if (storedTheme) {
          setThemeMode(storedTheme);
        } else if (systemScheme) {
          setThemeMode(systemScheme);
        }
      } catch (error) {
        console.error('Lỗi khi tải theme đã lưu:', error);
      }
    };
    loadStoredTheme();
  }, []);

  // Hàm chuyển đổi qua lại giữa Light và Dark mode và lưu vào bộ nhớ máy
  const toggleTheme = () => {
    requestAnimationFrame(async () => {
      const nextMode = themeMode === 'light' ? 'dark' : 'light';
      setThemeMode(nextMode);
      try {
        await AsyncStorage.setItem('user_theme', nextMode);
      } catch (error) {
        console.error('Lỗi khi lưu cài đặt theme:', error);
      }
    });
  };

  // Trích xuất mã màu tương ứng với trạng thái hiện tại
  const theme = Theme[themeMode];

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom Hook useTheme() giúp các components dễ dàng lấy mã màu và hàm chuyển đổi theme
 * @returns {{ themeMode: 'light'|'dark', toggleTheme: function, theme: typeof LIGHT_THEME }}
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme() phải được gọi bên trong một <ThemeProvider />');
  }
  return context;
};

/**
 * Provider quản lý người dùng đăng nhập trong toàn hệ thống
 */
export const MyUserProvider = ({ children }) => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={{ user, dispatch }}>
      {children}
    </MyUserContext.Provider>
  );
};

/**
 * Custom Hook useUser() giúp lấy thông tin người dùng đang đăng nhập và hàm cập nhật
 * @returns {{ user: object|null, dispatch: function }}
 */
export const useUser = () => {
  const context = useContext(MyUserContext);
  if (!context) {
    throw new Error('useUser() phải được gọi bên trong một <MyUserProvider />');
  }
  return context;
};
