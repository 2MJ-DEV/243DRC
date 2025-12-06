# 243 DRC - Déploiement

## Prérequis pour le déploiement

### Variables d'environnement requises

Créez un fichier `.env.local` avec les variables suivantes :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

### Configuration Firebase

1. **Activer l'authentification Google** dans la console Firebase
2. **Déployer les règles Firestore** :
   ```bash
   firebase deploy --only firestore:rules
   ```

### Collections Firestore requises

- `users` : Profils des utilisateurs
- `projects` : Projets open source

## Déploiement sur Vercel

### Préparation

```bash
# Installer les dépendances
pnpm install

# Tester le build local
pnpm build

# Démarrer en production
pnpm start
```

### Déployer

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel
3. Déployez automatiquement à chaque push sur `main`

### Variables d'environnement Vercel

Ajoutez toutes les variables `NEXT_PUBLIC_*` dans les settings Vercel.

## Optimisations de production

- ✅ Images optimisées avec Next.js Image
- ✅ Persistence Firestore pour mode offline
- ✅ Lazy loading des composants
- ✅ Ajout de projets optimisé (stats GitHub en arrière-plan)

## Dossiers exclus du déploiement

Les dossiers suivants sont exclus via `.vercelignore` :
- `context/` (vide/non utilisé)
- `config/` (vide/non utilisé)
- `app/(auth)/` (routes non implémentées)
