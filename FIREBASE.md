# 🔥 Firebase Configuration

Ce projet utilise **Firebase** pour l'authentification et le stockage des données utilisateurs.

## 📦 Services activés

- ✅ **Firebase Authentication** - Connexion avec Google
- ✅ **Cloud Firestore** - Base de données pour stocker les utilisateurs et données

## 🚀 Configuration

### 1. Variables d'environnement

Toutes les variables Firebase sont dans le fichier `.env` :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_projet_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_projet.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

### 2. Activer Google Sign-In dans Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Allez dans **Authentication** > **Sign-in method**
4. Activez **Google** comme fournisseur
5. Configurez votre email de support

### 3. Configurer Firestore

1. Dans Firebase Console, allez dans **Firestore Database**
2. Créez une base de données en mode **production**
3. Choisissez la région **africa-south1** (Johannesburg)
4. Configurez les règles de sécurité :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Les utilisateurs peuvent lire et écrire leurs propres données
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Autres collections (à adapter selon vos besoins)
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

## 📝 Utilisation

### Composant AuthButton

Le composant `AuthButton` gère automatiquement :
- La connexion avec Google
- La sauvegarde des données utilisateur dans Firestore
- La déconnexion
- L'affichage du profil utilisateur

```tsx
import AuthButton from "@/components/AuthButton";

// Dans votre composant
<AuthButton />
```

### Accéder aux services Firebase

```tsx
import { auth, db, googleProvider } from "@/lib/firebaseClient";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Exemple : Ajouter un document
const addData = async () => {
  await addDoc(collection(db, "posts"), {
    title: "Mon post",
    content: "Contenu...",
    authorId: auth.currentUser?.uid,
    createdAt: new Date().toISOString()
  });
};

// Exemple : Lire des documents
const getData = async () => {
  const snapshot = await getDocs(collection(db, "posts"));
  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return posts;
};
```

## 🔒 Structure Firestore

### Collection `users`

```typescript
{
  uid: string,              // ID de l'utilisateur
  email: string,            // Email
  displayName: string,      // Nom d'affichage
  photoURL: string,         // URL de la photo de profil
  createdAt: string         // Date de création (ISO)
}
```

## 🎯 Ce qui a été supprimé

- ❌ Firebase Admin SDK (backend)
- ❌ Firebase Functions
- ❌ Firebase Storage
- ❌ Firebase Analytics
- ❌ Routes API utilisant Firebase Admin

## ⚡ Ce qui reste

- ✅ Authentification côté client
- ✅ Firestore côté client
- ✅ Google Sign-In
- ✅ Gestion automatique des sessions

## 📚 Documentation

- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
