// Point d'entrée principal du backend Express pour le carnet d'adresses
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import contactsRouter from './routes/contacts';

const app = express();
app.use(express.json()); // Middleware pour parser le JSON
app.use(cors()); // Middleware pour autoriser les requêtes cross-origin

// Connexion à MongoDB (par défaut sur le service docker mongo)
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/addressbook', {});

// Route principale pour la gestion des contacts
app.use('/contacts', contactsRouter);

// Démarrage du serveur sur le port 5000
app.listen(5000, () => console.log('Backend running on :5000'));