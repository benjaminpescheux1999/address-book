// Modèle Mongoose pour un contact du carnet d'adresses
import mongoose from 'mongoose';

export const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String
});

export const Contact = mongoose.model('Contact', ContactSchema);
