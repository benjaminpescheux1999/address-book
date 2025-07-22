import React, { useEffect, useState, useCallback } from 'react';
import ContactForm from './components/ContactForm';
import ContactList, { Contact } from './components/ContactList';
import EditContactModal from './components/EditContactModal';
import SearchBar from './components/SearchBar';
import ActionSnackbar from './components/ActionSnackbar';
import ConfirmDialog from './components/ConfirmDialog';
import PaginationLoader from './components/PaginationLoader';
import ContactUtils from './components/ContactUtils';
import CircularProgress from '@mui/material/CircularProgress';
import { Container, Typography, Box } from '@mui/material';

// Récupération de l'URL de l'API depuis la variable d'environnement ou reconstruit dynamiquement avec l'IP de la machine
const API_URL = import.meta.env.VITE_API_URL || '/contacts';
const PAGE_SIZE = 5;


function App() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [editContact, setEditContact] = useState<Contact | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity?: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '' });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [pendingContact, setPendingContact] = useState<Contact | Omit<Contact, '_id'> | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        setContacts([]);
        setPage(1);
        setHasMore(true);
    }, [search]);

    useEffect(() => {
        fetchContacts(1, true);
        // eslint-disable-next-line
    }, [search]);

    const fetchContacts = useCallback(async (pageToLoad = 1, reset = false) => {
        setLoading(true);
        const url = search
            ? `${API_URL}/search?q=${encodeURIComponent(search)}&page=${pageToLoad}&limit=${PAGE_SIZE}`
            : `${API_URL}?page=${pageToLoad}&limit=${PAGE_SIZE}`;
        const res = await fetch(url);
        const data = await res.json();
        setContacts(prev => reset ? data.data : [...prev, ...data.data]);
        setTotal(data.total);
        setHasMore((pageToLoad * PAGE_SIZE) < data.total);
        setLoading(false);
    }, [search]);

    const loadMore = () => {
        if (!hasMore || loading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchContacts(nextPage);
    };

    const handleAddContact = (contact: Omit<Contact, '_id'>) => {
        setPendingAction('add');
        setPendingContact(contact);
        setConfirmOpen(true);
    };

    const handleDeleteContact = (contact: Contact) => {
        setPendingAction('delete');
        setPendingContact(contact);
        setConfirmOpen(true);
    };

    const handleEditContact = (contact: Contact) => {
        setEditContact(contact);
        setModalOpen(true);
    };

    const handleSaveContact = (contact: Contact) => {
        setPendingAction('edit');
        setPendingContact(contact);
        setConfirmOpen(true);
    };

    const refreshContacts = () => {
        setContacts([]);
        setPage(1);
        setHasMore(true);
        fetchContacts(1, true);
    };

    const confirmAction = async () => {
        try {
            if (pendingAction === 'add' && pendingContact && !('id' in pendingContact)) {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pendingContact),
                });
                if (!res.ok) {
                    const data = await res.json();
                    setSnackbar({ open: true, message: data.error || 'Erreur lors de l\'ajout', severity: 'error' });
                    setConfirmOpen(false); setPendingAction(null); setPendingContact(null); return;
                }
                setSnackbar({ open: true, message: 'Contact ajouté avec succès', severity: 'success' });
                refreshContacts();
            } else if (pendingAction === 'edit' && pendingContact && 'name' in pendingContact && '_id' in pendingContact && pendingContact._id) {
                const res = await fetch(`${API_URL}/${pendingContact._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: pendingContact.name, email: pendingContact.email, phone: pendingContact.phone }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    setSnackbar({ open: true, message: data.error || 'Erreur lors de la modification', severity: 'error' });
                    setConfirmOpen(false); setPendingAction(null); setPendingContact(null); return;
                }
                setSnackbar({ open: true, message: 'Contact modifié avec succès', severity: 'success' });
                setModalOpen(false);
                setEditContact(null);
                refreshContacts();
            } else if (pendingAction === 'delete' && pendingContact && '_id' in pendingContact && pendingContact._id) {
                await fetch(`${API_URL}/${pendingContact._id}`, {
                    method: 'DELETE',
                });
                setSnackbar({ open: true, message: 'Contact supprimé avec succès', severity: 'success' });
                refreshContacts();
            }
        } catch (e) {
            setSnackbar({ open: true, message: 'Erreur réseau', severity: 'error' });
        }
        setConfirmOpen(false);
        setPendingAction(null);
        setPendingContact(null);
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    let confirmMessage = '';
    if (pendingAction === 'add' && pendingContact) confirmMessage = `Voulez-vous vraiment ajouter le contact ${pendingContact.name} ?`;
    if (pendingAction === 'edit' && pendingContact) confirmMessage = `Voulez-vous vraiment modifier le contact ${pendingContact.name} ?`;
    if (pendingAction === 'delete' && pendingContact) confirmMessage = `Voulez-vous vraiment supprimer ${pendingContact.name} ?`;

    return (
        <Container maxWidth="sm" sx={{ mt: 4, fontFamily: 'sans-serif' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ContactUtils
                    onImport={(message) => { setContacts([]); setPage(1); setHasMore(true); fetchContacts(1, true); setSnackbar({ open: true, message, severity: 'success' }); }}
                    onDeleteAll={(message) => { setContacts([]); setPage(1); setHasMore(true); fetchContacts(1, true); setSnackbar({ open: true, message, severity: 'success' }); }}
                />
            </Box>
            <Typography variant="h4" gutterBottom>Carnet d'adresses</Typography>
            <ContactForm onAdd={handleAddContact} />
            <SearchBar value={search} onChange={setSearch} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" gutterBottom>Contacts</Typography>
                <Typography variant="subtitle1" color="text.secondary">({total})</Typography>
            </Box>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <ContactList contacts={contacts} onDelete={handleDeleteContact} onEdit={handleEditContact} />
            )}
            <PaginationLoader onLoadMore={loadMore} hasMore={hasMore} loading={loading} />
            <EditContactModal
                open={modalOpen}
                contact={editContact}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveContact}
            />
            <ActionSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleCloseSnackbar}
            />
            <ConfirmDialog
                open={confirmOpen}
                message={confirmMessage}
                onConfirm={confirmAction}
                onCancel={() => { setConfirmOpen(false); setPendingAction(null); setPendingContact(null); }}
            />
        </Container>
    );
}

export default App;