import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ----------------------------------------------------------------------------------
// CẤU HÌNH THÔNG TIN DỰ ÁN FIREBASE CỦA BẠN:
// 1. Truy cập https://console.firebase.google.com/
// 2. Tạo hoặc chọn Project -> Cài đặt dự án (Project settings) -> General
// 3. Thêm Web App (</>) và copy thông tin `firebaseConfig` vào bên dưới
// ----------------------------------------------------------------------------------
export const firebaseConfig = {
  apiKey: "AIzaSyAlDNA3WMp0pcfixDVHYtX3tL17v5n1A9w",
  authDomain: "quanlychitieu-6a210.firebaseapp.com",
  projectId: "quanlychitieu-6a210",
  storageBucket: "quanlychitieu-6a210.firebasestorage.app",
  messagingSenderId: "554304143809",
  appId: "1:554304143809:web:c52e39476883367de26f40",
  measurementId: "G-XR9DF0KCKQ"
};

// Kiểm tra xem cấu hình đã được thay thế bằng key thật hay chưa
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId !== "your-project-id"
);

// Khởi tạo Firebase App
let app: any;
let auth: any;
let db: any;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  if (isFirebaseConfigured) {
    // Khởi tạo Auth với AsyncStorage để tự động duy trì phiên đăng nhập
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      auth = getAuth(app);
    }
    db = getFirestore(app);
  }
} catch (error) {
  console.warn('Firebase init warning:', error);
}

export { app, auth, db };
