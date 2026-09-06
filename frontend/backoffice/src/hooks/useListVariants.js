import { useCallback, useEffect, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

/**
 * Hook pour récupérer les variantes de liste disponibles depuis le backend
 * Transforme les valeurs d'enum en options pour un select
 */
export default function useListVariants() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  const fetchVariants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get("/api/lists/variants");

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
        { value: "CARD", label: "Cartes" },
        { value: "BULLET", label: "Liste à puces" },
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
 * CARD -> Cartes
 * BULLET -> Liste à puces
 */
function formatVariantLabel(variant) {
  const labels = {
    CARD: "Cartes",
    BULLET: "Liste à puces",
  };

  return labels[variant] || variant;
}
