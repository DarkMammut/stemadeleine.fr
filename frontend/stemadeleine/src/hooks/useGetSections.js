'use client';

/* eslint-disable no-console */
import { useCallback, useState } from 'react';
import { useAxiosClient } from '@/utils/axiosClient';

const useGetSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  /**
   * Fetch sections for a specific page by pageId
   * @param {string} pageId - The business pageId (UUID)
   * @returns {Promise<Array>} - Array of sections
   */
  const fetchSectionsByPageId = useCallback(
    async (pageId) => {
      if (!pageId) {
        console.warn('useGetSections: pageId is required');
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching sections for pageId: ${pageId}`);

        const response = await axiosClient.get(
          `/api/public/pages/${pageId}/sections`,
        );

        const data = response.data;
        console.log(
          `Fetched ${data.length} sections for pageId: ${pageId}`,
          data,
        );

        setSections(data);
        return data;
      } catch (err) {
        let errorMessage;

        if (err.response?.status === 404) {
          console.warn(`No sections found for pageId: ${pageId}`);
          setSections([]);
          return [];
        }

        errorMessage = `Error fetching sections for pageId ${pageId}: ${err.message}`;
        console.error(errorMessage, err);
        setError(errorMessage);
        setSections([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [axiosClient],
  );

  /**
   * Clear sections state
   */
  const clearSections = useCallback(() => {
    setSections([]);
    setError(null);
  }, []);

  return {
    sections,
    loading,
    error,
    fetchSectionsByPageId,
    clearSections,
  };
};

export default useGetSections;
