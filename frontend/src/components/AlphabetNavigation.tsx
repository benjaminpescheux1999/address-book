import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { AlphabetNavigationProps, ALPHABET } from '../types';

export default function AlphabetNavigation({ onLetterClick, currentLetter }: AlphabetNavigationProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);

    // Animation pour la lettre active
    const getLetterStyle = (letter: string) => {
        const isActive = currentLetter === letter;
        const isHovered = hoveredLetter === letter;

        return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? 32 : 40,
            height: isMobile ? 32 : 40,
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            fontSize: isActive ? (isMobile ? '1.2rem' : '1.4rem') : (isMobile ? '0.9rem' : '1rem'),
            fontWeight: isActive ? 700 : 500,
            color: isActive ? theme.palette.primary.contrastText : theme.palette.text.secondary,
            backgroundColor: isActive
                ? theme.palette.primary.main
                : isHovered
                    ? theme.palette.action.hover
                    : 'transparent',
            transform: isActive ? 'scale(1.2)' : isHovered ? 'scale(1.1)' : 'scale(1)',
            boxShadow: isActive
                ? `0 4px 12px ${theme.palette.primary.main}40`
                : isHovered
                    ? `0 2px 8px ${theme.palette.action.hover}40`
                    : 'none',
            '&:hover': {
                backgroundColor: isActive ? theme.palette.primary.dark : theme.palette.action.hover,
                transform: 'scale(1.1)',
                boxShadow: `0 2px 8px ${theme.palette.action.hover}40`,
            }
        };
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                py: 2,
                px: 1,
                backgroundColor: theme.palette.background.paper,
                borderRadius: '0 12px 12px 0',
                boxShadow: `4px 0 12px ${theme.palette.action.hover}40`,
                border: `1px solid ${theme.palette.divider}`,
                borderLeft: 'none',
                minHeight: '60vh',
                maxHeight: '80vh',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.divider,
                    borderRadius: '2px',
                },
            }}
        >
            {ALPHABET.map((letter) => (
                <Box
                    key={letter}
                    sx={getLetterStyle(letter)}
                    onClick={() => onLetterClick(letter)}
                    onMouseEnter={() => setHoveredLetter(letter)}
                    onMouseLeave={() => setHoveredLetter(null)}
                    title={`Aller à la lettre ${letter}`}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: 'inherit',
                            fontWeight: 'inherit',
                            lineHeight: 1,
                            userSelect: 'none',
                        }}
                    >
                        {letter}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
} 