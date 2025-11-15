import { useAxiosClient } from "@/utils/axiosClient";
import { useCallback } from "react";

export default function useUpdateSectionOrder() {
  const axios = useAxiosClient();

  const updateSectionOrder = useCallback(
    async (pageId, treeData) => {
      try {
        // Extraire les IDs des sections dans l'ordre du treeData
        const sectionIds = treeData.map((section) => section.sectionId);
        await axios.put(`/api/sections/sort-order`, {
          pageId,
          sectionIds,
        });
        return true;
      } catch (error) {
        console.error("Error saving section order:", error);
        throw error;
      }
    },
    [axios],
  );

  return { updateSectionOrder };
}
