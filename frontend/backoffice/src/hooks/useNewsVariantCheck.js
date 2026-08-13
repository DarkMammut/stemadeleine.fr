"use client";

import { useCallback } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

/**
 * Hook pour vérifier l'existence d'une actualité avec la variante ALL
 */
export default function useNewsVariantCheck() {
  const axios = useAxiosClient();

  const checkNewsWithVariantAll = useCallback(async () => {
    try {
      const response = await axios.get("/api/news/exists-with-variant-all");
      return response.data; // boolean
    } catch (error) {
      console.error("Erreur lors de la vérification de l'actualité avec variante ALL:", error);
      throw error;
    }
  }, [axios]);

  return { checkNewsWithVariantAll };
}

