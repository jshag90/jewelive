import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

export const firebaseRegion = 'asia-northeast3';

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
export const db = getFirestore(app);
export const functions = getFunctions(app, firebaseRegion);
export const storage = getStorage(app);

export default app;
