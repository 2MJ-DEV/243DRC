"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Toast } from "./Toast";

interface ToastData {
  id: string;
  title: string;
  description: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, "id">) => void;
  showSuccess: (title: string, description: string) => void;
  showError: (title: string, description: string) => void;
  showWarning: (title: string, description: string) => void;
  showInfo: (title: string, description: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((toast: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const showSuccess = useCallback((title: string, description: string) => {
    showToast({ title, description, type: "success" });
  }, [showToast]);

  const showError = useCallback((title: string, description: string) => {
    showToast({ title, description, type: "error" });
  }, [showToast]);

  const showWarning = useCallback((title: string, description: string) => {
    showToast({ title, description, type: "warning" });
  }, [showToast]);

  const showInfo = useCallback((title: string, description: string) => {
    showToast({ title, description, type: "info" });
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
