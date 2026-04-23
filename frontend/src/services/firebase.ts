import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAWfDRrsWWcspH4-jlbfQzosFcpruJ--xc',
  authDomain: 'jewel-live.firebaseapp.com',
  projectId: 'jewel-live',
  storageBucket: 'jewel-live.firebasestorage.app',
  messagingSenderId: '967250218693',
  appId: '1:967250218693:web:9ccb803b2774bd6bec6aac',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
auth.languageCode = 'ko';
// Persist login across browser sessions on the same device.
void setPersistence(auth, browserLocalPersistence).catch(() => undefined);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
