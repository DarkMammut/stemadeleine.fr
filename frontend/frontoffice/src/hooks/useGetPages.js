import { useCallback, useEffect, useState } from "react";
import { useAxiosClient } from "../utils/axiosClient";

const useGetPages = () => {
  const [pages, setPages] = useState([]);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get("/api/public/pages");
      setPages(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des pages",
      );
    } finally {
      setLoading(false);
    }
  }, [axiosClient]);

  const fetchPagesTree = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get("/api/public/pages/tree");
      setTree(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement de l'arbre des pages",
      );
    } finally {
      setLoading(false);
    }
  }, [axiosClient]);

  const fetchPageById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosClient.get(`/api/public/pages/${id}`);
        return response.data;
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement de la page",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [axiosClient],
  );

  const fetchPageBySlug = useCallback(
    async (slug) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosClient.get(
          `/api/public/pages/slug?slug=${encodeURIComponent(slug)}`,
        );
        return response.data;
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement de la page",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [axiosClient],
  );

  const searchPages = useCallback(
    async (query) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosClient.get(
          `/api/public/pages/search?query=${encodeURIComponent(query)}`,
        );
        return response.data;
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors de la recherche",
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    [axiosClient],
  );

  useEffect(() => {
    fetchPagesTree();
  }, [fetchPagesTree]);

  return {
    pages,
    tree,
    loading,
    error,
    fetchPages,
    fetchPagesTree,
    fetchPageById,
    fetchPageBySlug,
    searchPages,
  };
};

export default useGetPages;
