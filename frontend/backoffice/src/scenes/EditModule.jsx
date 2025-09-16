"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Title from "@/components/Title";
import useGetModule from "@/hooks/useGetModule";
import { useBreadcrumbData } from "@/hooks/useBreadcrumbData";

// Import des composants spécialisés par type de module (basés sur votre backend Java)
import NewsModuleEditor from "@/components/modules/NewsModuleEditor";
import ArticleModuleEditor from "@/components/modules/ArticleModuleEditor";
import GalleryModuleEditor from "@/components/modules/GalleryModuleEditor";
import CTAModuleEditor from "@/components/modules/CTAModuleEditor";
import FormModuleEditor from "@/components/modules/FormModuleEditor";
import ListModuleEditor from "@/components/modules/ListModuleEditor";
import TimelineModuleEditor from "@/components/modules/TimelineModuleEditor";
import NewsletterModuleEditor from "@/components/modules/NewsletterModuleEditor";

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
    if (module) setModuleData(module);
  }, [module]);

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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl mx-auto space-y-6"
      >
        <Title
          label="Édition de module"
          apiUrl={`/api/modules/${moduleId}`}
          data={module}
        />
        <div className="text-center py-8 text-red-600">
          Type de module non supporté: {moduleData.type}
          <br />
          <span className="text-sm text-text-muted">
            Types disponibles: {Object.keys(MODULE_COMPONENTS).join(", ")}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      <Title
        label={`Édition de module - ${moduleData.type}`}
        apiUrl={`/api/modules/${moduleId}`}
        data={module}
      />

      <ModuleComponent
        moduleId={moduleId}
        moduleData={moduleData}
        setModuleData={setModuleData}
        refetch={refetch}
      />
    </motion.div>
  );
}
