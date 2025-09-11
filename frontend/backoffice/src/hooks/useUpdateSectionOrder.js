import { useAxiosClient } from "@/utils/axiosClient";
import { useCallback } from "react";

export default function useUpdateSectionOrder() {
  const axios = useAxiosClient();

  const updateSectionOrder = useCallback(
    async (pageId, treeData) => {
      try {
        await axios.put(`/api/sections/page/${pageId}/order`, treeData);
        console.log("Section order saved successfully");
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
