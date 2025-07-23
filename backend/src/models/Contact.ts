// Modèle Mongoose pour un contact du carnet d'adresses
import mongoose from 'mongoose';

export const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    avatar: String // Stockage de l'image en base64
});

export const Contact = mongoose.model('Contact', ContactSchema);
