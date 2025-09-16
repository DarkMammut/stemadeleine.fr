import {useAxiosClient} from "@/utils/axiosClient";
import {useCallback} from "react";

/**
 * Hook for managing newsletter publication operations
 * All API calls use PUT method for consistency
 */
export const useNewsletterOperations = () => {
  const axios = useAxiosClient();

  // Get all newsletter publications
  const getAllNewsletters = useCallback(async () => {
    try {
      const response = await axios.get("/api/newsletters");
      return response.data;
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      throw error;
    }
  }, [axios]);

  // Get newsletter publication by newsletterId (last version)
  const getNewsletter = useCallback(
    async (newsletterId) => {
      try {
        const response = await axios.get(
          `/api/newsletters/by-newsletter/${newsletterId}`,
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching newsletter:", error);
        throw error;
      }
    },
    [axios],
  );

  // Create new newsletter publication
  const createNewsletter = useCallback(
    async (newsletterData) => {
      try {
        const response = await axios.post("/api/newsletters", newsletterData);
        return response.data;
      } catch (error) {
        console.error("Error creating newsletter:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update newsletter publication
  const updateNewsletter = useCallback(
    async (id, newsletterData) => {
      try {
        const response = await axios.put(
          `/api/newsletters/${id}`,
          newsletterData,
        );
        return response.data;
      } catch (error) {
        console.error("Error updating newsletter:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update newsletter publication visibility by newsletterId
  const updateNewsletterVisibility = useCallback(
    async (newsletterId, isVisible) => {
      try {
        // First get the current newsletter to get its ID
        const newsletter = await getNewsletter(newsletterId);
        const response = await axios.put(
          `/api/newsletters/${newsletter.id}/visibility`,
          {
            isVisible,
          },
        );
        return response.data;
      } catch (error) {
        console.error("Error updating newsletter visibility:", error);
        throw error;
      }
    },
    [axios, getNewsletter],
  );

  // Set newsletter media
  const setNewsletterMedia = useCallback(
    async (id, mediaId) => {
      try {
        const response = await axios.put(`/api/newsletters/${id}/media`, {
          mediaId,
        });
        return response.data;
      } catch (error) {
        console.error("Error setting newsletter media:", error);
        throw error;
      }
    },
    [axios],
  );

  // Remove newsletter media
  const removeNewsletterMedia = useCallback(
    async (id) => {
      try {
        const response = await axios.delete(`/api/newsletters/${id}/media`);
        return response.data;
      } catch (error) {
        console.error("Error removing newsletter media:", error);
        throw error;
      }
    },
    [axios],
  );

  // Publish newsletter
  const publishNewsletter = useCallback(
    async (id) => {
      try {
        const response = await axios.put(`/api/newsletters/${id}/publish`);
        return response.data;
      } catch (error) {
        console.error("Error publishing newsletter:", error);
        throw error;
      }
    },
    [axios],
  );

  // Delete newsletter publication by newsletterId
  const deleteNewsletter = useCallback(
    async (newsletterId) => {
      try {
        // First get the current newsletter to get its ID
        const newsletter = await getNewsletter(newsletterId);
        await axios.delete(`/api/newsletters/${newsletter.id}`);
      } catch (error) {
        console.error("Error deleting newsletter:", error);
        throw error;
      }
    },
    [axios, getNewsletter],
  );

  return {
    getAllNewsletters,
    getNewsletter,
    createNewsletter,
    updateNewsletter,
    updateNewsletterVisibility,
    setNewsletterMedia,
    removeNewsletterMedia,
    publishNewsletter,
    deleteNewsletter,
  };
};
