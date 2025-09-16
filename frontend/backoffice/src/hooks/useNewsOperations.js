import {useAxiosClient} from "@/utils/axiosClient";
import {useCallback} from "react";

/**
 * Hook for managing news publication operations
 * All API calls use PUT method for consistency
 */
export const useNewsOperations = () => {
  const axios = useAxiosClient();

  // Get all news publications
  const getAllNews = useCallback(async () => {
    try {
      const response = await axios.get("/api/news-publications");
      return response.data;
    } catch (error) {
      console.error("Error fetching news:", error);
      throw error;
    }
  }, [axios]);

  // Get news publication by newsId (last version)
  const getNews = useCallback(
    async (newsId) => {
      try {
        const response = await axios.get(
          `/api/news-publications/by-news/${newsId}`,
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching news:", error);
        throw error;
      }
    },
    [axios],
  );

  // Create new news publication
  const createNews = useCallback(
    async (newsData) => {
      try {
        const response = await axios.post("/api/news-publications", newsData);
        return response.data;
      } catch (error) {
        console.error("Error creating news:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update news publication
  const updateNews = useCallback(
    async (id, newsData) => {
      try {
        const response = await axios.put(
          `/api/news-publications/${id}`,
          newsData,
        );
        return response.data;
      } catch (error) {
        console.error("Error updating news:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update news publication visibility by newsId
  const updateNewsVisibility = useCallback(
    async (newsId, isVisible) => {
      try {
        // First get the current news to get its ID
        const news = await getNews(newsId);
        const response = await axios.put(
          `/api/news-publications/${news.id}/visibility`,
          {
            isVisible,
          },
        );
        return response.data;
      } catch (error) {
        console.error("Error updating news visibility:", error);
        throw error;
      }
    },
    [axios, getNews],
  );

  // Set news media
  const setNewsMedia = useCallback(
    async (id, mediaId) => {
      try {
        const response = await axios.put(`/api/news-publications/${id}/media`, {
          mediaId,
        });
        return response.data;
      } catch (error) {
        console.error("Error setting news media:", error);
        throw error;
      }
    },
    [axios],
  );

  // Remove news media
  const removeNewsMedia = useCallback(
    async (id) => {
      try {
        const response = await axios.delete(
          `/api/news-publications/${id}/media`,
        );
        return response.data;
      } catch (error) {
        console.error("Error removing news media:", error);
        throw error;
      }
    },
    [axios],
  );

  // Publish news
  const publishNews = useCallback(
    async (id) => {
      try {
        const response = await axios.put(
          `/api/news-publications/${id}/publish`,
        );
        return response.data;
      } catch (error) {
        console.error("Error publishing news:", error);
        throw error;
      }
    },
    [axios],
  );

  // Delete news publication by newsId
  const deleteNews = useCallback(
    async (newsId) => {
      try {
        // First get the current news to get its ID
        const news = await getNews(newsId);
        await axios.delete(`/api/news-publications/${news.id}`);
      } catch (error) {
        console.error("Error deleting news:", error);
        throw error;
      }
    },
    [axios, getNews],
  );

  return {
    getAllNews,
    getNews,
    createNews,
    updateNews,
    updateNewsVisibility,
    setNewsMedia,
    removeNewsMedia,
    publishNews,
    deleteNews,
  };
};
