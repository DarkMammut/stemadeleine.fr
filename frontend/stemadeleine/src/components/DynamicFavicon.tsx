'use client';

import {useEffect} from 'react';

export default function DynamicFavicon() {
    useEffect(() => {
        const updateFavicon = async () => {
            try {
                const backend = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
                const response = await fetch(`${backend}/api/public/organization/settings`);

                if (!response.ok) {
                    console.log('Using default favicon');
                    return;
                }

                const settings = await response.json();

                if (settings.faviconMedia) {
                    // Supprimer les anciens liens de favicon
                    const existingLinks = document.querySelectorAll("link[rel*='icon']");
                    existingLinks.forEach(link => link.remove());

                    // Créer un nouveau lien vers le favicon dynamique
                    const link = document.createElement('link');
                    link.rel = 'icon';
                    link.type = 'image/x-icon';
                    link.href = `${backend}/api/public/media/${settings.faviconMedia}`;

                    document.head.appendChild(link);

                    // Forcer le rafraîchissement en ajoutant un timestamp
                    const timestamp = new Date().getTime();
                    link.href = `${backend}/api/public/media/${settings.faviconMedia}?t=${timestamp}`;
                }
            } catch (error) {
                console.error('Error loading dynamic favicon:', error);
            }
        };

        updateFavicon();
    }, []);

    return null;
}
