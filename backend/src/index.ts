// Point d'entrée principal du backend Express pour le carnet d'adresses
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import contactsRouter from './routes/contacts';
import dotenv from 'dotenv';
import deburr from 'lodash.deburr';
import { Contact } from './models/Contact';
dotenv.config();

const app = express();
app.use(express.json()); // Middleware pour parser le JSON
app.use(cors()); // Middleware pour autoriser les requêtes cross-origin

// Fonction d'initialisation pour les contacts existants
async function initializeContacts() {
    try {
        // Récupérer tous les contacts sans nameNormalized ou emailNormalized
        const contactsToUpdate = await Contact.find({
            $or: [
                { nameNormalized: { $exists: false } },
                { emailNormalized: { $exists: false } }
            ]
        });

        if (contactsToUpdate.length > 0) {
            console.log(`Initialisation de ${contactsToUpdate.length} contacts existants...`);

            // Mettre à jour chaque contact
            for (const contact of contactsToUpdate) {
                let updated = false;

                if (contact.name && !contact.nameNormalized) {
                    contact.nameNormalized = deburr(contact.name).toLowerCase();
                    updated = true;
                }

                if (contact.email && !contact.emailNormalized) {
                    contact.emailNormalized = deburr(contact.email).toLowerCase();
                    updated = true;
                }

                if (updated) {
                    await contact.save();
                    console.log(`Contact mis à jour: ${contact.name} (${contact.email})`);
                }
            }

            console.log('Initialisation des contacts terminée');
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des contacts:', error);
    }
}

// Connexion à MongoDB (par défaut sur le service docker mongo)
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/addressbook', {})
    .then(async () => {
        console.log('Connecté à MongoDB');

        // Initialiser les contacts existants
        await initializeContacts();

        // Route principale pour la gestion des contacts
        app.use('/contacts', contactsRouter);

        // Démarrage du serveur sur le port 5000
        const PORT = Number(process.env.PORT) || 5000;
        const HOST = process.env.HOST || '0.0.0.0';
        app.listen(PORT, HOST, () => console.log(`Backend running on http://${HOST}:${PORT}`));
    })
    .catch((error) => {
        console.error('Erreur de connexion à MongoDB:', error);
    });