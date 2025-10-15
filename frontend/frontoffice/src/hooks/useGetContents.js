/* eslint-disable no-console */
import { useCallback, useState } from 'react';
import { useAxiosClient } from '../utils/axiosClient';

const useGetContents = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  /**
   * Fetch published and visible contents by ownerId (sectionId, moduleId, etc.)
   * @param {string} ownerId - The owner ID (UUID) - could be sectionId, moduleId, etc.
   * @returns {Promise<Array>} - Array of published contents
   */
  const fetchContentsByOwnerId = useCallback(
    async (ownerId) => {
      if (!ownerId) {
        console.warn("useGetContents: ownerId is required");
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching contents for ownerId: ${ownerId}`);

        const response = await axiosClient.get(
          `/api/public/contents/${ownerId}`,
        );

        const data = response.data;
        console.log(
          `Fetched ${data.length} published contents for ownerId: ${ownerId}`,
          data,
        );

        setContents(data);
        return data;
      } catch (err) {
        let errorMessage;

        if (err.response?.status === 404) {
          console.warn(`No contents found for ownerId: ${ownerId}`);
          setContents([]);
          return [];
        }

        errorMessage = `Error fetching contents for ownerId ${ownerId}: ${err.message}`;
        console.error(errorMessage, err);
        setError(errorMessage);
        setContents([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [axiosClient],
  );

  /**
   * Clear contents state
   */
  const clearContents = useCallback(() => {
    setContents([]);
    setError(null);
  }, []);

  return {
    contents,
    loading,
    error,
    fetchContentsByOwnerId,
    clearContents,
  };
};

export default useGetContents;
