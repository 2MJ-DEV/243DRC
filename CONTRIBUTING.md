# Guide de Contribution - 243 DRC

Merci de votre intérêt pour contribuer à **243 DRC** ! 🎉

Ce guide vous aidera à comprendre comment contribuer efficacement au projet, que vous soyez débutant ou développeur expérimenté.

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Configuration de l'environnement](#configuration-de-lenvironnement)
- [Workflow de développement](#workflow-de-développement)
- [Standards de code](#standards-de-code)
- [Convention de commit](#convention-de-commit)
- [Process de Pull Request](#process-de-pull-request)
- [Signalement de bugs](#signalement-de-bugs)
- [Proposition de fonctionnalités](#proposition-de-fonctionnalités)

## 📜 Code de conduite

En participant à ce projet, vous acceptez de respecter notre [Code de Conduite](./CODE_OF_CONDUCT.md). Nous nous engageons à maintenir un environnement accueillant et inclusif pour tous.

## 🤝 Comment contribuer

Il existe plusieurs façons de contribuer :

### 1. Signaler des bugs 🐛
- Vérifiez si le bug n'a pas déjà été signalé dans les [Issues](https://github.com/2MJ-DEV/243DRC/issues)
- Utilisez le template de bug report
- Fournissez un maximum de détails (navigateur, OS, étapes de reproduction)

### 2. Proposer des améliorations 💡
- Ouvrez une [Discussion](https://github.com/2MJ-DEV/243DRC/discussions)
- Expliquez clairement votre idée et son utilité
- Attendez les retours avant de commencer le développement

### 3. Améliorer la documentation 📚
- Corriger des fautes de frappe
- Clarifier des sections confuses
- Ajouter des exemples ou des tutoriels

### 4. Développer des fonctionnalités ✨
- Consultez les [Issues](https://github.com/2MJ-DEV/243DRC/issues) avec le label `good first issue` ou `help wanted`
- Commentez l'issue pour indiquer que vous travaillez dessus
- Suivez le workflow de développement ci-dessous

## 🛠️ Configuration de l'environnement

### Prérequis

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (obligatoire, n'utilisez pas npm ou yarn)
- **Git**
- Un éditeur de code (VS Code recommandé)

### Installation

1. **Forkez le dépôt** sur GitHub

2. **Clonez votre fork** :
```bash
git clone https://github.com/VOTRE_USERNAME/243DRC.git
cd 243DRC
```

3. **Ajoutez le dépôt original comme remote** :
```bash
git remote add upstream https://github.com/2MJ-DEV/243DRC.git
```

4. **Installez pnpm** si ce n'est pas déjà fait :
```bash
npm install -g pnpm
```

5. **Installez les dépendances** :
```bash
pnpm install
```

6. **Configurez les variables d'environnement** :
```bash
cp .env.example .env.local
```

Remplissez `.env.local` avec vos propres clés Firebase (ou contactez les mainteneurs pour obtenir les clés de développement).

7. **Lancez le serveur de développement** :
```bash
pnpm dev
```

L'application devrait être accessible sur [http://localhost:3000](http://localhost:3000).

## 🔄 Workflow de développement

### 1. Créer une branche

Toujours créer une nouvelle branche pour vos modifications :

```bash
# Mettez à jour votre branche main
git checkout main
git pull upstream main

# Créez une nouvelle branche
git checkout -b type/description-courte
```

**Types de branches** :
- `feature/` - Nouvelles fonctionnalités
- `fix/` - Corrections de bugs
- `docs/` - Documentation uniquement
- `refactor/` - Refactoring de code
- `test/` - Ajout ou modification de tests
- `chore/` - Tâches de maintenance

**Exemples** :
```bash
git checkout -b feature/add-comment-system
git checkout -b fix/login-error
git checkout -b docs/update-readme
```

### 2. Développer

- Écrivez du code propre et lisible
- Respectez les conventions du projet
- Testez vos modifications localement
- Commitez régulièrement avec des messages clairs

### 3. Tester

Avant de soumettre votre PR :

```bash
# Vérifier le linting
pnpm lint

# Tester le build de production
pnpm build

# Lancer le serveur de production
pnpm start
```

### 4. Soumettre

```bash
# Poussez votre branche
git push origin votre-branche

# Créez une Pull Request sur GitHub
```

## 📝 Standards de code

### TypeScript

- **Toujours typer** vos fonctions et variables
- Évitez `any`, préférez `unknown` si nécessaire
- Utilisez des **interfaces** pour les objets complexes

```typescript
// ✅ Bon
interface Project {
  id: string;
  title: string;
  description: string;
  authorId: string;
}

const fetchProject = async (id: string): Promise<Project | null> => {
  // ...
}

// ❌ Mauvais
const fetchProject = async (id: any) => {
  // ...
}
```

### React

- Utilisez des **composants fonctionnels** avec hooks
- Préférez la **composition** à l'héritage
- Nommez les fichiers en **PascalCase** pour les composants
- Un composant = un fichier

```typescript
// ✅ Bon - MyComponent.tsx
export default function MyComponent({ title }: { title: string }) {
  return <div>{title}</div>;
}

// ❌ Mauvais
export default function mycomponent(props) {
  return <div>{props.title}</div>;
}
```

### Next.js

- Utilisez **Server Components** par défaut
- Ajoutez `"use client"` uniquement si nécessaire (hooks, événements)
- Préférez les **App Router** conventions

### Styling

- Utilisez **Tailwind CSS** pour le styling
- Suivez l'ordre des classes : layout → spacing → sizing → colors → typography
- Utilisez les composants **shadcn/ui** quand disponibles

```tsx
// ✅ Bon
<div className="flex items-center gap-4 p-6 rounded-lg bg-background text-foreground">

// ❌ Mauvais
<div className="text-foreground bg-background rounded-lg flex gap-4 items-center p-6">
```

### Imports

Ordre des imports :

1. Dépendances externes
2. Modules internes (@/...)
3. Composants
4. Types
5. Styles

```typescript
// ✅ Bon
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Project } from "@/types";
import "./styles.css";
```

## 💬 Convention de commit

Nous suivons la convention **Conventional Commits** :

```
<type>(<scope>): <description>

[body optionnel]

[footer optionnel]
```

### Types

- `feat` - Nouvelle fonctionnalité
- `fix` - Correction de bug
- `docs` - Documentation uniquement
- `style` - Formatting, point-virgules manquants, etc.
- `refactor` - Refactoring de code
- `perf` - Amélioration des performances
- `test` - Ajout ou modification de tests
- `chore` - Maintenance, configuration, dépendances

### Exemples

```bash
feat(dashboard): add project deletion feature
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
style(ui): format button component
refactor(api): simplify GitHub API calls
perf(firebase): add query indexing
test(projects): add unit tests for project creation
chore(deps): update Next.js to v16
```

### Règles

- Utilisez l'**impératif présent** : "add" et non "added" ou "adds"
- Pas de majuscule au début de la description
- Pas de point final
- Limitez la première ligne à **72 caractères**
- Ajoutez un body pour expliquer le "pourquoi" si nécessaire

## 🔍 Process de Pull Request

### Avant de soumettre

- [ ] Le code compile sans erreur (`pnpm build`)
- [ ] Le linting passe (`pnpm lint`)
- [ ] Les tests passent (si applicable)
- [ ] La documentation est à jour
- [ ] Vous avez testé manuellement vos modifications
- [ ] Votre branche est à jour avec `main`

### Template de PR

Utilisez ce template pour votre Pull Request :

```markdown
## Description

Décrivez brièvement vos modifications.

## Type de changement

- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Motivation et contexte

Pourquoi ce changement est-il nécessaire ? Quel problème résout-il ?

Fixes #(numéro d'issue)

## Comment tester ?

Expliquez comment tester vos modifications.

## Captures d'écran (si applicable)

Ajoutez des captures d'écran pour les modifications UI.

## Checklist

- [ ] Mon code suit les conventions du projet
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai commenté les parties complexes
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai testé sur plusieurs navigateurs (si UI)
```

### Review

- Les mainteneurs vont review votre PR
- Répondez aux commentaires et effectuez les modifications demandées
- Une fois approuvée, votre PR sera mergée

## 🐛 Signalement de bugs

Utilisez ce template pour signaler un bug :

```markdown
## Description du bug
Description claire et concise du problème.

## Reproduction
Étapes pour reproduire le comportement :
1. Allez sur '...'
2. Cliquez sur '...'
3. Scrollez jusqu'à '...'
4. Observez l'erreur

## Comportement attendu
Qu'est-ce qui devrait se passer normalement ?

## Captures d'écran
Si applicable, ajoutez des captures d'écran.

## Environnement
- OS: [ex: Windows 11]
- Navigateur: [ex: Chrome 120]
- Version: [ex: 1.0.0]

## Contexte additionnel
Toute autre information pertinente.
```

## 💡 Proposition de fonctionnalités

Utilisez ce template pour proposer une nouvelle fonctionnalité :

```markdown
## Problème à résoudre
Quel problème cette fonctionnalité résout-elle ?

## Solution proposée
Comment proposez-vous de résoudre ce problème ?

## Alternatives considérées
Quelles autres solutions avez-vous envisagées ?

## Bénéfices
- Qui bénéficiera de cette fonctionnalité ?
- Quel impact aura-t-elle sur le projet ?

## Complexité estimée
- [ ] Simple (quelques heures)
- [ ] Moyenne (quelques jours)
- [ ] Complexe (plusieurs semaines)
```

## 📚 Ressources utiles

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Communauté

- [GitHub Discussions](https://github.com/2MJ-DEV/243DRC/discussions)
- [Issues](https://github.com/2MJ-DEV/243DRC/issues)

## 🎓 Pour les débutants

Si c'est votre première contribution open source :

1. Cherchez les issues avec le label `good first issue`
2. Lisez attentivement ce guide
3. N'hésitez pas à poser des questions dans les discussions
4. Commencez petit (correction de typo, amélioration de doc)
5. Demandez de l'aide si vous êtes bloqué

**N'ayez pas peur de faire des erreurs ! Nous sommes là pour vous aider.** 💪

## 🙏 Remerciements

Merci de contribuer à **243 DRC** et de faire grandir la communauté tech congolaise ! 🇨🇩

---

**Questions ?** Ouvrez une [Discussion](https://github.com/2MJ-DEV/243DRC/discussions) ou contactez les mainteneurs
