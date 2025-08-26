"use client";

import { useCallback, useEffect, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export default function useGetPage({ route = "" } = {}) {
  const axios = useAxiosClient();

  const [page, setPage] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = "/api/pages";
      if (route) {
        url += `/${route}`;
      }

      const response = await axios.get(url);
      setPage(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [axios, route]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return { page, refetch: fetchPage, loading, error };
}
