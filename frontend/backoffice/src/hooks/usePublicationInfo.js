"use client";

import { useCallback, useEffect, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

/**
 * Versions DRAFT / PUBLISHED d'un élément versionné et réinitialisation du draft.
 * @param {"pages"|"sections"|"modules"} resource
 * @param {string} id - identifiant logique (pageId, sectionId, moduleId)
 */
export default function usePublicationInfo(resource, id) {
  const axios = useAxiosClient();
  const [info, setInfo] = useState(null);

  const refetchInfo = useCallback(async () => {
    if (!id) return;
    try {
      const response = await axios.get(`/api/${resource}/${id}/publication-info`);
      setInfo(response.data);
    } catch (err) {
      console.error("Erreur chargement infos de publication :", err);
    }
  }, [axios, resource, id]);

  useEffect(() => {
    refetchInfo();
    window.addEventListener("publication-info-changed", refetchInfo);
    return () =>
      window.removeEventListener("publication-info-changed", refetchInfo);
  }, [refetchInfo]);

  const resetDraft = useCallback(async () => {
    await axios.put(`/api/${resource}/${id}/reset-draft`);
    await refetchInfo();
  }, [axios, resource, id, refetchInfo]);

  return { info, refetchInfo, resetDraft };
}
