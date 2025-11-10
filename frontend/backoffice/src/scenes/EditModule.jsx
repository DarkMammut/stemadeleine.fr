"use client";

import React, { useEffect, useState } from "react";
import Title from "@/components/ui/Title";
import useGetModule from "@/hooks/useGetModule";
import axios from "axios";

// Import des composants spécialisés par type de module (basés sur votre backend Java)
import NewsModuleEditor from "@/components/modules/NewsModuleEditor";
import ArticleModuleEditor from "@/components/modules/ArticleModuleEditor";
import GalleryModuleEditor from "@/components/modules/GalleryModuleEditor";
import CTAModuleEditor from "@/components/modules/CTAModuleEditor";
import FormModuleEditor from "@/components/modules/FormModuleEditor";
import ListModuleEditor from "@/components/modules/ListModuleEditor";
import TimelineModuleEditor from "@/components/modules/TimelineModuleEditor";
import NewsletterModuleEditor from "@/components/modules/NewsletterModuleEditor";
import { useBreadcrumbData } from "@/hooks/useBreadcrumbData";
import SceneLayout from "@/components/ui/SceneLayout";

// Mapping des types de modules vers leurs composants d'édition (basé sur vos modèles Java)
const MODULE_COMPONENTS = {
  news: NewsModuleEditor,
  article: ArticleModuleEditor,
  gallery: GalleryModuleEditor,
  cta: CTAModuleEditor,
  form: FormModuleEditor,
  list: ListModuleEditor,
  timeline: TimelineModuleEditor,
  newsletter: NewsletterModuleEditor,
};

export default function EditModule({ pageId, sectionId, moduleId }) {
  const { module, refetch, loading, error } = useGetModule({ moduleId });
  const [moduleData, setModuleData] = useState(null);

  // Hook pour les breadcrumbs
  const {
    breadcrumbData,
    loading: breadcrumbLoading,
    error: breadcrumbError,
  } = useBreadcrumbData({ pageId, sectionId, moduleId });

  useEffect(() => {
    if (module) {
      console.log("📦 Module reçu dans EditModule:", module);
      console.log("  - type:", module.type);
      setModuleData(module);
    }
  }, [module]);

  // Fonction pour publier le module courant (et ses contenus si présents)
  const handlePublishModule = async () => {
    await axios.put(`/api/modules/${moduleId}/publish`);
    await refetch();
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (error)
    return (
      <div className="text-center py-8 text-red-600">
        Erreur: {error.message}
      </div>
    );

  if (!moduleData) {
    return (
      <div className="text-center py-8 text-text-muted">
        Chargement des données du module...
      </div>
    );
  }

  // Sélectionner le composant approprié en fonction du type de module
  const ModuleComponent = MODULE_COMPONENTS[moduleData.type?.toLowerCase()];

  if (!ModuleComponent) {
    return (
      <SceneLayout>
        <Title label="Édition de module" onPublish={handlePublishModule} />
        <div className="text-center py-8 text-red-600">
          Type de module non supporté: {moduleData.type}
          <br />
          <span className="text-sm text-text-muted">
            Types disponibles: {Object.keys(MODULE_COMPONENTS).join(", ")}
          </span>
        </div>
      </SceneLayout>
    );
  }

  return (
    <SceneLayout>
      <Title
        label={`Édition de module - ${moduleData.type}`}
        onPublish={handlePublishModule}
      />

      <ModuleComponent
        moduleId={moduleId}
        moduleData={moduleData}
        setModuleData={setModuleData}
        refetch={refetch}
      />
    </SceneLayout>
  );
}
