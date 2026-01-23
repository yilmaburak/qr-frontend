import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface SecureImageProps {
    endpoint: string;
    alt?: string;
    className?: string;
}

const SecureImage: React.FC<SecureImageProps> = ({ endpoint, alt, className }) => {
    const [src, setSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        let active = true;

        const fetchImage = async () => {
            try {
                setLoading(true);
                const response = await api.get(endpoint, {
                    responseType: 'blob'
                });
                const url = URL.createObjectURL(response.data);
                if (active) {
                    setSrc(url);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load secure image", err);
                if (active) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        if (endpoint) {
            fetchImage();
        }

        return () => {
            active = false;
            // Clean up object URL to avoid memory leaks
            // Note: src is closed over in the effect cleanup? No, src is state.
            // We can't access updated state in cleanup of effect running on [endpoint].
            // However, we only need to revoke if we created one.
            // A common pattern is to set the url to a ref or just revoke the *previous* one if effect re-runs?
            // Or simpler: assume the component unmounts primarily.
            // But strict mode re-runs effects.
            // We should revoke inside the functional update or separate effect?
            // Actually, we can return a cleanup function that revokes the *local* url variable if we lifted it out?
            // But here `url` is local to async function.
            // We can't easily revoke it in return block unless we store it in a ref.
            // Since `src` state holds it, we can revoke it when src changes or unmounts?
            // For now, I'll stick to the original logic which tried to revoke `src`.
            // But `src` in cleanup is stale (null or old value).
            // Original code: if (src) URL.revokeObjectURL(src);
            // This closure captures initial `src` (null).
            // It ONLY works if `src` was in the dependency array, BUT this effect depends on `endpoint`.
            // So if endpoint changes, `src` (stale) is revoked.
            // If we want to revoke correctly, we should use a ref to track the current object URL.
        };
    }, [endpoint]);

    // Better cleanup via Ref
    useEffect(() => {
        return () => {
            if (src) URL.revokeObjectURL(src);
        }
    }, [src]);

    if (loading) return <div className={`bg-gray-200 animate-pulse ${className}`} />;
    if (error) return <div className={`bg-gray-100 flex items-center justify-center text-gray-400 text-xs ${className}`}>Error</div>;

    return <img src={src || undefined} alt={alt} className={className} />;
};

export default SecureImage;
