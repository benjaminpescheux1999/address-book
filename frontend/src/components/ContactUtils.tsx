// Composant utilitaire pour importer, exporter et supprimer tous les contacts du carnet d'adresses
import React, { useRef, useState } from 'react';
import { Box, Button, useTheme, useMediaQuery } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ConfirmDialog from './ConfirmDialog';

export interface ContactUtilsProps {
    onImport?: (message: string) => void;
    onExport?: () => void;
    onDeleteAll?: (message: string) => void;
}

export default function ContactUtils({ onImport, onExport, onDeleteAll }: ContactUtilsProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);

    // Initialisation de l'URL de l'API
    const API_URL = import.meta.env.VITE_API_URL || '/contacts';
    console.log(API_URL);

    // Import CSV
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/import-csv`, {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();
        if (onImport) onImport(data.message);
    };

    // Export CSV
    const handleExport = (): void => {
        if (onExport) onExport();
        window.open(`${API_URL}/export-csv`, '_blank');
    };

    // Ouverture de la modal de confirmation pour supprimer tous les contacts
    const handleDeleteAllClick = (): void => {
        setConfirmDeleteOpen(true);
    };

    // Suppression de tous les contacts après confirmation
    const handleConfirmDeleteAll = async (): Promise<void> => {
        try {
            const res = await fetch(`${API_URL}`, { method: 'DELETE' });
            const data = await res.json();
            if (onDeleteAll) onDeleteAll(data.message);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            if (onDeleteAll) onDeleteAll('Erreur lors de la suppression des contacts');
        } finally {
            setConfirmDeleteOpen(false);
        }
    };

    // Fermeture de la modal de confirmation
    const handleCancelDeleteAll = (): void => {
        setConfirmDeleteOpen(false);
    };

    return (
        <>
            <Box sx={{
                display: 'flex',
                gap: 1,
                flexDirection: { xs: 'column', sm: 'row' },
                width: { xs: '100%', sm: 'auto' }
            }}>
                <input
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleImport}
                />
                <Button
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    size={isMobile ? "medium" : "small"}
                    fullWidth={isMobile}
                >
                    {isMobile ? 'Importer CSV' : 'Import'}
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    size={isMobile ? "medium" : "small"}
                    fullWidth={isMobile}
                >
                    {isMobile ? 'Exporter CSV' : 'Export'}
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteSweepIcon />}
                    onClick={handleDeleteAllClick}
                    size={isMobile ? "medium" : "small"}
                    fullWidth={isMobile}
                >
                    {isMobile ? 'Supprimer tout' : 'Supprimer'}
                </Button>
            </Box>

            {/* Modal de confirmation pour la suppression */}
            <ConfirmDialog
                open={confirmDeleteOpen}
                title="Confirmation de suppression"
                message="Voulez-vous vraiment supprimer tous les contacts ? Cette action est irréversible."
                onConfirm={handleConfirmDeleteAll}
                onCancel={handleCancelDeleteAll}
            />
        </>
    );
} 