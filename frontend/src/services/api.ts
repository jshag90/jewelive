import axios from 'axios';
import { auth } from './firebase';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // ignore token fetch failure
    }
  }
  return config;
});

export default api;
