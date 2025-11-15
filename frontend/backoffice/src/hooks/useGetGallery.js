import { useCallback, useEffect, useState } from 'react';
import { useAxiosClient } from '@/utils/axiosClient';

/**
 * Hook pour récupérer les données complètes d'une galerie (avec variant, etc.)
 * Utilise l'endpoint spécifique /api/galleries/by-module-id/{moduleId}
 */
export default function useGetGallery({ moduleId }) {
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  const fetchGallery = useCallback(async () => {
    if (!moduleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get(
        `/api/galleries/by-module-id/${moduleId}`,
      );
      setGallery(response.data);
    } catch (err) {
      console.error(
        "Erreur lors de la récupération de la galerie:",
        err?.response?.status,
      );
      setError(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, axiosClient]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const refetch = () => {
    fetchGallery();
  };

  return {
    gallery,
    loading,
    error,
    refetch,
  };
}
