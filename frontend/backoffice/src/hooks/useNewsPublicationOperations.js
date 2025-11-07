import { useAxiosClient } from '@/utils/axiosClient';
import { useCallback } from 'react';

/**
 * Hook for managing news publication operations
 * Handles NewsPublication entities (actual news instances)
 * Endpoint: /api/news-publications
 */
export const useNewsPublicationOperations = () => {
  const axios = useAxiosClient();

  // Get all news publications
  const getAllNewsPublications = useCallback(async () => {
    try {
      const response = await axios.get("/api/news-publications");
      return response.data;
    } catch (error) {
      console.error("Error fetching news publications:", error);
      throw error;
    }
  }, [axios]);

  // Get news publication by ID
  const getNewsPublicationById = useCallback(
    async (id) => {
      try {
        const response = await axios.get(`/api/news-publications/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching news publication:", error);
        throw error;
      }
    },
    [axios],
  );

  // Get news publication by news ID (module)
  const getNewsPublicationByNewsId = useCallback(
    async (newsId) => {
      try {
        const response = await axios.get(
          `/api/news-publications/news/${newsId}`,
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching news publication by news ID:", error);
        throw error;
      }
    },
    [axios],
  );

  // Get published news (public)
  const getPublishedNews = useCallback(async () => {
    try {
      const response = await axios.get("/api/news-publications/public");
      return response.data;
    } catch (error) {
      console.error("Error fetching published news:", error);
      throw error;
    }
  }, [axios]);

  // Create new news publication
  const createNewsPublication = useCallback(
    async (publicationData) => {
      try {
        const response = await axios.post(
          "/api/news-publications",
          publicationData,
        );
        return response.data;
      } catch (error) {
        console.error("Error creating news publication:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update news publication
  const updateNewsPublication = useCallback(
    async (id, publicationData) => {
      try {
        const response = await axios.put(
          `/api/news-publications/${id}`,
          publicationData,
        );
        return response.data;
      } catch (error) {
        console.error("Error updating news publication:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update news publication visibility
  const updateNewsPublicationVisibility = useCallback(
    async (id, isVisible) => {
      try {
        const response = await axios.put(
          `/api/news-publications/${id}/visibility`,
          { isVisible },
        );
        return response.data;
      } catch (error) {
        console.error("Error updating news publication visibility:", error);
        throw error;
      }
    },
    [axios],
  );

  // Set media for news publication
  const setNewsPublicationMedia = useCallback(
    async (id, mediaId) => {
      try {
        const response = await axios.put(`/api/news-publications/${id}/media`, {
          mediaId,
        });
        return response.data;
      } catch (error) {
        console.error("Error setting news publication media:", error);
        throw error;
      }
    },
    [axios],
  );

  // Remove media from news publication
  const removeNewsPublicationMedia = useCallback(
    async (id) => {
      try {
        const response = await axios.delete(
          `/api/news-publications/${id}/media`,
        );
        return response.data;
      } catch (error) {
        console.error("Error removing news publication media:", error);
        throw error;
      }
    },
    [axios],
  );

  // Publish news publication
  const publishNewsPublication = useCallback(
    async (id) => {
      try {
        const response = await axios.put(
          `/api/news-publications/${id}/publish`,
        );
        return response.data;
      } catch (error) {
        console.error("Error publishing news publication:", error);
        throw error;
      }
    },
    [axios],
  );

  // Delete news publication (soft delete)
  const deleteNewsPublication = useCallback(
    async (id) => {
      try {
        await axios.delete(`/api/news-publications/${id}`);
      } catch (error) {
        console.error("Error deleting news publication:", error);
        throw error;
      }
    },
    [axios],
  );

  // Create news content
  const createNewsContent = useCallback(
    async (newsId, title = "New News Content") => {
      try {
        const response = await axios.post(
          `/api/news-publications/${newsId}/contents`,
          { title },
        );
        return response.data;
      } catch (error) {
        console.error("Error creating news content:", error);
        throw error;
      }
    },
    [axios],
  );

  return {
    getAllNewsPublications,
    getNewsPublicationById,
    getNewsPublicationByNewsId,
    getPublishedNews,
    createNewsPublication,
    updateNewsPublication,
    updateNewsPublicationVisibility,
    setNewsPublicationMedia,
    removeNewsPublicationMedia,
    publishNewsPublication,
    deleteNewsPublication,
    createNewsContent,
  };
};
