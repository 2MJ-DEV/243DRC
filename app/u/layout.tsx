"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ToastContainer";
import Link from "next/link";
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import {
  Home,
  Menu,
  User as UserIcon,
  FolderGit2,
  Plus,
  Search,
  LogOut,
  Users,
  Bookmark,
  MessageSquare,
  X,
} from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { showInfo } = useToast();

  useEffect(() => {
    if (!auth) {
      router.push("/");
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!db || !user) return;

    const unreadQuery = query(
      collection(db, "privateMessages"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
      const unreadCount = snapshot.docs.reduce((count, messageDoc) => {
        const data = messageDoc.data() as {
          receiverId?: string;
          read?: boolean;
        };

        if (data.receiverId === user.uid && data.read === false) {
          return count + 1;
        }
        return count;
      }, 0);

      setUnreadMessagesCount(unreadCount);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!db || !user) return;

    const userRef = doc(db, "users", user.uid);
    let heartbeatId: ReturnType<typeof setInterval> | null = null;
    let activityDebounceId: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const markOnline = async () => {
      if (disposed) return;
      try {
        await setDoc(
          userRef,
          {
            isOnline: true,
            lastActiveAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Erreur mise a jour presence (online):", error);
      }
    };

    const markOffline = async () => {
      if (disposed) return;
      try {
        await setDoc(
          userRef,
          {
            isOnline: false,
            lastActiveAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Erreur mise a jour presence (offline):", error);
      }
    };

    void markOnline();
    heartbeatId = setInterval(() => {
      void markOnline();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void markOnline();
      }
    };

    const handleUserActivity = () => {
      if (activityDebounceId) return;
      activityDebounceId = setTimeout(() => {
        activityDebounceId = null;
        void markOnline();
      }, 2000);
    };

    const handlePageHide = () => {
      void markOffline();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("focus", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("pointerdown", handleUserActivity);
    window.addEventListener("wheel", handleUserActivity, { passive: true });

    return () => {
      disposed = true;
      if (heartbeatId) clearInterval(heartbeatId);
      if (activityDebounceId) clearTimeout(activityDebounceId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("focus", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("pointerdown", handleUserActivity);
      window.removeEventListener("wheel", handleUserActivity);
    };
  }, [user]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    if (!auth) {
      console.error("Auth non initialise");
      return;
    }

    try {
      const userName = user?.displayName || "Developpeur";
      if (db && user) {
        await setDoc(
          doc(db, "users", user.uid),
          { isOnline: false, lastActiveAt: serverTimestamp() },
          { merge: true }
        );
      }
      await signOut(auth);

      showInfo(
        `A bientot, ${userName} !`,
        "Vous avez ete deconnecte avec succes"
      );

      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la deconnexion:", error);
    }
  };

  const menuItems = [
    { icon: Home, label: "Apercu", href: "/u/dashboard" },
    { icon: UserIcon, label: "Profil", href: "/u/dashboard/profil" },
    { icon: FolderGit2, label: "Mes Projets", href: "/u/dashboard/mes-projets" },
    { icon: Plus, label: "Ajouter un projet", href: "/u/dashboard/ajouter-projet" },
    { icon: Search, label: "Explorer", href: "/u/dashboard/explorer" },
    { icon: Bookmark, label: "Favoris", href: "/u/dashboard/favoris" },
    { icon: MessageSquare, label: "Messages", href: "/u/dashboard/messages", badge: unreadMessagesCount },
    { icon: Users, label: "Rencontres", href: "/u/dashboard/rencontres" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const sidebarContent = (
    <div className="p-4 space-y-2">
      <div className="mb-6 rounded-lg bg-muted/50 p-3">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="w-12 h-12 rounded-full border-2 border-primary/20"
              onError={(event) => {
                const target = event.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-12 h-12 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-semibold ${user.photoURL ? "hidden" : ""}`}
          >
            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user.displayName || "Utilisateur"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#007FFF] text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {!!item.badge && item.badge > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-md border p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Ouvrir le menu"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" className="text-xl font-bold">
                Dashboard
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationBell />
              <Button onClick={handleSignOut} variant="destructive" size="sm">
                <span className="hidden sm:inline">Deconnexion</span>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fermer le menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-16 bottom-0 w-[86vw] max-w-xs border-r bg-background shadow-xl overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
              <p className="font-semibold">Navigation</p>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Fermer le menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex flex-1 pt-16">
        <aside className="w-64 border-r bg-background/50 hidden md:block fixed top-16 left-0 bottom-0 overflow-y-auto">
          {sidebarContent}
        </aside>

        <main className="flex-1 p-4 sm:p-6 md:p-8 md:ml-64 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

