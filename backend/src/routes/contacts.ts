import { Router, Request, Response } from 'express';
import { Contact } from '../models/Contact';
import deburr from 'lodash.deburr';
import csvParser from 'csv-parser';
import Papa from 'papaparse';
import multer from 'multer';
import stream from 'stream';

const router = Router();
const upload = multer();

// Validation d'email au format standard
function validateEmail(email: string) {
    return /^[^\s@]+@[^ 0-\s@]+\.[^\s@]+$/.test(email);
}
// Validation de numéro de téléphone international ou national (7 à 15 chiffres)
function validatePhone(phone: string) {
    return /^\+?\d{7,15}$/.test((phone || '').replace(/\s/g, ''));
}

// Récupère les contacts paginés et triés par nom (ordre alphabétique, insensible aux accents)
router.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(String(req.query.page || '1'), 10);
        const limit = parseInt(String(req.query.limit || '5'), 10);
        const skip = (page - 1) * limit;

        // Requête optimisée : pagination et tri directement en MongoDB
        const [contacts, total] = await Promise.all([
            Contact.find()
                .sort({ nameNormalized: 1 }) // Tri alphabétique par nom normalisé
                .skip(skip) // Pagination
                .limit(limit) // Limite de contacts par page
                .lean(), // Optimisation : retourne des objets JavaScript simples
            Contact.countDocuments() // Compte total pour la pagination
        ]);

        res.json({
            data: contacts,
            total,
            page,
            limit
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des contacts:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des contacts' });
    }
});

// Initialisation des contacts existants (appelée une seule fois au démarrage)
router.post('/initialize', async (_req: Request, res: Response) => {
    try {
        // Récupérer tous les contacts sans nameNormalized ou emailNormalized
        const contactsToUpdate = await Contact.find({
            $or: [
                { nameNormalized: { $exists: false } },
                { emailNormalized: { $exists: false } }
            ]
        });

        if (contactsToUpdate.length === 0) {
            return res.json({
                message: 'Tous les contacts sont déjà initialisés.',
                updated: 0
            });
        }

        console.log(`Initialisation de ${contactsToUpdate.length} contacts existants...`);

        // Mettre à jour chaque contact
        let updatedCount = 0;
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
                updatedCount++;
            }
        }

        console.log(`Initialisation terminée: ${updatedCount} contacts mis à jour`);

        res.json({
            message: `Initialisation terminée. ${updatedCount} contacts mis à jour.`,
            updated: updatedCount
        });
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des contacts:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'initialisation des contacts' });
    }
});

// Recherche avancée paginée sur nom, email ou téléphone (insensible aux accents/majuscules)
router.get('/search', async (req: Request, res: Response) => {
    try {
        const q = req.query.q ? String(req.query.q) : '';
        const page = parseInt(String(req.query.page || '1'), 10);
        const limit = parseInt(String(req.query.limit || '5'), 10);
        const skip = (page - 1) * limit;

        if (!q) {
            return res.json({ data: [], total: 0, page, limit });
        }

        // Normalisation de la requête pour gérer les accents
        const normalizedQuery = deburr(q).toLowerCase();

        // Recherche optimisée directement en MongoDB
        const searchQuery = {
            $or: [
                { nameNormalized: { $regex: normalizedQuery, $options: 'i' } },
                { email: { $regex: normalizedQuery, $options: 'i' } },
                { phone: { $regex: normalizedQuery, $options: 'i' } }
            ]
        };

        // Requête optimisée : recherche, pagination et tri directement en MongoDB
        const [contacts, total] = await Promise.all([
            Contact.find(searchQuery)
                .sort({ nameNormalized: 1 }) // Tri alphabétique par nom normalisé
                .skip(skip) // Pagination
                .limit(limit) // Limite de contacts par page
                .lean(), // Optimisation : retourne des objets JavaScript simples
            Contact.countDocuments(searchQuery) // Compte total pour la pagination
        ]);

        res.json({
            data: contacts,
            total,
            page,
            limit
        });
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
    }
});

// Création d'un contact avec contrôle d'unicité email/téléphone
router.post('/', async (req: Request, res: Response) => {
    try {
        const { email, phone } = req.body;

        // Normalisation de l'email pour le contrôle d'unicité
        const emailNormalized = deburr(email).toLowerCase();

        // Vérification d'unicité optimisée avec email normalisé
        const exists = await Contact.findOne({
            $or: [
                { emailNormalized },
                { phone }
            ]
        }).lean();

        if (exists) {
            return res.status(409).json({ error: 'Email ou téléphone déjà utilisé.' });
        }

        const newContact = new Contact(req.body);
        await newContact.save();
        res.status(201).json(newContact);
    } catch (error) {
        console.error('Erreur lors de la création du contact:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la création du contact' });
    }
});

// Import CSV : n'importe que les contacts valides et non existants (email/téléphone unique)
router.post('/import-csv', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier envoyé.' });
        }

        const results: any[] = [];
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        bufferStream
            .pipe(csvParser({ separator: ';' }))
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    // Validation des données
                    const validContacts = results.filter(c =>
                        validateEmail(c.email) &&
                        validatePhone(c.phone) &&
                        c.name && c.name.trim()
                    );

                    if (validContacts.length === 0) {
                        return res.json({
                            message: 'Aucun contact valide trouvé dans le fichier CSV.'
                        });
                    }

                    // Extraction des emails et téléphones pour vérification d'unicité
                    const emails = validContacts.map(c => c.email);
                    const phones = validContacts.map(c => c.phone);

                    // Normalisation des emails pour le contrôle d'unicité
                    const emailsNormalized = validContacts.map(c => deburr(c.email).toLowerCase());

                    // Vérification d'unicité optimisée en une seule requête
                    const existing = await Contact.find({
                        $or: [
                            { emailNormalized: { $in: emailsNormalized } },
                            { phone: { $in: phones } }
                        ]
                    }).lean();

                    const existingEmailsNormalized = new Set(existing.map(c => c.emailNormalized));
                    const existingPhones = new Set(existing.map(c => c.phone));

                    // Filtrage des contacts non existants et ajout du champ nameNormalized
                    const toInsert = validContacts.filter(c => {
                        const emailNormalized = deburr(c.email).toLowerCase();
                        return !existingEmailsNormalized.has(emailNormalized) &&
                            !existingPhones.has(c.phone);
                    }).map(c => ({
                        ...c,
                        nameNormalized: deburr(c.name).toLowerCase(),
                        emailNormalized: deburr(c.email).toLowerCase()
                    }));

                    if (toInsert.length === 0) {
                        return res.json({
                            message: 'Tous les contacts du fichier existent déjà dans la base de données.'
                        });
                    }

                    // Insertion en lot optimisée
                    await Contact.insertMany(toInsert);

                    const ignored = results.length - toInsert.length;
                    res.json({
                        message: `${toInsert.length} contacts importés, ${ignored} ignorés (doublons ou invalides).`
                    });
                } catch (error) {
                    console.error('Erreur lors du traitement CSV:', error);
                    res.status(500).json({ error: 'Erreur lors du traitement du fichier CSV' });
                }
            });
    } catch (error) {
        console.error('Erreur lors de l\'import CSV:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'import CSV' });
    }
});

// Export CSV : tous les contacts, séparateur ;, encodage UTF-8
router.get('/export-csv', async (_req: Request, res: Response) => {
    try {
        // Récupération optimisée avec projection pour limiter les données
        const contacts = await Contact.find({}, {
            name: 1,
            email: 1,
            phone: 1,
            avatar: 1
        }).lean();

        // Génération du CSV sans BOM pour éviter les problèmes d'affichage
        const csv = Papa.unparse(
            contacts.map((c: any) => ({
                name: c.name || '',
                email: c.email || '',
                phone: c.phone || '',
                avatar: c.avatar || ''
            })),
            {
                delimiter: ';',
                header: true
            }
        );

        // Headers pour un téléchargement propre
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
        res.setHeader('Cache-Control', 'no-cache');

        res.send(csv);
    } catch (error) {
        console.error('Erreur lors de l\'export CSV:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'export CSV' });
    }
});

// Modification d'un contact avec contrôle d'unicité email/téléphone
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { email, phone } = req.body;

        // Normalisation de l'email pour le contrôle d'unicité
        const emailNormalized = deburr(email).toLowerCase();

        // Vérification d'unicité optimisée avec email normalisé (exclut le contact actuel)
        const exists = await Contact.findOne({
            $or: [
                { emailNormalized },
                { phone }
            ],
            _id: { $ne: req.params.id }
        }).lean();

        if (exists) {
            return res.status(409).json({ error: 'Email ou téléphone déjà utilisé.' });
        }

        const updated = await Contact.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                avatar: req.body.avatar || null
            },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Contact non trouvé.' });
        }

        res.json(updated);
    } catch (error) {
        console.error('Erreur lors de la modification du contact:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la modification du contact' });
    }
});

// Suppression d'un contact par ID
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deleted = await Contact.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Contact non trouvé.' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Erreur lors de la suppression du contact:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression du contact' });
    }
});

// Suppression de tous les contacts
router.delete('/', async (_req: Request, res: Response) => {
    try {
        const result = await Contact.deleteMany({});
        res.json({
            message: `${result.deletedCount} contacts ont été supprimés.`
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de tous les contacts:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression des contacts' });
    }
});

export default router;