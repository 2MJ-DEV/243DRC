// components/SignIn.tsx
"use client";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebaseClient";
import { signInWithPopup } from "firebase/auth";

export default function SignIn() {
  const router = useRouter();

  const signInWithGoogle = async () => {
    if (!auth || !db || !googleProvider) {
      console.error("Firebase non configuré correctement");
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
        });
      }

      router.push("/u/dashboard");
    } catch (error: unknown) {
      // Ignorer silencieusement l'erreur si l'utilisateur ferme la popup
      const authError = error as { code?: string };
      if (authError.code === 'auth/popup-closed-by-user') {
        // L'utilisateur a simplement fermé la popup, ce n'est pas une erreur
        return;
      }
      
      // Pour les autres erreurs, les logger
      console.error("Erreur lors de la connexion:", error);
    }
  };

  return <button onClick={signInWithGoogle}>Se connecter avec Google</button>;
}


