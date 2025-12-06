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
  };

  return <button onClick={signInWithGoogle}>Se connecter avec Google</button>;
}