import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import ShoppingCart from './screens/ShoppingCart';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'cart'>('login');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Navigation Header to switch between screens for demo purposes */}
      <View style={styles.navHeader}>
        <TouchableOpacity 
          style={[styles.navButton, currentScreen === 'login' && styles.activeNavButton]}
          onPress={() => setCurrentScreen('login')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'login' && styles.activeNavButtonText]}>
            Login Screen
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, currentScreen === 'cart' && styles.activeNavButton]}
          onPress={() => setCurrentScreen('cart')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'cart' && styles.activeNavButtonText]}>
            Shopping Cart
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen Content */}
      <View style={styles.content}>
        {currentScreen === 'login' ? <LoginScreen /> : <ShoppingCart />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'center',
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeNavButton: {
    backgroundColor: '#007BFF',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeNavButtonText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
});
