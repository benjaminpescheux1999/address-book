import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import ValidationMessage from './ValidationMessage';

export interface ContactFormProps {
    onAdd: (contact: { name: string; email: string; phone: string }) => void;
}

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string) {
    return /^\+?\d{7,15}$/.test(phone.replace(/\s/g, ''));
}

export default function ContactForm({ onAdd }: ContactFormProps) {
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
        onAdd(form);
        setForm({ name: '', email: '', phone: '' });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: 'column' }}>
            <ValidationMessage message={error} />
            <Box sx={{ display: 'flex', gap: 2 }}>
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
                <Button type="submit" variant="contained">Ajouter</Button>
            </Box>
        </Box>
    );
} 