'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type ToastVariant = 'default' | 'destructive';

type Toast = {
  id: number;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  toast: (toast: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((nextToast: Omit<Toast, 'id'>) => {
    const id = ++toastId;
    setToasts((current) => [...current, { ...nextToast, id }]);
    window.setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-100 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((item) => {
          const isDestructive = item.variant === 'destructive';
          const Icon = isDestructive ? AlertCircle : CheckCircle2;
          return (
            <div
              key={item.id}
              className={`rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all ${
                isDestructive
                  ? 'border-red-500/40 bg-red-950/90 text-red-50'
                  : 'border-emerald-500/30 bg-neutral-950/90 text-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isDestructive ? 'text-red-400' : 'text-emerald-400'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{item.title}</div>
                  {item.description ? (
                    <div className="mt-1 text-xs leading-5 text-neutral-300">{item.description}</div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(item.id)}
                  className="rounded-md p-1 text-neutral-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Dismiss toast"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
