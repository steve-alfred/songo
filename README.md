# 🪘 Songo - Jeu Traditionnel Africain

Jeu de Songo, un jeu traditionnel de semailles et de stratégie d'Afrique Centrale.

## 🚀 Déploiement sur Vercel avec Redis

### Prérequis
- Compte Vercel ([vercel.com](https://vercel.com))
- Compte GitHub ([github.com](https://github.com))

### Étape 1: Créer une base de données Redis sur Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur "Storage" puis "Create Database"
3. Sélectionnez "Redis" (Vercel KV)
4. Choisissez la région et créez la base de données
5. Une fois créée, cliquez sur ".env.local" pour copier les variables d'environnement:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### Étape 2: Déployer sur Vercel

#### Option A: Via l'interface Vercel
1. Cliquez sur "Add New Project" sur Vercel
2. Importez votre repository GitHub
3. Vercel détectera automatiquement la configuration
4. Dans "Environment Variables", ajoutez:
   - `KV_REST_API_URL` = (valeur depuis votre dashboard Redis)
   - `KV_REST_API_TOKEN` = (valeur depuis votre dashboard Redis)
5. Cliquez sur "Deploy"

#### Option B: Via CLI Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel
```

### Étape 3: Configurer les variables d'environnement sur Vercel

1. Allez dans votre projet sur Vercel
2. Cliquez sur "Settings" → "Environment Variables"
3. Ajoutez les variables suivantes:
   - `KV_REST_API_URL`: votre URL Redis
   - `KV_REST_API_TOKEN`: votre token Redis

## 📦 Déploiement sur GitHub

### Étape 1: Initialiser le repository (si pas déjà fait)

```bash
# Ajouter tous les fichiers
git add .

# Commit initial
git commit -m "Initial commit - Jeu Songo"

# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Push vers GitHub
git branch -M main
git push -u origin main
```

### Étape 2: Créer le repository sur GitHub

1. Allez sur [github.com](https://github.com) et connectez-vous
2. Cliquez sur "+" → "New repository"
3. Nommez-le "songo"
4. Ne cochez pas "Initialize with README" (nous en avons déjà un)
5. Cliquez sur "Create repository"
6. Suivez les instructions pour pousser votre code existant

## 🔧 Configuration Locale

Pour tester localement, créez un fichier `.env`:

```bash
cp .env.example .env
```

Puis ajoutez vos variables Redis dans le fichier `.env`.

## 📁 Structure du Projet

```
songo/
├── api/
│   └── game.js          # API Vercel KV pour le jeu en ligne
├── songo-enligne/       # Fichiers pour le mode en ligne
├── acceuil.html         # Page d'accueil
├── locale.html          # Mode jeu local
├── songo.css            # Styles
├── songo.js             # Logique du jeu
├── vercel.json          # Configuration Vercel
├── package.json         # Dépendances
└── README.md            # Ce fichier
```

## 🎮 Fonctionnalités

- **Mode local**: Jouez à deux sur le même appareil
- **Mode en ligne**: Jouez avec un ami via Redis
- **Design responsive**: Fonctionne sur mobile et desktop

## 🛠️ Technologies

- HTML5, CSS3, JavaScript
- Vercel KV (Redis) pour le stockage en ligne
- Vercel pour l'hébergement

## 📝 Notes

- Le jeu utilise Redis pour synchroniser l'état du jeu entre les joueurs
- L'API dans `api/game.js` gère les requêtes GET (lecture) et POST (sauvegarde)
- CORS est configuré pour autoriser les requêtes cross-origin
