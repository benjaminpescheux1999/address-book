import React from 'react';
import { TextField, Box } from '@mui/material';
import { SearchChangeHandler } from '../types';

export interface SearchBarProps {
    value: string;
    onChange: SearchChangeHandler;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <Box sx={{ mb: 3 }}>
            <TextField
                fullWidth
                label="Rechercher un contact (nom, email, téléphone)"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                size="small"
                autoFocus
            />
        </Box>
    );
} 