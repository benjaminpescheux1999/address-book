import React, { useEffect, useRef } from 'react';

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
        <div ref={loaderRef} style={{ height: 32, textAlign: 'center' }}>
            {loading && <span>Chargement...</span>}
        </div>
    );
} 