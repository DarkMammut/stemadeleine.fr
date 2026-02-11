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
                    console.log('Using default favicon');
                    return;
                }

                const settings = await response.json();

                if (settings.faviconMedia) {
                    // Au lieu de supprimer tous les favicons, chercher uniquement notre favicon dynamique précédent
                    const existingDynamicFavicon = document.querySelector("link[data-dynamic-favicon='true']");
                    if (existingDynamicFavicon && existingDynamicFavicon.parentNode) {
                        existingDynamicFavicon.parentNode.removeChild(existingDynamicFavicon);
                    }

                    // Créer un nouveau lien vers le favicon dynamique avec un attribut identifiant
                    const link = document.createElement('link');
                    link.rel = 'icon';
                    link.type = 'image/x-icon';
                    link.setAttribute('data-dynamic-favicon', 'true');
                    link.href = `${backend}/api/public/media/${settings.faviconMedia}`;

                    // Ajouter de manière sécurisée
                    if (document.head) {
                        document.head.appendChild(link);
                        addedLink = link;

                        // Forcer le rafraîchissement en ajoutant un timestamp
                        const timestamp = new Date().getTime();
                        link.href = `${backend}/api/public/media/${settings.faviconMedia}?t=${timestamp}`;
                    }
                }
            } catch (error) {
                console.error('Error loading dynamic favicon:', error);
            }
        };

        updateFavicon();

        // Cleanup function - supprimer seulement notre favicon dynamique
        return () => {
            if (addedLink && addedLink.parentNode) {
                try {
                    addedLink.parentNode.removeChild(addedLink);
                } catch (e) {
                    // Ignorer les erreurs si l'élément n'existe plus
                    console.warn('Could not remove dynamic favicon:', e);
                }
            }
        };
    }, []);

    return null;
}
