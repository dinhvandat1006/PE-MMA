import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, DEFAULT_CATEGORIES } from '../types/transaction';
import { formatCurrency } from '../services/transactionService';

interface TransactionDetailScreenProps {
  transaction: Transaction;
  onBack: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => Promise<void>;
}

export default function TransactionDetailScreen({
  transaction,
  onBack,
  onEdit,
  onDelete,
}: TransactionDetailScreenProps) {
  const isIncome = transaction.type === 'income';

  // Lấy icon và màu danh mục
  const catConfig = DEFAULT_CATEGORIES.find(
    (c) => c.name.toLowerCase() === transaction.category.toLowerCase()
  ) || {
    icon: isIncome ? 'wallet-outline' : 'cart-outline',
    color: isIncome ? '#10B981' : '#EF4444',
  };

  const confirmDelete = () => {
    Alert.alert(
      'Xác nhận xóa giao dịch',
      `Bạn có chắc chắn muốn xóa khoản ${isIncome ? 'thu' : 'chi'} ${formatCurrency(transaction.amount)} (${transaction.category})? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy bỏ', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            await onDelete(transaction.id);
            onBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Giao Dịch</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => onEdit(transaction)}>
          <Ionicons name="create-outline" size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Card số tiền nổi bật */}
        <View style={styles.amountCard}>
          <View style={[styles.categoryIconWrap, { backgroundColor: `${catConfig.color}20` }]}>
            <Ionicons name={catConfig.icon as any} size={36} color={catConfig.color} />
          </View>
          <Text style={[styles.amountText, { color: isIncome ? '#10B981' : '#EF4444' }]}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
          <Text style={styles.categoryNameText}>{transaction.category}</Text>

          <View style={[styles.typeBadge, { backgroundColor: isIncome ? '#ECFDF5' : '#FEF2F2' }]}>
            <Ionicons
              name={isIncome ? 'arrow-down-circle' : 'arrow-up-circle'}
              size={14}
              color={isIncome ? '#059669' : '#DC2626'}
            />
            <Text style={[styles.typeBadgeText, { color: isIncome ? '#059669' : '#DC2626' }]}>
              {isIncome ? 'Khoản Thu Nhập' : 'Khoản Chi Tiêu'}
            </Text>
          </View>
        </View>

        {/* Bảng chi tiết thông tin */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <Ionicons name="calendar-outline" size={18} color="#64748B" />
              <Text style={styles.infoLabel}>Ngày giao dịch</Text>
            </View>
            <Text style={styles.infoValue}>{transaction.date}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <Ionicons name="pricetag-outline" size={18} color="#64748B" />
              <Text style={styles.infoLabel}>Danh mục</Text>
            </View>
            <Text style={styles.infoValue}>{transaction.category}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#64748B" />
              <Text style={styles.infoLabel}>Ghi chú</Text>
            </View>
            <Text style={[styles.infoValue, !transaction.note && { fontStyle: 'italic', color: '#94A3B8' }]}>
              {transaction.note || 'Không có ghi chú'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <Ionicons name="time-outline" size={18} color="#64748B" />
              <Text style={styles.infoLabel}>Thời gian tạo</Text>
            </View>
            <Text style={styles.infoValue}>
              {new Date(transaction.createdAt).toLocaleString('vi-VN')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <Ionicons name="key-outline" size={18} color="#64748B" />
              <Text style={styles.infoLabel}>Mã định danh (ID)</Text>
            </View>
            <Text style={[styles.infoValue, styles.idText]} numberOfLines={1}>
              {transaction.id}
            </Text>
          </View>
        </View>

        {/* Nút Chỉnh sửa & Xóa */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(transaction)}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={18} color="#2563EB" />
            <Text style={styles.editButtonText}>Chỉnh Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={confirmDelete}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Xóa Giao Dịch</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    padding: 16,
  },
  amountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountText: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 4,
  },
  categoryNameText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    maxWidth: '55%',
    textAlign: 'right',
  },
  idText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
});
