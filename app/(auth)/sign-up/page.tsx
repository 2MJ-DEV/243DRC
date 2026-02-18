"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ToastContainer";

export default function SignUpPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [loadingProvider, setLoadingProvider] = useState<"google" | null>(null);

  const ensureUserDocument = async (provider: "google", user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null; }) => {
    if (!db) return false;
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const isNewUser = !userDoc.exists();

    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || (user.email ? user.email.split("@")[0] : "Utilisateur"),
        photoURL: user.photoURL || "",
        provider,
        lastLoginAt: new Date().toISOString(),
        ...(isNewUser ? { createdAt: new Date().toISOString() } : {}),
      },
      { merge: true }
    );

    return isNewUser;
  };

  const handleAuth = async (providerName: "google") => {
    const providerInstance = googleProvider;
    if (!auth || !db || !providerInstance) {
      showError("Configuration manquante", "Firebase n'est pas configure correctement.");
      return;
    }

    try {
      setLoadingProvider(providerName);
      const result = await signInWithPopup(auth, providerInstance);
      const signedUser = result.user;

      const isNewUser = await ensureUserDocument(providerName, signedUser);

      showSuccess(
        isNewUser
          ? `Bienvenue, ${signedUser.displayName || "Developpeur"} !`
          : `Bon retour, ${signedUser.displayName || "Developpeur"} !`,
        isNewUser ? "Compte cree avec succes." : "Connexion reussie."
      );

      router.push("/u/dashboard");
    } catch (error: unknown) {
      const authErrorCode =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
          ? (error as { code: string }).code
          : null;

      if (authErrorCode === "auth/popup-closed-by-user") return;

      if (authErrorCode === "auth/account-exists-with-different-credential") {
        showError(
          "Compte deja existant",
          "Ce mail est deja associe a une autre methode de connexion. Utilisez Google pour acceder a ce compte."
        );
        return;
      }

      console.error("Erreur auth:", error);
      showError("Connexion echouee", "Impossible de vous connecter. Veuillez reessayer.");
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md space-y-4">
        <Button asChild variant="ghost" className="pl-0">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour a l'accueil
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Connexion / Inscription</CardTitle>
            <p className="text-sm text-muted-foreground">
              Utilisez Google. Si vous n'avez pas encore de compte, il sera cree automatiquement.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col">
            <Button
              type="button"
              variant="outline"
              className="w-full flex justify-center whitespace-normal text-center"
              disabled={loadingProvider !== null}
              onClick={() => handleAuth("google")}
            >
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
              {loadingProvider === "google" ? "Connexion..." : "Continuer avec Google"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
