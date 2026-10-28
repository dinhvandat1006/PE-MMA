import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebaseConfig';
import { UserSession } from '../types/transaction';

export type { UserSession };

const SESSION_STORAGE_KEY = '@finance_tracker_session';
const LOCAL_USERS_KEY = '@finance_tracker_local_users';

interface LocalUserRecord {
  uid: string;
  email: string;
  passwordHash: string; // Lưu dạng băm đơn giản, không lưu plain-text
  displayName: string;
}

// Hàm băm mật khẩu đơn giản trên client để tránh lưu plain-text password
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

/**
 * Lấy danh sách tài khoản offline được lưu trong thiết bị
 */
async function getLocalUsers(): Promise<LocalUserRecord[]> {
  try {
    const data = await AsyncStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Đăng nhập người dùng (Kiểm tra cả Firestore accounts, Firebase Auth và Local)
 */
export async function loginUser(email: string, password: string): Promise<UserSession> {
  const cleanEmail = email.trim().toLowerCase();
  const inputHash = simpleHash(password);

  // 1. Kiểm tra trong Firestore user_accounts trước (để nhận mật khẩu đã đổi trực tiếp)
  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, 'user_accounts', cleanEmail);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.passwordHash === inputHash) {
          const session: UserSession = {
            uid: userData.uid,
            email: userData.email || cleanEmail,
            displayName: userData.displayName || cleanEmail.split('@')[0],
          };
          await saveSession(session);
          return session;
        }
      }
    } catch (fsErr) {
      console.warn('Kiểm tra Firestore user_accounts lỗi, chuyển sang Auth chuẩn:', fsErr);
    }
  }

  // 2. Thử đăng nhập qua Firebase Auth tiêu chuẩn
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;
      const session: UserSession = {
        uid: user.uid,
        email: user.email || cleanEmail,
        displayName: user.displayName || cleanEmail.split('@')[0],
      };
      await saveSession(session);
      return session;
    } catch (firebaseError: any) {
      console.warn('Firebase login failed, checking local users fallback:', firebaseError.code);
    }
  }

  // 3. Fallback: Kiểm tra trong bộ nhớ cục bộ (Local Users)
  const localUsers = await getLocalUsers();
  const matched = localUsers.find(
    (u) => u.email === cleanEmail && u.passwordHash === inputHash
  );
  if (matched) {
    const session: UserSession = {
      uid: matched.uid,
      email: matched.email,
      displayName: matched.displayName,
    };
    await saveSession(session);
    return session;
  }

  throw new Error('Email hoặc mật khẩu không chính xác.');
}

/**
 * Đăng ký tài khoản người dùng mới
 */
export async function registerUser(email: string, password: string, displayName?: string): Promise<UserSession> {
  const cleanEmail = email.trim().toLowerCase();
  const userName = displayName?.trim() || cleanEmail.split('@')[0];
  const pHash = simpleHash(password);

  let newUid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      newUid = userCredential.user.uid;
    } catch (firebaseError: any) {
      console.warn('Firebase registration error:', firebaseError.code);
      throw new Error(getReadableAuthErrorMessage(firebaseError.code));
    }
  }

  // Đồng bộ thông tin tài khoản vào Firestore
  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, 'user_accounts', cleanEmail);
      await setDoc(userDocRef, {
        uid: newUid,
        email: cleanEmail,
        displayName: userName,
        passwordHash: pHash,
        updatedAt: Date.now(),
      });
    } catch (dbErr) {
      console.warn('Lỗi lưu user_accounts lên Firestore:', dbErr);
    }
  }

  // Lưu vào Local Storage
  const localUsers = await getLocalUsers();
  const existingIdx = localUsers.findIndex((u) => u.email === cleanEmail);
  const newRecord: LocalUserRecord = {
    uid: newUid,
    email: cleanEmail,
    passwordHash: pHash,
    displayName: userName,
  };

  if (existingIdx >= 0) {
    localUsers[existingIdx] = newRecord;
  } else {
    localUsers.push(newRecord);
  }
  await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));

  const session: UserSession = {
    uid: newUid,
    email: cleanEmail,
    displayName: userName,
  };
  await saveSession(session);
  return session;
}

/**
 * ĐẶT LẠI MẬT KHẨU TRỰC TIẾP (Không cần gửi email)
 */
export async function directResetPassword(email: string, newPassword: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Vui lòng nhập địa chỉ email.');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
  }

  const newHash = simpleHash(newPassword);
  let found = false;

  // 1. Cập nhật trong Firestore
  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, 'user_accounts', cleanEmail);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, {
          passwordHash: newHash,
          updatedAt: Date.now(),
        });
        found = true;
      }
    } catch (fsErr) {
      console.warn('Lỗi cập nhật Firestore khi reset pass:', fsErr);
    }
  }

  // 2. Cập nhật trong Local Storage
  const localUsers = await getLocalUsers();
  const localUserIdx = localUsers.findIndex((u) => u.email === cleanEmail);
  if (localUserIdx >= 0) {
    localUsers[localUserIdx].passwordHash = newHash;
    await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
    found = true;
  }

  // 3. Nếu chưa tìm thấy tài khoản (ví dụ user được tạo trước đó trên Firebase Auth)
  if (!found && isFirebaseConfigured && db) {
    // Tạo bản ghi mới để user có thể đăng nhập ngay bằng mật khẩu mới
    try {
      const userDocRef = doc(db, 'user_accounts', cleanEmail);
      const newUid = `user_${Date.now()}`;
      await setDoc(userDocRef, {
        uid: newUid,
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0],
        passwordHash: newHash,
        updatedAt: Date.now(),
      });
      found = true;
    } catch (e) {
      console.warn('Lỗi tạo mới user_accounts:', e);
    }
  }

  if (!found) {
    throw new Error('Không tìm thấy tài khoản với email này. Vui lòng kiểm tra lại email hoặc đăng ký mới.');
  }
}

/**
 * Đổi mật khẩu tài khoản khi đang đăng nhập
 */
export async function changeUserPassword(currentPassword: string, newPassword: string): Promise<void> {
  if (!currentPassword) {
    throw new Error('Vui lòng nhập mật khẩu hiện tại.');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
  }

  const session = await getStoredSession();
  if (!session || !session.email) {
    throw new Error('Bạn chưa đăng nhập.');
  }

  const cleanEmail = session.email.trim().toLowerCase();
  const currentHash = simpleHash(currentPassword);
  const newHash = simpleHash(newPassword);

  // 1. Kiểm tra mật khẩu cũ trên Firestore
  let verified = false;
  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, 'user_accounts', cleanEmail);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (data.passwordHash && data.passwordHash !== currentHash) {
          throw new Error('Mật khẩu hiện tại không chính xác.');
        }
        await updateDoc(userDocRef, {
          passwordHash: newHash,
          updatedAt: Date.now(),
        });
        verified = true;
      }
    } catch (err: any) {
      if (err.message === 'Mật khẩu hiện tại không chính xác.') throw err;
    }
  }

  // 2. Cập nhật trong Local Storage
  const localUsers = await getLocalUsers();
  const userIndex = localUsers.findIndex((u) => u.email === cleanEmail);
  if (userIndex >= 0) {
    if (localUsers[userIndex].passwordHash && localUsers[userIndex].passwordHash !== currentHash) {
      throw new Error('Mật khẩu hiện tại không chính xác.');
    }
    localUsers[userIndex].passwordHash = newHash;
    await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
    verified = true;
  }

  if (!verified) {
    // Nếu chưa có trong local thì lưu lại với hash mới
    const newRecord: LocalUserRecord = {
      uid: session.uid,
      email: cleanEmail,
      displayName: session.displayName || cleanEmail.split('@')[0],
      passwordHash: newHash,
    };
    localUsers.push(newRecord);
    await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
  }
}

/**
 * Lưu phiên đăng nhập an toàn vào AsyncStorage (KHÔNG lưu password)
 */
export async function saveSession(session: UserSession): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Lỗi khi lưu session:', err);
  }
}

/**
 * Lấy phiên đăng nhập đã lưu khi khởi động ứng dụng (Session Persistence)
 */
export async function getStoredSession(): Promise<UserSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi khi đọc session đã lưu:', err);
    return null;
  }
}

/**
 * Đăng xuất: xóa sạch phiên đăng nhập
 */
export async function logoutUser(): Promise<void> {
  try {
    if (isFirebaseConfigured && auth) {
      await signOut(auth).catch(() => {});
    }
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Lỗi khi đăng xuất:', err);
  }
}

/**
 * Lắng nghe thay đổi trạng thái Auth của Firebase
 */
export function subscribeAuthState(callback: (session: UserSession | null) => void): () => void {
  if (isFirebaseConfigured && auth) {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const session: UserSession = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
        };
        await saveSession(session);
        callback(session);
      } else {
        const stored = await getStoredSession();
        callback(stored);
      }
    });
    return unsubscribe;
  }

  // Fallback không dùng Firebase
  getStoredSession().then((s) => callback(s));
  return () => {};
}

function getReadableAuthErrorMessage(code?: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Địa chỉ email không đúng định dạng.';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị khóa.';
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản với email này.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Mật khẩu hiện tại hoặc email không chính xác.';
    case 'auth/email-already-in-use':
      return 'Email này đã được sử dụng bởi tài khoản khác.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu (cần tối thiểu 6 ký tự).';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra lại Internet.';
    case 'auth/requires-recent-login':
      return 'Vui lòng đăng xuất và đăng nhập lại trước khi đổi mật khẩu vì lý do bảo mật.';
    default:
      return 'Đã có lỗi xảy ra trong quá trình xác thực.';
  }
}
