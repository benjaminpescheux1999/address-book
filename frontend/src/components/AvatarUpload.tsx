import React, { useState, useRef, useEffect } from 'react';
import {
    Avatar,
    Box,
    Button,
    IconButton,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';

export interface AvatarUploadProps {
    currentAvatar?: string;
    onAvatarChange: (avatar: string | null) => void;
    contactName?: string;
}

export default function AvatarUpload({ currentAvatar, onAvatarChange, contactName }: AvatarUploadProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [hasRemovedAvatar, setHasRemovedAvatar] = useState<boolean>(false);

    useEffect(() => {
        setPreviewAvatar(currentAvatar || null);
        setHasRemovedAvatar(false);
    }, [currentAvatar]);

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Vérification du type de fichier
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image valide.');
            return;
        }

        // limite de taille de l'image
        if (file.size > 2 * 1024 * 1024) {
            alert('L\'image doit faire moins de 2MB.');
            return;
        }

        // lecture de l'image
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const result = e.target?.result as string;
            setPreviewAvatar(result);
            setHasRemovedAvatar(false);
            onAvatarChange(result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = (): void => {
        setPreviewAvatar(null);
        setHasRemovedAvatar(true);
        onAvatarChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const displayAvatar = hasRemovedAvatar ? null : (previewAvatar || currentAvatar);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            mb: 2
        }}>
            <Typography variant="h6" color="text.secondary">
                Avatar
            </Typography>

            <Box sx={{ position: 'relative' }}>
                <Avatar
                    src={displayAvatar || undefined}
                    sx={{
                        width: 120,
                        height: 120,
                        fontSize: '2rem',
                        border: 2,
                        borderColor: 'divider'
                    }}
                >
                    {!displayAvatar && contactName ? getInitials(contactName) : '?'}
                </Avatar>

                <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        }
                    }}
                    size="small"
                >
                    <PhotoCameraIcon />
                </IconButton>
            </Box>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            <Box sx={{
                display: 'flex',
                gap: 1,
                flexDirection: { xs: 'column', sm: 'row' },
                width: { xs: '100%', sm: 'auto' }
            }}>
                <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current?.click()}
                    size={isMobile ? "medium" : "small"}
                    fullWidth={isMobile}
                >
                    {displayAvatar ? 'Changer l\'avatar' : 'Ajouter un avatar'}
                </Button>

                {displayAvatar && (
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleRemoveAvatar}
                        size={isMobile ? "medium" : "small"}
                        fullWidth={isMobile}
                    >
                        Supprimer
                    </Button>
                )}
            </Box>

            <Typography variant="caption" color="text.secondary" textAlign="center">
                Formats acceptés : JPG, PNG, GIF (max 2MB)
            </Typography>
        </Box>
    );
} 