import { useCallback, useState } from 'react';
import { NewsPublication } from '@/types/news';
import { useAxiosClient } from '@/utils/axiosClient';

export default function useGetNewsPublicationByNewsId() {
    const [newsPublication, setNewsPublication] = useState<NewsPublication | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const axiosClient = useAxiosClient();

    const fetchNewsByNewsId = useCallback(async (newsId: string) => {
        if (!newsId) {
            setError('ID de l\'actualité requis');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axiosClient.get<NewsPublication>(
                `/api/public/modules/news/publications/news/${newsId}`
            );

            const data = response.data;
            setNewsPublication(data);
            return data;
        } catch (err: unknown) {
            const error = err as { response?: { status?: number }; message?: string };
            const errorMessage = error?.response?.status === 404
                ? 'Actualité non trouvée'
                : error?.message || 'Une erreur est survenue';

            setError(errorMessage);
            console.error('Erreur lors de la récupération de l\'actualité par newsId:', err);
            setNewsPublication(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [axiosClient]);

    const clearNews = useCallback(() => {
        setNewsPublication(null);
        setError(null);
    }, []);

    return {
        newsPublication,
        loading,
        error,
        fetchNewsByNewsId,
        clearNews,
    };
}

