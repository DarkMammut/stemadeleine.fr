import { useAxiosClient } from "@/utils/axiosClient";
import { useCallback } from "react";

/**
 * Hook dédié à la gestion des contenus d'un module Liste (List).
 * Contrairement aux contenus génériques (useContentOperations), les contenus
 * de liste ne sont pas versionnés et supportent un champ linkUrl (lien cliquable).
 */
export const useListContentOperations = () => {
  const axios = useAxiosClient();

  // Récupère les contenus d'une liste
  const getContents = useCallback(
    async (listId) => {
      try {
        const response = await axios.get(`/api/lists/${listId}/contents`);
        return response.data;
      } catch (error) {
        console.error("Error fetching list contents:", error);
        throw error;
      }
    },
    [axios],
  );

  // Création d'un contenu de liste
  const createContent = useCallback(
    async (listId, title = "Nouveau contenu") => {
      try {
        const response = await axios.post(`/api/lists/${listId}/contents`, {
          title,
        });
        return response.data;
      } catch (error) {
        console.error("Error creating list content:", error);
        throw error;
      }
    },
    [axios],
  );

  // Mise à jour d'un contenu de liste (titre, body, lien)
  const updateContent = useCallback(
    async (contentId, data) => {
      try {
        const response = await axios.put(
          `/api/lists/contents/${contentId}`,
          data,
        );
        return response.data;
      } catch (error) {
        console.error("Error updating list content:", error);
        throw error;
      }
    },
    [axios],
  );

  // Mise à jour de la visibilité d'un contenu de liste
  const updateContentVisibility = useCallback(
    async (contentId, isVisible) => {
      try {
        const response = await axios.put(
          `/api/lists/contents/${contentId}/visibility`,
          { isVisible },
        );
        return response.data;
      } catch (error) {
        console.error("Error updating list content visibility:", error);
        throw error;
      }
    },
    [axios],
  );

  // Suppression d'un contenu de liste
  const deleteContent = useCallback(
    async (contentId) => {
      try {
        await axios.delete(`/api/lists/contents/${contentId}`);
      } catch (error) {
        console.error("Error deleting list content:", error);
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
  };
};

export default useListContentOperations;
