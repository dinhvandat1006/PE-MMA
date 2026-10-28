import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEFAULT_CATEGORIES, TransactionType } from '../types/transaction';

interface CategoryPickerProps {
  selectedType: TransactionType;
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export default function CategoryPicker({
  selectedType,
  selectedCategory,
  onSelectCategory,
}: CategoryPickerProps) {
  // Lọc danh mục theo loại giao dịch đang chọn (Income / Expense)
  const availableCategories = DEFAULT_CATEGORIES.filter((c) => c.type === selectedType);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Chọn danh mục:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {availableCategories.map((item) => {
          const isSelected = selectedCategory.toLowerCase() === item.name.toLowerCase();
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.categoryCard,
                isSelected && {
                  borderColor: item.color,
                  backgroundColor: `${item.color}15`,
                  borderWidth: 2,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => onSelectCategory(item.name)}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: isSelected ? item.color : '#F1F5F9' },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={isSelected ? '#FFFFFF' : '#475569'}
                />
              </View>
              <Text
                style={[
                  styles.categoryText,
                  isSelected && { fontWeight: '700', color: item.color },
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  scrollList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 84,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
