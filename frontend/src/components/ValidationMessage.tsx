import React from 'react';
import { Alert } from '@mui/material';
import { SnackbarSeverity } from '../types';

export interface ValidationMessageProps {
    message: string;
    severity?: SnackbarSeverity;
}

export default function ValidationMessage({ message, severity = 'error' }: ValidationMessageProps) {
    if (!message) return null;
    return <Alert severity={severity} sx={{ mb: 2 }}>{message}</Alert>;
} 