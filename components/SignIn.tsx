// components/SignIn.tsx
"use client";
import { auth } from "@/lib/firebaseClient";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function SignIn() {
  const signInWithGoogle = async () => {
    if (!auth) {
      console.error("Auth non initialisé");
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Envoie le idToken au serveur pour créer la session
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      // maintenant la session cookie est crée côté serveur
    } catch (error: any) {
      // Ignorer silencieusement l'erreur si l'utilisateur ferme la popup
      if (error.code === 'auth/popup-closed-by-user') {
        // L'utilisateur a simplement fermé la popup, ce n'est pas une erreur
        return;
      }
      
      // Pour les autres erreurs, les logger
      console.error("Erreur lors de la connexion:", error);
    }
  };

  return <button onClick={signInWithGoogle}>Se connecter avec Google</button>;
}