import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import api from './api';
import type { User } from '../types/product';

const USER_KEY = 'jl_user';

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

export function isLoggedIn(): boolean {
  return !!auth.currentUser;
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
  } catch {
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

export async function loginWithGoogle(): Promise<User | null> {
  await signInWithPopup(auth, googleProvider);
  return syncMe();
}

export async function logout() {
  await signOut(auth);
  setCachedUser(null);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export { syncMe as fetchMe };
