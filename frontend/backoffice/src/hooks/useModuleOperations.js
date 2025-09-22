import { useCallback } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export function useModuleOperations() {
  const axios = useAxiosClient();

  // Update module
  const updateModule = useCallback(
    async (module, moduleData) => {
      try {
        const response = await axios.post(`/api/${module}/version`, moduleData);
        return response.data;
      } catch (error) {
        console.error("Error updating module:", error);
        throw error;
      }
    },
    [axios],
  );

  // Update module visibility
  const updateModuleVisibility = useCallback(
    async (moduleId, isVisible) => {
      try {
        // Envoyer le boolean avec les headers corrects pour Spring Boot
        const response = await axios.put(
          `/api/modules/${moduleId}/visibility`,
          isVisible, // Le boolean directement
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        return response.data;
      } catch (error) {
        console.error("Error updating module visibility:", error);
        throw error;
      }
    },
    [axios],
  );

  // Delete module
  const deleteModule = useCallback(
    async (moduleId) => {
      try {
        await axios.delete(`/api/modules/${moduleId}`);
      } catch (error) {
        console.error("Error deleting module:", error);
        throw error;
      }
    },
    [axios],
  );

  return {
    updateModule,
    updateModuleVisibility,
    deleteModule,
  };
}
