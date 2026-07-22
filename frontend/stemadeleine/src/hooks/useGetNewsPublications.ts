import { useState, useCallback } from 'react';
import { NewsPublication } from '@/types/news';
import { useAxiosClient } from '@/utils/axiosClient';

export default function useGetNewsPublications() {
  const [publications, setPublications] = useState<NewsPublication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const axiosClient = useAxiosClient();

  const fetchPublications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosClient.get<NewsPublication[]>(
        '/api/public/modules/news/publications'
      );

      const data = response.data;
      setPublications(data);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { status?: number }; message?: string };
      const errorMessage = error?.response?.status === 404
        ? 'Aucune actualité trouvée'
        : error?.message || 'Une erreur est survenue';

      setError(errorMessage);
      console.error('Erreur lors de la récupération des actualités:', err);
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

