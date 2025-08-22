"use client";

import { useEffect, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export default function useGetPages({ route = "" } = {}) {
  const axios = useAxiosClient();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = "/api/pages";
        if (route) {
          url += `/${route}`;
        }

        const response = await axios.get(url);
        setPages(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [route]);

  return { pages, loading, error };
}
