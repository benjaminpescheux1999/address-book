import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ open, title = 'Confirmation', message, onConfirm, onCancel }: ConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Annuler</Button>
                <Button onClick={onConfirm} color="error" variant="contained">Confirmer</Button>
            </DialogActions>
        </Dialog>
    );
} 