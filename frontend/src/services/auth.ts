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

// Resolves once Firebase has finished restoring the persisted session on boot.
// Many components mount before that completes, so we expose a promise instead
// of a synchronous flag based on auth.currentUser.
const authReady: Promise<FirebaseUser | null> = new Promise((resolve) => {
  const unsub = onAuthStateChanged(auth, (user) => {
    unsub();
    resolve(user);
  });
});

// Surface any pending redirect-based Google sign-in result on app start so the
// follow-up profile sync runs without a manual trigger.
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

export function currentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}

/** Synchronous best-effort check. Use `waitForAuthReady()` if accuracy on first
 *  paint matters (e.g. redirect guards). */
export function isLoggedIn(): boolean {
  return !!auth.currentUser;
}

/** Resolves once the persisted Firebase session has been restored (or proven
 *  absent). Returns the FirebaseUser if signed in. */
export function waitForAuthReady(): Promise<FirebaseUser | null> {
  return authReady;
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
  nickname?: string,
): Promise<User | null> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (nickname && nickname.trim()) {
    try {
      await updateProfile(credential.user, { displayName: nickname.trim() });
    } catch {
      // ignore profile update failure
    }
  }
  return syncMe();
}

function isPopupBlockedError(err: unknown): boolean {
  const code = (err as { code?: string } | null | undefined)?.code || '';
  return [
    'auth/popup-blocked',
    'auth/popup-closed-by-user',
    'auth/cancelled-popup-request',
    'auth/operation-not-supported-in-this-environment',
    'auth/web-storage-unsupported',
  ].includes(code);
}

export async function loginWithGoogle(): Promise<User | null> {
  try {
    await signInWithPopup(auth, googleProvider);
    return syncMe();
  } catch (err) {
    if (isPopupBlockedError(err)) {
      // Fallback for in-app browsers / blocked popups: redirect flow.
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
