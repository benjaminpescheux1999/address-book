import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export interface PaginationLoaderProps {
    onLoadMore: () => void;
    hasMore: boolean;
    loading: boolean;
}

export default function PaginationLoader({ onLoadMore, hasMore, loading }: PaginationLoaderProps) {
    const loaderRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!hasMore || loading) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            { threshold: 1 }
        );
        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [hasMore, loading, onLoadMore]);

    return (
        <Box
            ref={loaderRef}
            sx={{
                height: 80,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                py: 2
            }}
        >
            {loading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary">
                        Chargement de nouveaux contacts...
                    </Typography>
                </Box>
            )}
            {!hasMore && !loading && (
                <Typography variant="body2" color="text.secondary">
                    Tous les contacts ont été chargés
                </Typography>
            )}
        </Box>
    );
} 