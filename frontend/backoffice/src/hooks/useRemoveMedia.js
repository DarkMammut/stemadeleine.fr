import { useAxiosClient } from "@/utils/axiosClient";
import { useState } from "react";

export default function useRemoveMedia() {
  const axios = useAxiosClient();
  const [loading, setLoading] = useState(false);

  const removeMedia = async (
    entityType,
    entityId,
    { allowMultiple = false, mediaId = null } = {},
  ) => {
    setLoading(true);
    try {
      let url;
      if (allowMultiple && mediaId) {
        url = `/api/${entityType}/${entityId}/medias/${mediaId}`;
      } else {
        url = `/api/${entityType}/${entityId}/media`;
      }
      const response = await axios.delete(url);
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression du média de ${entityType}:`,
        error,
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { removeMedia, loading };
}
