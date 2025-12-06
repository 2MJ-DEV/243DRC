# ✅ Checklist de Déploiement - 243 DRC

## Avant le déploiement

### 1. Configuration Firebase
- [ ] Projet Firebase créé
- [ ] Authentification Google activée dans Firebase Console
- [ ] Règles Firestore déployées (`firebase deploy --only firestore:rules`)
- [ ] Collections `users` et `projects` créées (se créent automatiquement)

### 2. Variables d'environnement
- [ ] `.env.local` configuré localement
- [ ] Variables ajoutées dans Vercel Dashboard :
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

### 3. Tests locaux
- [ ] `pnpm install` exécuté sans erreurs
- [ ] `pnpm build` réussi
- [ ] `pnpm start` fonctionne correctement
- [ ] Connexion Google testée
- [ ] Ajout de projet testé
- [ ] Navigation dashboard testée

### 4. Nettoyage du code
- [ ] Pas d'erreurs TypeScript
- [ ] Pas d'erreurs ESLint critiques
- [ ] Dossiers inutiles supprimés (context/, config/)
- [ ] Fichiers .env exclus de git

### 5. Optimisations
- [ ] Images optimisées (Next.js Image)
- [ ] Lazy loading activé
- [ ] Persistence Firestore configurée
- [ ] Ajout de projets optimisé (background fetch)

## Déploiement sur Vercel

1. **Connecter le repository GitHub à Vercel**
2. **Configurer les variables d'environnement**
3. **Déployer** (automatique via Git push)
4. **Vérifier le déploiement** :
   - [ ] Site accessible
   - [ ] Connexion Google fonctionne
   - [ ] Dashboard accessible
   - [ ] Ajout de projet fonctionne
   - [ ] Pas d'erreurs dans la console

## Post-déploiement

- [ ] Ajouter le domaine Vercel dans Firebase Auth (Authorized domains)
- [ ] Tester sur mobile
- [ ] Vérifier les performances (Lighthouse)
- [ ] Configurer le monitoring (optionnel)

## Support

En cas de problème :
1. Vérifier les logs Vercel
2. Vérifier la console Firebase
3. Vérifier les variables d'environnement
4. Consulter DEPLOYMENT.md pour plus de détails
