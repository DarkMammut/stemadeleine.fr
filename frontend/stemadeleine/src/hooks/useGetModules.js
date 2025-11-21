/* eslint-disable no-console */
import { useCallback, useState } from 'react';
import { useAxiosClient } from '../utils/axiosClient';

const useGetModules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();

  /**
   * Fetch published and visible modules by sectionId
   * @param {string} sectionId - The section ID (UUID)
   * @returns {Promise<Array>} - Array of published modules with inherited data
   */
  const fetchModulesBySectionId = useCallback(
    async (sectionId) => {
      if (!sectionId) {
        console.warn("useGetModules: sectionId is required");
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching modules for sectionId: ${sectionId}`);

        const response = await axiosClient.get(
          `/api/public/sections/${sectionId}/modules`,
        );

        const data = response.data;
        console.log(
          `Fetched ${data.length} published modules for sectionId: ${sectionId}`,
          data,
        );

        setModules(data);
        return data;
      } catch (err) {
        let errorMessage;

        if (err.response?.status === 404) {
          console.warn(`No modules found for sectionId: ${sectionId}`);
          setModules([]);
          return [];
        }

        errorMessage = `Error fetching modules for sectionId ${sectionId}: ${err.message}`;
        console.error(errorMessage, err);
        setError(errorMessage);
        setModules([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [axiosClient],
  );

  /**
   * Clear modules data
   */
  const clearModules = useCallback(() => {
    setModules([]);
    setError(null);
  }, []);

  return {
    modules,
    loading,
    error,
    fetchModulesBySectionId,
    clearModules,
  };
};

export default useGetModules;
