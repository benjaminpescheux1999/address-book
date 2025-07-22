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

- **Backend** : Node.js, Express, TypeScript
- **Frontend** : React, TypeScript
- **Base de données** : MongoDB
- **Conteneurisation** : Docker, Docker Compose

## Lancement rapide

1. Cloner le dépôt
2. Installer les dépendances dans `backend` et `frontend`
3. Lancer l'application avec Docker Compose :

```bash
docker-compose up --build
```

## Fonctionnalités prévues

- Ajouter, modifier, supprimer des contacts
- Rechercher des contacts
- Interface utilisateur moderne avec React
- API REST sécurisée

## Auteur

- Projet de carnet d'adresses simple, stack MERN + TypeScript 