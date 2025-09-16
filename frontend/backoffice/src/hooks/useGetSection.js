"use client";

import { useCallback, useEffect, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";
import { useParams } from "next/navigation";

export default function useGetSection({ sectionId }) {
  const axios = useAxiosClient();
  const params = useParams();
  const pageId = params.pageId;

  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSection = useCallback(async () => {
    if (!sectionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching section with ID:", sectionId);

      // Stratégie 1: Essayer l'endpoint direct
      try {
        const response = await axios.get(`/api/sections/${sectionId}`);
        console.log("Section response (direct):", response);
        setSection(response.data);
        return;
      } catch (directError) {
        console.warn(
          "Direct endpoint failed, trying fallback:",
          directError.response?.status,
        );

        // Stratégie 2: Fallback - récupérer via la page si on a le pageId
        if (pageId) {
          console.log("Trying fallback via page:", pageId);
          const pageResponse = await axios.get(`/api/pages/${pageId}/sections`);
          console.log("Page sections response:", pageResponse);

          const foundSection = pageResponse.data.sections?.find(
            (s) => s.sectionId === sectionId,
          );
          if (foundSection) {
            console.log("Found section via fallback:", foundSection);
            setSection(foundSection);
            return;
          } else {
            throw new Error("Section non trouvée dans la page");
          }
        } else {
          // Pas de pageId disponible, on ne peut pas faire le fallback
          throw directError;
        }
      }
    } catch (err) {
      console.error("Erreur lors de la récupération de la section :", err);
      console.error("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config,
      });

      // Améliorer la gestion d'erreur
      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        "Erreur inconnue";

      setError({
        ...err,
        message: errorMessage,
        status: err.response?.status,
      });
      setSection(null);
    } finally {
      setLoading(false);
    }
  }, [sectionId, pageId, axios]);

  useEffect(() => {
    fetchSection();
  }, [fetchSection]);

  const refetch = () => {
    fetchSection();
  };

  return { section, refetch, loading, error };
}
