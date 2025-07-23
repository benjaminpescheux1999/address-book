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
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '5'), 10);
    const skip = (page - 1) * limit;
    const contacts = await Contact.find();
    contacts.sort((a: any, b: any) => deburr(a.name).localeCompare(deburr(b.name), undefined, { sensitivity: 'base' }));
    const paginated = contacts.slice(skip, skip + limit);
    res.json({
        data: paginated,
        total: contacts.length,
        page,
        limit
    });
});

// Recherche avancée paginée sur nom, email ou téléphone (insensible aux accents/majuscules)
router.get('/search', async (req: Request, res: Response) => {
    const q = req.query.q ? String(req.query.q) : '';
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '5'), 10);
    const skip = (page - 1) * limit;
    if (!q) return res.json({ data: [], total: 0, page, limit });
    const regex = new RegExp(deburr(q), 'i');
    const contacts = await Contact.find();
    const filtered = contacts.filter((c: any) =>
        deburr(c.name).match(regex) ||
        deburr(c.email).match(regex) ||
        deburr(c.phone).match(regex)
    );
    filtered.sort((a: any, b: any) => deburr(a.name).localeCompare(deburr(b.name), undefined, { sensitivity: 'base' }));
    const paginated = filtered.slice(skip, skip + limit);
    res.json({
        data: paginated,
        total: filtered.length,
        page,
        limit
    });
});

// Création d'un contact avec contrôle d'unicité email/téléphone
router.post('/', async (req: Request, res: Response) => {
    const { email, phone } = req.body;
    const exists = await Contact.findOne({ $or: [{ email }, { phone }] });
    if (exists) {
        return res.status(409).json({ error: 'Email ou téléphone déjà utilisé.' });
    }
    const newContact = new Contact(req.body);
    await newContact.save();
    res.status(201).json(newContact);
});

// Import CSV : n'importe que les contacts valides et non existants (email/téléphone unique)
router.post('/import-csv', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier envoyé.' });
    const results: any[] = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream
        .pipe(csvParser({ separator: ';' }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const emails = results.map(c => c.email);
            const phones = results.map(c => c.phone);
            const existing = await Contact.find({ $or: [{ email: { $in: emails } }, { phone: { $in: phones } }] });
            const existingEmails = new Set(existing.map(c => c.email));
            const existingPhones = new Set(existing.map(c => c.phone));
            // Ne conserve que les contacts valides et non existants
            const toInsert = results.filter(c =>
                validateEmail(c.email) &&
                validatePhone(c.phone) &&
                !existingEmails.has(c.email) &&
                !existingPhones.has(c.phone)
            );
            const ignored = results.length - toInsert.length;
            await Contact.insertMany(toInsert);
            res.json({ message: `${toInsert.length} contacts importés, ${ignored} ignorés (doublons ou invalides).` });
        });
});

// Export CSV : tous les contacts, séparateur ;, encodage UTF-8 BOM
router.get('/export-csv', async (_req: Request, res: Response) => {
    const contacts = await Contact.find();
    const csv = '\uFEFF' + Papa.unparse(
        contacts.map((c: any) => ({
            name: c.name,
            email: c.email,
            phone: c.phone,
            avatar: c.avatar || ''
        })),
        { delimiter: ';' }
    );
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('contacts.csv');
    res.send(csv);
});

// Modification d'un contact avec contrôle d'unicité email/téléphone
router.put('/:id', async (req: Request, res: Response) => {
    const { email, phone } = req.body;
    const exists = await Contact.findOne({
        $or: [{ email }, { phone }],
        _id: { $ne: req.params.id }
    });
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
        { new: true }
    );
    res.json(updated);
});

// Suppression d'un contact par ID
router.delete('/:id', async (req: Request, res: Response) => {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// Suppression de tous les contacts
router.delete('/', async (_req: Request, res: Response) => {
    await Contact.deleteMany({});
    res.json({ message: 'Tous les contacts ont été supprimés.' });
});

export default router;