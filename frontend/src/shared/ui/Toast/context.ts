import { createContext, useContext } from 'react';
import type { ToastData } from './Toast';

export interface ToastApi {
  show: (toast: ToastData) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast: оберните приложение в <ToastProvider>');
  return api;
}
