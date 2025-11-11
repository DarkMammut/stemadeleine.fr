import { useCallback, useEffect, useState } from 'react';
import { useAxiosClient } from '@/utils/axiosClient';

/**
 * Hook pour récupérer les variantes d'article disponibles depuis le backend
 * Transforme les valeurs d'enum en options pour un select
 */
export default function useArticleVariants() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  const fetchVariants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get("/api/articles/variants");

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
        { value: "STAGGERED", label: "Affichage décalé" },
        { value: "LEFT", label: "Aligné à gauche" },
        { value: "RIGHT", label: "Aligné à droite" },
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
 * STAGGERED -> Affichage décalé
 * LEFT -> Aligné à gauche
 * RIGHT -> Aligné à droite
 */
function formatVariantLabel(variant) {
  const labels = {
    STAGGERED: "Affichage décalé",
    LEFT: "Aligné à gauche",
    RIGHT: "Aligné à droite",
  };

  return labels[variant] || variant;
}
