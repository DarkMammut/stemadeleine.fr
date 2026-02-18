'use client';

import {useEffect} from 'react';

export default function DynamicFavicon() {
    useEffect(() => {
        let addedLink: HTMLLinkElement | null = null;

        const updateFavicon = async () => {
            try {
                const backend = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
                const response = await fetch(`${backend}/api/public/organization/settings`);

                if (!response.ok) {
                    console.log('Using default favicon - API not available');
                    return;
                }

                const settings = await response.json();

                if (settings.faviconMedia) {
                    // Supprimer TOUS les favicons existants pour éviter les conflits
                    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
                    existingFavicons.forEach(link => {
                        if (link.parentNode) {
                            link.parentNode.removeChild(link);
                        }
                    });

                    // Créer un nouveau lien vers le favicon dynamique
                    const link = document.createElement('link');
                    link.rel = 'icon';
                    link.type = 'image/x-icon';
                    link.setAttribute('data-dynamic-favicon', 'true');

                    // Ajouter un timestamp pour forcer le rechargement
                    const timestamp = new Date().getTime();
                    link.href = `${backend}/api/public/media/${settings.faviconMedia}?t=${timestamp}`;

                    // Ajouter de manière sécurisée
                    if (document.head) {
                        document.head.appendChild(link);
                        addedLink = link;

                        console.log('Dynamic favicon loaded:', link.href);
                    }
                } else {
                    console.log('No favicon configured in settings');
                }
            } catch (error) {
                console.error('Error loading dynamic favicon:', error);
            }
        };

        // Attendre un peu que Next.js ait fini de charger pour éviter les conflits
        const timeoutId = setTimeout(() => {
            updateFavicon();
        }, 100);

        // Cleanup function
        return () => {
            clearTimeout(timeoutId);
            if (addedLink && addedLink.parentNode) {
                try {
                    addedLink.parentNode.removeChild(addedLink);
                } catch (e) {
                    console.warn('Could not remove dynamic favicon:', e);
                }
            }
        };
    }, []);

    return null;
}
