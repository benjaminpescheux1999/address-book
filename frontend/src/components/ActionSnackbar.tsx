import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export interface ActionSnackbarProps {
    open: boolean;
    message: string;
    severity?: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
}

export default function ActionSnackbar({ open, message, severity = 'success', onClose }: ActionSnackbarProps) {
    return (
        <Snackbar open={open} autoHideDuration={3000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
} 