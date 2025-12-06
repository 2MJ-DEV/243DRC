"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ToastProps {
  title: string;
  description: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

export function Toast({ title, description, type = "success", duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 10);

    // Auto-fermeture après duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const colors = {
    success: {
      bg: "bg-green-50 dark:bg-green-950/50",
      border: "border-green-200 dark:border-green-800",
      icon: "bg-green-500",
      text: "text-green-800 dark:text-green-200",
      subtext: "text-green-600 dark:text-green-400"
    },
    error: {
      bg: "bg-red-50 dark:bg-red-950/50",
      border: "border-red-200 dark:border-red-800",
      icon: "bg-red-500",
      text: "text-red-800 dark:text-red-200",
      subtext: "text-red-600 dark:text-red-400"
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-950/50",
      border: "border-yellow-200 dark:border-yellow-800",
      icon: "bg-yellow-500",
      text: "text-yellow-800 dark:text-yellow-200",
      subtext: "text-yellow-600 dark:text-yellow-400"
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/50",
      border: "border-blue-200 dark:border-blue-800",
      icon: "bg-blue-500",
      text: "text-blue-800 dark:text-blue-200",
      subtext: "text-blue-600 dark:text-blue-400"
    }
  };

  const theme = colors[type];

  const icons = {
    success: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50
        transition-all duration-300 ease-out
        ${isVisible && !isExiting ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
      `}
    >
      <div
        className={`
          flex items-start gap-3 min-w-[320px] max-w-md
          p-4 rounded-xl border shadow-lg backdrop-blur-sm
          ${theme.bg} ${theme.border}
        `}
      >
        {/* Icône */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${theme.icon} flex items-center justify-center`}>
          {icons[type]}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${theme.text}`}>{title}</h3>
          <p className={`text-xs mt-1 ${theme.subtext}`}>{description}</p>
        </div>

        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className={`flex-shrink-0 ${theme.text} hover:opacity-70 transition-opacity`}
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
