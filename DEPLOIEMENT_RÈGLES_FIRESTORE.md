# 🚀 Guide de Déploiement des Règles Firestore

Ce guide vous explique comment déployer les règles Firestore pour résoudre l'erreur "Missing or insufficient permissions".

---

## ⚠️ CRITIQUE : Les Règles Doivent Être Déployées

**Les règles dans `firestore.rules` ne sont PAS automatiquement appliquées.** Vous devez les déployer manuellement dans Firebase Console.

---

## 📋 Méthode 1 : Via Firebase Console (Recommandé)

### Étape 1 : Ouvrir Firebase Console
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet **243DRC**

### Étape 2 : Accéder aux Règles Firestore
1. Dans le menu de gauche, cliquez sur **Firestore Database**
2. Cliquez sur l'onglet **Règles** en haut de la page

### Étape 3 : Copier les Règles
1. Ouvrez le fichier `firestore.rules` dans votre éditeur
2. Copiez **tout le contenu** du fichier (Ctrl+A puis Ctrl+C)

### Étape 4 : Coller et Publier
1. Collez le contenu dans l'éditeur de règles Firebase Console
2. Cliquez sur le bouton **Publier** en haut à droite
3. Attendez la confirmation "Règles publiées avec succès" ✅

**Les règles sont maintenant actives !**

---

## 📋 Méthode 2 : Via Firebase CLI

### Prérequis
```bash
# Installer Firebase CLI (si pas déjà fait)
npm install -g firebase-tools

# Se connecter à Firebase
firebase login
```

### Déployer les Règles
```bash
# Depuis la racine du projet
firebase deploy --only firestore:rules
```

### Vérification
Vous devriez voir :
```
✔  Deploy complete!
```

---

## ✅ Règles Configurées

Les règles suivantes sont maintenant dans `firestore.rules` :

### 1. Collection `users`
- ✅ **Lecture** : Tous les utilisateurs authentifiés
- ✅ **Création** : Seulement son propre document (uid == userId)
- ✅ **Modification** : Seulement son propre document
- ✅ **Suppression** : Seulement son propre document

### 2. Collection `projects`
- ✅ **Lecture** : Tous les utilisateurs authentifiés
- ✅ **Création** : Tous les utilisateurs authentifiés (avec vérification authorId)
- ✅ **Modification/Suppression** : Seulement le propriétaire

### 3. Collection `githubStats` (Cache GitHub)
- ✅ **Lecture** : Tous les utilisateurs authentifiés
- ✅ **Écriture** : Tous les utilisateurs authentifiés

---

## 🔍 Vérification Après Déploiement

Testez ces actions dans votre application :

1. ✅ **Connexion** : Connectez-vous avec Google
2. ✅ **Création de projet** : Ajoutez un nouveau projet
3. ✅ **Exploration** : Parcourez les projets
4. ✅ **Cache GitHub** : Les stats GitHub devraient se charger sans erreur

---

## 🐛 Dépannage

### Erreur persiste après déploiement

1. **Vérifiez que vous êtes authentifié**
   - L'erreur "Missing or insufficient permissions" peut aussi signifier que vous n'êtes pas connecté
   - Vérifiez dans la console : `auth.currentUser` devrait exister

2. **Vérifiez que les règles sont bien publiées**
   - Dans Firebase Console > Firestore > Règles
   - Vous devriez voir vos règles avec la date de dernière modification

3. **Attendez quelques secondes**
   - Les règles peuvent prendre 10-30 secondes pour se propager

4. **Rafraîchissez complètement**
   - Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)
   - Videz le cache si nécessaire

### Erreur : "Rules are not valid"
- Vérifiez la syntaxe dans Firebase Console
- Assurez-vous qu'il n'y a pas d'erreurs de syntaxe (parenthèses, accolades, etc.)

### Erreur : "Permission denied" pour githubStats
- Vérifiez que la règle `githubStats` est bien présente dans les règles déployées
- Vérifiez que vous êtes authentifié avant d'accéder à cette collection

---

## 📝 Contenu des Règles à Déployer

Voici le contenu complet de `firestore.rules` :

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour la collection users
    match /users/{userId} {
      // Permettre la lecture à tous les utilisateurs authentifiés
      allow read: if request.auth != null;
      
      // Permettre la création si l'utilisateur crée son propre document
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Permettre la modification seulement au propriétaire du document
      allow update: if request.auth != null && request.auth.uid == userId;
      
      // Permettre la suppression seulement au propriétaire du document
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour la collection projects
    match /projects/{projectId} {
      // Permettre la lecture à tous les utilisateurs authentifiés
      allow read: if request.auth != null;
      
      // Permettre la création à tous les utilisateurs authentifiés
      allow create: if request.auth != null 
                    && request.resource.data.authorId == request.auth.uid;
      
      // Permettre la modification et suppression seulement au propriétaire
      allow update, delete: if request.auth != null 
                            && resource.data.authorId == request.auth.uid;
    }
    
    // Règles pour la collection githubStats (cache des stats GitHub)
    match /githubStats/{statsId} {
      // Permettre la lecture à tous les utilisateurs authentifiés
      allow read: if request.auth != null;
      
      // Permettre l'écriture (create/update) à tous les utilisateurs authentifiés
      // Cette collection sert de cache partagé pour les stats GitHub
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🔗 Ressources

- [Firebase Console](https://console.firebase.google.com/)
- [Documentation Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)

---

**⚠️ IMPORTANT : Déployez ces règles maintenant pour résoudre l'erreur "Missing or insufficient permissions" !**
