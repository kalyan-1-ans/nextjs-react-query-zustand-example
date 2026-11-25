import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
}
interface ToastState {
  toasts: Toast[];
  addToast: (message: string) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastState = create<ToastState>(set => ({
  toasts: [],
  clearToasts: () => set({ toasts: [] }),
  addToast: message =>
    set(state => ({
      toasts: [...state.toasts, { message, id: crypto.randomUUID() }],
    })),
  removeToast: id => set(state => ({ toasts: state.toasts.filter(toast => toast.id !== id) })),
}));
