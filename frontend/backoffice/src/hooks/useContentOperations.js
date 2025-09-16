import {useAxiosClient} from "@/utils/axiosClient";
import {useCallback} from "react";

/**
 * Hook for managing content operations within sections
 * All API calls use PUT method for consistency (except DELETE and GET)
 */
export const useContentOperations = () => {
  const axios = useAxiosClient();

  // Get contents for a specific section
  const getSectionContents = useCallback(
    async (sectionId) => {
      try {
        const response = await axios.get(`/api/sections/${sectionId}/contents`);

        // Remove duplicates based on contentId and keep only the latest version
        const uniqueContents = response.data.reduce((acc, content) => {
          const existingIndex = acc.findIndex(
            (c) => c.contentId === content.contentId,
          );
          if (existingIndex === -1) {
            // Content not found, add it
            acc.push(content);
          } else {
            // Content found, keep the one with higher version
            if (content.version > acc[existingIndex].version) {
              acc[existingIndex] = content;
            }
          }
          return acc;
        }, []);

        return uniqueContents;
      } catch (error) {
        console.error("Error fetching section contents:", error);
        throw error;
      }
    },
    [axios],
  );

  // Create new content for a section
  const createContent = useCallback(
    async (sectionId, title = "New Content") => {
      try {
        const response = await axios.post(
          `/api/sections/${sectionId}/contents`,
          {
            title,
          },
        );
        return response.data;
      } catch (error) {
        console.error("Error creating content:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update content (creates new version due to versioning system)
  const updateContent = useCallback(
    async (contentId, contentData) => {
      try {
        const response = await axios.put(
          `/api/sections/contents/${contentId}`,
          contentData,
        );
        return response.data;
      } catch (error) {
        console.error("Error updating content:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update content visibility
  const updateContentVisibility = useCallback(
    async (contentId, isVisible) => {
      try {
        const response = await axios.put(
          `/api/sections/contents/${contentId}/visibility`,
          {
            isVisible,
          },
        );
        return response.data;
      } catch (error) {
        console.error("Error updating content visibility:", error);
        throw error;
      }
    },
    [axios],
  );

  // Delete content
  const deleteContent = useCallback(
    async (contentId) => {
      try {
        await axios.delete(`/api/sections/contents/${contentId}`);
      } catch (error) {
        console.error("Error deleting content:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update contents sort order
  const updateContentsSortOrder = useCallback(
    async (ownerId, contentIds) => {
      try {
        const response = await axios.put(`/api/sections/contents/sort-order`, {
          ownerId,
          contentIds,
        });
        return response.data;
      } catch (error) {
        console.error("Error updating contents sort order:", error);
        throw error;
      }
    },
    [axios],
  );

  // Batch update multiple contents
  const batchUpdateContents = useCallback(
    async (updates) => {
      try {
        const promises = updates.map(({ contentId, contentData }) =>
          updateContent(contentId, contentData),
        );
        const results = await Promise.all(promises);
        return results;
      } catch (error) {
        console.error("Error batch updating contents:", error);
        throw error;
      }
    },
    [updateContent],
  );

  // Add media to content
  const addMediaToContent = useCallback(
    async (contentId, mediaId) => {
      try {
        const response = await axios.put(
          `/api/sections/contents/${contentId}/media`,
          {
            mediaId,
          },
        );
        return response.data;
      } catch (error) {
        console.error("Error adding media to content:", error);
        throw error;
      }
    },
    [axios],
  );

  // Remove media from content
  const removeMediaFromContent = useCallback(
    async (contentId, mediaId) => {
      try {
        const response = await axios.delete(
          `/api/sections/contents/${contentId}/media/${mediaId}`,
        );
        return response.data;
      } catch (error) {
        console.error("Error removing media from content:", error);
        throw error;
      }
    },
    [axios],
  );

  return {
    getSectionContents,
    createContent,
    updateContent,
    updateContentVisibility,
    deleteContent,
    updateContentsSortOrder,
    batchUpdateContents,
    addMediaToContent,
    removeMediaFromContent,
  };
};
