import { useAxiosClient } from "@/utils/axiosClient";
import { useCallback } from "react";

export default function useUpdatePageOrder() {
  const axios = useAxiosClient();

  const updatePageOrder = useCallback(
    async (treeData) => {
      try {
        await axios.put("/api/pages/tree", treeData);
        console.log("Page order saved successfully");
        return true;
      } catch (error) {
        console.error("Error saving page order:", error);
        throw error;
      }
    },
    [axios],
  );

  return { updatePageOrder };
}
