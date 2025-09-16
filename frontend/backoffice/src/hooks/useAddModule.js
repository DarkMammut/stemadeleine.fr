import { useCallback } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export function useAddModule() {
  const axiosClient = useAxiosClient();

  const addModule = useCallback(
    async (moduleData) => {
      console.log("useAddModule: Starting API call with data:", moduleData);

      try {
        // Utiliser l'endpoint du backend: POST /api/modules avec la structure correcte
        const response = await axiosClient.post("/api/modules", {
          sectionId: moduleData.sectionId,
          name: moduleData.name,
          type: moduleData.type,
        });

        console.log("useAddModule: API call successful:", response.data);
        return response.data;
      } catch (error) {
        console.error("useAddModule: API call failed:", error);
        console.error("useAddModule: Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config,
        });
        throw error;
      }
    },
    [axiosClient],
  );

  const updateModule = useCallback(
    async (moduleId, moduleData) => {
      try {
        const response = await axiosClient.put(
          `/api/modules/${moduleId}`,
          moduleData,
        );
        return response.data;
      } catch (error) {
        console.error("Error updating module:", error);
        throw error;
      }
    },
    [axiosClient],
  );

  const deleteModule = useCallback(
    async (moduleId) => {
      try {
        await axiosClient.delete(`/api/modules/${moduleId}`);
      } catch (error) {
        console.error("Error deleting module:", error);
        throw error;
      }
    },
    [axiosClient],
  );

  return {
    addModule,
    updateModule,
    deleteModule,
  };
}

// Export par défaut aussi au cas où
export default useAddModule;
