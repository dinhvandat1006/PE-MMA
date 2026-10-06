import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = () => {
    let valid = true;
    if (!email) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email format.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (valid) {
      // Proceed with login
      console.log('Login successful');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.title}>Welcome Back</Text>

        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4140/4140037.png' }} // Dummy avatar image similar to the design
          style={styles.avatar}
          resizeMode="contain"
        />

        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError('');
            }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#888" />
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Feather name="check" size={14} color="#000" />}
          </View>
          <Text style={styles.checkboxLabel}>Remember password</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupTextBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    marginTop: 15,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    borderColor: '#000',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#555',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#007BFF',
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#FF4D4D',
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#007BFF',
  },
  signupTextBold: {
    fontWeight: 'bold',
  },
});

export default LoginScreen;
