# 🔥 Index Firestore Requis

Ce document liste tous les index Firestore qui doivent être créés dans Firebase Console pour que les requêtes fonctionnent correctement.

## ⚠️ IMPORTANT

Sans ces index, les requêtes Firestore échoueront avec l'erreur `failed-precondition`. Créez ces index **immédiatement** après le déploiement.

---

## 📋 Index à Créer

### 1. Index Composite pour les Projets par Auteur

**Collection:** `projects`

**Champs à indexer:**
- `authorId` - **Ascending** (Croissant)
- `createdAt` - **Descending** (Décroissant)

**Query Scope:** Collection

**Utilisé dans:**
- `app/u/dashboard/page.tsx` (ligne 47-52)
- `app/u/dashboard/mes-projets/page.tsx` (ligne 54-58)

**Comment créer:**
1. Allez dans [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Allez dans **Firestore Database** > **Indexes**
4. Cliquez sur **Créer un index**
5. Collection ID: `projects`
6. Ajoutez les champs:
   - `authorId` (Ascending)
   - `createdAt` (Descending)
7. Cliquez sur **Créer**

**Temps de création:** 2-5 minutes

---

### 2. Index Simple pour Trier par Date (Optionnel mais Recommandé)

**Collection:** `projects`

**Champs à indexer:**
- `createdAt` - **Descending** (Décroissant)

**Query Scope:** Collection

**Utilisé dans:**
- `app/u/dashboard/explorer/page.tsx` (ligne 73-76)

**Note:** Cet index est automatiquement créé par Firestore lors de la première requête, mais vous pouvez le créer manuellement pour éviter le délai.

---

## 🚀 Création Automatique via Firebase CLI

Si vous utilisez Firebase CLI, vous pouvez créer ces index automatiquement en créant un fichier `firestore.indexes.json` :

```json
{
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "authorId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Puis déployez avec :
```bash
firebase deploy --only firestore:indexes
```

---

## ✅ Vérification

Après création, vérifiez que les index sont **actifs** (état vert) dans Firebase Console avant de tester les requêtes.

---

## 📝 Notes

- Les index composites sont nécessaires quand vous combinez `where()` et `orderBy()` sur des champs différents
- La création d'un index peut prendre quelques minutes
- Les requêtes échoueront avec `failed-precondition` tant que l'index n'est pas créé
- Les index sont gratuits mais comptent dans les limites de Firestore

---

## 🔗 Documentation

- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Composite Indexes](https://firebase.google.com/docs/firestore/query-data/indexing#composite_indexes)

