// Point d'entrée principal du backend Express pour le carnet d'adresses
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import contactsRouter from './routes/contacts';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/addressbook', {})
    .then(async () => {
        console.log('Connecté à MongoDB');

        // Route principale
        app.use('/contacts', contactsRouter);

        // Démarrage du serveur
        const PORT = Number(process.env.PORT) || 5000;
        const HOST = process.env.HOST || '0.0.0.0';
        app.listen(PORT, HOST, () => console.log(`Backend running on http://${HOST}:${PORT}`));
    })
    .catch((error: Error) => {
        console.error('Erreur de connexion à MongoDB:', error);
    });