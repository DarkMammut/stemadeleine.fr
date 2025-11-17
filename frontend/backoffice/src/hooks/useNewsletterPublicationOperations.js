import { useAxiosClient } from '@/utils/axiosClient';
import { useCallback } from 'react';

/**
 * Hook for managing newsletter publication operations
 * Handles NewsletterPublication entities (actual newsletter instances)
 * Endpoint: /api/newsletter-publication
 */
export const useNewsletterPublicationOperations = () => {
  const axios = useAxiosClient();

  // Get all newsletter publications (paginated)
  const getAllNewsletterPublications = useCallback(
    async (page = 0, size = 20, options = {}) => {
      try {
        const config = {};
        if (options.signal) config.signal = options.signal;
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("size", String(size));
        if (options.search) params.set("search", options.search);
        if (options.sortField) {
          // Build Spring Data 'sort' param (e.g. sort=createdAt,desc)
          const dir = options.sortDir || "asc";
          params.set("sort", `${options.sortField},${dir}`);
        }
        if (typeof options.isPublished !== "undefined") {
          params.set("published", String(options.isPublished));
        }

        const response = await axios.get(
          `/api/newsletter-publication?${params.toString()}`,
          config,
        );
        return response.data;
      } catch (error) {
        // If request was cancelled, let the caller handle it without logging
        if (error?.name === "CanceledError" || error?.message === "canceled") {
          throw error;
        }
        console.error("Error fetching newsletter publications:", error);
        throw error;
      }
    },
    [axios],
  );

  // Get newsletter publication by ID
  const getNewsletterPublicationById = useCallback(
    async (id) => {
      try {
        const response = await axios.get(`/api/newsletter-publication/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching newsletter publication:", error);
        throw error;
      }
    },
    [axios],
  );

  // Get newsletter publication by newsletter ID (module)
  const getNewsletterPublicationByNewsletterId = useCallback(
    async (newsletterId) => {
      try {
        const response = await axios.get(
          `/api/newsletter-publication/newsletter/${newsletterId}`,
        );
        return response.data;
      } catch (error) {
        console.error(
          "Error fetching newsletter publication by newsletter ID:",
          error,
        );
        throw error;
      }
    },
    [axios],
  );

  // Get published newsletters (public) - paginated
  const getPublishedNewsletters = useCallback(
    async (page = 0, size = 10) => {
      try {
        const response = await axios.get(
          `/api/newsletter-publication/public?page=${page}&size=${size}`,
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching published newsletters:", error);
        throw error;
      }
    },
    [axios],
  );

  // Create new newsletter publication
  const createNewsletterPublication = useCallback(
    async (publicationData) => {
      try {
        const response = await axios.post(
          "/api/newsletter-publication",
          publicationData,
        );
        return response.data;
      } catch (error) {
        console.error("Error creating newsletter publication:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update newsletter publication
  const updateNewsletterPublication = useCallback(
    async (id, publicationData) => {
      try {
        const response = await axios.put(
          `/api/newsletter-publication/${id}`,
          publicationData,
        );
        return response.data;
      } catch (error) {
        console.error("Error updating newsletter publication:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update newsletter publication visibility
  const updateNewsletterPublicationVisibility = useCallback(
    async (id, isVisible) => {
      try {
        const response = await axios.put(
          `/api/newsletter-publication/${id}/visibility`,
          { isVisible },
        );
        return response.data;
      } catch (error) {
        console.error(
          "Error updating newsletter publication visibility:",
          error,
        );
        throw error;
      }
    },
    [axios],
  );

  // Set media for newsletter publication
  const setNewsletterPublicationMedia = useCallback(
    async (id, mediaId) => {
      try {
        const response = await axios.put(
          `/api/newsletter-publication/${id}/media`,
          { mediaId },
        );
        return response.data;
      } catch (error) {
        console.error("Error setting newsletter publication media:", error);
        throw error;
      }
    },
    [axios],
  );

  // Remove media from newsletter publication
  const removeNewsletterPublicationMedia = useCallback(
    async (id) => {
      try {
        const response = await axios.delete(
          `/api/newsletter-publication/${id}/media`,
        );
        return response.data;
      } catch (error) {
        console.error("Error removing newsletter publication media:", error);
        throw error;
      }
    },
    [axios],
  );

  // Publish newsletter publication
  const publishNewsletterPublication = useCallback(
    async (id) => {
      try {
        const response = await axios.put(
          `/api/newsletter-publication/${id}/publish`,
        );
        return response.data;
      } catch (error) {
        console.error("Error publishing newsletter publication:", error);
        throw error;
      }
    },
    [axios],
  );

  // Delete newsletter publication (soft delete)
  const deleteNewsletterPublication = useCallback(
    async (id) => {
      try {
        await axios.delete(`/api/newsletter-publication/${id}`);
      } catch (error) {
        console.error("Error deleting newsletter publication:", error);
        throw error;
      }
    },
    [axios],
  );

  // Create newsletter content
  const createNewsletterContent = useCallback(
    async (newsletterId, title = "New Newsletter Content") => {
      try {
        const response = await axios.post(
          `/api/newsletter-publication/${newsletterId}/contents`,
          { title },
        );
        return response.data;
      } catch (error) {
        console.error("Error creating newsletter content:", error);
        throw error;
      }
    },
    [axios],
  );

  return {
    getAllNewsletterPublications,
    getNewsletterPublicationById,
    getNewsletterPublicationByNewsletterId,
    getPublishedNewsletters,
    createNewsletterPublication,
    updateNewsletterPublication,
    updateNewsletterPublicationVisibility,
    setNewsletterPublicationMedia,
    removeNewsletterPublicationMedia,
    publishNewsletterPublication,
    deleteNewsletterPublication,
    createNewsletterContent,
  };
};
