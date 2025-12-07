# Issues à créer pour 243 DRC

## Priorité Haute

### 1. Connexion Firestore pour les projets soumis
**Label:** `enhancement`, `backend`, `priority-high`
**Titre:** `[FEATURE] Remplacer projects.json par Firestore pour l'affichage des projets`

**Description:**
Actuellement, la page `/explorer-les-projets` utilise un fichier JSON statique. Il faut :
- Remplacer l'import du fichier JSON par des appels Firestore
- Utiliser la collection `projects` existante
- Gérer les états de chargement et les erreurs
- Tester la pagination si nécessaire (plus de 50 projets)

**Fichiers concernés:**
- `app/explorer-les-projets/page.tsx`

---

### 2. Gestion des erreurs d'authentification Firebase
**Label:** `bug`, `auth`, `priority-high`
**Titre:** `[BUG] Améliorer la gestion des erreurs d'authentification Firebase`

**Description:**
- Afficher des messages d'erreur clairs quand Firebase n'est pas configuré
- Gérer les erreurs de connexion réseau
- Ajouter un fallback quand `db` est `undefined`
- Créer un composant ErrorBoundary pour les pages auth

**Fichiers concernés:**
- `lib/firebaseClient.ts`
- `components/AuthButton.tsx`
- `app/u/layout.tsx`

---

### 3. Page de profil utilisateur publique
**Label:** `enhancement`, `feature`, `priority-high`
**Titre:** `[FEATURE] Créer une page de profil utilisateur publique`

**Description:**
Créer une route `/profil/[username]` ou `/u/[uid]` pour afficher :
- Photo de profil et nom
- Bio et localisation
- Liste des projets publics de l'utilisateur
- Liens sociaux (GitHub, Twitter, LinkedIn)
- Badge "Contributeur actif" si applicable

**Pages à créer:**
- `app/profil/[username]/page.tsx`

---

## Priorité Moyenne

### 4. Amélioration de l'UI/UX du dashboard
**Label:** `enhancement`, `ui`, `priority-medium`
**Titre:** `[UI/UX] Améliorer la navigation et les transitions du dashboard`

**Description:**
- Ajouter des animations de transition entre les pages
- Améliorer le feedback visuel sur les actions (loading states)
- Rendre le sidebar collapsible sur mobile
- Ajouter des tooltips sur les icônes
- Améliorer l'accessibilité (ARIA labels, navigation clavier)

**Fichiers concernés:**
- `app/u/layout.tsx`
- `components/ui/*`

---

### 5. Système de notifications en temps réel
**Label:** `enhancement`, `feature`, `priority-medium`
**Titre:** `[FEATURE] Implémenter un système de notifications en temps réel`

**Description:**
Utiliser Firestore Realtime pour notifier les utilisateurs :
- Nouveau projet ajouté dans la communauté
- Quelqu'un a commenté/liké leur projet (fonctionnalité future)
- Nouveau follower (fonctionnalité future)
- Mise à jour importante de la plateforme

**Composants à créer:**
- `components/NotificationBell.tsx`
- `components/NotificationList.tsx`

---

### 6. Filtre avancé et recherche améliorée
**Label:** `enhancement`, `feature`, `priority-medium`
**Titre:** `[FEATURE] Ajouter des filtres avancés sur la page Explorer`

**Description:**
Ajouter des filtres supplémentaires :
- Trier par nombre de stars/forks
- Filtrer par technologies multiples
- Filtrer par date de création
- Recherche fuzzy (tolérance aux fautes)
- Sauvegarde des filtres dans localStorage

**Fichiers concernés:**
- `app/explorer-les-projets/page.tsx`
- `app/u/dashboard/explorer/page.tsx`

---

## Priorité Basse

### 7. Statistiques et analytics du dashboard
**Label:** `enhancement`, `analytics`, `priority-low`
**Titre:** `[FEATURE] Ajouter des graphiques de statistiques dans le dashboard`

**Description:**
Créer une page `app/u/dashboard/statistiques/page.tsx` avec :
- Graphique d'évolution des stars au fil du temps
- Répartition des projets par langage (pie chart)
- Activité de la communauté (nombre de nouveaux projets par mois)
- Utiliser une lib comme Recharts ou Chart.js

---

### 8. Mode sombre amélioré
**Label:** `enhancement`, `ui`, `priority-low`
**Titre:** `[UI] Améliorer le mode sombre avec un toggle persistant`

**Description:**
- Ajouter un bouton de toggle dark/light mode dans la navbar
- Sauvegarder la préférence dans localStorage
- S'assurer que tous les composants supportent bien le dark mode
- Ajouter une transition fluide entre les modes

**Fichiers concernés:**
- `components/Navbar.tsx`
- `app/layout.tsx`
- `app/globals.css`

---

### 9. Internationalisation (i18n)
**Label:** `enhancement`, `i18n`, `priority-low`
**Titre:** `[FEATURE] Ajouter le support multilingue (FR/EN)`

**Description:**
Implémenter i18n pour supporter :
- Français (par défaut)
- Anglais
- Utiliser next-intl ou react-i18next
- Créer les fichiers de traduction dans `locales/`

---

### 10. Page "À propos" et "Contact"
**Label:** `enhancement`, `content`, `priority-low`
**Titre:** `[CONTENT] Créer les pages À propos et Contact`

**Description:**
Créer :
- `app/about/page.tsx` : Histoire du projet, mission, équipe
- `app/contact/page.tsx` : Formulaire de contact ou liens sociaux
- Mettre à jour les liens dans le footer

---

## Tests et Documentation

### 11. Tests unitaires et E2E
**Label:** `testing`, `priority-medium`
**Titre:** `[TESTING] Ajouter des tests avec Jest et Playwright`

**Description:**
- Configurer Jest pour les tests unitaires
- Configurer Playwright pour les tests E2E
- Tester les composants critiques (AuthButton, ProjectCard)
- Tester les flows utilisateurs (login, ajout projet)

---

### 12. Documentation API et composants
**Label:** `documentation`, `priority-low`
**Titre:** `[DOCS] Documenter les composants et l'architecture`

**Description:**
- Créer un Storybook pour les composants UI
- Documenter l'architecture Firestore (collections, champs)
- Ajouter des JSDoc sur les fonctions utilitaires
- Créer un guide pour les nouveaux contributeurs

---

## Améliorations techniques

### 13. Optimisation des performances
**Label:** `performance`, `priority-medium`
**Titre:** `[PERF] Optimiser le chargement des images et le bundle size`

**Description:**
- Implémenter le lazy loading pour les images GitHub
- Utiliser next/image pour toutes les images
- Analyser et réduire le bundle size
- Implémenter ISR (Incremental Static Regeneration) pour les pages publiques

---

### 14. SEO et métadonnées
**Label:** `seo`, `priority-medium`
**Titre:** `[SEO] Améliorer le référencement avec métadonnées dynamiques`

**Description:**
- Ajouter les métadonnées Open Graph pour chaque page
- Créer un sitemap.xml dynamique
- Ajouter robots.txt
- Implémenter les structured data (JSON-LD)

---

## Fonctionnalités futures (Backlog)

- Système de likes/favoris sur les projets
- Commentaires et discussions sur les projets
- Système de followers/following
- Badges et achievements pour les contributeurs
- Intégration avec GitLab et Bitbucket
- Export du portfolio en PDF
- Intégration d'un blog pour articles tech
- Marketplace pour templates/composants
- Système de mentorat (matching dev junior/senior)
- Hackathons et challenges communautaires

---

## Notes

Pour créer ces issues sur GitHub :
1. Aller sur https://github.com/2MJ-DEV/243DRC/issues/new
2. Copier le titre et la description
3. Ajouter les labels appropriés
4. Assigner si nécessaire
5. Lier à un milestone si applicable

**Convention de nommage des branches :**
- `feature/nom-fonctionnalite` pour les nouvelles fonctionnalités
- `fix/nom-bug` pour les corrections de bugs
- `docs/nom-doc` pour la documentation
- `refactor/nom-refactor` pour le refactoring