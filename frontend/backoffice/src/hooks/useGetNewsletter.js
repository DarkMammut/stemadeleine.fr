import { useCallback, useEffect, useState } from 'react';
import { useAxiosClient } from '@/utils/axiosClient';

/**
 * Hook pour récupérer les données complètes d'un article (avec variant.)
 * Utilise l'endpoint spécifique /api/articles/by-module-id/{moduleId}
 */
export default function useGetNewsletterletter({ moduleId }) {
  const [newsletter, setNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  const fetchNewsletter = useCallback(async () => {
    if (!moduleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get(
        `/api/newsletters/by-module-id/${moduleId}`,
      );
      setNewsletter(response.data);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération de l'actualité:", err);
      setError(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, axiosClient]);

  useEffect(() => {
    fetchNewsletter();
  }, [fetchNewsletter]);

  const refetch = () => {
    fetchNewsletter();
  };

  return {
    newsletter,
    loading,
    error,
    refetch,
  };
}
