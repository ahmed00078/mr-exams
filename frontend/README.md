# 🇲🇷 Portail des Résultats d'Examens - Frontend

Frontend moderne et responsive pour le portail des résultats d'examens mauritaniens, développé avec **Next.js 14**, **TypeScript** et **Tailwind CSS**.

## ✨ Fonctionnalités

### Pour les Candidats
- 🔍 **Recherche intelligente** par NNI ou nom
- 📱 **Interface responsive** optimisée mobile/desktop
- 📊 **Affichage détaillé** des résultats avec classements
- 🔗 **Partage social sécurisé** (Facebook, WhatsApp, Twitter, etc.)
- 🌍 **Support bilingue** français/arabe
- 📈 **Statistiques publiques** par wilaya et établissement

### Pour les Administrateurs
- 📤 **Upload en masse** de résultats (CSV/Excel)
- 📊 **Monitoring en temps réel** des uploads
- 👥 **Gestion des sessions** d'examens
- 🔐 **Authentification sécurisée**
- 📈 **Tableau de bord** administratif

## 🚀 Installation Rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Backend API en cours d'exécution (port 8000)

### 1. Installation des dépendances

```bash
npm install
# ou
yarn install
```

### 2. Configuration de l'environnement

Créer un fichier `.env.local` :

```env
API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Démarrage en développement

```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible sur **http://localhost:3000**

### 4. Build pour la production

```bash
npm run build
npm start
# ou
yarn build
yarn start
```

## 📁 Structure du Projet

```
├── app/                     # App Router Next.js 14
│   ├── page.tsx            # Page d'accueil
│   ├── search/             # Pages de recherche
│   ├── result/[id]/        # Détail d'un résultat
│   ├── stats/              # Statistiques
│   ├── admin/              # Administration
│   ├── layout.tsx          # Layout principal
│   └── globals.css         # Styles globaux
├── components/             # Composants réutilisables
│   ├── Header.tsx          # En-tête principal
│   ├── Footer.tsx          # Pied de page
│   ├── SearchForm.tsx      # Formulaire de recherche
│   ├── ResultCard.tsx      # Carte de résultat
│   ├── SocialShare.tsx     # Partage social
│   └── LoadingSpinner.tsx  # Indicateur de chargement
├── lib/                    # Utilitaires et API
│   ├── api.ts             # Client API
│   └── utils.ts           # Fonctions utilitaires
├── types/                  # Types TypeScript
│   └── index.ts           # Définitions des types
└── public/                # Assets statiques
```

## 🎨 Design System

### Couleurs Principales
- **Primaire**: `#2563eb` (Bleu mauritanien)
- **Vert**: `#28a745` (Drapeau)
- **Jaune**: `#ffc107` (Drapeau) 
- **Rouge**: `#dc3545` (Drapeau)

### Composants Stylisés
- **Cartes**: `card` - Cards avec ombres et bordures
- **Boutons**: `btn-primary`, `btn-secondary`
- **Inputs**: `form-input`, `form-select`
- **Drapeau**: `mauritania-flag` - Drapeau mauritanien CSS

### Responsive Design
- **Mobile First** avec breakpoints Tailwind
- **Grilles adaptatives** pour tous les écrans
- **Navigation mobile** avec menu hamburger
- **Formulaires optimisés** pour le tactile

## 🔧 Configuration API

### Variables d'environnement

```env
# URL de l'API backend
API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optionnel: Configuration avancée
NEXT_PUBLIC_ITEMS_PER_PAGE=50
NEXT_PUBLIC_MAX_SEARCH_RESULTS=1000
```

### Endpoints Utilisés

```typescript
// Recherche de résultats
GET /api/results/search?nni=123&nom=Ahmed

// Détail d'un résultat  
GET /api/results/{id}

// Références (wilayas, établissements, séries)
GET /api/references/wilayas
GET /api/references/etablissements
GET /api/references/series

// Statistiques
GET /api/stats/wilaya/{id}
GET /api/stats/global

// Administration (avec authentification)
POST /api/auth/login
POST /api/admin/upload
```

## 📱 Fonctionnalités Avancées

### Recherche Intelligente
- **Multi-critères**: NNI, nom, wilaya, établissement, série
- **Autocomplétion** des références
- **Validation** des formats (NNI, etc.)
- **Filtres avancés** masquables
- **Historique** des recherches (localStorage)

### Partage Social
- **Liens sécurisés** avec tokens temporaires
- **Mode anonyme** pour protéger l'identité
- **Multi-plateformes**: Facebook, Twitter, WhatsApp, Telegram, LinkedIn
- **Aperçu personnalisé** avec Open Graph tags

### Performance
- **Cache intelligent** des résultats de recherche
- **Lazy loading** des composants
- **Optimisation images** avec Next.js Image
- **Compression** automatique des assets
- **SSR/SSG** pour le SEO

### Accessibilité
- **Contraste WCAG AA** sur tous les textes
- **Navigation clavier** complète
- **Screen readers** supportés
- **Focus visible** sur tous les éléments interactifs
- **Labels ARIA** appropriés

## 🔐 Sécurité

### Côté Client
- **Validation** stricte des entrées utilisateur
- **Sanitisation** des données affichées
- **HTTPS** requis en production
- **CSP Headers** configurés
- **XSS Protection** active

### Authentification Admin
- **JWT Tokens** avec expiration
- **Stockage sécurisé** (localStorage avec validation)
- **Déconnexion automatique** en cas d'inactivité
- **Validation** des permissions côté serveur

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configuration automatique Next.js
# Variables d'environnement via dashboard Vercel
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Build Static (Optionnel)

```bash
# Générer build statique
npm run build
npm run export

# Servir avec nginx/apache
```

## 🛠️ Développement

### Scripts Disponibles

```bash
npm run dev          # Développement avec hot-reload
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linting ESLint
npm run type-check   # Vérification TypeScript
```

### Guidelines de Code

- **TypeScript strict** activé
- **ESLint** avec règles Next.js
- **Prettier** pour le formatage automatique
- **Conventional Commits** pour les messages
- **Hooks Git** pour validation pré-commit

### Ajout de Nouvelles Fonctionnalités

1. **Types**: Définir dans `types/index.ts`
2. **API**: Ajouter dans `lib/api.ts` 
3. **Composants**: Créer dans `components/`
4. **Pages**: Ajouter dans `app/`
5. **Styles**: Étendre dans `globals.css`

### Tests (À implémenter)

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📊 Monitoring et Analytics

### Performance
- **Core Web Vitals** surveillés
- **Bundle size** optimisé
- **Lighthouse** score > 90
- **Real User Monitoring** disponible

### Analytics (Optionnel)
- **Google Analytics** intégrable
- **Événements personnalisés** pour les recherches
- **Conversion funnel** candidats/résultats

## 🤝 Contribution

### Pour contribuer
1. Fork du repository
2. Branche feature: `git checkout -b feature/ma-fonctionnalite`
3. Commit: `git commit -m 'feat: ajouter ma fonctionnalité'`
4. Push: `git push origin feature/ma-fonctionnalite`
5. Pull Request

### Standards
- **Code Review** obligatoire
- **Tests** pour nouvelles fonctionnalités
- **Documentation** mise à jour
- **Responsive** testé sur mobile/desktop

## 📞 Support

### Problèmes Fréquents

**Q: L'API n'est pas accessible**
```bash
# Vérifier que le backend est démarré
curl http://localhost:8000/health

# Vérifier les variables d'environnement
echo $API_URL
```

**Q: Erreurs de build TypeScript**
```bash
# Nettoyer et réinstaller
rm -rf node_modules .next
npm install
npm run build
```

**Q: Styles Tailwind non appliqués**
```bash
# Vérifier la configuration
npm run dev
# Inspecter les classes CSS dans le navigateur
```

### Logs et Debug

```bash
# Mode debug Next.js
DEBUG=* npm run dev

# Logs détaillés
NODE_ENV=development npm run dev
```

---

## 🎯 Roadmap

### Version 1.1
- [ ] **Tests automatisés** (Jest + Testing Library)
- [ ] **PWA** avec cache offline
- [ ] **Notifications** push pour nouveaux résultats
- [ ] **Mode sombre** avec préférence utilisateur

### Version 1.2  
- [ ] **Multi-langues** (français, arabe, anglais)
- [ ] **Exportation PDF** des résultats
- [ ] **Comparaison** de performances entre années
- [ ] **API GraphQL** pour optimiser les requêtes

### Version 2.0
- [ ] **Mobile App** React Native
- [ ] **Dashboard Analytics** avancé
- [ ] **Machine Learning** pour prédictions
- [ ] **Blockchain** pour certification des résultats

---

**🇲🇷 Développé avec ❤️ pour l'éducation mauritanienne**