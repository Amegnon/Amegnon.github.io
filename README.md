# My_Portfolio

Portfolio personnel multi-pages, inspiré du style du portfolio analysé.

## Aperçu
Ce projet est un site statique HTML/CSS/JS avec:
- Sidebar gauche rabattable
- Theme clair/sombre avec memorisation
- Bouton retour en haut
- Page Certifications alimentee par JSON
- Design responsive (desktop/mobile)

## Stack technique
- HTML5
- CSS3
- JavaScript (vanilla)
- Font Awesome (icones via CDN)
- Google Fonts (Inter)

## Arborescence
```text
My_Portfolio/
├── index.html
├── about.html
├── skills.html
├── projects.html
├── certifications.html
├── contact.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── data/
│   └── certifications.json
├── assets/
│   ├── profile/
│   │   └── profile.jpg
│   └── certifications/
│       ├── ejpt-placeholder.svg
│       ├── google-cyber-placeholder.svg
│       └── htb-placeholder.svg
└── README.md
```

## Lancer en local
Option recommandee (serveur local):
```bash
cd /home/blackout/My_Portfolio
python3 -m http.server 8000
```
Puis ouvrir:
`http://localhost:8000`

Pourquoi cette methode:
- La page `certifications.html` charge `data/certifications.json` avec `fetch`.
- En `file://`, ce chargement peut etre bloque par le navigateur.

## Personnaliser le contenu

### 1) Photo de profil
- Place ta photo dans `assets/profile/`
- Le chemin actuel est:
  - `assets/profile/profile.jpg`
- Utilisee dans:
  - `index.html`

### 2) Textes des pages
- Accueil: `index.html`
- A propos: `about.html`
- Competences: `skills.html`
- Projets: `projects.html`
- Contact: `contact.html`

### 3) Certifications (JSON)
Les certifications ne sont pas en dur dans la page HTML.
Elles sont chargees depuis:
- `data/certifications.json`

Format d'un item:
```json
{
  "title": "eJPT v2 - Junior Penetration Tester",
  "issuer": "INE Security",
  "year": "2025",
  "description": "...",
  "image": "assets/certifications/ejpt-placeholder.svg",
  "image_alt": "Certificat eJPT v2",
  "link": "https://example.com/certif-ejpt",
  "link_label": "Voir certification"
}
```

Pour ajouter une certification:
- Duplique un objet dans le tableau `certifications` du JSON
- Mets ton image dans `assets/certifications/`
- Mets le vrai lien dans `link`

### 4) Sidebar / navigation
La sidebar est presente sur chaque page.
Si tu ajoutes une nouvelle page:
- Ajoute le lien dans le `<nav>` de chaque fichier HTML
- Ajoute `data-page="nom_page"` sur le `<body>` de la nouvelle page
- Mets `data-nav="nom_page"` sur le lien correspondant

Le script active automatiquement le menu courant.

## Fonctionnalites UI deja en place
- Sidebar rabattable (etat sauvegarde via `localStorage`)
- Theme clair/sombre (etat sauvegarde via `localStorage`)
- Effets hover/click sur cartes et labels
- Retour en haut avec apparition au scroll
- Liens cliquables dans la section contact (email, LinkedIn, GitHub)

## Depannage
- Le JSON ne se charge pas:
  - Lance le site via `python3 -m http.server 8000`
- Les styles ne changent pas apres modification:
  - Force refresh navigateur: `Ctrl + Shift + R`
- Le menu semble casse:
  - Verifie `data-page` (body) et `data-nav` (liens)

## Deploiement
Site statique, deployable sur:
- GitHub Pages
- Netlify
- Vercel (mode static)
- N'importe quel hebergement HTTP simple

## Auteur
SOGADJI Belange Amegnon Steeve
