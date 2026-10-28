import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FinancialSummary } from '../types/transaction';
import { formatCurrency } from '../services/transactionService';

interface BalanceCardProps {
  summary: FinancialSummary;
}

export default function BalanceCard({ summary }: BalanceCardProps) {
  const isPositive = summary.balance >= 0;

  return (
    <View style={styles.cardContainer}>
      {/* Tiêu đề & Số dư chính */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.subtitle}>SỐ DƯ HIỆN TẠI</Text>
          <Text style={[styles.balanceAmount, { color: isPositive ? '#10B981' : '#EF4444' }]}>
            {formatCurrency(summary.balance)}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: isPositive ? '#ECFDF5' : '#FEF2F2' }]}>
          <Ionicons
            name={isPositive ? 'shield-checkmark' : 'alert-circle'}
            size={16}
            color={isPositive ? '#059669' : '#DC2626'}
          />
          <Text style={[styles.badgeText, { color: isPositive ? '#059669' : '#DC2626' }]}>
            {isPositive ? 'Tài chính ổn định' : 'Cần thắt chặt chi tiêu'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 2 Cột: Tổng Thu & Tổng Chi */}
      <View style={styles.statsRow}>
        {/* Cột Tổng Thu */}
        <View style={styles.statColumn}>
          <View style={styles.statIconBadgeIncome}>
            <Ionicons name="arrow-down" size={16} color="#10B981" />
          </View>
          <View style={styles.statTextWrap}>
            <Text style={styles.statLabel}>Tổng thu nhập</Text>
            <Text style={styles.incomeValue}>+{formatCurrency(summary.totalIncome)}</Text>
          </View>
        </View>

        <View style={styles.verticalDivider} />

        {/* Cột Tổng Chi */}
        <View style={styles.statColumn}>
          <View style={styles.statIconBadgeExpense}>
            <Ionicons name="arrow-up" size={16} color="#EF4444" />
          </View>
          <View style={styles.statTextWrap}>
            <Text style={styles.statLabel}>Tổng chi tiêu</Text>
            <Text style={styles.expenseValue}>-{formatCurrency(summary.totalExpense)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconBadgeIncome: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconBadgeExpense: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextWrap: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  incomeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34D399',
  },
  expenseValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F87171',
  },
  verticalDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#334155',
    marginHorizontal: 8,
  },
});
