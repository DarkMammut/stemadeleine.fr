import { useEffect, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export function useBreadcrumbData({ pageId, sectionId, moduleId }) {
  const [breadcrumbData, setBreadcrumbData] = useState({
    page: null,
    section: null,
    module: null,
    loading: true,
    error: null,
  });

  const axiosClient = useAxiosClient();

  useEffect(() => {
    const fetchBreadcrumbData = async () => {
      if (!pageId) {
        setBreadcrumbData((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        setBreadcrumbData((prev) => ({ ...prev, loading: true, error: null }));

        let pageData = null;
        let sectionData = null;
        let moduleData = null;

        // Récupérer les informations de la page
        try {
          const pageResponse = await axiosClient.get(`/api/pages/${pageId}`);
          pageData = pageResponse.data;
        } catch (pageError) {
          console.error("Error fetching page:", pageError);
        }

        // Récupérer les informations de la section si sectionId est fourni
        if (sectionId) {
          try {
            const sectionResponse = await axiosClient.get(
              `/api/sections/${sectionId}`,
            );
            sectionData = sectionResponse.data;
          } catch (sectionError) {
            console.error("Error fetching section:", sectionError);
          }
        }

        // Récupérer les informations du module si moduleId est fourni
        if (moduleId) {
          try {
            const moduleResponse = await axiosClient.get(
              `/api/modules/${moduleId}`,
            );
            moduleData = moduleResponse.data;
          } catch (moduleError) {
            console.error("Error fetching module:", moduleError);
          }
        }

        setBreadcrumbData({
          page: pageData,
          section: sectionData,
          module: moduleData,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching breadcrumb data:", error);
        setBreadcrumbData((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    };

    fetchBreadcrumbData();
  }, [pageId, sectionId, moduleId, axiosClient]);

  return breadcrumbData;
}
