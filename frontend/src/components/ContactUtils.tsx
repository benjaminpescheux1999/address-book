// Composant utilitaire pour importer, exporter et supprimer tous les contacts du carnet d'adresses
import React, { useRef } from 'react';
import { Box, Button } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

export interface ContactUtilsProps {
    onImport?: (message: string) => void;
    onExport?: () => void;
    onDeleteAll?: (message: string) => void;
}

export default function ContactUtils({ onImport, onExport, onDeleteAll }: ContactUtilsProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    // Récupération de l'URL de l'API depuis la variable d'environnement ou reconstruit dynamiquement avec l'IP de la machine
    const API_URL = import.meta.env.VITE_API_URL_BACKEND || `http://${window.location.hostname}:5000`;
    console.log("import.meta.env.VITE_API_URL_BACKEND", import.meta.env.VITE_API_URL_BACKEND);

    // Import CSV : envoie le fichier au backend et affiche le message de retour
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/contacts/import-csv`, {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();
        if (onImport) onImport(data.message);
    };

    // Export CSV : ouvre le fichier généré par le backend
    const handleExport = () => {
        if (onExport) onExport();
        window.open(`${API_URL}/contacts/export-csv`, '_blank');
    };

    // Suppression de tous les contacts avec confirmation
    const handleDeleteAll = async () => {
        if (!window.confirm('Voulez-vous vraiment supprimer tous les contacts ?')) return;
        const res = await fetch(`${API_URL}/contacts`, { method: 'DELETE' });
        const data = await res.json();
        if (onDeleteAll) onDeleteAll(data.message);
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 2 }}>
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
            >
                Importer CSV
            </Button>
            <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
            >
                Exporter CSV
            </Button>
            <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteSweepIcon />}
                onClick={handleDeleteAll}
            >
                Supprimer tout
            </Button>
        </Box>
    );
} 