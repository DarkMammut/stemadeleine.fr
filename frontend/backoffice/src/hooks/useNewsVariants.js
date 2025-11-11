import { useEffect, useState } from 'react';
import { useAxiosClient } from '@/utils/axiosClient';

/**
 * Hook pour récupérer les variantes de news disponibles depuis le backend
 */
export default function useNewsVariants() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoading(true);
        console.log("🔍 Récupération des variantes de news depuis le backend");
        const response = await axiosClient.get("/api/news/variants");
        console.log("📥 Variantes récupérées:", response.data);

        // Transformer en format compatible avec MyForm (options de select)
        const formattedVariants = response.data.map((variant) => ({
          value: variant,
          label: variant, // Vous pouvez ajouter une traduction ici si nécessaire
        }));

        setVariants(formattedVariants);
      } catch (err) {
        console.error("❌ Erreur lors de la récupération des variantes:", err);
        setError(err);
        // Fallback vers des variantes par défaut en cas d'erreur
        setVariants([
          { value: "LAST", label: "LAST" },
          { value: "LAST3", label: "LAST3" },
          { value: "LAST5", label: "LAST5" },
          { value: "ALL", label: "ALL" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [axiosClient]);

  return {
    variants,
    loading,
    error,
  };
}
