import { useCallback, useEffect, useState } from 'react';
import { useAxiosClient } from '@/utils/axiosClient';

/**
 * Hook pour récupérer les données complètes d'un article (avec variant, writer, writingDate, etc.)
 * Utilise l'endpoint spécifique /api/articles/by-module-id/{moduleId}
 */
export default function useGetArticle({ moduleId }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  const fetchArticle = useCallback(async () => {
    if (!moduleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get(
        `/api/articles/by-module-id/${moduleId}`,
      );
      setArticle(response.data);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération de l'article:", err);
      setError(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, axiosClient]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const refetch = () => {
    fetchArticle();
  };

  return {
    article,
    loading,
    error,
    refetch,
  };
}
