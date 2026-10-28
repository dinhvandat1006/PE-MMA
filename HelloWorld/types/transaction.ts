export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO date format YYYY-MM-DD
  note?: string;
  createdAt: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface UserSession {
  uid: string;
  email: string;
  displayName?: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  icon: string; // Ionicons / MaterialIcons name
  type: TransactionType;
  color: string;
}

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  // Chi tiêu (Expense)
  { id: 'food', name: 'Ăn uống', icon: 'fast-food-outline', type: 'expense', color: '#FF6B6B' },
  { id: 'transport', name: 'Di chuyển', icon: 'car-outline', type: 'expense', color: '#FFA07A' },
  { id: 'shopping', name: 'Mua sắm', icon: 'cart-outline', type: 'expense', color: '#FF70A6' },
  { id: 'bills', name: 'Hóa đơn & Dịch vụ', icon: 'receipt-outline', type: 'expense', color: '#9B5DE5' },
  { id: 'entertainment', name: 'Giải trí', icon: 'game-controller-outline', type: 'expense', color: '#4EA8DE' },
  { id: 'health', name: 'Y tế & Sức khỏe', icon: 'medkit-outline', type: 'expense', color: '#06D6A0' },
  { id: 'education', name: 'Học tập & Sách', icon: 'book-outline', type: 'expense', color: '#3A86FF' },
  { id: 'other_expense', name: 'Chi tiêu khác', icon: 'ellipsis-horizontal-circle-outline', type: 'expense', color: '#8D99AE' },

  // Thu nhập (Income)
  { id: 'salary', name: 'Tiền lương', icon: 'cash-outline', type: 'income', color: '#2EC4B6' },
  { id: 'bonus', name: 'Tiền thưởng', icon: 'trophy-outline', type: 'income', color: '#FFD166' },
  { id: 'investment', name: 'Đầu tư & Lãi', icon: 'trending-up-outline', type: 'income', color: '#06D6A0' },
  { id: 'freelance', name: 'Làm thêm (Freelance)', icon: 'laptop-outline', type: 'income', color: '#118AB2' },
  { id: 'gift', name: 'Được tặng / Cho', icon: 'gift-outline', type: 'income', color: '#E07A5F' },
  { id: 'other_income', name: 'Thu nhập khác', icon: 'wallet-outline', type: 'income', color: '#2B9348' },
];
