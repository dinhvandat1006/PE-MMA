import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BalanceCard from '../components/BalanceCard';
import TransactionItem from '../components/TransactionItem';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { Transaction, UserSession, FinancialSummary } from '../types/transaction';
import { isFirebaseConfigured } from '../config/firebaseConfig';

interface DashboardScreenProps {
  session: UserSession;
  summary: FinancialSummary;
  transactions: Transaction[];
  onOpenAddTransaction: (initialType?: 'income' | 'expense') => void;
  onOpenTransactionDetail: (transaction: Transaction) => void;
  onNavigateToList: () => void;
  onLogout: () => void;
}

export default function DashboardScreen({
  session,
  summary,
  transactions,
  onOpenAddTransaction,
  onOpenTransactionDetail,
  onNavigateToList,
  onLogout,
}: DashboardScreenProps) {
  const [showChangePasswordModal, setShowChangePasswordModal] = React.useState(false);

  // Lọc duy nhất theo ID phòng ngừa trùng lặp key khi render
  const recentTransactions = React.useMemo(() => {
    const seen = new Set<string>();
    const list: Transaction[] = [];
    for (const t of transactions) {
      if (t && t.id && !seen.has(t.id)) {
        seen.add(t.id);
        list.push(t);
      }
    }
    return list.slice(0, 5);
  }, [transactions]);

  const confirmLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.userProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(session.displayName || session.email).charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {session.displayName || session.email.split('@')[0]}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Badge trạng thái lưu trữ */}
          <View style={styles.storageStatus}>
            <Ionicons
              name={isFirebaseConfigured ? 'cloud-done' : 'save'}
              size={14}
              color={isFirebaseConfigured ? '#059669' : '#D97706'}
            />
            <Text style={[styles.storageText, { color: isFirebaseConfigured ? '#059669' : '#D97706' }]}>
              {isFirebaseConfigured ? 'Firebase' : 'Local'}
            </Text>
          </View>

          {/* Nút Đổi mật khẩu */}
          <TouchableOpacity
            style={styles.keyButton}
            onPress={() => setShowChangePasswordModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="key-outline" size={18} color="#2563EB" />
          </TouchableOpacity>

          {/* Nút Đăng xuất */}
          <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Thẻ Số dư & Thu Chi */}
        <BalanceCard summary={summary} />

        {/* Các nút Thao tác nhanh (Quick Actions) */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickButton, styles.quickButtonIncome]}
            activeOpacity={0.8}
            onPress={() => onOpenAddTransaction('income')}
          >
            <View style={styles.quickIconIncome}>
              <Ionicons name="arrow-down-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.quickTextIncome}>+ Thêm Thu Nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, styles.quickButtonExpense]}
            activeOpacity={0.8}
            onPress={() => onOpenAddTransaction('expense')}
          >
            <View style={styles.quickIconExpense}>
              <Ionicons name="arrow-up-circle" size={20} color="#EF4444" />
            </View>
            <Text style={styles.quickTextExpense}>- Thêm Chi Tiêu</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Giao dịch gần đây */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
          {transactions.length > 0 && (
            <TouchableOpacity onPress={onNavigateToList} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>Xem tất cả ({transactions.length})</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentTransactions.length > 0 ? (
          recentTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onPress={onOpenTransactionDetail}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Chưa có giao dịch nào</Text>
            <Text style={styles.emptySubtitle}>
              Bắt đầu ghi chép các khoản thu nhập hoặc chi tiêu của bạn ngay hôm nay!
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => onOpenAddTransaction()}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addFirstButtonText}>Thêm giao dịch đầu tiên</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal Đổi Mật Khẩu */}
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 12,
    color: '#64748B',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    gap: 4,
  },
  storageText: {
    fontSize: 11,
    fontWeight: '600',
  },
  keyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginVertical: 4,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    gap: 6,
  },
  quickButtonIncome: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  quickButtonExpense: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  quickIconIncome: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickIconExpense: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickTextIncome: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  quickTextExpense: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
