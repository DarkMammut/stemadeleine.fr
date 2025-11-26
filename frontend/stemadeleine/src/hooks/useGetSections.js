'use client';

import { useCallback, useRef, useState } from 'react';
import { useAxiosClient } from '@/utils/axiosClient';

const useGetSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  // Keep track of the last pageId we fetched sections for to avoid repeated requests
  const lastFetchedPageId = useRef(null);

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

      // If we've already fetched for this pageId, return current sections to avoid duplicate fetches
      if (lastFetchedPageId.current === String(pageId)) {
        console.debug('useGetSections: already fetched sections for pageId', pageId);
        return sections;
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
        // Mark this pageId as fetched
        lastFetchedPageId.current = String(pageId);
        return data;
      } catch (err) {
        let errorMessage;

        if (err.response?.status === 404) {
          console.warn(`No sections found for pageId: ${pageId}`);
          setSections([]);
          // Mark as fetched to avoid retrying repeatedly
          lastFetchedPageId.current = String(pageId);
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
    // sections is read here; include axiosClient and sections in deps
    [axiosClient, sections],
  );

  /**
   * Clear sections state
   */
  const clearSections = useCallback(() => {
    setSections([]);
    setError(null);
    lastFetchedPageId.current = null;
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
