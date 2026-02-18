"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebaseClient";
import { Button } from "./ui/button";
import { useToast } from "@/components/ToastContainer";
import { LogOut, User as UserIcon, Settings } from "lucide-react";

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showSuccess } = useToast();

  useEffect(() => {
    // Attendre que Firebase soit initialisé côté client
    if (typeof window === "undefined") {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    // Si auth n'est pas disponible, afficher le bouton de connexion
    if (!auth) {
      console.warn("Firebase Auth unavailable");
      setTimeout(() => setLoading(false), 0);
      return;
    }

    // Vérifier l'état actuel immédiatement
    if (auth.currentUser) {
      setTimeout(() => {
        setUser(auth.currentUser);
        setLoading(false);
      }, 0);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // Réinitialiser l'erreur d'image quand l'utilisateur change
      setImageError(false);
      // Fermer le menu si l'utilisateur se déconnecte
      if (!currentUser) {
        setShowMenu(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fermer le menu quand on clique en dehors
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

  const handleGoogleSignIn = async () => {
    if (!auth || !googleProvider || !db) {
      console.error("Firebase n'est pas configuré correctement");
      return;
    }

    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Sauvegarder les données utilisateur dans Firestore
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const isNewUser = !userDoc.exists();

      if (isNewUser) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
        });
      }

      // Afficher le toast de bienvenue
      showSuccess(
        isNewUser ? `Bienvenue, ${user.displayName || "Développeur"} ! 👋` : `Bon retour, ${user.displayName || "Développeur"} ! 👋`,
        isNewUser ? "Votre compte a été créé avec succès" : "Connexion réussie à 243 DRC"
      );

      // Redirection vers le dashboard après connexion réussie
      router.push("/u/dashboard");
    } catch (error: unknown) {
      // Ignorer silencieusement l'erreur si l'utilisateur ferme la popup
      if (error.code === 'auth/popup-closed-by-user') {
        // L'utilisateur a simplement fermé la popup, ce n'est pas une erreur
        setLoading(false);
        return;
      }
      
      // Pour les autres erreurs, les afficher
      console.error("Erreur lors de la connexion:", error);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) {
      console.error("Auth non initialisé");
      return;
    }
  
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Afficher un loader pendant le chargement initial seulement
  if (loading && !user) {
    return (
      <Button disabled variant="outline" className="min-w-[120px]">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="ml-2">Chargement...</span>
      </Button>
    );
  }

  // Afficher le bouton de connexion si pas d'utilisateur
  if (!user) {
    return (
      <Button onClick={handleGoogleSignIn} variant="rdc" disabled={loading}>
        <svg className="w-5 h-5 " viewBox="0 0 24 24">
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

  // Afficher le profil utilisateur si connecté
  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full flex items-center justify-center w-10 h-10"
          aria-label="Menu utilisateur"
        >
          {user.photoURL && !imageError ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="w-10 h-10 rounded-full border-2 border-primary/20 hover:border-primary/50 transition-colors object-cover flex-shrink-0"
              onError={() => {
                setImageError(true);
              }}
              onLoad={() => {
                setImageError(false);
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
              {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </button>

        {/* Menu déroulant */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-xl z-[100] overflow-hidden">
            <div className="p-4 border-b border-border">
              <p className="font-semibold text-sm text-foreground truncate">
                {user.displayName || "Utilisateur"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
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
                onClick={async () => {
                  await handleSignOut();
                  setShowMenu(false);
                  router.push("/");
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback : afficher le bouton de connexion par défaut
  return (
    <Button onClick={handleGoogleSignIn} variant="rdc" disabled={loading}>
      <svg className="w-5 h-5 " viewBox="0 0 24 24">
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





