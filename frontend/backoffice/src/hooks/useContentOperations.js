import {useAxiosClient} from "@/utils/axiosClient";
import {useCallback} from "react";

/**
 * Hook générique pour la gestion des contenus (section, module, ...)
 * @param {Object} options - { parentType: "section" | "module" }
 */
export const useContentOperations = ({ parentType = "section" } = {}) => {
  const axios = useAxiosClient();

  // Génère le préfixe d'URL selon le type de parent
  const getApiPrefix = (parentId) => {
    if (parentType === "module") return `/api/modules/${parentId}/contents`;
    return `/api/sections/${parentId}/contents`;
  };

  // Récupère les contenus pour un parent (section/module)
  const getContents = useCallback(
    async (parentId) => {
      try {
        const response = await axios.get(getApiPrefix(parentId));
        // Déduplication par contentId/version
        const uniqueContents = response.data.reduce((acc, content) => {
          const existingIndex = acc.findIndex(
            (c) => c.contentId === content.contentId,
          );
          if (existingIndex === -1) {
            acc.push(content);
          } else {
            if (content.version > acc[existingIndex].version) {
              acc[existingIndex] = content;
            }
          }
          return acc;
        }, []);
        return uniqueContents;
      } catch (error) {
        console.error("Error fetching contents:", error);
        throw error;
      }
    },
    [axios],
  );

  // Création d'un contenu
  const createContent = useCallback(
    async (parentId, title = "Nouveau contenu") => {
      try {
        const response = await axios.post(getApiPrefix(parentId), { title });
        return response.data;
      } catch (error) {
        console.error("Error creating content:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update content
  const updateContent = useCallback(
    async (contentId, data) => {
      try {
        const response = await axios.put(
          `/api/sections/contents/${contentId}`,
          data,
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
          { isVisible },
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

  // Media operations (POST sur /api/content-media avec clé composite)
  const addMediaToContent = useCallback(
    async (contentId, mediaId) => {
      try {
        const response = await axios.post(`/api/content-media`, {
          id: {
            contentId: contentId,
            mediaId: mediaId,
          },
          content: { id: contentId },
          media: { id: mediaId },
        });
        return response.data;
      } catch (error) {
        console.error("Error adding media to content:", error);
        throw error;
      }
    },
    [axios],
  );

  const removeMediaFromContent = useCallback(
    async (contentId, mediaId) => {
      try {
        const response = await axios.delete(
          `/api/content-media/${contentId}/medias/${mediaId}`,
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
    getContents,
    createContent,
    updateContent,
    updateContentVisibility,
    deleteContent,
    addMediaToContent,
    removeMediaFromContent,
  };
};
