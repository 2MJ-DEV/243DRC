<img width="960" height="540" alt="Preview page" src="/public/Previews.png" />

[![Contributors](https://img.shields.io/github/contributors/2MJ-DEV/243DRC)](https://github.com/2MJ-DEV/243DRC/graphs/contributors)
[![Stars](https://img.shields.io/github/stars/2MJ-DEV/243DRC)](https://github.com/2MJ-DEV/243DRC/stargazers)
[![Issues](https://img.shields.io/github/issues/2MJ-DEV/243DRC)](https://github.com/2MJ-DEV/243DRC/issues)
[![License](https://img.shields.io/github/license/2MJ-DEV/243DRC)](./LICENSE)

## À propos du projet

**243 DRC** est une plateforme communautaire dédiée aux développeurs de la République Démocratique du Congo. Elle permet de :

-  **Découvrir** des projets open source créés par des développeurs congolais
-  **Partager** vos propres projets et recevoir des feedbacks de la communauté
-  **Se connecter** avec d'autres développeurs talentueux de la RDC
-  **Suivre** les statistiques de vos projets (stars, forks) directement depuis GitHub
-  **Construire** votre portfolio de développeur avec un profil personnalisé

### Pourquoi 243 DRC ?

Le code téléphonique de la RDC est le **+243**. Ce projet vise à créer un hub centralisé pour valoriser le talent tech congolais et favoriser la collaboration au sein de la communauté.

##  Fonctionnalités

### Pour tous les utilisateurs
- Navigation fluide avec smooth scroll (Lenis)
- Interface moderne et responsive (Tailwind CSS + shadcn/ui)
- Authentification sécurisée via Google

### Dashboard développeur
- **Profil personnalisé** : Bio, localisation, université, poste actuel, liens sociaux
- **Gestion de projets** : Ajouter, modifier, supprimer vos projets
- **Statistiques** : Vue d'ensemble de vos projets et leurs performances
- **Explorateur** : Recherche en temps réel parmi tous les projets de la communauté

### Intégration GitHub
- Récupération automatique des statistiques (stars, forks)
- Synchronisation des données en arrière-plan
- Support des images OpenGraph

##  Technologies utilisées

### Frontend
- **Next.js 16** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Framework CSS utility-first
- **shadcn/ui** - Composants UI réutilisables
- **Lenis** - Smooth scroll
- **Lucide React** - Icônes

### Backend & Services
- **Firebase Authentication** - Authentification Google
- **Cloud Firestore** - Base de données NoSQL temps réel
- **GitHub API** - Récupération des statistiques de projets

### DevOps
- **pnpm** - Gestionnaire de paquets rapide et efficient
- **Vercel** - Déploiement et hébergement
- **ESLint** - Linting du code

##  Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur)
- **pnpm** (v8 ou supérieur)
- Un compte **Firebase** (pour l'authentification et Firestore)
- Un compte **GitHub** (pour les contributions)

### Installation de pnpm

```bash
# Via npm
npm install -g pnpm

# Via Homebrew (macOS)
brew install pnpm

# Via Chocolatey (Windows)
choco install pnpm

# Via Scoop (Windows)
scoop install pnpm
```

##  Installation et démarrage

### 1. Cloner le dépôt

```bash
git clone https://github.com/2MJ-DEV/243DRC.git
cd 243DRC
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

> **Note** : Contactez les mainteneurs du projet pour obtenir les clés Firebase de développement, ou créez votre propre projet Firebase pour tester localement.

### 4. Lancer le serveur de développement

```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

##  Structure du projet

```
243DRC/
├── app/                          # App Router Next.js
│   ├── u/                        # Routes dashboard (/u/*)
│   │   ├── layout.tsx           # Layout dashboard avec sidebar
│   │   └── dashboard/           # Pages du dashboard
│   │       ├── page.tsx         # Aperçu général
│   │       ├── profil/          # Gestion du profil
│   │       ├── mes-projets/     # Liste des projets
│   │       ├── ajouter-projet/  # Formulaire d'ajout
│   │       └── explorer/        # Explorateur communauté
│   ├── layout.tsx               # Layout racine
│   ├── page.tsx                 # Page d'accueil
│   └── globals.css              # Styles globaux
├── components/                   # Composants React
│   ├── ui/                      # Composants UI (shadcn)
│   ├── Header.tsx               # En-tête du site
│   ├── Navbar.tsx               # Barre de navigation
│   └── AuthButton.tsx           # Bouton d'authentification
├── lib/                         # Utilitaires et configs
│   ├── firebaseClient.ts        # Configuration Firebase
│   └── utils.ts                 # Fonctions utilitaires
├── public/                      # Assets statiques
├── .env.local                   # Variables d'environnement (non versionné)
├── firestore.rules              # Règles de sécurité Firestore
├── next.config.ts               # Configuration Next.js
├── tailwind.config.ts           # Configuration Tailwind
├── tsconfig.json                # Configuration TypeScript
└── package.json                 # Dépendances et scripts
```

##  Contribuer

Les contributions sont les bienvenues ! Consultez notre [Guide de contribution](./CONTRIBUTING.md) pour plus de détails.

### Processus rapide

1. **Fork** le projet
2. **Créez** votre branche (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'feat: Add some AmazingFeature'`)
4. **Poussez** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

##  Scripts disponibles

```bash
pnpm dev          # Démarre le serveur de développement
pnpm build        # Compile pour la production
pnpm start        # Démarre le serveur de production
pnpm lint         # Vérifie le code avec ESLint
pnpm clean        # Nettoie le cache (.next, node_modules/.cache)
```

##  Sécurité

Si vous découvrez une vulnérabilité de sécurité, consultez notre [Politique de sécurité](./SECURITY.md).

##  Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

##  Remerciements

Merci à tous les contributeurs qui font vivre ce projet !

<a href="https://github.com/2MJ-DEV/243DRC/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=2MJ-DEV/243DRC" />
</a>

##  Contact et Support

- **Issues** : [GitHub Issues](https://github.com/2MJ-DEV/243DRC/issues)
- **Discussions** : [GitHub Discussions](https://github.com/2MJ-DEV/243DRC/discussions)
- **Twitter** : [@243DRC](https://twitter.com/243DRC)

---


**Fait avec ❤️ par la communauté tech de la RDC 🇨🇩**
