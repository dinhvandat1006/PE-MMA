import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TransactionItem from '../components/TransactionItem';
import { Transaction, TransactionType, DEFAULT_CATEGORIES } from '../types/transaction';
import { filterTransactions, formatCurrency } from '../services/transactionService';

interface TransactionListScreenProps {
  transactions: Transaction[];
  onOpenDetail: (transaction: Transaction) => void;
  onOpenAdd: () => void;
}

export default function TransactionListScreen({
  transactions,
  onOpenDetail,
  onOpenAdd,
}: TransactionListScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  // Lọc danh sách giao dịch theo searchTerm, type và category (đảm bảo không trùng ID)
  const filteredList = useMemo(() => {
    const seen = new Set<string>();
    const uniqueTx = transactions.filter((t) => {
      if (!t || !t.id || seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    return filterTransactions(uniqueTx, {
      searchTerm,
      type: selectedType,
      category: selectedCategory,
    });
  }, [transactions, searchTerm, selectedType, selectedCategory]);

  // Tính tổng số tiền của kết quả đang lọc
  const filteredTotal = useMemo(() => {
    return filteredList.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  }, [filteredList]);

  // Danh mục duy nhất có trong dữ liệu hoặc tất cả danh mục
  const categoryOptions = useMemo(() => {
    const categoriesInList = Array.from(new Set(transactions.map((t) => t.category)));
    return ['all', ...categoriesInList];
  }, [transactions]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo ghi chú hoặc danh mục..."
            placeholderTextColor="#94A3B8"
            value={searchTerm}
            onChangeText={setSearchTerm}
            clearButtonMode="while-editing"
          />
          {searchTerm !== '' && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterToggleBtn, showCategoryFilter && styles.filterToggleBtnActive]}
          onPress={() => setShowCategoryFilter(!showCategoryFilter)}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={showCategoryFilter ? '#2563EB' : '#475569'}
          />
        </TouchableOpacity>
      </View>

      {/* Type Filter Chips (Tất cả / Thu nhập / Chi tiêu) */}
      <View style={styles.typeFilterRow}>
        <TouchableOpacity
          style={[styles.typeChip, selectedType === 'all' && styles.typeChipActiveAll]}
          onPress={() => setSelectedType('all')}
        >
          <Text style={[styles.typeChipText, selectedType === 'all' && styles.typeChipTextActive]}>
            Tất cả ({transactions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeChip, selectedType === 'income' && styles.typeChipActiveIncome]}
          onPress={() => setSelectedType('income')}
        >
          <Ionicons
            name="arrow-down"
            size={14}
            color={selectedType === 'income' ? '#059669' : '#10B981'}
          />
          <Text style={[styles.typeChipText, selectedType === 'income' && styles.typeChipTextActive]}>
            Thu nhập
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeChip, selectedType === 'expense' && styles.typeChipActiveExpense]}
          onPress={() => setSelectedType('expense')}
        >
          <Ionicons
            name="arrow-up"
            size={14}
            color={selectedType === 'expense' ? '#DC2626' : '#EF4444'}
          />
          <Text style={[styles.typeChipText, selectedType === 'expense' && styles.typeChipTextActive]}>
            Chi tiêu
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown / Horizontal chips chọn danh mục nếu bấm icon Filter */}
      {showCategoryFilter && (
        <View style={styles.categoryFilterContainer}>
          <Text style={styles.filterLabel}>Lọc theo danh mục:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChipsList}>
            {categoryOptions.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat === 'all' ? 'Tất cả danh mục' : cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Summary line của kết quả lọc */}
      <View style={styles.summaryBar}>
        <Text style={styles.resultCountText}>
          Hiển thị <Text style={styles.highlightText}>{filteredList.length}</Text> giao dịch
        </Text>
        <Text style={styles.totalFilteredText}>
          Biến động: <Text style={{ color: filteredTotal >= 0 ? '#10B981' : '#EF4444', fontWeight: '700' }}>
            {filteredTotal >= 0 ? '+' : ''}{formatCurrency(filteredTotal)}
          </Text>
        </Text>
      </View>

      {/* Danh sách giao dịch */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem transaction={item} onPress={onOpenDetail} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Không tìm thấy giao dịch nào</Text>
            <Text style={styles.emptySubtitle}>
              Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại bộ lọc.
            </Text>
            {(searchTerm !== '' || selectedType !== 'all' || selectedCategory !== 'all') && (
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                }}
              >
                <Text style={styles.resetFilterText}>Đặt lại bộ lọc</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fabButton} onPress={onOpenAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  filterToggleBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterToggleBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  typeFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  typeChipActiveAll: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  typeChipActiveIncome: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  typeChipActiveExpense: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  typeChipTextActive: {
    color: '#0F172A',
  },
  categoryFilterContainer: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  categoryChipsList: {
    gap: 6,
  },
  categoryChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultCountText: {
    fontSize: 12,
    color: '#64748B',
  },
  highlightText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  totalFilteredText: {
    fontSize: 12,
    color: '#64748B',
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetFilterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  resetFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
