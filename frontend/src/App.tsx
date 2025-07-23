import React, { useEffect, useState, useCallback } from 'react';
import ContactList, { Contact } from './components/ContactList';
import ContactModal from './components/ContactModal';
import SearchBar from './components/SearchBar';
import ActionSnackbar from './components/ActionSnackbar';
import ConfirmDialog from './components/ConfirmDialog';
import PaginationLoader from './components/PaginationLoader';
import ContactUtils from './components/ContactUtils';
import AlphabetNavigation from './components/AlphabetNavigation';
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
    const [currentLetter, setCurrentLetter] = useState<string | undefined>(undefined);

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

    const navigateToLetter = async (letter: string) => {
        setCurrentLetter(letter);
        setLoading(true);

        // Vérifier d'abord si la lettre est déjà dans les contacts chargés
        const sectioned = getSectionedContacts(contacts);
        const letterSection = sectioned.find(([sectionLetter]) => sectionLetter === letter);

        if (letterSection) {
            // La lettre est déjà chargée, scroll direct
            setLoading(false);
            setTimeout(() => {
                const letterElement = document.querySelector(`[data-letter="${letter}"]`);
                if (letterElement) {
                    letterElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 100);
            return;
        }

        // La lettre n'est pas encore chargée, charger les pages nécessaires
        let allContacts = [...contacts]; // Garder les contacts existants
        let currentPage = page;
        let found = false;
        let targetLetter = letter;
        const maxPages = 50; // Augmenter la limite pour charger plus de contacts

        while (!found && currentPage <= maxPages) {
            const url = search
                ? `${API_URL}/search?q=${encodeURIComponent(search)}&page=${currentPage}&limit=${PAGE_SIZE}`
                : `${API_URL}?page=${currentPage}&limit=${PAGE_SIZE}`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.data.length === 0) break;

            // Ajouter seulement les nouveaux contacts
            const newContacts = data.data.filter((newContact: Contact) =>
                !allContacts.some(existing => existing._id === newContact._id)
            );

            allContacts = [...allContacts, ...newContacts];

            // Vérifier si on a trouvé la lettre demandée
            const updatedSectioned = getSectionedContacts(allContacts);
            const foundLetterSection = updatedSectioned.find(([sectionLetter]) => sectionLetter === targetLetter);

            if (foundLetterSection) {
                found = true;
                break;
            }

            // Si on a chargé beaucoup de pages et qu'on n'a toujours pas trouvé la lettre,
            // chercher la lettre la plus proche avant seulement à la fin
            if (currentPage >= 40) { // Attendre plus longtemps avant de chercher une alternative
                const availableLetters = updatedSectioned.map(([sectionLetter]) => sectionLetter);
                const closestLetter = findClosestLetterBefore(targetLetter, availableLetters);

                if (closestLetter) {
                    targetLetter = closestLetter;
                    const closestSection = updatedSectioned.find(([sectionLetter]) => sectionLetter === closestLetter);
                    if (closestSection) {
                        found = true;
                        break;
                    }
                }
            }

            currentPage++;
        }

        // Mettre à jour l'état
        setContacts(allContacts);
        setPage(currentPage);
        setHasMore((currentPage * PAGE_SIZE) < total);
        setLoading(false);

        // Mettre à jour la lettre courante avec la lettre trouvée
        setCurrentLetter(targetLetter);

        // Faire défiler vers la lettre (celle trouvée ou la plus proche)
        setTimeout(() => {
            const letterElement = document.querySelector(`[data-letter="${targetLetter}"]`);
            if (letterElement) {
                letterElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    };

    // Fonction utilitaire pour sectionner les contacts (copiée de ContactList)
    const getSectionedContacts = (contacts: Contact[]) => {
        const sections: { [letter: string]: Contact[] } = {};
        contacts.forEach((c) => {
            const letter = c.name ? c.name[0].toUpperCase() : '#';
            if (!sections[letter]) sections[letter] = [];
            sections[letter].push(c);
        });
        return Object.entries(sections).sort(([a], [b]) => a.localeCompare(b));
    };

    // Fonction pour trouver la lettre la plus proche avant la lettre demandée
    const findClosestLetterBefore = (targetLetter: string, availableLetters: string[]): string | null => {
        // Filtrer les lettres qui sont avant la lettre cible
        const lettersBefore = availableLetters.filter(letter => letter < targetLetter);

        if (lettersBefore.length === 0) {
            return null; // Aucune lettre avant trouvée
        }

        // Retourner la lettre la plus proche (la plus grande parmi celles qui sont avant)
        return lettersBefore.reduce((closest, current) =>
            current > closest ? current : closest
        );
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
        <Container maxWidth="md" sx={{ mt: 2, mb: 4, fontFamily: 'sans-serif', pl: { xs: 6, sm: 8 } }}>
            {/* Header avec titre et actions */}
            <Box sx={{ mb: 3 }}>
                {/* Titre principal */}
                <Typography
                    variant="h4"
                    sx={{
                        mb: { xs: 2, md: 3 },
                        textAlign: { xs: 'center', md: 'left' }
                    }}
                >
                    Carnet d'adresses
                </Typography>

                {/* Actions organisées en deux lignes sur desktop */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 2, md: 3 },
                    alignItems: { xs: 'stretch', md: 'center' },
                    justifyContent: { xs: 'stretch', md: 'space-between' }
                }}>
                    {/* Bouton Ajouter un contact */}
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddContact}
                        sx={{
                            minWidth: { xs: '100%', md: 'auto' },
                            px: { xs: 2, md: 3 },
                            py: { xs: 1.5, md: 1.2 },
                            fontSize: { xs: '1rem', md: '0.9rem' }
                        }}
                    >
                        AJOUTER UN CONTACT
                    </Button>

                    {/* Outils (Import/Export/Supprimer) */}
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        justifyContent: { xs: 'center', md: 'flex-end' }
                    }}>
                        <ContactUtils
                            onImport={(message) => { setContacts([]); setPage(1); setHasMore(true); fetchContacts(1, true); setSnackbar({ open: true, message, severity: 'success' }); }}
                            onDeleteAll={(message) => { setContacts([]); setPage(1); setHasMore(true); fetchContacts(1, true); setSnackbar({ open: true, message, severity: 'success' }); }}
                        />
                    </Box>
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

            {/* Navigation alphabétique fixe */}
            <AlphabetNavigation
                onLetterClick={navigateToLetter}
                currentLetter={currentLetter}
            />

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