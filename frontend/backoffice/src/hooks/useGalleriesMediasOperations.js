import { useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export function useGalleriesMediasOperations() {
  const axios = useAxiosClient();
  const [mediaLoading, setMediaLoading] = useState(false);

  // Ajout d'un média à un module (ou sous-module MediaAttachable)
  const addMedia = async (galleryId, media) => {
    const mediaId = typeof media === "string" ? media : media?.id;
    if (!mediaId)
      throw new Error("Le média sélectionné n'a pas d'identifiant valide.");
    setMediaLoading(true);
    try {
      const url = `/api/galleries/${galleryId}/medias`;
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
      // Log global pour tout problème JS ou réseau
      console.error("Erreur lors de l'ajout du média:", err);
      throw err;
    } finally {
      setMediaLoading(false);
    }
  };

  // Suppression d'un média d'un module
  const removeMedia = async (galleryId, mediaId) => {
    setMediaLoading(true);
    try {
      const url = `/api/galleries/${galleryId}/medias/${mediaId}`;
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
