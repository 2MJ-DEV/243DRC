"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Megaphone, Info, AlertCircle, Bell, CircleCheckBig } from "lucide-react";
import Link from "next/link";
import { useBanner } from "@/context/BannerContext";

interface AnnouncementBannerProps {
  message: string;
  type?: "info" | "warning" | "success" | "announcement";
  link?: {
    text: string;
    href: string;
  };
  dismissible?: boolean;
  storageKey?: string;
}

export default function AnnouncementBanner({
  message,
  type = "info",
  link,
  dismissible = true,
  storageKey = "announcement-dismissed",
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { setIsBannerVisible } = useBanner();

  const handleDismiss = useCallback(() => {
    setIsAnimating(false);
    setIsBannerVisible(false);
    setTimeout(() => {
      setIsVisible(false);
      if (dismissible) {
        localStorage.setItem(storageKey, "true");
      }
    }, 300);
  }, [dismissible, storageKey, setIsBannerVisible]);

  useEffect(() => {
    // Vérifier si l'annonce a été fermée précédemment
    const isDismissed = localStorage.getItem(storageKey);
    if (!isDismissed) {
      setIsVisible(true);
      setIsBannerVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
      
      // Disparaître automatiquement après 8 secondes
      const autoHideTimer = setTimeout(() => {
        handleDismiss();
      }, 8000);
      
      return () => clearTimeout(autoHideTimer);
    } else {
      // Si la bannière a déjà été fermée, mettre à jour le contexte
      setIsBannerVisible(false);
    }
  }, [storageKey, handleDismiss, setIsBannerVisible]);

  if (!isVisible) return null;

  const styles: Record<
    "info" | "warning" | "success" | "announcement",
    { bg: string; text: string; icon: typeof Info }
  > = {
    info: {
      bg: "bg-blue-600 dark:bg-blue-700",
      text: "text-white",
      icon: Bell,
    },
    warning: {
      bg: "bg-yellow-500 dark:bg-yellow-600",
      text: "text-white",
      icon: AlertCircle,
    },
    success: {
      bg: "bg-green-600 dark:bg-green-700",
      text: "text-white",
      icon: CircleCheckBig,
    },
    announcement: {
      bg: "bg-gradient-to-r from-blue-600 to-purple-600",
      text: "text-white",
      icon: Megaphone,
    },
  };

  const style = styles[type] || styles.info;
  const Icon = style.icon;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50
        ${style.bg} ${style.text}
        transition-all duration-300 ease-out
        ${isAnimating ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
      `}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-center gap-2 sm:gap-4 py-2 sm:py-3 min-h-[24px] sm:min-h-[28px]">

          {/* Message */}
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center">
            <Icon className="w-3 h-3 sm:w-4 sm:h-4 hidden xs:block" />
            <p className="text-[10px] sm:text-xs font-sans leading-tight sm:leading-normal">{message}</p>
            {link && (
              <Link
                href={link.href}
                className="text-[10px] sm:text-xs font-semibold underline underline-offset-2 sm:underline-offset-4 hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                {link.text} →
              </Link>
            )}
          </div>

          {/* Bouton fermer */}
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 hover:opacity-70 transition-opacity p-0.5 sm:p-1"
              aria-label="Fermer l'annonce"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
