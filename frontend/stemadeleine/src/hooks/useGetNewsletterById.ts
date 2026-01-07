import {useCallback, useState} from 'react';
import {NewsletterPublication} from '@/types/newsletter';
import {useAxiosClient} from '@/utils/axiosClient';

export default function useGetNewsletterById() {
    const [newsletter, setNewsletter] = useState<NewsletterPublication | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const axiosClient = useAxiosClient();

    const fetchNewsletterById = useCallback(async (newsletterId: string) => {
        if (!newsletterId) {
            setError('ID de newsletter requis');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Fetching newsletter by ID:', newsletterId);

            const response = await axiosClient.get<NewsletterPublication>(
                `/api/public/modules/newsletter/publications/${newsletterId}`
            );

            const data = response.data;
            console.log(`Fetched newsletter:`, data);

            setNewsletter(data);
            return data;
        } catch (err: unknown) {
            const error = err as { response?: { status?: number }; message?: string };
            const errorMessage = error?.response?.status === 404
                ? 'Newsletter non trouvée'
                : error?.message || 'Une erreur est survenue';

            setError(errorMessage);
            console.error('Erreur lors de la récupération de la newsletter:', err);
            setNewsletter(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [axiosClient]);

    const clearNewsletter = useCallback(() => {
        setNewsletter(null);
        setError(null);
    }, []);

    return {
        newsletter,
        loading,
        error,
        fetchNewsletterById,
        clearNewsletter,
    };
}

