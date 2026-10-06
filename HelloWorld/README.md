# Hello World - React Native (Expo) UI Project

Dự án này là một ứng dụng di động được xây dựng bằng **React Native** (thông qua **Expo**). Ứng dụng tập trung vào việc tạo ra giao diện người dùng (UI) hiện đại, mượt mà và tương thích tốt trên các thiết bị khác nhau (đặc biệt đã tối ưu hóa cho màn hình tai thỏ như iPhone XS Max).

## 🚀 Tính năng nổi bật (Features)

1. **Điều hướng cơ bản (Simple Navigation):**
   - Hệ thống tab điều hướng phía trên màn hình để chuyển đổi nhanh giữa hai màn hình chính: **Login** và **Shopping Cart**.
   - Trạng thái được quản lý tại file `App.tsx` bằng `useState`.

2. **Màn hình Login (LoginScreen.tsx):**
   - Giao diện đăng nhập hiện đại với ảnh đại diện.
   - Các trường nhập liệu (Email, Mật khẩu) tùy chỉnh đi kèm với Icon (từ `@expo/vector-icons`).
   - Có tính năng **hiển thị/ẩn mật khẩu**.
   - Checkbox "Remember password" tự tùy chỉnh (custom UI).
   - **Xác thực dữ liệu (Form Validation):** Tự động báo lỗi đỏ dưới ô nhập liệu nếu người dùng để trống hoặc nhập sai định dạng email/mật khẩu quá ngắn.
   - Tích hợp `KeyboardAvoidingView` để bàn phím không che lấp nút bấm khi gõ.

3. **Màn hình Giỏ hàng (ShoppingCart.tsx):**
   - Hiển thị danh sách sản phẩm bằng `FlatList` giúp tối ưu hiệu năng (chỉ render các phần tử nằm trên màn hình).
   - Cho phép **Tăng/Giảm số lượng** từng mặt hàng.
   - Cho phép **Tích chọn/Bỏ chọn** sản phẩm để thanh toán (Checkbox).
   - Hệ thống **tự động tính tổng tiền (Total)** dưới cùng theo thời gian thực dựa trên các mặt hàng đang được tích chọn.
   - Tính năng **Delete**: Xóa các mặt hàng đã được tích chọn khỏi danh sách giỏ hàng.

## 🛠 Cấu trúc thư mục (Folder Structure)

```text
HelloWorld/
│
├── App.tsx                    # Điểm bắt đầu (Entry point) của ứng dụng, chứa khung điều hướng và SafeAreaView
├── package.json               # Chứa các thông tin về thư viện và script của dự án
│
├── assets/                    # Thư mục mặc định của Expo (chứa icon app, splash screen)
│
└── screens/                   # Nơi chứa các component giao diện màn hình
    ├── LoginScreen.tsx        # Giao diện màn hình đăng nhập
    ├── ShoppingCart.tsx       # Giao diện giỏ hàng
    └── PlatformScreen.tsx     # (Code cũ) Màn hình hiển thị thông tin nền tảng
```

## 🖼 Về vấn đề Hình Ảnh (Images/Assets)

Bạn có thể thắc mắc tại sao không thấy các hình ảnh của người dùng (avatar) hay giày dép trong thư mục `assets`. 

**Câu trả lời là:** Hệ thống **không** lưu bất kỳ ảnh tĩnh nào vào thư mục `assets` của bạn để tránh làm nặng dự án ban đầu. Thay vào đó, trong code, dự án đang lấy ảnh trực tiếp từ internet (Network Images) bằng cách sử dụng các đường link URL.

*Ví dụ trong code `ShoppingCart.tsx`:*
```tsx
<Image source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' }} />
```
Khi máy ảo hoặc điện thoại của bạn có kết nối internet, nó sẽ tự động tải các ảnh này về và hiển thị. Nếu bạn muốn dùng ảnh offline (ảnh lưu trong máy), bạn có thể tải ảnh về bỏ vào thư mục `assets` và sửa lại code thành `<Image source={require('../assets/ten-anh.png')} />`.

## ⚙️ Hướng dẫn cài đặt và khởi chạy (How to run)

1. Đảm bảo bạn đã cài đặt Node.js.
2. Mở terminal tại thư mục `HelloWorld`.
3. Chạy lệnh cài đặt các gói phụ thuộc (nếu chưa cài):
   ```bash
   npm install
   ```
4. Đảm bảo đã cài đặt bộ icon (đã được tự động xử lý trước đó):
   ```bash
   npx expo install @expo/vector-icons
   ```
5. Chạy dự án:
   ```bash
   npm run start
   ```
   hoặc
   ```bash
   npx expo start
   ```
6. Bấm phím `i` để mở trên giả lập iOS, hoặc phím `a` để mở trên giả lập Android. Bấm phím `r` để reload lại app nếu có lỗi.

## 📖 Giải thích chi tiết code LoginScreen.tsx

Dưới đây là phần giải thích chi tiết cho từng đoạn code quan trọng trong file `LoginScreen.tsx` mà bạn vừa xem:

### 1. Import các thư viện cần thiết
```tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
```
- `useState`: Hook của React để lưu trữ trạng thái (như dữ liệu người dùng nhập, trạng thái lỗi, v.v.).
- Các component từ `react-native`: `View` (tương đương thẻ div trong HTML), `Text` (để hiển thị chữ), `TextInput` (để nhập liệu), `TouchableOpacity` (nút bấm có hiệu ứng mờ), `Image` (hiển thị ảnh), `KeyboardAvoidingView` và `ScrollView` (để giao diện cuộn lên không bị bàn phím che lấp).
- `Feather`: Bộ icon để hiển thị biểu tượng ổ khóa, con mắt, bì thư.

### 2. Khởi tạo State (Trạng thái)
```tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [rememberMe, setRememberMe] = useState(false);
const [emailError, setEmailError] = useState('');
const [passwordError, setPasswordError] = useState('');
```
Đây là nơi lưu trữ các biến thay đổi trên màn hình:
- `email`, `password`: Lưu giá trị chuỗi văn bản người dùng gõ vào.
- `showPassword`: Cờ (boolean) để xác định xem mật khẩu đang hiển thị dạng chữ hay dạng dấu `*`.
- `rememberMe`: Trạng thái của nút Checkbox "Lưu mật khẩu".
- `emailError`, `passwordError`: Chứa chuỗi thông báo lỗi (ví dụ: "Email is required") hiển thị màu đỏ dưới ô nhập.

### 3. Hàm xử lý Đăng nhập (handleLogin)
```tsx
const handleLogin = () => {
  let valid = true;
  // Kiểm tra email
  if (!email) {
    setEmailError('Email is required.');
    valid = false;
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    setEmailError('Invalid email format.');
    valid = false;
  } else { ... }
  // Tương tự cho password...
```
- Hàm này được gọi khi bấm nút "Login". Nó sẽ kiểm tra xem (validate) email có trống không, có đúng định dạng email tiêu chuẩn (có chữ @) không bằng biểu thức chính quy (Regex). 
- Nếu có lỗi, state lỗi sẽ được gán giá trị tương ứng. Nếu mọi thứ hợp lệ (`valid = true`), code sẽ chuyển sang logic gọi API thực tế.

### 4. Xử lý Bàn phím (Keyboard)
```tsx
<KeyboardAvoidingView 
  style={styles.container}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
```
- Khi code app trên điện thoại, bàn phím hiện lên rất dễ che mất nút "Login". `<KeyboardAvoidingView>` kết hợp với `<ScrollView>` giúp toàn bộ nội dung tự động đẩy lên hoặc cho phép cuộn xuống khi bàn phím ảo bật lên. (Xử lý behavior khác nhau một chút giữa `ios` và `android`).

### 5. Giao diện Ô nhập liệu (Input)
```tsx
<View style={styles.inputContainer}>
  <Feather name="mail" size={20} color="#888" style={styles.inputIcon} />
  <TextInput ... />
</View>
{emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
```
- Để làm được ô nhập liệu đẹp có icon ở bên trái, chúng ta bọc icon (`Feather`) và thẻ `<TextInput>` vào trong một thẻ `<View>` có định dạng CSS ngang (`flexDirection: 'row'`).
- Dòng `{emailError ? ...}` là điều kiện rẽ nhánh: Nếu biến `emailError` có giá trị, nó sẽ render ra dòng chữ cảnh báo màu đỏ ở ngay dưới ô input.

### 6. Tính năng Ẩn/Hiện mật khẩu
```tsx
<TextInput secureTextEntry={!showPassword} ... />
<TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
  <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#888" />
</TouchableOpacity>
```
- Thuộc tính `secureTextEntry` mặc định quyết định chữ có bị biến thành dấu `*` hay không.
- Khi người dùng bấm vào icon con mắt (`TouchableOpacity`), biến `showPassword` sẽ bị đảo ngược giá trị, từ đó đổi luôn hình ảnh icon (giữa `eye` và `eye-off`).

### 7. Tự chế Checkbox (Custom Checkbox)
```tsx
<TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
    {rememberMe && <Feather name="check" size={14} color="#000" />}
  </View>
  <Text style={styles.checkboxLabel}>Remember password</Text>
</TouchableOpacity>
```
- Khác với web, React Native không có thẻ `<input type="checkbox">` sẵn. Chúng ta tự tạo bằng cách dùng thẻ `<View>` vẽ thành hình vuông.
- Nếu `rememberMe` là `true`, ta đổi màu viền sang đen và render icon dấu tick (`Feather name="check"`) bên trong. Bấm vào thì nó sẽ tự động đảo trạng thái.

### 8. Định dạng giao diện (StyleSheet)
```tsx
const styles = StyleSheet.create({ ... });
```
- Phần dưới cùng là hệ thống CSS của React Native. Mọi màu sắc (`backgroundColor`), kích thước bo góc (`borderRadius`), màu viền (`borderColor`) đều được khai báo tại đây. Nó hoạt động tương tự như Flexbox trong CSS thông thường nhưng viết bằng Javascript Object.
