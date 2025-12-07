# Script pour créer automatiquement les issues GitHub

Ce script crée automatiquement toutes les issues définies dans `ISSUES_TODO.md` via l'API GitHub.

## Utilisation rapide

### Option 1 : Via Node.js (Recommandé)

```bash
# 1. Installer les dépendances
pnpm install @octokit/rest

# 2. Créer un Personal Access Token sur GitHub
# Aller sur: https://github.com/settings/tokens
# Cliquer sur "Generate new token (classic)"
# Cocher le scope "repo" (Full control of private repositories)
# Copier le token généré

# 3. Définir le token en variable d'environnement
# Windows PowerShell:
$env:GITHUB_TOKEN="ghp_your_token_here"

# Windows CMD:
set GITHUB_TOKEN=ghp_your_token_here

# Linux/macOS:
export GITHUB_TOKEN=ghp_your_token_here

# 4. Exécuter le script
node scripts/create-issues.js
```

### Option 2 : Via GitHub CLI (Plus simple)

```bash
# 1. Installer GitHub CLI
# Windows (winget):
winget install --id GitHub.cli

# macOS:
brew install gh

# Linux:
# Voir https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# 2. S'authentifier
gh auth login

# 3. Créer les issues via le script PowerShell
pwsh scripts/create-issues-gh.ps1
```

## Que fait ce script ?

Le script crée **14 issues** organisées par priorité :

-  **3 issues haute priorité** (Firestore, auth, profils publics)
-  **6 issues moyenne priorité** (UI/UX, notifications, analytics, tests)
-  **5 issues basse priorité** (dark mode, i18n, SEO, documentation)

Chaque issue contient :
-  Un titre descriptif avec préfixe `[FEATURE]`, `[BUG]`, etc.
-  Une description complète avec contexte
-  Des labels appropriés (enhancement, bug, priority-*)
-  Une checklist de tâches à accomplir
-  Les fichiers concernés

##  Sécurité du token

** Important :** Ne jamais commit votre token GitHub !

Le token est temporaire et doit être stocké dans une variable d'environnement.

Pour plus de sécurité, ajoutez `.env` à votre `.gitignore` :

```bash
echo ".env" >> .gitignore
```

##  Personnalisation

Pour modifier les issues à créer, éditez le fichier :
- `scripts/create-issues.js` (méthode Node.js)
- `ISSUES_TODO.md` pour la documentation

##  Résultat attendu

Après exécution, vous verrez :

```
 Création des issues GitHub...

 Issue créée: [FEATURE] Remplacer projects.json par Firestore
   URL: https://github.com/2MJ-DEV/243DRC/issues/1

 Issue créée: [BUG] Améliorer la gestion des erreurs Firebase
   URL: https://github.com/2MJ-DEV/243DRC/issues/2

...

✨ Toutes les issues ont été créées !
```

##  Dépannage

### Erreur "GITHUB_TOKEN not defined"
Assurez-vous d'avoir défini la variable d'environnement correctement.

### Erreur "Rate limit exceeded"
GitHub limite à 5000 requêtes/heure. Attendez quelques minutes.

### Erreur "401 Unauthorized"
Vérifiez que votre token est valide et a le scope `repo`.

### Issues déjà existantes
Le script créera des doublons. Supprimez les anciennes issues d'abord.

##  Liens utiles

- [GitHub API - Issues](https://docs.github.com/en/rest/issues/issues)
- [Créer un Personal Access Token](https://github.com/settings/tokens)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Octokit.js Documentation](https://github.com/octokit/octokit.js)