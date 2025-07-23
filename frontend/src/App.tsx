import React, { useEffect, useState, useCallback } from 'react';
import ContactList, { Contact } from './components/ContactList';
import ContactModal from './components/ContactModal';
import SearchBar from './components/SearchBar';
import ActionSnackbar from './components/ActionSnackbar';
import ConfirmDialog from './components/ConfirmDialog';
import PaginationLoader from './components/PaginationLoader';
import ContactUtils from './components/ContactUtils';
import CircularProgress from '@mui/material/CircularProgress';
import { Container, Typography, Box, Button, useTheme, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Récupération de l'URL de l'API depuis la variable d'environnement ou reconstruit dynamiquement avec l'IP de la machine
const API_URL = import.meta.env.VITE_API_URL || '/contacts';
const PAGE_SIZE = 5;


function App() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [contactModalMode, setContactModalMode] = useState<'create' | 'edit'>('create');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
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

        // Sauvegarder la position de scroll avant le chargement (sauf pour la première page)
        const scrollPosition = pageToLoad > 1 ? window.scrollY : 0;

        const url = search
            ? `${API_URL}/search?q=${encodeURIComponent(search)}&page=${pageToLoad}&limit=${PAGE_SIZE}`
            : `${API_URL}?page=${pageToLoad}&limit=${PAGE_SIZE}`;
        const res = await fetch(url);
        const data = await res.json();

        setContacts(prev => {
            const newContacts = reset ? data.data : [...prev, ...data.data];

            // Restaurer la position de scroll après la mise à jour (sauf pour la première page)
            if (pageToLoad > 1) {
                setTimeout(() => {
                    window.scrollTo(0, scrollPosition);
                }, 0);
            }

            return newContacts;
        });

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

    const handleAddContact = () => {
        setContactModalMode('create');
        setSelectedContact(null);
        setContactModalOpen(true);
    };

    const handleEditContact = (contact: Contact) => {
        setContactModalMode('edit');
        setSelectedContact(contact);
        setContactModalOpen(true);
    };

    const handleDeleteContact = (contact: Contact) => {
        setPendingAction('delete');
        setPendingContact(contact);
        setConfirmOpen(true);
    };

    const handleSaveContact = (contact: Contact | Omit<Contact, '_id'>) => {
        if (contactModalMode === 'create') {
            setPendingAction('add');
            setPendingContact(contact);
            setConfirmOpen(true);
        } else {
            setPendingAction('edit');
            setPendingContact(contact as Contact);
            setConfirmOpen(true);
        }
    };

    const refreshContacts = () => {
        setContacts([]);
        setPage(1);
        setHasMore(true);
        fetchContacts(1, true);
    };

    const confirmAction = async () => {
        try {
            if (pendingAction === 'add' && pendingContact && !('_id' in pendingContact)) {
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
                    body: JSON.stringify({
                        name: pendingContact.name,
                        email: pendingContact.email,
                        phone: pendingContact.phone,
                        avatar: pendingContact.avatar || null
                    }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    setSnackbar({ open: true, message: data.error || 'Erreur lors de la modification', severity: 'error' });
                    setConfirmOpen(false); setPendingAction(null); setPendingContact(null); return;
                }
                setSnackbar({ open: true, message: 'Contact modifié avec succès', severity: 'success' });
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
        <Container maxWidth="md" sx={{ mt: 2, mb: 4, fontFamily: 'sans-serif' }}>
            {/* Header avec actions */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
            }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>Carnet d'adresses</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddContact}
                        sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                    >
                        Ajouter un contact
                    </Button>
                    <ContactUtils
                        onImport={(message) => { setContacts([]); setPage(1); setHasMore(true); fetchContacts(1, true); setSnackbar({ open: true, message, severity: 'success' }); }}
                        onDeleteAll={(message) => { setContacts([]); setPage(1); setHasMore(true); fetchContacts(1, true); setSnackbar({ open: true, message, severity: 'success' }); }}
                    />
                </Box>
            </Box>

            {/* Barre de recherche */}
            <SearchBar value={search} onChange={setSearch} />

            {/* En-tête de la liste */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>Contacts</Typography>
                <Typography variant="subtitle1" color="text.secondary">({total})</Typography>
            </Box>

            {/* Liste des contacts */}
            {loading && page === 1 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <ContactList contacts={contacts} onDelete={handleDeleteContact} onEdit={handleEditContact} />
            )}

            {/* Pagination */}
            {contacts.length > 0 && (
                <PaginationLoader onLoadMore={loadMore} hasMore={hasMore} loading={loading && page > 1} />
            )}

            {/* Espace en bas de la liste */}
            <Box sx={{ mb: 8 }} />

            {/* Modals */}
            <ContactModal
                open={contactModalOpen}
                contact={selectedContact}
                onClose={() => setContactModalOpen(false)}
                onSave={handleSaveContact}
                mode={contactModalMode}
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