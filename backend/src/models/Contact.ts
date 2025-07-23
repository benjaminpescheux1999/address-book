// Modèle Mongoose pour un contact du carnet d'adresses
import mongoose from 'mongoose';
import deburr from 'lodash.deburr';

export const ContactSchema = new mongoose.Schema({
    name: String,
    nameNormalized: String, // Champ normalisé pour le tri alphabétique
    email: String,
    emailNormalized: String, // Champ normalisé pour l'unicité des emails
    phone: String,
    avatar: String // Stockage de l'image en base64
});

// Index textuel pour la recherche avec gestion des accents et de la casse
ContactSchema.index({ name: 'text', email: 'text', phone: 'text' });

// Index simple pour le tri alphabétique normalisé
ContactSchema.index({ nameNormalized: 1 });

// Index unique pour l'email normalisé
ContactSchema.index({ emailNormalized: 1 }, { unique: true });

// Index unique pour le téléphone
ContactSchema.index({ phone: 1 }, { unique: true });

// Middleware pour automatiquement normaliser le nom et l'email lors de la sauvegarde
ContactSchema.pre('save', function (this: any, next: any) {
    if (this.name) {
        this.nameNormalized = deburr(this.name).toLowerCase();
    }
    if (this.email) {
        this.emailNormalized = deburr(this.email).toLowerCase();
    }
    next();
});

// Middleware pour la mise à jour
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
