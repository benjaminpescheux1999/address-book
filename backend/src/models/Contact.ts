// Modèle Mongoose pour un contact du carnet d'adresses
import mongoose from 'mongoose';
import deburr from 'lodash.deburr';

export const ContactSchema = new mongoose.Schema({
    name: String,
    nameNormalized: String, // Champ normalisé pour le tri alphabétique (sans accents)
    email: String,
    emailNormalized: String, // Champ normalisé pour l'unicité des emails (sans accents)
    phone: String,
    avatar: String // base64 de l'image
});

// Permet la recherche avec gestion des accents et de la casse
ContactSchema.index({ name: 'text', email: 'text', phone: 'text' });

// Permet le tri alphabétique normalisé
ContactSchema.index({ nameNormalized: 1 });

// Permet l'unicité des emails normalisés
ContactSchema.index({ emailNormalized: 1 }, { unique: true });

// Permet l'unicité des téléphones
ContactSchema.index({ phone: 1 }, { unique: true });

// Gestion des accents lors de la sauvegarde
ContactSchema.pre('save', function (this: any, next: any) {
    if (this.name) {
        this.nameNormalized = deburr(this.name).toLowerCase();
    }
    if (this.email) {
        this.emailNormalized = deburr(this.email).toLowerCase();
    }
    next();
});

// Mettre à jour un contacts avec gestion des accents 
ContactSchema.pre('findOneAndUpdate', function (this: any, next: any) {
    const update = this.getUpdate() as any;
    if (update && update.name) {
        update.nameNormalized = deburr(update.name).toLowerCase();
    }
    if (update && update.email) {
        update.emailNormalized = deburr(update.email).toLowerCase();
    }
    next();
});

export const Contact = mongoose.model('Contact', ContactSchema);
