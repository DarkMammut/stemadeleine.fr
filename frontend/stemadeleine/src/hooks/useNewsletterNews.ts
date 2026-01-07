/**
 * useNewsletterNews Hook
 *
 * Hook personnalisé pour gérer les liens entre newsletters et actualités
 */

import {useCallback, useEffect, useState} from 'react';

interface NewsPublication {
    id: string;
    newsId: string;
    name: string;
    title: string;
    description?: string;
    isVisible: boolean;
    status: string;
    publishedDate?: string;
    media?: {
        id: string;
        filename: string;
        url: string;
    };
}

interface UseNewsletterNewsOptions {
    newsletterId?: string;
    autoFetch?: boolean;
}

interface UseNewsletterNewsReturn {
    linkedNews: NewsPublication[];
    loading: boolean;
    error: string | null;
    fetchLinkedNews: () => Promise<NewsPublication[]>;
    addNewsToNewsletter: (newsId: string) => Promise<void>;
    removeNewsFromNewsletter: (newsId: string) => Promise<void>;
    refreshLinkedNews: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function useNewsletterNews({
                                      newsletterId,
                                      autoFetch = true,
                                  }: UseNewsletterNewsOptions = {}): UseNewsletterNewsReturn {
    const [linkedNews, setLinkedNews] = useState<NewsPublication[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Récupérer le token d'authentification
    const getAuthToken = () => {
        // Adapter selon votre système d'authentification
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken') || '';
        }
        return '';
    };

    // Récupérer les actualités liées à une newsletter
    const fetchLinkedNews = useCallback(async (): Promise<NewsPublication[]> => {
        if (!newsletterId) {
            return [];
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_URL}/api/newsletter-publication/${newsletterId}/news`,
                {
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch linked news: ${response.statusText}`);
            }

            const data = await response.json();
            setLinkedNews(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error fetching linked news:', errorMessage);
            setError('Erreur lors du chargement des actualités liées');
            return [];
        } finally {
            setLoading(false);
        }
    }, [newsletterId]);

    // Ajouter une actualité à une newsletter
    const addNewsToNewsletter = useCallback(
        async (newsId: string): Promise<void> => {
            if (!newsletterId) {
                throw new Error('Newsletter ID is required');
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `${API_URL}/api/newsletter-publication/${newsletterId}/news/${newsId}`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${getAuthToken()}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to add news: ${response.statusText}`);
                }

                // Rafraîchir la liste
                await fetchLinkedNews();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                console.error('Error adding news to newsletter:', errorMessage);
                setError('Erreur lors de l\'ajout de l\'actualité');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [newsletterId, fetchLinkedNews]
    );

    // Retirer une actualité d'une newsletter
    const removeNewsFromNewsletter = useCallback(
        async (newsId: string): Promise<void> => {
            if (!newsletterId) {
                throw new Error('Newsletter ID is required');
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `${API_URL}/api/newsletter-publication/${newsletterId}/news/${newsId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${getAuthToken()}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to remove news: ${response.statusText}`);
                }

                // Rafraîchir la liste
                await fetchLinkedNews();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                console.error('Error removing news from newsletter:', errorMessage);
                setError('Erreur lors de la suppression de l\'actualité');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [newsletterId, fetchLinkedNews]
    );

    // Rafraîchir la liste des actualités liées
    const refreshLinkedNews = useCallback(async (): Promise<void> => {
        await fetchLinkedNews();
    }, [fetchLinkedNews]);

    // Charger automatiquement les données au montage si autoFetch est true
    useEffect(() => {
        if (autoFetch && newsletterId) {
            fetchLinkedNews();
        }
    }, [autoFetch, newsletterId, fetchLinkedNews]);

    return {
        linkedNews,
        loading,
        error,
        fetchLinkedNews,
        addNewsToNewsletter,
        removeNewsFromNewsletter,
        refreshLinkedNews,
    };
}

// Hook pour récupérer une actualité par son newsId
export function useNewsByNewsId(newsId?: string) {
    const [news, setNews] = useState<NewsPublication | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAuthToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken') || '';
        }
        return '';
    };

    const fetchNews = useCallback(async () => {
        if (!newsId) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_URL}/api/news-publications/by-news/${newsId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch news: ${response.statusText}`);
            }

            const data = await response.json();
            setNews(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error fetching news:', errorMessage);
            setError('Erreur lors du chargement de l\'actualité');
        } finally {
            setLoading(false);
        }
    }, [newsId]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    return {news, loading, error, refetch: fetchNews};
}

export default useNewsletterNews;

