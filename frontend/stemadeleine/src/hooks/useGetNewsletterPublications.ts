import { useState, useCallback } from 'react';
import { NewsletterPublication } from '@/types/newsletter';
import { useAxiosClient } from '@/utils/axiosClient';

export default function useGetNewsletterPublications() {
  const [publications, setPublications] = useState<NewsletterPublication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const axiosClient = useAxiosClient();

  const fetchPublications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching newsletter publications');

      const response = await axiosClient.get<NewsletterPublication[]>(
        '/api/public/modules/newsletter/publications'
      );

      const data = response.data;
      console.log(`Fetched ${data.length} newsletter publications`, data);

      setPublications(data);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { status?: number }; message?: string };
      const errorMessage = error?.response?.status === 404
        ? 'Aucune newsletter trouvée'
        : error?.message || 'Une erreur est survenue';

      setError(errorMessage);
      console.error('Erreur lors de la récupération des publications:', err);
      setPublications([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [axiosClient]);

  const clearPublications = useCallback(() => {
    setPublications([]);
    setError(null);
  }, []);

  return {
    publications,
    loading,
    error,
    fetchPublications,
    clearPublications,
  };
}

