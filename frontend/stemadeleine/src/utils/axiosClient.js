import axios from 'axios';
import {useMemo} from 'react';

export function useAxiosClient() {
    const client = useMemo(() => {
        const instance = axios.create({
            baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
            timeout: 30000,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Intercepteur de requête pour ajouter des headers communs si nécessaire
        instance.interceptors.request.use(
            (config) => {
                return config;
            },
            (error) => {
                return Promise.reject(error);
            },
        );

        // Intercepteur de réponse pour gérer les erreurs globalement
        instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                // Gestion des erreurs spécifiques
                if (error.response?.status === 404) {
                    console.warn('Ressource non trouvée:', error.config?.url);
                } else if (error.response?.status >= 500) {
                    console.error('Erreur serveur:', error.response?.data || error.message);
                } else if (error.code === 'ECONNABORTED') {
                    console.error('Timeout de la requête');
                }

                return Promise.reject(error);
            },
        );

        return instance;
    }, []);

    return client;
}

// Export d'un client axios simple pour les cas où les hooks ne sont pas utilisables
export const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
    timeout: 10000,
    withCredentials: true, // Nécessaire pour la configuration CORS unifiée
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteurs pour le client simple
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 404) {
            console.warn('Ressource non trouvée:', error.config?.url);
        } else if (error.response?.status >= 500) {
            console.error('Erreur serveur:', error.response?.data || error.message);
        } else if (error.code === 'ECONNABORTED') {
            console.error('Timeout de la requête');
        }

        return Promise.reject(error);
    },
);
