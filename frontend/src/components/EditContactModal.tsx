import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { Contact } from './ContactList';
import ValidationMessage from './ValidationMessage';

export interface EditContactModalProps {
    open: boolean;
    contact: Contact | null;
    onClose: () => void;
    onSave: (contact: Contact) => void;
}

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string) {
    return /^\+?\d{7,15}$/.test(phone.replace(/\s/g, ''));
}

export default function EditContactModal({ open, contact, onClose, onSave }: EditContactModalProps) {
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (contact) {
            setForm({ name: contact.name, email: contact.email, phone: contact.phone });
        }
    }, [contact]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!form.name || !form.email || !form.phone) {
            setError('Tous les champs sont obligatoires.');
            return;
        }
        if (!validateEmail(form.email)) {
            setError('Adresse email invalide.');
            return;
        }
        if (!validatePhone(form.phone)) {
            setError('Numéro de téléphone invalide.');
            return;
        }
        setError('');
        if (!contact) return;
        onSave({ ...contact, ...form });
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Modifier le contact</DialogTitle>
            <DialogContent>
                <ValidationMessage message={error} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        name="name"
                        label="Nom"
                        value={form.name}
                        onChange={handleChange}
                        size="small"
                    />
                    <TextField
                        name="email"
                        label="Email"
                        value={form.email}
                        onChange={handleChange}
                        size="small"
                    />
                    <TextField
                        name="phone"
                        label="Téléphone"
                        value={form.phone}
                        onChange={handleChange}
                        size="small"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Annuler</Button>
                <Button onClick={handleSubmit} variant="contained">Enregistrer</Button>
            </DialogActions>
        </Dialog>
    );
} 