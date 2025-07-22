import React from 'react';
import { Alert } from '@mui/material';

export interface ValidationMessageProps {
    message: string;
    severity?: 'error' | 'success' | 'info' | 'warning';
}

export default function ValidationMessage({ message, severity = 'error' }: ValidationMessageProps) {
    if (!message) return null;
    return <Alert severity={severity} sx={{ mb: 2 }}>{message}</Alert>;
} 