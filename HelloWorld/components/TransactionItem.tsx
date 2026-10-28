import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, DEFAULT_CATEGORIES } from '../types/transaction';
import { formatCurrency } from '../services/transactionService';

interface TransactionItemProps {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export default function TransactionItem({ transaction, onPress, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';

  // Tìm icon và màu sắc cho danh mục
  const catConfig = DEFAULT_CATEGORIES.find(
    (c) => c.name.toLowerCase() === transaction.category.toLowerCase()
  ) || {
    icon: isIncome ? 'wallet-outline' : 'cart-outline',
    color: isIncome ? '#10B981' : '#EF4444',
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => onPress(transaction)}
    >
      {/* Icon danh mục */}
      <View style={[styles.iconContainer, { backgroundColor: `${catConfig.color}20` }]}>
        <Ionicons name={catConfig.icon as any} size={22} color={catConfig.color} />
      </View>

      {/* Thông tin chính */}
      <View style={styles.infoContainer}>
        <Text style={styles.categoryTitle} numberOfLines={1}>
          {transaction.category}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{transaction.date}</Text>
          {transaction.note ? (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.noteText} numberOfLines={1}>
                {transaction.note}
              </Text>
            </>
          ) : null}
        </View>
      </View>

      {/* Số tiền */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amountText, { color: isIncome ? '#10B981' : '#EF4444' }]}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
  },
  dot: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 5,
  },
  noteText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  chevron: {
    marginLeft: 4,
  },
});
