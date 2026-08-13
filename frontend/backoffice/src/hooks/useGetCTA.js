import { useCallback, useEffect, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export default function useGetCTA({ moduleId }) {
  const [cta, setCta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  const fetchCTA = useCallback(async () => {
    if (!moduleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get(
        `/api/cta/by-module-id/${moduleId}`,
      );
      setCta(response.data);
    } catch (err) {
      console.error("Error fetching CTA:", err);
      setError(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, axiosClient]);

  useEffect(() => {
    fetchCTA();
  }, [fetchCTA]);

  return {
    cta,
    loading,
    error,
    refetch: fetchCTA,
  };
}
