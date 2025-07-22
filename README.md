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
>     mongodb://{ip_machine}:27017/addressbook

## Fonctionnalités prévues

- Ajouter, modifier, supprimer des contacts
- Rechercher des contacts
- Import/export CSV
- Interface utilisateur moderne avec React + MUI
- API REST sécurisée

## Fichiers de configuration et exemples

- **Exemple de fichier CSV pour l'import de contacts** :
  - [exemple-contacts.csv](./contacts_import.csv)
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
  - Copiez ces fichiers en `.env` dans le dossier correspondant et adaptez les valeurs selon votre environnement (IP, ports, etc.)

## Auteur

- Benjamin Pescheux-Heslan