"use client";

import { useAxiosClient } from "@/utils/axiosClient";

export default function useAddPage() {
  const axios = useAxiosClient();

  const createPage = async (pageData) => {
    try {
      const response = await axios.post("/api/pages", pageData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la page :", error);
      throw error;
    }
  };
  const updatePage = async (pageId, pageData) => {
    try {
      const response = await axios.post(
        `/api/pages/${pageId}/version`,
        pageData,
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la page :", error);
      throw error;
    }
  };

  return { createPage, updatePage };
}
