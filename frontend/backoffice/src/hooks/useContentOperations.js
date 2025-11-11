import { useAxiosClient } from '@/utils/axiosClient';
import { useCallback } from 'react';

/**
 * Hook générique pour la gestion des contenus (section, module, newsletter-publication, etc.)
 * @param {Object} options - { parentType: "section" | "module" | "newsletter-publication" | etc. }
 */
export const useContentOperations = ({ parentType = "section" } = {}) => {
  const axios = useAxiosClient();

  // Génère le préfixe d'URL selon le type de parent
  const getApiPrefix = useCallback(
    (parentId) => {
      // Map des types de parents vers leurs routes API
      const routeMap = {
        section: `/api/sections/${parentId}/contents`,
        module: `/api/modules/${parentId}/contents`,
        "newsletter-publication": `/api/newsletter-publication/${parentId}/contents`,
        "news-publication": `/api/news-publications/${parentId}/contents`,
        news: `/api/news/${parentId}/contents`,
      };

      return routeMap[parentType] || `/api/${parentType}/${parentId}/contents`;
    },
    [parentType],
  );

  // Génère la route pour les opérations sur un contenu spécifique
  const getContentApiRoute = useCallback((contentId, operation = "") => {
    // Routes génériques pour les opérations sur contenus
    const baseRoute = `/api/content/${contentId}`;
    return operation ? `${baseRoute}/${operation}` : baseRoute;
  }, []);

  // Récupère les contenus pour un parent (section/module/newsletter/etc.)
  const getContents = useCallback(
    async (parentId) => {
      try {
        const response = await axios.get(getApiPrefix(parentId));
        // Déduplication par contentId/version
        return response.data.reduce((acc, content) => {
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
      } catch (error) {
        console.error("Error fetching contents:", error);
        throw error;
      }
    },
    [axios, getApiPrefix],
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
    [axios, getApiPrefix],
  );

  // Update content
  const updateContent = useCallback(
    async (contentId, data) => {
      try {
        let updatedContent = null;

        // Si on met à jour le titre
        if (data.title !== undefined) {
          const titleResponse = await axios.put(
            getContentApiRoute(contentId, "title"),
            { title: data.title },
          );
          updatedContent = titleResponse.data;
        }

        // Si on met à jour le body
        if (data.body !== undefined) {
          const bodyResponse = await axios.put(
            getContentApiRoute(contentId, "body"),
            { body: data.body },
          );
          updatedContent = bodyResponse.data;
        }

        return updatedContent;
      } catch (error) {
        console.error("Error updating content:", error);
        throw error;
      }
    },
    [axios, getContentApiRoute],
  );

  // Update content visibility
  const updateContentVisibility = useCallback(
    async (contentId, isVisible) => {
      try {
        const response = await axios.put(
          getContentApiRoute(contentId, "visibility"),
          { isVisible },
        );
        return response.data;
      } catch (error) {
        console.error("Error updating content visibility:", error);
        throw error;
      }
    },
    [axios, getContentApiRoute],
  );

  // Delete content
  const deleteContent = useCallback(
    async (contentId) => {
      try {
        await axios.delete(getContentApiRoute(contentId));
      } catch (error) {
        console.error("Error deleting content:", error);
        throw error;
      }
    },
    [axios, getContentApiRoute],
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
