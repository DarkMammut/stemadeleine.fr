import { useCallback, useEffect, useState } from 'react';
import { useAxiosClient } from '@/utils/axiosClient';

/**
 * Hook pour récupérer les données complètes d'un article (avec variant.)
 * Utilise l'endpoint spécifique /api/articles/by-module-id/{moduleId}
 */
export default function useGetNews({ moduleId }) {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  const fetchNews = useCallback(async () => {
    if (!moduleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get(
        `/api/news/by-module-id/${moduleId}`,
      );
      setNews(response.data);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération de l'actualité:", err);
      setError(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, axiosClient]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const refetch = () => {
    fetchNews();
  };

  return {
    news,
    loading,
    error,
    refetch,
  };
}
