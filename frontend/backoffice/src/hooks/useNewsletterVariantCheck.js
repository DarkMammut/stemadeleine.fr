"use client";

import { useCallback } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

/**
 * Hook pour vérifier l'existence d'une newsletter avec la variante ALL
 */
export default function useNewsletterVariantCheck() {
  const axios = useAxiosClient();

  const checkNewsletterWithVariantAll = useCallback(async () => {
    try {
      const response = await axios.get("/api/newsletters/exists-with-variant-all");
      return response.data; // boolean
    } catch (error) {
      console.error("Erreur lors de la vérification de la newsletter avec variante ALL:", error);
      throw error;
    }
  }, [axios]);

  return { checkNewsletterWithVariantAll };
}

