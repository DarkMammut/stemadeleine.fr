/* eslint-disable no-console */
import { useCallback, useState } from 'react';
import { useAxiosClient } from '@/utils/axiosClient';

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
        console.warn('useGetModules: sectionId is required');
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

  // -----------------------------------------------------------------------
  // New: fetch article by moduleId
  // Utilise l'endpoint défini dans ModulePublicController:
  // GET /api/public/modules/article/by-module-id/{moduleId}
  // -----------------------------------------------------------------------

  const [article, setArticle] = useState(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [articleError, setArticleError] = useState(null);

  /**
   * Fetch latest article (version) by moduleId
   * @param {string} moduleId - UUID of the module
   * @returns {Promise<Object|null>} - article DTO or null if not found/error
   */
  const fetchArticleByModuleId = useCallback(
    async (moduleId) => {
      if (!moduleId) {
        console.warn('useGetModules: moduleId is required to fetch article');
        return null;
      }

      setArticleLoading(true);
      setArticleError(null);

      try {
        console.log(`Fetching article for moduleId: ${moduleId}`);

        const response = await axiosClient.get(
          `/api/public/modules/article/by-module-id/${moduleId}`,
        );

        const data = response.data;
        console.log(`Fetched article for moduleId: ${moduleId}`, data);

        setArticle(data);
        return data;
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn(`No article found for moduleId: ${moduleId}`);
          setArticle(null);
          return null;
        }

        const errorMessage = `Error fetching article for moduleId ${moduleId}: ${err.message}`;
        console.error(errorMessage, err);
        setArticleError(errorMessage);
        setArticle(null);
        return null;
      } finally {
        setArticleLoading(false);
      }
    },
    [axiosClient],
  );

  const clearArticle = useCallback(() => {
    setArticle(null);
    setArticleError(null);
  }, []);

  // -----------------------------------------------------------------------
  // New: fetch gallery by moduleId
  // Utilise l'endpoint défini dans ModulePublicController:
  // GET /api/public/modules/gallery/by-module-id/{moduleId}
  // -----------------------------------------------------------------------

  const [gallery, setGallery] = useState(null);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState(null);

  /**
   * Fetch latest gallery (version) by moduleId
   * @param {string} moduleId - UUID of the module
   * @returns {Promise<Object|null>} - gallery DTO or null if not found/error
   */
  const fetchGalleryByModuleId = useCallback(
    async (moduleId) => {
      if (!moduleId) {
        console.warn('useGetModules: moduleId is required to fetch article');
        return null;
      }

      setGalleryLoading(true);
      setGalleryError(null);

      try {
        console.log(`Fetching article for moduleId: ${moduleId}`);

        const response = await axiosClient.get(
          `/api/public/modules/gallery/by-module-id/${moduleId}`,
        );

        const data = response.data;
        console.log(`Fetched gallery for moduleId: ${moduleId}`, data);

        setGallery(data);
        return data;
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn(`No article found for moduleId: ${moduleId}`);
          setGallery(null);
          return null;
        }

        const errorMessage = `Error fetching gallery for moduleId ${moduleId}: ${err.message}`;
        console.error(errorMessage, err);
        setGalleryError(errorMessage);
        setGallery(null);
        return null;
      } finally {
        setGalleryLoading(false);
      }
    },
    [axiosClient],
  );

  const clearGallery = useCallback(() => {
    setGallery(null);
    setGalleryError(null);
  }, []);

  return {
    modules,
    loading,
    error,
    fetchModulesBySectionId,
    clearModules,
    // article helpers
    article,
    articleLoading,
    articleError,
    fetchArticleByModuleId,
    clearArticle,
    // gallery helpers
    gallery,
    galleryLoading,
    galleryError,
    fetchGalleryByModuleId,
    clearGallery,
  };
};

export default useGetModules;
