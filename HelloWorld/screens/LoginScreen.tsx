import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loginUser, registerUser, directResetPassword } from '../services/authService';
import { UserSession } from '../types/transaction';
import { isFirebaseConfigured } from '../config/firebaseConfig';

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate form
  const validateForm = (): boolean => {
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Định dạng email không hợp lệ (ví dụ: user@example.com).');
      return false;
    }

    if (!password) {
      setErrorMessage(
        authMode === 'forgot_password'
          ? 'Vui lòng nhập mật khẩu mới.'
          : 'Vui lòng nhập mật khẩu.'
      );
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự.');
      return false;
    }
    if ((authMode === 'register' || authMode === 'forgot_password') && password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (authMode === 'register') {
        const session = await registerUser(email, password, displayName);
        Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
        onLoginSuccess(session);
      } else if (authMode === 'login') {
        const session = await loginUser(email, password);
        onLoginSuccess(session);
      } else if (authMode === 'forgot_password') {
        await directResetPassword(email, password);
        Alert.alert(
          'Thành công',
          'Mật khẩu của bạn đã được cập nhật thành công! Hãy đăng nhập bằng mật khẩu mới.',
          [
            {
              text: 'Đăng nhập ngay',
              onPress: () => {
                setAuthMode('login');
                setPassword('');
                setConfirmPassword('');
                setErrorMessage(null);
              },
            },
          ]
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header App */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="wallet" size={38} color="#2563EB" />
          </View>
          <Text style={styles.appTitle}>Finance Tracker</Text>
          <Text style={styles.appSubtitle}>
            {authMode === 'forgot_password'
              ? 'Đặt lại mật khẩu trực tiếp'
              : 'Quản lý thu chi cá nhân thông minh'}
          </Text>

          {/* Badge chế độ lưu trữ */}
          <View style={styles.storageBadge}>
            <Ionicons
              name={isFirebaseConfigured ? 'cloud-done-outline' : 'save-outline'}
              size={14}
              color={isFirebaseConfigured ? '#059669' : '#D97706'}
            />
            <Text style={[styles.storageBadgeText, { color: isFirebaseConfigured ? '#059669' : '#D97706' }]}>
              {isFirebaseConfigured ? 'Firebase Cloud' : 'Offline Persistence Mode'}
            </Text>
          </View>
        </View>

        {/* Tab chuyển Đăng nhập / Đăng ký (chỉ hiện khi không ở chế độ Quên mật khẩu) */}
        {authMode !== 'forgot_password' ? (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, authMode === 'login' && styles.activeTabButton]}
              onPress={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
            >
              <Text style={[styles.tabText, authMode === 'login' && styles.activeTabText]}>Đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, authMode === 'register' && styles.activeTabButton]}
              onPress={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
            >
              <Text style={[styles.tabText, authMode === 'register' && styles.activeTabText]}>Đăng ký mới</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.forgotHeaderBox}>
            <TouchableOpacity
              style={styles.backToLoginRow}
              onPress={() => {
                setAuthMode('login');
                setPassword('');
                setConfirmPassword('');
                setErrorMessage(null);
              }}
            >
              <Ionicons name="arrow-back" size={18} color="#2563EB" />
              <Text style={styles.backToLoginText}>Quay lại Đăng nhập</Text>
            </TouchableOpacity>
            <Text style={styles.forgotInstruction}>
              Nhập email tài khoản và thiết lập mật khẩu mới ngay tại đây (không cần chờ email).
            </Text>
          </View>
        )}

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Input fields */}
        <View style={styles.formContainer}>
          {authMode === 'register' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên người dùng</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập tên của bạn"
                  placeholderTextColor="#94A3B8"
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email tài khoản</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="user@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {authMode === 'forgot_password' ? 'Mật khẩu mới (tối thiểu 6 ký tự)' : 'Mật khẩu'}
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Tối thiểu 6 ký tự"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Nút Quên mật khẩu ở chế độ Login */}
          {authMode === 'login' && (
            <View style={styles.forgotPasswordRow}>
              <TouchableOpacity
                onPress={() => {
                  setAuthMode('forgot_password');
                  setPassword('');
                  setConfirmPassword('');
                  setErrorMessage(null);
                }}
              >
                <Text style={styles.forgotPasswordLink}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>
          )}

          {(authMode === 'register' || authMode === 'forgot_password') && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {authMode === 'forgot_password' ? 'Xác nhận mật khẩu mới' : 'Xác nhận mật khẩu'}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>
          )}

          {/* Nút bấm Submit */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {authMode === 'register'
                  ? 'Đăng Ký Tài Khoản'
                  : authMode === 'login'
                  ? 'Đăng Nhập'
                  : 'Cập Nhật Mật Khẩu Mới'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 10,
    textAlign: 'center',
  },
  storageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  storageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  forgotHeaderBox: {
    marginBottom: 16,
  },
  backToLoginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  forgotInstruction: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    flex: 1,
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {},
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordLink: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
