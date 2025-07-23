🇬🇧 # Address Book App

[🇫🇷 Français](README.md) | [🇬🇧 English](README_EN.md)

This project is an address book management application developed with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

## Project Structure

```
/address-book-app
│
├── backend        # Node.js/Express API + TypeScript
├── frontend       # React Application + TypeScript
├── nginx          # Nginx reverse proxy configuration
├── mongo          # Used by docker-compose for MongoDB
├── docker-compose.yml
└── README.md
```

## Technical Stack

| Side          | Main Technologies                                           |
|---------------|------------------------------------------------------------|
| **Backend**   | Node.js, Express, TypeScript, Mongoose, Multer, PapaParse, csv-parser, lodash.deburr |
| **Frontend**  | React, TypeScript, Material UI (MUI), Fetch API            |
| **Database**  | MongoDB (via Docker)                                       |
| **DevOps**    | Docker, Docker Compose, Nginx (reverse proxy)              |

### Main Libraries Details
- **Backend** :
  - [Express](https://expressjs.com/) : HTTP server
  - [Mongoose](https://mongoosejs.com/) : MongoDB ODM
  - [Multer](https://github.com/expressjs/multer) : file upload
  - [PapaParse](https://www.papaparse.com/) & [csv-parser](https://www.npmjs.com/package/csv-parser) : CSV handling
  - [lodash.deburr](https://lodash.com/docs/4.17.15#deburr) : accent handling
- **Frontend** :
  - [React](https://react.dev/) : UI
  - [Material UI (MUI)](https://mui.com/) : graphical components
  - [TypeScript](https://www.typescriptlang.org/) : static typing

## Quick Start

> **No dependency installation with `npm install` required!**
> Everything is automated via Docker and Docker Compose.

1. Clone the repository
2. Launch the application with Docker Compose:

```bash
docker-compose up --build
```

## Service Access (via Docker)

After launching with Docker Compose, services are accessible at the following addresses:

- **Frontend (React) + API** : http://{machine_ip}:3001
  - **Nginx automatically serves the frontend** and proxies to the backend
  - **No IP or domain configuration required** : everything works automatically
- **Backend (Express API) - direct access** : http://{machine_ip}:5000
- **MongoDB** : mongodb://{machine_ip}:27017 (local access, or via `mongo` container)

> **Nginx Reverse Proxy Advantage** :
> - Frontend and API communicate without CORS issues
> - No IP or domain configuration required
> - Works on any machine (VM, server, local) without modification

> To access MongoDB with a graphical client (e.g., MongoDB Compass), use the URL:
> 
>     mongodb://{machine_ip}:27017/addressbook

## Planned Features

- Add, modify, delete contacts
- **Avatar management** : image upload with preview and default initials
- Search contacts
- CSV import/export
- Modern user interface with React + MUI
- Secure REST API
- **Infinite pagination** with automatic scroll
- **Responsive interface** adapted for mobile/desktop

## Configuration Files and Examples

- **CSV file example for contact import** :
  - [contacts_import.csv](./contacts_import.csv)
  - Use this file to test contact import in the application.
  - Expected format:

```csv
name,email,phone
Jean Dupont,jean.dupont@email.com,0601020304
Alice Martin,alice.martin@email.com,0605060708
```

- **Environment configuration files** :
  - `backend/.env.example` : configuration example for backend (Express)
  - `frontend/.env.example` : configuration example for frontend (Vite/React)
  - **Default configuration** : with Nginx reverse proxy, no IP or domain configuration is required
  - **Frontend environment variable** : `VITE_API_URL=/contacts` (relative path, no IP)
  - Copy these files to `.env` in the corresponding folder and adjust values according to your environment if needed

## Author

- Benjamin Pescheux-Heslan 