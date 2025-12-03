# Rowboat MCP SSE Server

Service SSE permanent qui expose Rowboat via Supergateway MCP pour l'intégration avec Flowise.

## 🎯 Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Repo Git (déployé par Coolify)                          │
│                                                          │
│  • rowboatx installé en dépendance permanente           │
│  • Supergateway MCP en mode stdio → SSE                 │
│  • Exposition via URL Coolify                           │
└─────────────────────────────────────────────────────────┘
                       ↓ SSE
         https://rowboat.xxxxx.sslip.io
                       ↓
┌─────────────────────────────────────────────────────────┐
│ Flowise AgentFlow                                        │
│                                                          │
│  Connecteur Supergateway MCP configuré avec :           │
│  --sse "https://rowboat.xxxxx.sslip.io"                 │
└─────────────────────────────────────────────────────────┘
```

## 📦 Dépendances

- **@rowboatlabs/rowboatx** : CLI Rowboat installé en permanence (pas via `npx @latest`)
- **@modelcontextprotocol/server-supergateway** : Expose Rowboat en mode SSE

## 🚀 Déploiement sur Coolify

### 1. Créer un nouveau service dans Coolify

1. Allez dans votre projet Coolify
2. Cliquez sur "Add Resource" → "Git Repository"
3. Connectez ce repository GitHub
4. Sélectionnez la branche `claude/install-rowboat-cli-01Q5h4NDV9B9UgnqC5NngdNY`

### 2. Configuration du service

**Type**: Docker

**Port**: 3000

**Variables d'environnement**:

**OBLIGATOIRE** - Clé API OpenAI :
```bash
OPENAI_API_KEY=sk-proj-votre-cle-api-openai
```

Optionnelles :
```bash
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
```

⚠️ **Important** : La variable `OPENAI_API_KEY` est **REQUISE**. Sans elle, le serveur refusera de démarrer.

Pour obtenir une clé API OpenAI :
1. Visitez https://platform.openai.com/api-keys
2. Créez une nouvelle clé API
3. Copiez-la et ajoutez-la dans les variables d'environnement Coolify

### 3. Récupération de l'URL SSE

Après le déploiement, Coolify va générer une URL publique, par exemple:
```
https://rowboat-xxxxxxxx.sslip.io
```

Cette URL sera votre endpoint SSE pour Flowise.

## 🔗 Configuration dans Flowise

### Connecteur Supergateway MCP

Dans l'édition de votre AgentFlow Flowise, configurez le connecteur Supergateway MCP avec:

```bash
--sse "https://rowboat-xxxxxxxx.sslip.io"
```

Remplacez `rowboat-xxxxxxxx.sslip.io` par l'URL générée par Coolify.

## 🛠️ Développement local

### Installation

```bash
npm install
```

### Démarrage

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

### Test de l'endpoint SSE

```bash
curl http://localhost:3000
```

## 📁 Structure du projet

```
.
├── server.js           # Point d'entrée - Lance Supergateway avec Rowboat
├── package.json        # Dépendances npm (rowboatx + supergateway)
├── Dockerfile          # Image Docker pour Coolify
├── .dockerignore       # Optimisation de l'image Docker
└── README.md           # Cette documentation
```

## 🔍 Comment ça marche

1. **Initialisation** : `init-rowboat.js` crée automatiquement la configuration Rowboat avec votre clé OpenAI
2. **Démarrage** : `server.js` lance Supergateway avec les bons arguments (`--stdio --outputTransport sse`)
3. **Conversion** : Supergateway convertit le protocole stdio de Rowboat en Server-Sent Events (SSE)
4. **Exposition** : L'endpoint SSE (`/sse`) est exposé publiquement via Coolify
5. **Connexion** : Flowise se connecte à cet endpoint SSE pour utiliser les capacités de Rowboat

## 🐛 Troubleshooting

### Erreur "OPENAI_API_KEY is required"

Le serveur refuse de démarrer car la variable d'environnement `OPENAI_API_KEY` est manquante.

**Solution** :
1. Allez dans les paramètres de votre application Coolify
2. Section "Environment Variables"
3. Ajoutez `OPENAI_API_KEY` avec votre clé API OpenAI
4. Redéployez l'application

### Le serveur ne démarre pas

Vérifiez que les dépendances sont bien installées:
```bash
npm ci
```

Vérifiez les logs du conteneur dans Coolify pour identifier l'erreur exacte.

### L'URL Coolify ne fonctionne pas

1. Vérifiez que le port 3000 est bien exposé dans Coolify
2. Vérifiez les logs du conteneur dans Coolify
3. Assurez-vous que le health check passe

### Flowise ne se connecte pas

1. Vérifiez que l'URL SSE est correcte (avec `https://`)
2. Testez l'endpoint directement avec curl
3. Vérifiez les CORS si nécessaire

## 📝 Notes techniques

- **Rowboat** est installé comme dépendance npm fixe (pas `@latest` dynamique)
- **Supergateway** expose Rowboat via SSE sur le port configuré
- **Coolify** génère automatiquement les certificats SSL et l'URL publique
- **Flowise** consomme l'endpoint SSE pour les capacités MCP

## 🔐 Sécurité

Pour production, considérez d'ajouter:
- Authentication/Authorization sur l'endpoint SSE
- Rate limiting
- CORS policy stricte
- Variables d'environnement pour les secrets

## 📄 Licence

MIT
