import { useCallback, useEffect, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export default function useGetModule({ moduleId }) {
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  const fetchModule = useCallback(async () => {
    if (!moduleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get(
        `/api/modules/by-module-id/${moduleId}`,
      );
      setModule(response.data);
    } catch (err) {
      console.error("Error fetching module:", err);
      setError(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, axiosClient]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  const refetch = () => {
    fetchModule();
  };

  return {
    module,
    loading,
    error,
    refetch,
  };
}
