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
            // ADR-16 — tokens only; the variant is carried by the icon and
            // the left rule, not by tinting the whole surface.
            <div
              key={item.id}
              role="status"
              aria-live={isDestructive ? 'assertive' : 'polite'}
              className={`rounded-lg border border-border bg-card px-4 py-3 text-card-foreground shadow-lg border-l-2 ${
                isDestructive ? 'border-l-danger' : 'border-l-success'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon
                  aria-hidden
                  className={`mt-0.5 h-5 w-5 shrink-0 ${isDestructive ? 'text-danger' : 'text-success'}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{item.title}</div>
                  {item.description ? (
                    <div className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(item.id)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
