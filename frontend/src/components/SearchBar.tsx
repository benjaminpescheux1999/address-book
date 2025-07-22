import React from 'react';
import { TextField, Box } from '@mui/material';

export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <Box sx={{ mb: 3 }}>
            <TextField
                fullWidth
                label="Rechercher un contact (nom, email, téléphone)"
                value={value}
                onChange={e => onChange(e.target.value)}
                size="small"
                autoFocus
            />
        </Box>
    );
} 