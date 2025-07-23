🇫🇷 # Address Book App

[🇫🇷 Français](README.md) | [🇬🇧 English](README_EN.md)

Ce projet est une application de gestion de carnet d'adresses (Address Book) développée avec la stack MERN (MongoDB, Express, React, Node.js) et TypeScript.

## Structure du projet

```
/address-book-app
│
├── backend        # API Node.js/Express + TypeScript
├── frontend       # Application React + TypeScript
├── nginx          # Configuration du reverse proxy Nginx
├── mongo          # Utilisé par docker-compose pour MongoDB
├── docker-compose.yml
└── README.md
```

## Stack technique

| Côté         | Technologies principales                                 |
|--------------|---------------------------------------------------------|
| **Backend**  | Node.js, Express, TypeScript, Mongoose, Multer, PapaParse, csv-parser, lodash.deburr |
| **Frontend** | React, TypeScript, Material UI (MUI), Fetch API         |
| **Base de données** | MongoDB (via Docker)                             |
| **DevOps**   | Docker, Docker Compose, Nginx (reverse proxy)           |

### Détails des bibliothèques principales
- **Backend** :
  - [Express](https://expressjs.com/) : serveur HTTP
  - [Mongoose](https://mongoosejs.com/) : ODM MongoDB
  - [Multer](https://github.com/expressjs/multer) : upload de fichiers
  - [PapaParse](https://www.papaparse.com/) & [csv-parser](https://www.npmjs.com/package/csv-parser) : gestion CSV
  - [lodash.deburr](https://lodash.com/docs/4.17.15#deburr) : gestion des accents
- **Frontend** :
  - [React](https://react.dev/) : UI
  - [Material UI (MUI)](https://mui.com/) : composants graphiques
  - [TypeScript](https://www.typescriptlang.org/) : typage statique

## Lancement rapide

> **Aucune installation de dépendances avec `npm install` n'est nécessaire !**
> Tout est automatisé via Docker et Docker Compose.

1. Cloner le dépôt
2. Lancer l'application avec Docker Compose :

```bash
docker-compose up --build
```

## Accès aux services (via Docker)

Après le lancement avec Docker Compose, les services sont accessibles aux adresses suivantes :

- **Frontend (React) + API** : http://{ip_machine}:3001
  - **Nginx sert automatiquement le frontend** et fait le proxy vers le backend
  - **Aucune configuration d'IP ou de domaine nécessaire** : tout fonctionne automatiquement
- **Backend (API Express) - accès direct** : http://{ip_machine}:5000
- **MongoDB** : mongodb://{ip_machine}:27017 (accès local, ou via le conteneur `mongo`)

> **Avantage du reverse proxy Nginx** :
> - Le frontend et l'API communiquent sans problème de CORS
> - Aucune configuration d'IP ou de domaine n'est requise
> - Fonctionne sur n'importe quelle machine (VM, serveur, local) sans modification

> Pour accéder à MongoDB avec un client graphique (ex : MongoDB Compass), utilisez l'URL :
> 
>     mongodb://{ip_machine}:27017/addressbook

## Fonctionnalités prévues

- Ajouter, modifier, supprimer des contacts
- **Gestion des avatars** : upload d'images avec prévisualisation et initiales par défaut
- Rechercher des contacts
- Import/export CSV
- Interface utilisateur moderne avec React + MUI
- API REST sécurisée
- **Pagination infinie** avec scroll automatique
- **Interface responsive** adaptée mobile/desktop

## Fichiers de configuration et exemples

- **Exemple de fichier CSV pour l'import de contacts** :
  - [contacts_import.csv](./contacts_import.csv)
  - Utilisez ce fichier pour tester l'import de contacts dans l'application.
  - Format attendu :

```csv
name,email,phone
Jean Dupont,jean.dupont@email.com,0601020304
Alice Martin,alice.martin@email.com,0605060708
```

- **Fichiers de configuration d'environnement** :
  - `backend/.env.example` : exemple de configuration pour le backend (Express)
  - `frontend/.env.example` : exemple de configuration pour le frontend (Vite/React)
  - **Configuration par défaut** : avec le reverse proxy Nginx, aucune configuration d'IP ou de domaine n'est nécessaire
  - **Variable d'environnement frontend** : `VITE_API_URL=/contacts` (chemin relatif, pas d'IP)
  - Copiez ces fichiers en `.env` dans le dossier correspondant et adaptez les valeurs selon votre environnement si nécessaire

## Auteur

- Benjamin Pescheux-Heslan