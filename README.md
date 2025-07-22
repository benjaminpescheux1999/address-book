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

## Accès aux services (via Docker)

Après le lancement avec Docker Compose, les services sont accessibles aux adresses suivantes :

- **Frontend (React)** : http://{ip_machine}:3001
- **Backend (API Express)** : http://{ip_machine}:5000
- **MongoDB** : mongodb://{ip_machine}:27017 (accès local, ou via le conteneur `mongo`)

> Pour accéder à MongoDB avec un client graphique (ex : MongoDB Compass), utilisez l’URL :
> 
>     mongodb://localhost:27017/addressbook

## Fonctionnalités prévues

- Ajouter, modifier, supprimer des contacts
- Rechercher des contacts
- Import/export CSV
- Interface utilisateur moderne avec React + MUI
- API REST sécurisée

## Auteur

- Benjamin Pescheux-Heslan