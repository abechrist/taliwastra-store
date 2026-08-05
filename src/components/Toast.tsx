'use client';

import { useState, useEffect, useCallback } from 'react';
import Icon from './Icon';

type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};

let addToastFn: ((message: string, type: ToastType) => void) | null = null;

export function addToast(message: string, type: ToastType = 'success') {
  addToastFn?.(message, type);
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    addToastFn = (message: string, type: ToastType) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4000);
    };
    return () => {
      addToastFn = null;
    };
  }, [removeToast]);

  if (toasts.length === 0) return null;

  const iconMap: Record<ToastType, string> = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  };

  const colorMap: Record<ToastType, string> = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          <Icon name={iconMap[toast.type]} className={colorMap[toast.type]} />
          <span className="font-body text-sm text-on-surface flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="text-on-surface-variant hover:text-on-surface">
            <Icon name="close" className="text-sm" />
          </button>
        </div>
      ))}
    </div>
  );
}
