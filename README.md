# PhishGuard — Outil de Détection de Phishing & Analyseur Cyber-Sécurité

PhishGuard est une plateforme d'analyse de menaces et de détection de phishing conçue pour analyser les adresses email, les URLs et les messages suspects. Elle calcule un score de risque pondéré (0 à 100) et fournit des explications pédagogiques claires adaptées aux utilisateurs techniques et non techniques.

---

## 🌟 Fonctionnalités Principales

1. **Formulaire d'analyse universel** :
   - Détection automatique du type de cible : URL/Lien Web, Adresse Email, ou Texte/Message complet.
   - Boutons de tests immédiats (Faux PayPal, Faux SMS Ameli, Hôte IP brut, Faux email bancaire, Sites légitimes).
   - Mode rapide heuristique (instantané, 0 latence) et mode approfondi IA (analyse sémantique CTI).

2. **Moteur Heuristique & Règles de Détection** :
   - **Urgence artificielle & ingénierie sociale** : Analyse lexicale des délais anxiogènes (*urgent*, *compte bloqué*, *24h*, *dernier rappel*, *action immédiate*, etc.).
   - **Typosquatting & imitation de marques** : Algorithme de distance de Levenshtein et substitutions visuelles (*paypa1.com*, *amaz0n*, *apple-login-verify*), couvrant plus de 50 marques institutionnelles et bancaires.
   - **Attaques Homographes (IDN)** : Détection des caractères cyrilliques/grecs trompeurs imitant l'alphabet latin et des encodages Punycode (`xn--`).
   - **Sous-domaines trompeurs & masquage** : Repérage des domaines imbriqués (*paypal.com.mon-compte-auth.xyz*) et du caractère `@` d'obfuscation de navigation.
   - **Adresses IP directes** : Alerte critique lors de l'utilisation d'une IP brute sans nom de domaine légitime.
   - **Extensions de domaine à risque (TLD)** : Détection des TLDs surreprésentés dans le cybercrime (*.tk, .ml, .xyz, .top, .work, .click*, etc.).
   - **Chiffrement & transport** : Détection des connexions non chiffrées en HTTP.
   - **Tentatives d'hameçonnage d'identifiants** : Détection des requêtes de mots de passe, numéros de cartes de crédit et codes 2FA reçus par SMS.

3. **Restitution Visuelle & Pédagogique** :
   - **Jauge de risque visuelle** (0 à 100) avec code couleur dynamique (Vert : Faible, Orange : Modéré, Rouge : Élevé/Critique).
   - Décomposition des 4 vecteurs de menace (Domaine, Urgence, Technique, Identifiants).
   - **Inspecteur technique de domaine** (Protocole, Hôte DNS, TLD, Usurpation identifiée).
   - Fiches d'explication pédagogiques détaillant le piège de l'attaquant et la recommandation d'action immédiate.

4. **Historique local & Confidentialité** :
   - Sauvegarde automatique en `localStorage` (aucune donnée sensible transmise à des tiers sans consentement).
   - Possibilité de rejouer une analyse, d'exporter un rapport textuel ou de vider l'historique.

5. **Livrable Autonome en 1 seul fichier HTML** :
   - Un fichier `standalone.html` est fourni à la racine, prêt à être ouvert par double-clic dans n'importe quel navigateur sans serveur ni installation npm.
   - Export et copie directe depuis l'interface web via le bouton "1 seul HTML".

---

## 🏛️ Architecture Technique

```
├── server.ts                    # Serveur backend Node.js / Express (API REST + Vite middleware)
├── standalone.html              # Version 100% autonome en un seul fichier HTML
├── src/
│   ├── main.tsx                 # Point d'entrée React
│   ├── App.tsx                  # Composant racine avec gestion d'état et navigation
│   ├── types.ts                 # Définitions TypeScript (AnalysisResult, RiskSignal, etc.)
│   ├── index.css                # Styles globaux Tailwind CSS
│   ├── lib/
│   │   ├── detector.ts          # Moteur heuristique de cybersécurité (règles, dictionnaires, Levenshtein)
│   │   └── standaloneTemplate.ts # Modèle du livrable HTML autonome
│   └── components/
│       ├── Header.tsx           # Barre de navigation et statut cybersécurité
│       ├── ScannerForm.tsx      # Champ de saisie universel et exemples prêts à l'emploi
│       ├── RiskGauge.tsx        # Jauge circulaire SVG animée et barres de scores
│       ├── ScanResults.tsx      # Restitution détaillée, inspecteur technique et recommandations
│       ├── ScanHistory.tsx      # Historique local persistant
│       ├── HowItWorksModal.tsx  # Page méthodologie et plateformes de signalement (Pharos, etc.)
│       └── StandaloneExportModal.tsx # Modale d'export et de téléchargement du code HTML autonome
```

---

## 🚀 Installation & Lancement Local

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

### Étapes
1. Cloner ou télécharger le répertoire :
```bash
git clone <url-du-depot>
cd phishguard
```

2. Installer les dépendances :
```bash
npm install
```

3. Lancer en mode développement (Express + Vite) :
```bash
npm run dev
```
L'application est disponible immédiatement sur : `http://localhost:3000`

4. Compiler pour la production :
```bash
npm run build
npm start
```

---

## 🌐 Déploiement en Ligne

PhishGuard peut être déployé selon plusieurs modes selon vos besoins :

### 1. Déploiement Standalone (GitHub Pages / Netlify / Vercel Static)
Le fichier `standalone.html` peut être renommé en `index.html` et déposé directement sur :
- **GitHub Pages** : Activez GitHub Pages dans les paramètres du dépôt.
- **Netlify Drop** : Glissez-déposez le dossier contenant `standalone.html`.

### 2. Déploiement Full-Stack (Render / Railway / Cloud Run / VPS)
- **Start Command** : `npm start`
- **Build Command** : `npm run build`
- **Port** : `3000` (ou variable d'environnement `PORT`)

### 3. Déploiement Vercel
- Le projet inclut un fichier `vercel.json` et un fichier `.npmrc` configurés pour résoudre automatiquement les dépendances et gérer le routage.
- **Framework Preset** : Vite
- **Output Directory** : `dist`
- Les fonctions API Serverless (`/api/analyze`, `/api/health`) sont automatiquement prises en charge par Vercel.

---

## 🔒 Sécurité & Confidentialité
- **Analyse locale en priorité** : Le moteur heuristique s'exécute directement dans le navigateur ou sur votre backend sécurisé sans dépendance externe obligatoire.
- **Protection de l'utilisateur** : L'outil désactive les liens cliquables dangereux pour éviter toute visite accidentelle vers les sites malveillants analysés.
- **Signalement citoyen** : Les utilisateurs sont orientés vers les canaux officiels de signalement de la cybercriminalité :
  - **PHAROS** : [internet-signalement.gouv.fr](https://www.internet-signalement.gouv.fr)
  - **Cybermalveillance.gouv.fr** : [cybermalveillance.gouv.fr](https://www.cybermalveillance.gouv.fr)
  - **Signal-Spam** : [signal-spam.fr](https://www.signal-spam.fr)

---

## 📄 Licence
Projet open-source distribué sous licence MIT.
