import { useCallback, useEffect, useState } from 'react';
import { useAxiosClient } from '@/utils/axiosClient';

/**
 * Hook pour récupérer les variantes de galerie disponibles depuis le backend
 * Transforme les valeurs d'enum en options pour un select
 */
export default function useGalleryVariants() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  const fetchVariants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get("/api/galleries/variants");

      // Transformer les variantes en options pour le select
      const options = response.data.map((variant) => ({
        value: variant,
        label: formatVariantLabel(variant),
      }));

      setVariants(options);
    } catch (err) {
      console.error("Erreur lors de la récupération des variantes:", err);
      setError(err.response?.data || err);
      // Fallback sur des valeurs par défaut en cas d'erreur
      setVariants([
        { value: "GRID", label: "Grille" },
        { value: "SLIDER", label: "Slider" },
        { value: "CAROUSEL", label: "Carrousel" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [axiosClient]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  return {
    variants,
    loading,
    error,
    refetch: fetchVariants,
  };
}

/**
 * Formate le nom de la variante pour l'affichage
 * GRID -> Grille
 * SLIDER -> Slider
 * CAROUSEL -> Carrousel
 */
function formatVariantLabel(variant) {
  const labels = {
    GRID: "Grille",
    SLIDER: "Slider",
    CAROUSEL: "Carrousel",
  };

  return labels[variant] || variant;
}
