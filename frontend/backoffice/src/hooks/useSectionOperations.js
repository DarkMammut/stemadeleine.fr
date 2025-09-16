import {useAxiosClient} from "@/utils/axiosClient";
import {useCallback} from "react";

/**
 * Hook for managing section operations
 * All API calls use PUT method for consistency
 */
export const useSectionOperations = () => {
  const axios = useAxiosClient();

  // Update section visibility
  const updateSectionVisibility = useCallback(
    async (sectionId, isVisible) => {
      try {
        const response = await axios.put(
          `/api/sections/${sectionId}/visibility`,
          {
            isVisible,
          },
        );
        return response.data;
      } catch (error) {
        console.error("Error updating section visibility:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update section basic information
  const updateSection = useCallback(
    async (sectionId, sectionData) => {
      try {
        const response = await axios.put(
          `/api/sections/${sectionId}`,
          sectionData,
        );
        return response.data;
      } catch (error) {
        console.error("Error updating section:", error);
        throw error;
      }
    },
    [axios],
  );

  // Set section media
  const setSectionMedia = useCallback(
    async (sectionId, mediaId) => {
      try {
        const response = await axios.put(`/api/sections/${sectionId}/media`, {
          mediaId,
        });
        return response.data;
      } catch (error) {
        console.error("Error setting section media:", error);
        throw error;
      }
    },
    [axios],
  );

  // Remove section media
  const removeSectionMedia = useCallback(
    async (sectionId) => {
      try {
        const response = await axios.delete(`/api/sections/${sectionId}/media`);
        return response.data;
      } catch (error) {
        console.error("Error removing section media:", error);
        throw error;
      }
    },
    [axios],
  );

  // Get section by ID
  const getSection = useCallback(
    async (sectionId) => {
      try {
        const response = await axios.get(`/api/sections/${sectionId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching section:", error);
        throw error;
      }
    },
    [axios],
  );

  // Delete section
  const deleteSection = useCallback(
    async (sectionId) => {
      try {
        await axios.delete(`/api/sections/${sectionId}`);
      } catch (error) {
        console.error("Error deleting section:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update sections sort order
  const updateSectionsSortOrder = useCallback(
    async (pageId, sectionIds) => {
      try {
        const response = await axios.put(`/api/sections/sort-order`, {
          pageId,
          sectionIds,
        });
        return response.data;
      } catch (error) {
        console.error("Error updating sections sort order:", error);
        throw error;
      }
    },
    [axios],
  );

  return {
    updateSectionVisibility,
    updateSection,
    setSectionMedia,
    removeSectionMedia,
    getSection,
    deleteSection,
    updateSectionsSortOrder,
  };
};
