#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script pour créer automatiquement les issues GitHub depuis ISSUES_TODO.md
 * Usage: node scripts/create-issues.js
 * 
 * Prérequis:
 * 1. Installer: npm install @octokit/rest
 * 2. Créer un Personal Access Token sur GitHub avec scope 'repo'
 * 3. Définir la variable d'environnement: GITHUB_TOKEN=your_token
 */

const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const owner = "2MJ-DEV";
const repo = "243DRC";

const issues = [
  // Priorité Haute
  {
    title: "[FEATURE] Remplacer projects.json par Firestore pour l'affichage des projets",
    body: `## Description
Actuellement, la page \`/explorer-les-projets\` utilise un fichier JSON statique. Il faut :
- Remplacer l'import du fichier JSON par des appels Firestore
- Utiliser la collection \`projects\` existante
- Gérer les états de chargement et les erreurs
- Tester la pagination si nécessaire (plus de 50 projets)

##  Fichiers concernés
- \`app/explorer-les-projets/page.tsx\`

## Checklist
- [ ] Remplacer import JSON par Firestore
- [ ] Gérer les états de chargement
- [ ] Gérer les erreurs de connexion
- [ ] Tester avec de nombreux projets
- [ ] Mettre à jour la documentation`,
    labels: ["enhancement", "backend", "priority-high"]
  },
  {
    title: "[BUG] Améliorer la gestion des erreurs d'authentification Firebase",
    body: `## Description
Améliorer la gestion des erreurs d'authentification Firebase pour une meilleure UX.

## Objectifs
- Afficher des messages d'erreur clairs quand Firebase n'est pas configuré
- Gérer les erreurs de connexion réseau
- Ajouter un fallback quand \`db\` est \`undefined\`
- Créer un composant ErrorBoundary pour les pages auth

## Fichiers concernés
- \`lib/firebaseClient.ts\`
- \`components/AuthButton.tsx\`
- \`app/u/layout.tsx\`

## Checklist
- [ ] Messages d'erreur clairs
- [ ] Gestion erreurs réseau
- [ ] Fallback pour \`db undefined\`
- [ ] ErrorBoundary component
- [ ] Tests des scénarios d'erreur`,
    labels: ["bug", "auth", "priority-high"]
  },
  {
    title: "[FEATURE] Créer une page de profil utilisateur publique",
    body: `## Description
Créer une route \`/profil/[username]\` ou \`/u/[uid]\` pour afficher les profils publics.

## Contenu à afficher
- Photo de profil et nom
- Bio et localisation
- Liste des projets publics de l'utilisateur
- Liens sociaux (GitHub, Twitter, LinkedIn)
- Badge "Contributeur actif" si applicable

## Pages à créer
- \`app/profil/[username]/page.tsx\`

## Checklist
- [ ] Route dynamique \`/profil/[username]\`
- [ ] Récupération données Firestore
- [ ] Affichage projets de l'utilisateur
- [ ] Liens sociaux
- [ ] Design responsive
- [ ] SEO (métadonnées dynamiques)`,
    labels: ["enhancement", "feature", "priority-high"]
  },

  // Priorité Moyenne
  {
    title: "[UI/UX] Améliorer la navigation et les transitions du dashboard",
    body: `## Description
Améliorer l'expérience utilisateur dans le dashboard.

## Améliorations
- Ajouter des animations de transition entre les pages
- Améliorer le feedback visuel sur les actions (loading states)
- Rendre le sidebar collapsible sur mobile
- Ajouter des tooltips sur les icônes
- Améliorer l'accessibilité (ARIA labels, navigation clavier)

## Fichiers concernés
- \`app/u/layout.tsx\`
- \`components/ui/*\`

## Checklist
- [ ] Animations de transition (Framer Motion)
- [ ] Loading states améliorés
- [ ] Sidebar collapsible mobile
- [ ] Tooltips sur icônes
- [ ] ARIA labels et accessibilité
- [ ] Tests de navigation clavier`,
    labels: ["enhancement", "ui", "priority-medium", "a11y"]
  },
  {
    title: "[FEATURE] Implémenter un système de notifications en temps réel",
    body: `## Description
Utiliser Firestore Realtime pour notifier les utilisateurs en temps réel.

## Notifications à implémenter
- Nouveau projet ajouté dans la communauté
- Quelqu'un a commenté/liké leur projet (fonctionnalité future)
- Nouveau follower (fonctionnalité future)
- Mise à jour importante de la plateforme

## Composants à créer
- \`components/NotificationBell.tsx\`
- \`components/NotificationList.tsx\`
- \`context/NotificationContext.tsx\`

## Checklist
- [ ] Collection Firestore \`notifications\`
- [ ] NotificationBell component
- [ ] NotificationList component
- [ ] Context pour state global
- [ ] Badge count non lues
- [ ] Marquer comme lu
- [ ] Sons/animations (optionnel)`,
    labels: ["enhancement", "feature", "priority-medium"]
  },
  {
    title: "[FEATURE] Ajouter des filtres avancés sur la page Explorer",
    body: `## Description
Améliorer l'expérience de recherche avec des filtres avancés.

## Filtres à ajouter
- Trier par nombre de stars/forks
- Filtrer par technologies multiples
- Filtrer par date de création
- Recherche fuzzy (tolérance aux fautes)
- Sauvegarde des filtres dans localStorage

## Fichiers concernés
- \`app/explorer-les-projets/page.tsx\`
- \`app/u/dashboard/explorer/page.tsx\`

## Checklist
- [ ] Tri par stars/forks
- [ ] Multi-select technologies
- [ ] Filtre par date
- [ ] Recherche fuzzy (fuse.js)
- [ ] Persistence localStorage
- [ ] UI/UX des filtres
- [ ] Tests des combinaisons`,
    labels: ["enhancement", "feature", "priority-medium"]
  },
  {
    title: "[FEATURE] Ajouter des graphiques de statistiques dans le dashboard",
    body: `## Description
Créer une page \`app/u/dashboard/statistiques/page.tsx\` avec des graphiques.

## Graphiques à créer
- Graphique d'évolution des stars au fil du temps
- Répartition des projets par langage (pie chart)
- Activité de la communauté (nombre de nouveaux projets par mois)
- Top contributeurs
- Utiliser Recharts ou Chart.js

## Checklist
- [ ] Installer Recharts
- [ ] Page statistiques
- [ ] Graphique évolution stars
- [ ] Pie chart langages
- [ ] Graphique activité communauté
- [ ] Design responsive
- [ ] Export en PNG (optionnel)`,
    labels: ["enhancement", "analytics", "priority-medium"]
  },
  {
    title: "[TESTING] Ajouter des tests avec Jest et Playwright",
    body: `## Description
Mettre en place une infrastructure de tests complète.

## Configuration
- Configurer Jest pour les tests unitaires
- Configurer Playwright pour les tests E2E
- Tester les composants critiques (AuthButton, ProjectCard)
- Tester les flows utilisateurs (login, ajout projet)

## Checklist
- [ ] Configuration Jest
- [ ] Configuration Playwright
- [ ] Tests AuthButton
- [ ] Tests ProjectCard
- [ ] Tests flow login
- [ ] Tests flow ajout projet
- [ ] CI/CD integration
- [ ] Coverage report`,
    labels: ["testing", "priority-medium"]
  },
  {
    title: "[PERF] Optimiser le chargement des images et le bundle size",
    body: `## Description
Optimiser les performances de l'application.

## Optimisations
- Implémenter le lazy loading pour les images GitHub
- Utiliser next/image pour toutes les images
- Analyser et réduire le bundle size
- Implémenter ISR (Incremental Static Regeneration) pour les pages publiques

## Checklist
- [ ] Lazy loading images
- [ ] Migration vers next/image
- [ ] Analyse bundle (webpack-bundle-analyzer)
- [ ] Code splitting
- [ ] ISR pour pages publiques
- [ ] Lighthouse audit > 90`,
    labels: ["performance", "priority-medium"]
  },

  // Priorité Basse
  {
    title: "[UI] Améliorer le mode sombre avec un toggle persistant",
    body: `## Description
Ajouter un système de toggle dark/light mode amélioré.

## Fonctionnalités
- Ajouter un bouton de toggle dans la navbar
- Sauvegarder la préférence dans localStorage
- S'assurer que tous les composants supportent le dark mode
- Transition fluide entre les modes

## Fichiers concernés
- \`components/Navbar.tsx\`
- \`app/layout.tsx\`
- \`app/globals.css\`

## Checklist
- [ ] Toggle button component
- [ ] Context pour theme state
- [ ] Persistence localStorage
- [ ] Vérification tous composants
- [ ] Transition animations
- [ ] Support prefers-color-scheme`,
    labels: ["enhancement", "ui", "priority-low"]
  },
  {
    title: "[FEATURE] Ajouter le support multilingue (FR/EN)",
    body: `## Description
Implémenter l'internationalisation pour supporter plusieurs langues.

## Langues à supporter
- Français (par défaut)
- Anglais

## Stack
- Utiliser next-intl ou react-i18next
- Créer les fichiers de traduction dans \`locales/\`

## Checklist
- [ ] Configuration next-intl
- [ ] Fichiers FR/EN
- [ ] Language switcher component
- [ ] Traduction toutes les pages
- [ ] Traduction composants UI
- [ ] URLs localisées
- [ ] Tests des traductions`,
    labels: ["enhancement", "i18n", "priority-low"]
  },
  {
    title: "[CONTENT] Créer les pages À propos et Contact",
    body: `## Description
Créer les pages institutionnelles du site.

## Pages à créer
- \`app/about/page.tsx\` : Histoire du projet, mission, équipe
- \`app/contact/page.tsx\` : Formulaire de contact ou liens sociaux

## Checklist
- [ ] Page About avec histoire
- [ ] Section équipe/contributeurs
- [ ] Mission et vision
- [ ] Page Contact
- [ ] Formulaire fonctionnel (EmailJS)
- [ ] Mise à jour liens footer
- [ ] SEO métadonnées`,
    labels: ["enhancement", "content", "priority-low"]
  },
  {
    title: "[DOCS] Documenter les composants et l'architecture",
    body: `## Description
Améliorer la documentation technique du projet.

## Documentation à créer
- Créer un Storybook pour les composants UI
- Documenter l'architecture Firestore (collections, champs)
- Ajouter des JSDoc sur les fonctions utilitaires
- Créer un guide pour les nouveaux contributeurs

## Checklist
- [ ] Configuration Storybook
- [ ] Stories pour composants UI
- [ ] Documentation Firestore
- [ ] JSDoc fonctions utils
- [ ] Guide nouveaux contributeurs
- [ ] Architecture decision records (ADR)
- [ ] Diagrammes (Mermaid)`,
    labels: ["documentation", "priority-low"]
  },
  {
    title: "[SEO] Améliorer le référencement avec métadonnées dynamiques",
    body: `## Description
Optimiser le SEO de toutes les pages.

## Optimisations SEO
- Ajouter les métadonnées Open Graph pour chaque page
- Créer un sitemap.xml dynamique
- Ajouter robots.txt
- Implémenter les structured data (JSON-LD)

## Checklist
- [ ] Métadonnées OG toutes pages
- [ ] Sitemap.xml dynamique
- [ ] robots.txt
- [ ] JSON-LD structured data
- [ ] Meta descriptions
- [ ] Canonical URLs
- [ ] Audit SEO complet`,
    labels: ["seo", "priority-low"]
  }
];

async function createIssues() {
  console.log("🚀 Création des issues GitHub...\n");

  for (const issue of issues) {
    try {
      const response = await octokit.issues.create({
        owner,
        repo,
        title: issue.title,
        body: issue.body,
        labels: issue.labels
      });

      console.log(`✅ Issue créée: ${issue.title}`);
      console.log(`   URL: ${response.data.html_url}\n`);

      // Pause de 1s entre chaque création pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Erreur lors de la création de "${issue.title}":`, error.message);
    }
  }

  console.log("Toutes les issues ont été créées !");
}

// Vérifier que le token est défini
if (!process.env.GITHUB_TOKEN) {
  console.error("❌ Erreur: La variable d'environnement GITHUB_TOKEN n'est pas définie.");
  console.log("\n Pour créer un token:");
  console.log("1. Allez sur https://github.com/settings/tokens");
  console.log("2. Cliquez sur 'Generate new token (classic)'");
  console.log("3. Sélectionnez le scope 'repo'");
  console.log("4. Copiez le token et définissez: export GITHUB_TOKEN=your_token");
  process.exit(1);
}

createIssues();
