import { useCallback, useEffect, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

/**
 * Hook pour récupérer les données complètes d'une liste (avec variant, contents, etc.)
 * Utilise l'endpoint spécifique /api/lists/by-module-id/{moduleId}
 */
export default function useGetList({ moduleId }) {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  const fetchList = useCallback(async () => {
    if (!moduleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get(
        `/api/lists/by-module-id/${moduleId}`,
      );
      setList(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération de la liste:", err);
      setError(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, axiosClient]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const refetch = () => {
    fetchList();
  };

  return {
    list,
    loading,
    error,
    refetch,
  };
}
