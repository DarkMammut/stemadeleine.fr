import { useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

/**
 * Hook dédié à la gestion des médias attachés à un contenu de liste (ListContent).
 * Chaque contenu de liste peut avoir ses propres médias, indépendamment
 * des autres contenus.
 */
export function useListContentMediasOperations() {
  const axios = useAxiosClient();
  const [mediaLoading, setMediaLoading] = useState(false);

  // Ajout d'un média à un contenu de liste
  const addMedia = async (contentId, media) => {
    const mediaId = typeof media === "string" ? media : media?.id;
    if (!mediaId)
      throw new Error("Le média sélectionné n'a pas d'identifiant valide.");
    setMediaLoading(true);
    try {
      const url = `/api/lists/contents/${contentId}/medias`;
      const response = await axios.post(
        url,
        { mediaId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (response.status < 200 || response.status >= 300)
        throw new Error("Erreur lors de l'attachement du média");
      return response.data;
    } catch (err) {
      console.error("Erreur lors de l'ajout du média:", err);
      throw err;
    } finally {
      setMediaLoading(false);
    }
  };

  // Suppression d'un média d'un contenu de liste
  const removeMedia = async (contentId, mediaId) => {
    setMediaLoading(true);
    try {
      const url = `/api/lists/contents/${contentId}/medias/${mediaId}`;
      const response = await axios.delete(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status < 200 || response.status >= 300)
        throw new Error("Erreur lors de la suppression du média");
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression du média:", err);
      throw err;
    } finally {
      setMediaLoading(false);
    }
  };

  return { addMedia, removeMedia, mediaLoading };
}

export default useListContentMediasOperations;
