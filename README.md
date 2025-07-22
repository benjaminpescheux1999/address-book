# Address Book App

Ce projet est une application de gestion de carnet d'adresses (Address Book) développée avec la stack MERN (MongoDB, Express, React, Node.js) et TypeScript.

## Structure du projet

```
/address-book-app
│
├── backend        # API Node.js/Express + TypeScript
├── frontend       # Application React + TypeScript
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
| **DevOps**   | Docker, Docker Compose                                 |
| **Outils dev**| ts-node-dev, TypeScript, ESLint, Prettier              |

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

> **Aucune installation de dépendances avec `npm install` n'est nécessaire !**
> Tout est automatisé via Docker et Docker Compose.

1. Cloner le dépôt
2. Lancer l'application avec Docker Compose :

```bash
docker-compose up --build
```

## Fonctionnalités prévues

- Ajouter, modifier, supprimer des contacts
- Rechercher des contacts
- Import/export CSV
- Interface utilisateur moderne avec React + MUI
- API REST sécurisée

## Auteur

- Benjamin Pescheux-Heslan