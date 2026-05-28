import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Cấu hình kết nối tới Firebase Realtime Database
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Khởi tạo app firebase với các biến cấu hình
const app = initializeApp(firebaseConfig);

// Xuất ra instance của database để các component khác có thể sử dụng (lắng nghe realtime realtime)
export const database = getDatabase(app);
