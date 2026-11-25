import { useAuthStore } from '@/state/auth/store';
import axios from 'axios';

export const axiosInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE_URL });
axiosInstance.interceptors.request.use(config => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
