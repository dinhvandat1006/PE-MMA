import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import TransactionListScreen from './screens/TransactionListScreen';
import AddEditTransactionScreen from './screens/AddEditTransactionScreen';
import TransactionDetailScreen from './screens/TransactionDetailScreen';

import {
  UserSession,
  getStoredSession,
  logoutUser,
  subscribeAuthState,
} from './services/authService';
import {
  Transaction,
  FinancialSummary,
  TransactionType,
} from './types/transaction';
import {
  subscribeTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  calculateFinancialSummary,
} from './services/transactionService';

type ActiveTab = 'dashboard' | 'transactions';
type ActiveSubScreen = 'none' | 'add' | 'edit' | 'detail';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Dữ liệu giao dịch của tài khoản hiện tại
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Quản lý điều hướng màn hình
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeSubScreen, setActiveSubScreen] = useState<ActiveSubScreen>('none');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [defaultAddType, setDefaultAddType] = useState<TransactionType>('expense');

  // 1. Khôi phục phiên đăng nhập khi khởi động app (Session Persistence)
  useEffect(() => {
    let isMounted = true;

    async function checkSavedSession() {
      try {
        const savedSession = await getStoredSession();
        if (isMounted) {
          if (savedSession) {
            setSession(savedSession);
          }
          setIsCheckingSession(false);
        }
      } catch (err) {
        if (isMounted) setIsCheckingSession(false);
      }
    }

    checkSavedSession();

    const unsubscribe = subscribeAuthState((currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        setIsCheckingSession(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // 2. Lắng nghe và đồng bộ dữ liệu giao dịch theo UserId (User Isolation)
  useEffect(() => {
    if (!session?.uid) {
      setTransactions([]);
      return;
    }

    const unsubscribe = subscribeTransactions(session.uid, (data) => {
      setTransactions(() => {
        const uniqueMap = new Map<string, Transaction>();
        data.forEach((item) => uniqueMap.set(item.id, item));
        return Array.from(uniqueMap.values()).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt
        );
      });
    });

    return () => {
      unsubscribe();
    };
  }, [session?.uid]);

  // 3. Tự động tính toán số dư, tổng thu, tổng chi (Reactive Financial Summary)
  const financialSummary: FinancialSummary = useMemo(() => {
    return calculateFinancialSummary(transactions);
  }, [transactions]);

  // Đăng nhập thành công
  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    setActiveTab('dashboard');
    setActiveSubScreen('none');
  };

  // Đăng xuất
  const handleLogout = async () => {
    await logoutUser();
    setSession(null);
    setTransactions([]);
    setSelectedTransaction(null);
    setActiveSubScreen('none');
    setActiveTab('dashboard');
  };

  // Mở form thêm giao dịch
  const handleOpenAdd = (type: TransactionType = 'expense') => {
    setDefaultAddType(type);
    setSelectedTransaction(null);
    setActiveSubScreen('add');
  };

  // Mở màn hình chi tiết giao dịch
  const handleOpenDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setActiveSubScreen('detail');
  };

  // Mở form chỉnh sửa giao dịch
  const handleOpenEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setActiveSubScreen('edit');
  };

  // Lưu giao dịch (Thêm mới)
  const handleSaveAdd = async (data: {
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    note?: string;
  }) => {
    if (!session?.uid) return;
    const newTx = await addTransaction(session.uid, data);
    setTransactions((prev) => {
      if (prev.some((item) => item.id === newTx.id)) return prev;
      return [newTx, ...prev];
    });
    setActiveSubScreen('none');
  };

  // Lưu giao dịch (Cập nhật)
  const handleSaveEdit = async (data: {
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    note?: string;
  }) => {
    if (!session?.uid || !selectedTransaction) return;
    const updated: Transaction = {
      ...selectedTransaction,
      type: data.type,
      amount: data.amount,
      category: data.category,
      date: data.date,
      note: data.note,
    };
    await updateTransaction(session.uid, updated);
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    setSelectedTransaction(updated);
    setActiveSubScreen('detail'); // Quay về màn hình chi tiết
  };

  // Xóa giao dịch
  const handleDeleteTransaction = async (transactionId: string) => {
    if (!session?.uid) return;
    await deleteTransaction(session.uid, transactionId);
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    setSelectedTransaction(null);
    setActiveSubScreen('none');
  };

  // Màn hình chờ kiểm tra Session khi mở app
  if (isCheckingSession) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.splashTitle}>Finance Tracker</Text>
        <Text style={styles.splashSubtitle}>Đang khôi phục phiên đăng nhập...</Text>
      </SafeAreaView>
    );
  }

  // Nếu chưa đăng nhập -> Hiển thị LoginScreen
  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </SafeAreaView>
    );
  }

  // Điều hướng các Sub-screen (Add / Edit / Detail)
  if (activeSubScreen === 'add') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <AddEditTransactionScreen
          defaultType={defaultAddType}
          onSave={handleSaveAdd}
          onCancel={() => setActiveSubScreen('none')}
        />
      </SafeAreaView>
    );
  }

  if (activeSubScreen === 'edit' && selectedTransaction) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <AddEditTransactionScreen
          initialTransaction={selectedTransaction}
          onSave={handleSaveEdit}
          onCancel={() => setActiveSubScreen('detail')}
        />
      </SafeAreaView>
    );
  }

  if (activeSubScreen === 'detail' && selectedTransaction) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <TransactionDetailScreen
          transaction={selectedTransaction}
          onBack={() => setActiveSubScreen('none')}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteTransaction}
        />
      </SafeAreaView>
    );
  }

  // Màn hình chính kèm Bottom Navigation Tab Bar
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Nội dung Tab */}
      <View style={styles.mainContent}>
        {activeTab === 'dashboard' ? (
          <DashboardScreen
            session={session}
            summary={financialSummary}
            transactions={transactions}
            onOpenAddTransaction={handleOpenAdd}
            onOpenTransactionDetail={handleOpenDetail}
            onNavigateToList={() => setActiveTab('transactions')}
            onLogout={handleLogout}
          />
        ) : (
          <TransactionListScreen
            transactions={transactions}
            onOpenDetail={handleOpenDetail}
            onOpenAdd={() => handleOpenAdd('expense')}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('dashboard')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'dashboard' ? 'home' : 'home-outline'}
            size={24}
            color={activeTab === 'dashboard' ? '#2563EB' : '#94A3B8'}
          />
          <Text
            style={[
              styles.tabItemText,
              activeTab === 'dashboard' && styles.tabItemTextActive,
            ]}
          >
            Tổng quan
          </Text>
        </TouchableOpacity>

        {/* Nút Tròn Ở Giữa: Thêm Giao Dịch */}
        <TouchableOpacity
          style={styles.centerAddButton}
          onPress={() => handleOpenAdd('expense')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('transactions')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'transactions' ? 'receipt' : 'receipt-outline'}
            size={24}
            color={activeTab === 'transactions' ? '#2563EB' : '#94A3B8'}
          />
          <Text
            style={[
              styles.tabItemText,
              activeTab === 'transactions' && styles.tabItemTextActive,
            ]}
          >
            Lịch sử
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  splashSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
  },
  mainContent: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabItemText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  tabItemTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  centerAddButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
