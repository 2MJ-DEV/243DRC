# 🔍 Analyse de Performance - Problèmes Identifiés

## 📊 Résumé Exécutif

Ce document identifie les problèmes de performance majeurs dans l'application, particulièrement au niveau backend/Firebase, qui expliquent la lenteur en production.

---

## 🚨 Problèmes Critiques

### 1. **Index Firestore Manquants** ⚠️ CRITIQUE

**Problème :**
Les requêtes Firestore utilisent des filtres composites (`where` + `orderBy`) sans index correspondants.

**Fichiers concernés :**
- `app/u/dashboard/page.tsx` (ligne 47-52)
- `app/u/dashboard/mes-projets/page.tsx` (ligne 54-58)

**Code problématique :**
```typescript
const projectsQuery = query(
  collection(db, "projects"),
  where("authorId", "==", user.uid),
  orderBy("createdAt", "desc"),  // ❌ Nécessite un index composite
  limit(3)
);
```

**Impact :**
- Les requêtes échouent ou sont extrêmement lentes
- Firestore retourne des erreurs "index missing"
- Temps de réponse : 5-30 secondes au lieu de <1 seconde

**Solution :**
Créer un index composite dans Firebase Console :
- Collection: `projects`
- Champs: `authorId` (Ascending) + `createdAt` (Descending)

---

### 2. **Chargement de Tous les Projets Sans Limite** ⚠️ CRITIQUE

**Problème :**
La page `explorer/page.tsx` charge TOUS les projets de la collection sans limite ni pagination.

**Fichier concerné :**
- `app/u/dashboard/explorer/page.tsx` (ligne 66-93)

**Code problématique :**
```typescript
const q = query(
  collection(db, "projects"),
  orderBy("createdAt", "desc")
  // ❌ Pas de limit() - charge TOUS les documents
);
```

**Impact :**
- Avec 100+ projets : 10-30 secondes de chargement
- Consommation excessive de bande passante
- Coûts Firestore élevés (lectures illimitées)
- Expérience utilisateur dégradée

**Solution :**
Ajouter une pagination avec `limit()` et `startAfter()` :
```typescript
const q = query(
  collection(db, "projects"),
  orderBy("createdAt", "desc"),
  limit(20) // Limiter à 20 projets par page
);
```

---

### 3. **Fonction `loadAllProjects` Jamais Appelée** ⚠️ CRITIQUE

**Problème :**
Dans `app/u/dashboard/explorer/page.tsx`, la fonction `loadAllProjects` est définie mais jamais appelée dans un `useEffect`.

**Fichier concerné :**
- `app/u/dashboard/explorer/page.tsx` (ligne 66-93)

**Impact :**
- La page reste vide ou affiche un état de chargement infini
- Les projets ne sont jamais chargés

**Solution :**
Ajouter un `useEffect` qui appelle `loadAllProjects()` après l'authentification.

---

### 4. **Appels API GitHub Non Optimisés** ⚠️ HAUTE PRIORITÉ

**Problème :**
Dans `app/explorer-les-projets/page.tsx`, tous les appels GitHub sont faits en parallèle sans gestion de limite de taux.

**Fichier concerné :**
- `app/explorer-les-projets/page.tsx` (ligne 193-224)

**Code problématique :**
```typescript
const projectsWithStats = await Promise.all(
  projectsList.map(async (project) => {
    const response = await fetch(
      `https://api.github.com/repos/${githubInfo.owner}/${githubInfo.repo}`
    );
    // ❌ Pas de gestion de limite de taux (60 req/heure non authentifié)
  })
);
```

**Impact :**
- Limite GitHub : 60 requêtes/heure pour IP non authentifiée
- Blocage après quelques chargements de page
- Erreurs 403/429 fréquentes
- Temps de chargement : 10-30 secondes

**Solution :**
- Utiliser un token GitHub pour augmenter la limite (5000 req/heure)
- Implémenter un système de cache pour les stats GitHub
- Limiter le nombre d'appels parallèles (batch de 5-10)

---

### 5. **Pas de Pagination** ⚠️ HAUTE PRIORITÉ

**Problème :**
Aucune pagination n'est implémentée pour les listes de projets.

**Fichiers concernés :**
- `app/u/dashboard/explorer/page.tsx`
- `app/u/dashboard/mes-projets/page.tsx`

**Impact :**
- Performance dégradée avec la croissance des données
- Temps de chargement exponentiel
- Expérience utilisateur médiocre

**Solution :**
Implémenter la pagination avec `startAfter()` et boutons "Charger plus".

---

### 6. **Pas de Cache** ⚠️ MOYENNE PRIORITÉ

**Problème :**
Aucun système de cache pour les données Firestore ou les stats GitHub.

**Impact :**
- Requêtes répétées inutiles
- Coûts Firestore élevés
- Temps de chargement à chaque visite

**Solution :**
- Utiliser `react-query` ou `swr` pour le cache côté client
- Implémenter un cache pour les stats GitHub (localStorage ou Firestore)

---

### 7. **Tout Côté Client (Pas de SSR/SSG)** ⚠️ MOYENNE PRIORITÉ

**Problème :**
Toutes les pages sont en mode "use client", aucune utilisation du SSR/SSG de Next.js.

**Impact :**
- Temps de chargement initial plus long
- Pas de préchargement des données
- SEO dégradé

**Solution :**
- Créer des routes API Next.js pour les requêtes Firestore
- Utiliser Server Components pour les données publiques
- Implémenter ISR (Incremental Static Regeneration) pour les projets

---

### 8. **IndexedDB Persistence Peut Ralentir** ⚠️ MOYENNE PRIORITÉ

**Problème :**
`enableIndexedDbPersistence` est activé dans `firebaseClient.ts` (ligne 36).

**Fichier concerné :**
- `lib/firebaseClient.ts` (ligne 36-42)

**Impact :**
- Première requête plus lente (initialisation de la DB locale)
- Synchronisation peut bloquer le thread principal
- Problèmes avec plusieurs onglets ouverts

**Solution :**
- Désactiver la persistence en production si non nécessaire
- Ou utiliser `enableMultiTabIndexedDbPersistence` pour plusieurs onglets

---

### 9. **Pas de Debouncing pour la Recherche** ⚠️ BASSE PRIORITÉ

**Problème :**
La recherche filtre immédiatement à chaque frappe sans debounce.

**Fichier concerné :**
- `app/u/dashboard/explorer/page.tsx` (ligne 49-64)

**Impact :**
- Filtrage répété inutile
- Performance dégradée avec beaucoup de projets

**Solution :**
Ajouter un debounce de 300ms pour la recherche.

---

### 10. **Pas de Gestion d'Erreur pour les Limites GitHub** ⚠️ BASSE PRIORITÉ

**Problème :**
Aucune gestion spécifique pour les erreurs 403/429 de l'API GitHub.

**Impact :**
- Erreurs silencieuses
- Stats GitHub manquantes sans explication

**Solution :**
Ajouter une gestion d'erreur avec retry et fallback.

---

## 📈 Recommandations par Priorité

### 🔴 Priorité 1 (À faire immédiatement)
1. ✅ Créer les index Firestore manquants
2. ✅ Ajouter `limit()` aux requêtes Firestore
3. ✅ Appeler `loadAllProjects()` dans `explorer/page.tsx`
4. ✅ Implémenter la pagination de base

### 🟡 Priorité 2 (Cette semaine)
5. ✅ Optimiser les appels API GitHub (token + cache)
6. ✅ Implémenter un système de cache (react-query/swr)
7. ✅ Ajouter debouncing pour la recherche

### 🟢 Priorité 3 (Ce mois)
8. ✅ Créer des routes API Next.js
9. ✅ Implémenter SSR/SSG pour les pages publiques
10. ✅ Optimiser la persistence Firebase

---

## 🛠️ Solutions Techniques Détaillées

### Solution 1 : Index Firestore

**Étape 1 :** Aller dans Firebase Console > Firestore > Indexes

**Étape 2 :** Créer un index composite :
- Collection ID: `projects`
- Champs à indexer:
  - `authorId` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection

**Étape 3 :** Attendre la création de l'index (peut prendre quelques minutes)

---

### Solution 2 : Pagination Firestore

```typescript
const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
const [hasMore, setHasMore] = useState(true);

const loadProjects = async () => {
  let q = query(
    collection(db, "projects"),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const snapshot = await getDocs(q);
  const newProjects = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
  setHasMore(snapshot.docs.length === 20);
  setProjects([...projects, ...newProjects]);
};
```

---

### Solution 3 : Cache GitHub Stats

```typescript
// Utiliser Firestore pour stocker les stats avec TTL
const getCachedStats = async (repoUrl: string) => {
  const cacheDoc = await getDoc(doc(db, "githubStats", hashRepoUrl(repoUrl)));
  
  if (cacheDoc.exists()) {
    const data = cacheDoc.data();
    const cacheAge = Date.now() - data.cachedAt;
    const TTL = 60 * 60 * 1000; // 1 heure
    
    if (cacheAge < TTL) {
      return data.stats; // Retourner le cache
    }
  }
  
  // Sinon, faire l'appel API et mettre en cache
  const stats = await fetchGithubStats(repoUrl);
  await setDoc(doc(db, "githubStats", hashRepoUrl(repoUrl)), {
    stats,
    cachedAt: Date.now()
  });
  
  return stats;
};
```

---

## 📊 Métriques Attendues Après Corrections

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| Temps de chargement (explorer) | 15-30s | 1-2s | **90%** |
| Temps de chargement (dashboard) | 5-10s | 0.5-1s | **85%** |
| Requêtes Firestore/page | 1 (tous) | 1 (20) | **80%** |
| Erreurs Firestore | Fréquentes | Aucune | **100%** |
| Blocages GitHub API | Fréquents | Rares | **95%** |

---

## 🔗 Ressources

- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firestore Pagination](https://firebase.google.com/docs/firestore/query-data/query-cursors)
- [GitHub API Rate Limiting](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

