import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import api from './api';
import type { User } from '../types/product';

const USER_KEY = 'jl_user';

// Surface a pending redirect-based Google sign-in result on app boot so the
// follow-up profile sync runs without a manual trigger after the redirect
// returns to the SPA.
void getRedirectResult(auth)
  .then(async (result) => {
    if (result?.user) {
      await syncMe();
    }
  })
  .catch((err) => {
    if (err?.code !== 'auth/no-auth-event') {
      console.warn('redirect result error', err?.code || err?.message);
    }
  });

export function getCachedUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setCachedUser(user: User | null) {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Resolves with the *current* persisted Firebase session — fresh on every call,
// not a memoized one-shot, so it works correctly across logout/re-login cycles
// in the same SPA session.
export function waitForAuthReady(): Promise<FirebaseUser | null> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

async function syncMe(): Promise<User | null> {
  try {
    const res = await api.get('/me');
    setCachedUser(res.data as User);
    return res.data as User;
  } catch (err) {
    console.warn('failed to sync /api/me', err);
    return null;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<User | null> {
  await signInWithEmailAndPassword(auth, email, password);
  return syncMe();
}

export async function registerWithEmail(
  email: string,
  password: string,
  nickname: string,
): Promise<User | null> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: nickname.trim() });
  // displayName이 ID 토큰의 name claim에 반영되도록 강제 갱신.
  // 이 단계가 빠지면 직후 /api/me 호출이 displayName 없는 캐시 토큰을 써서
  // 백엔드가 닉네임을 email prefix로 잘못 저장한다.
  await credential.user.getIdToken(true);
  return syncMe();
}

const POPUP_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/operation-not-supported-in-this-environment',
  'auth/web-storage-unsupported',
]);

export async function loginWithGoogle(): Promise<User | null> {
  try {
    await signInWithPopup(auth, googleProvider);
    return syncMe();
  } catch (err) {
    const code = (err as { code?: string } | null | undefined)?.code || '';
    if (POPUP_FALLBACK_CODES.has(code)) {
      // Redirect flow lands back on the SPA; the module-level getRedirectResult
      // handler above will then call syncMe(). Don't double-sync here.
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw err;
  }
}

export async function logout() {
  await signOut(auth);
  setCachedUser(null);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export { syncMe as fetchMe };
