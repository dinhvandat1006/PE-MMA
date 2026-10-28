import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebaseConfig';
import { Transaction, FinancialSummary, TransactionType } from '../types/transaction';

const STORAGE_PREFIX = '@finance_tracker_transactions_';

/**
 * Lấy storage key cho từng tài khoản người dùng riêng biệt (User Isolation)
 */
function getUserStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

/**
 * Đọc toàn bộ giao dịch của người dùng từ Local Storage (tự động loại bỏ trùng ID)
 */
export async function getLocalTransactions(userId: string): Promise<Transaction[]> {
  try {
    const raw = await AsyncStorage.getItem(getUserStorageKey(userId));
    if (!raw) return [];
    const list: Transaction[] = JSON.parse(raw);
    const uniqueMap = new Map<string, Transaction>();
    list.forEach((item) => {
      if (item && item.id) uniqueMap.set(item.id, item);
    });
    return Array.from(uniqueMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt
    );
  } catch (error) {
    console.error('Lỗi khi đọc local transactions:', error);
    return [];
  }
}

/**
 * Lưu toàn bộ giao dịch của người dùng vào Local Storage (loại bỏ trùng ID)
 */
export async function saveLocalTransactions(userId: string, transactions: Transaction[]): Promise<void> {
  try {
    const uniqueMap = new Map<string, Transaction>();
    transactions.forEach((item) => {
      if (item && item.id) uniqueMap.set(item.id, item);
    });
    await AsyncStorage.setItem(getUserStorageKey(userId), JSON.stringify(Array.from(uniqueMap.values())));
  } catch (error) {
    console.error('Lỗi khi lưu local transactions:', error);
  }
}

/**
 * Thêm giao dịch mới
 */
export async function addTransaction(
  userId: string,
  data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
): Promise<Transaction> {
  if (!data.amount || Number(data.amount) <= 0) {
    throw new Error('Số tiền phải lớn hơn 0.');
  }
  if (!data.category || data.category.trim() === '') {
    throw new Error('Vui lòng chọn danh mục giao dịch.');
  }
  if (!data.date) {
    throw new Error('Vui lòng chọn ngày giao dịch.');
  }

  const newId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newTransaction: Transaction = {
    id: newId,
    userId,
    type: data.type,
    amount: Number(data.amount),
    category: data.category.trim(),
    date: data.date,
    note: data.note?.trim() || '',
    createdAt: Date.now(),
  };

  // 1. Lưu vào Local AsyncStorage (lọc bỏ nếu đã có ID trùng)
  const localList = await getLocalTransactions(userId);
  const updatedList = [newTransaction, ...localList.filter((t) => t.id !== newId)];
  await saveLocalTransactions(userId, updatedList);

  // 2. Nếu có cấu hình Firebase Firestore, đồng bộ lên Cloud
  if (isFirebaseConfigured && db) {
    try {
      const txDocRef = doc(db, 'users', userId, 'transactions', newId);
      await setDoc(txDocRef, newTransaction);
    } catch (fbErr) {
      console.warn('Lỗi đồng bộ Firestore (đã lưu local):', fbErr);
    }
  }

  return newTransaction;
}

/**
 * Cập nhật giao dịch đã có
 */
export async function updateTransaction(
  userId: string,
  updatedData: Transaction
): Promise<Transaction> {
  if (!updatedData.amount || Number(updatedData.amount) <= 0) {
    throw new Error('Số tiền phải lớn hơn 0.');
  }
  if (!updatedData.category || updatedData.category.trim() === '') {
    throw new Error('Vui lòng chọn danh mục giao dịch.');
  }

  // 1. Cập nhật Local Storage
  const localList = await getLocalTransactions(userId);
  const updatedList = localList.map((tx) =>
    tx.id === updatedData.id ? { ...updatedData, amount: Number(updatedData.amount) } : tx
  );
  await saveLocalTransactions(userId, updatedList);

  // 2. Cập nhật Firestore nếu có
  if (isFirebaseConfigured && db) {
    try {
      const txDocRef = doc(db, 'users', userId, 'transactions', updatedData.id);
      await updateDoc(txDocRef, {
        type: updatedData.type,
        amount: Number(updatedData.amount),
        category: updatedData.category,
        date: updatedData.date,
        note: updatedData.note || '',
      });
    } catch (fbErr) {
      console.warn('Lỗi cập nhật Firestore (đã lưu local):', fbErr);
    }
  }

  return updatedData;
}

/**
 * Xóa giao dịch
 */
export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  // 1. Xóa trong Local Storage
  const localList = await getLocalTransactions(userId);
  const updatedList = localList.filter((tx) => tx.id !== transactionId);
  await saveLocalTransactions(userId, updatedList);

  // 2. Xóa trong Firestore nếu có
  if (isFirebaseConfigured && db) {
    try {
      const txDocRef = doc(db, 'users', userId, 'transactions', transactionId);
      await deleteDoc(txDocRef);
    } catch (fbErr) {
      console.warn('Lỗi xóa Firestore (đã xóa local):', fbErr);
    }
  }
}

/**
 * Lắng nghe thay đổi danh sách giao dịch Realtime
 */
export function subscribeTransactions(
  userId: string,
  onUpdate: (transactions: Transaction[]) => void
): () => void {
  // B1. Đọc dữ liệu local ngay lập tức để render tức thì không có độ trễ
  getLocalTransactions(userId).then((initialData) => {
    onUpdate(initialData);
  });

  // B2. Nếu có Firebase Firestore, mở listener onSnapshot
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'users', userId, 'transactions');
      const q = query(colRef, orderBy('date', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          const cloudList: Transaction[] = [];
          snapshot.forEach((docSnap) => {
            cloudList.push(docSnap.data() as Transaction);
          });

          // Cập nhật lại local cache để giữ nhất quán
          if (cloudList.length > 0) {
            await saveLocalTransactions(userId, cloudList);
            onUpdate(cloudList);
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot error, using local data:', error);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Firestore subscription failed, falling back to local storage:', err);
    }
  }

  return () => {};
}

/**
 * Tính toán tổng thu, tổng chi và số dư ví
 * Formula: Balance = Total Income - Total Expenses
 */
export function calculateFinancialSummary(transactions: Transaction[]): FinancialSummary {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const item of transactions) {
    const val = Number(item.amount) || 0;
    if (item.type === 'income') {
      totalIncome += val;
    } else if (item.type === 'expense') {
      totalExpense += val;
    }
  }

  const balance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    balance,
  };
}

/**
 * Lọc và tìm kiếm giao dịch theo từ khóa, loại giao dịch hoặc danh mục
 */
export function filterTransactions(
  transactions: Transaction[],
  filters: {
    searchTerm?: string;
    type?: TransactionType | 'all';
    category?: string;
  }
): Transaction[] {
  return transactions.filter((tx) => {
    // 1. Lọc theo Type
    if (filters.type && filters.type !== 'all' && tx.type !== filters.type) {
      return false;
    }

    // 2. Lọc theo Category
    if (filters.category && filters.category !== 'all' && tx.category !== filters.category) {
      return false;
    }

    // 3. Tìm kiếm theo Search Term (note hoặc category)
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const queryLower = filters.searchTerm.toLowerCase().trim();
      const matchNote = tx.note?.toLowerCase().includes(queryLower);
      const matchCategory = tx.category.toLowerCase().includes(queryLower);
      if (!matchNote && !matchCategory) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Helper định dạng tiền tệ Việt Nam Đồng (VND) hoặc Dollar
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}
