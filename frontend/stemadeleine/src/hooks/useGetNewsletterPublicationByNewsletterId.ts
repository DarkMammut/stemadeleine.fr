import {useCallback, useState} from 'react';
import {NewsletterPublication} from '@/types/newsletter';
import {useAxiosClient} from '@/utils/axiosClient';

export default function useGetNewsletterPublicationByNewsletterId() {
    const [newsletter, setNewsletter] = useState<NewsletterPublication | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const axiosClient = useAxiosClient();

    const fetchNewsletterByNewsletterId = useCallback(async (newsletterId: string) => {
        if (!newsletterId) {
            setError('ID de newsletter requis');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Fetching newsletter publication by newsletterId:', newsletterId);

            const response = await axiosClient.get<NewsletterPublication>(
                `/api/public/modules/newsletter/publications/newsletter/${newsletterId}`
            );

            const data = response.data;
            console.log('Fetched newsletter publication:', data);

            setNewsletter(data);
            return data;
        } catch (err: unknown) {
            const error = err as { response?: { status?: number }; message?: string };
            const errorMessage = error?.response?.status === 404
                ? 'Newsletter non trouvée'
                : error?.message || 'Une erreur est survenue';

            setError(errorMessage);
            console.error('Erreur lors de la récupération de la newsletter par newsletterId:', err);
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
        fetchNewsletterByNewsletterId,
        clearNewsletter,
    };
}

