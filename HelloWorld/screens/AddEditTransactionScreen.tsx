import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryPicker from '../components/CategoryPicker';
import { Transaction, TransactionType } from '../types/transaction';
import { formatCurrency } from '../services/transactionService';

interface AddEditTransactionScreenProps {
  initialTransaction?: Transaction | null;
  defaultType?: TransactionType;
  onSave: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    note?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function AddEditTransactionScreen({
  initialTransaction,
  defaultType = 'expense',
  onSave,
  onCancel,
}: AddEditTransactionScreenProps) {
  const isEditing = Boolean(initialTransaction);

  const [type, setType] = useState<TransactionType>(
    initialTransaction ? initialTransaction.type : defaultType
  );
  const [amountStr, setAmountStr] = useState<string>(
    initialTransaction ? String(initialTransaction.amount) : ''
  );
  const [category, setCategory] = useState<string>(
    initialTransaction ? initialTransaction.category : (type === 'income' ? 'Tiền lương' : 'Ăn uống')
  );
  const [date, setDate] = useState<string>(
    initialTransaction ? initialTransaction.date : new Date().toISOString().split('T')[0]
  );
  const [note, setNote] = useState<string>(
    initialTransaction?.note || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Khi đổi type thì đổi danh mục mặc định phù hợp
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('Tiền lương');
    } else {
      setCategory('Ăn uống');
    }
  };

  const handleQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(d.toISOString().split('T')[0]);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    const parsedAmount = parseFloat(amountStr.replace(/[^0-9]/g, ''));

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Số tiền phải lớn hơn 0.');
      return;
    }

    if (!category.trim()) {
      setErrorMessage('Vui lòng chọn danh mục giao dịch.');
      return;
    }

    if (!date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      setErrorMessage('Định dạng ngày không hợp lệ. Vui lòng nhập định dạng YYYY-MM-DD (VD: 2026-10-27).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        type,
        amount: parsedAmount,
        category,
        date: date.trim(),
        note: note.trim(),
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể lưu giao dịch. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  const numericAmount = parseFloat(amountStr.replace(/[^0-9]/g, '')) || 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Chỉnh Sửa Giao Dịch' : 'Thêm Giao Dịch Mới'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Toggle Type: Thu Nhập / Chi Tiêu */}
        <View style={styles.typeToggleContainer}>
          <TouchableOpacity
            style={[
              styles.typeToggleButton,
              type === 'expense' && styles.typeToggleActiveExpense,
            ]}
            onPress={() => handleTypeChange('expense')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-up-circle"
              size={18}
              color={type === 'expense' ? '#FFFFFF' : '#EF4444'}
            />
            <Text
              style={[
                styles.typeToggleText,
                type === 'expense' && styles.typeToggleTextActive,
              ]}
            >
              Khoản Chi (-)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeToggleButton,
              type === 'income' && styles.typeToggleActiveIncome,
            ]}
            onPress={() => handleTypeChange('income')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-down-circle"
              size={18}
              color={type === 'income' ? '#FFFFFF' : '#10B981'}
            />
            <Text
              style={[
                styles.typeToggleText,
                type === 'income' && styles.typeToggleTextActive,
              ]}
            >
              Khoản Thu (+)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Nhập số tiền */}
        <View style={styles.amountInputCard}>
          <Text style={styles.fieldLabel}>Số tiền (VND) *</Text>
          <View style={styles.amountInputRow}>
            <Text style={[styles.currencyPrefix, { color: type === 'income' ? '#10B981' : '#EF4444' }]}>
              {type === 'income' ? '+' : '-'}
            </Text>
            <TextInput
              style={[styles.amountInput, { color: type === 'income' ? '#10B981' : '#EF4444' }]}
              placeholder="0"
              placeholderTextColor="#CBD5E1"
              keyboardType="numeric"
              value={amountStr}
              onChangeText={setAmountStr}
              autoFocus={!isEditing}
            />
          </View>
          {numericAmount > 0 && (
            <Text style={styles.amountPreviewText}>
              Bằng chữ / Quy đổi: {formatCurrency(numericAmount)}
            </Text>
          )}
        </View>

        {/* Bộ chọn danh mục */}
        <CategoryPicker
          selectedType={type}
          selectedCategory={category}
          onSelectCategory={setCategory}
        />

        {/* Nhập Ngày giao dịch */}
        <View style={styles.sectionCard}>
          <Text style={styles.fieldLabel}>Ngày giao dịch (YYYY-MM-DD) *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="calendar-outline" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="2026-10-27"
              placeholderTextColor="#94A3B8"
              value={date}
              onChangeText={setDate}
            />
          </View>
          {/* Quick date buttons */}
          <View style={styles.quickDateRow}>
            <TouchableOpacity style={styles.quickDateBtn} onPress={() => handleQuickDate(0)}>
              <Text style={styles.quickDateText}>Hôm nay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickDateBtn} onPress={() => handleQuickDate(1)}>
              <Text style={styles.quickDateText}>Hôm qua</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickDateBtn} onPress={() => handleQuickDate(2)}>
              <Text style={styles.quickDateText}>2 ngày trước</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ghi chú */}
        <View style={styles.sectionCard}>
          <Text style={styles.fieldLabel}>Ghi chú (Tùy chọn)</Text>
          <View style={[styles.inputWrapper, { height: 70, alignItems: 'flex-start', paddingTop: 8 }]}>
            <Ionicons name="create-outline" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { height: 50, textAlignVertical: 'top' }]}
              placeholder="VD: Mua sách học React Native, ăn trưa với bạn bè..."
              placeholderTextColor="#94A3B8"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        </View>

        {/* Nút Submit */}
        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Lưu Thay Đổi' : 'Thêm Giao Dịch'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  backButton: {
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
  scrollContent: {
    padding: 16,
  },
  typeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  typeToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 6,
  },
  typeToggleActiveExpense: {
    backgroundColor: '#EF4444',
  },
  typeToggleActiveIncome: {
    backgroundColor: '#10B981',
  },
  typeToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  typeToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    flex: 1,
  },
  amountInputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
  },
  amountPreviewText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickDateBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  quickDateText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
