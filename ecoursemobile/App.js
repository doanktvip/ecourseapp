import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { UserProvider } from './configs/Contexts';
import AppNavigator from './navigation/AppNavigator';

// Component gốc của ứng dụng bao bọc các Provider toàn cục
const App = () => {
  return (
    // Xử lý hiển thị an toàn trên các thiết bị có tai thỏ (notch)
    <SafeAreaProvider>
      {/* Context cung cấp state user đăng nhập cho toàn app */}
      <UserProvider>
        {/* Provider của thư viện giao diện React Native Paper */}
        <PaperProvider>
          {/* Quản lý điều hướng chuyển trang */}
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}

export default App;
