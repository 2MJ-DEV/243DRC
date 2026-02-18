"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon, Settings } from "lucide-react";

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    if (!auth) {
      console.warn("Firebase Auth unavailable");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setImageError(false);
      if (!currentUser) setShowMenu(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setShowMenu(false);
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la deconnexion:", error);
    }
  };

  if (loading && !user) {
    return (
      <Button disabled variant="outline" className="min-w-[120px]">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="ml-2">Chargement...</span>
      </Button>
    );
  }

  if (!user) {
    return (
      <Button onClick={() => router.push("/sign-up")} variant="rdc" disabled={loading}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Se connecter
      </Button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full flex items-center justify-center w-10 h-10"
        aria-label="Menu utilisateur"
      >
        {user.photoURL && !imageError ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="w-10 h-10 rounded-full border-2 border-primary/20 hover:border-primary/50 transition-colors object-cover flex-shrink-0"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
          </div>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-xl z-[100] overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="font-semibold text-sm text-foreground truncate">
              {user.displayName || "Utilisateur"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                router.push("/u/dashboard");
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              Mon tableau de bord
            </button>

            <button
              onClick={() => {
                router.push("/u/dashboard/profil");
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Settings className="w-4 h-4" />
              Mon profil
            </button>

            <div className="border-t border-border my-1" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Se deconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

