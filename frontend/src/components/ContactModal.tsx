import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Contact } from './ContactList';
import ValidationMessage from './ValidationMessage';
import AvatarUpload from './AvatarUpload';

export interface ContactModalProps {
    open: boolean;
    contact?: Contact | null; // null = création, Contact = modification
    onClose: () => void;
    onSave: (contact: Contact | Omit<Contact, '_id'>) => void;
    mode: 'create' | 'edit';
}

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string) {
    return /^\+?\d{7,15}$/.test(phone.replace(/\s/g, ''));
}

export default function ContactModal({ open, contact, onClose, onSave, mode }: ContactModalProps) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [form, setForm] = useState({ name: '', email: '', phone: '', avatar: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (contact) {
            setForm({
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                avatar: contact.avatar || ''
            });
        } else {
            setForm({ name: '', email: '', phone: '', avatar: '' });
        }
        setError('');
    }, [contact, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (avatar: string | null) => {
        setForm({ ...form, avatar: avatar || '' });
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

        if (mode === 'create') {
            onSave(form);
        } else if (contact) {
            onSave({ ...contact, ...form });
        }

        onClose();
    };

    const getTitle = () => {
        return mode === 'create' ? 'Ajouter un contact' : 'Modifier le contact';
    };

    const getSubmitButtonText = () => {
        return mode === 'create' ? 'Ajouter' : 'Enregistrer';
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={fullScreen}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogContent>
                <ValidationMessage message={error} />

                {/* Avatar Upload */}
                <AvatarUpload
                    currentAvatar={form.avatar}
                    onAvatarChange={handleAvatarChange}
                    contactName={form.name}
                />

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    mt: 1,
                    minWidth: { xs: '100%', sm: 400 }
                }}>
                    <TextField
                        name="name"
                        label="Nom"
                        value={form.name}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                        autoFocus
                    />
                    <TextField
                        name="email"
                        label="Email"
                        value={form.email}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                        type="email"
                    />
                    <TextField
                        name="phone"
                        label="Téléphone"
                        value={form.phone}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                        type="tel"
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined">
                    Annuler
                </Button>
                <Button onClick={handleSubmit} variant="contained">
                    {getSubmitButtonText()}
                </Button>
            </DialogActions>
        </Dialog>
    );
} 