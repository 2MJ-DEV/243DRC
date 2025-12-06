"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ToastContainer";
import Link from "next/link";
import {
  Home,
  User as UserIcon,
  FolderGit2,
  Plus,
  Search,
  LogOut,
} from "lucide-react";
import LenisScroll from "@/components/ui/LenisScroll";
import ScrollLinked from "@/components/ui/ScrollLinked";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
  const handleSignOut = async () => {
    if (!auth) {
      console.error("Auth non initialisé");
      return;
    }

    try {
      const userName = user?.displayName || "Développeur";
      await signOut(auth);

      // Afficher le toast de déconnexion
      showInfo(
        `À bientôt, ${userName} ! 👋`,
        "Vous avez été déconnecté avec succès"
      );

      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const menuItems = [
    { icon: Home, label: "Aperçu", href: "/u/dashboard" },
    { icon: UserIcon, label: "Profil", href: "/u/dashboard/profil" },
    {
      icon: FolderGit2,
      label: "Mes Projets",
      href: "/u/dashboard/mes-projets",
    },
    {
      icon: Plus,
      label: "Ajouter un projet",
      href: "/u/dashboard/ajouter-projet",
    },
    { icon: Search, label: "Explorer", href: "/u/dashboard/explorer" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/u/dashboard" className="text-xl font-bold">
              Dashboard
            </Link>

            <div className="flex items-center gap-4">
              {/* {user.photoURL && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium hidden sm:inline">{user.displayName}</span> */}
              <Button onClick={handleSignOut} variant="destructive" size="sm">
                <span>Déconnexion</span>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r min-h-[calc(100vh-4rem)] bg-background/50 hidden md:block sticky top-16 self-start">
          <div className="p-4 space-y-2">
            {/* User Profile Section */}
            <div className="mb-6 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-3">
                {user.photoURL && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-12 h-12 rounded-full border-2 border-primary/20"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#007FFF] text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 sm:p-8">
          <LenisScroll>{children}</LenisScroll>
        </main>
      </div>
    </div>
  );
}
