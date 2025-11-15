"use client";

import React, { useEffect, useState } from "react";
import Title from "@/components/ui/Title";
import useGetModule from "@/hooks/useGetModule";
import SceneLayout from "@/components/ui/SceneLayout";

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

export default function EditModule({
  moduleId,
  pageId: _pageId,
  sectionId: _sectionId,
}) {
  const { module, refetch, loading, error } = useGetModule({ moduleId });
  const [moduleData, setModuleData] = useState(null);

  // Ne pas retourner tôt — laisser les composants afficher leur état `loading` via props.
  useEffect(() => {
    if (module) {
      setModuleData(module);
    }
  }, [module]);

  // Ensure moduleData.type is never null to avoid downstream components calling .toLowerCase() or accessing .type when null
  const safeModuleData = moduleData
    ? { ...moduleData, type: moduleData?.type ?? "" }
    : null;

  // Sélectionner le composant approprié en fonction du type de module (protéger les accès)
  const ModuleComponent =
    MODULE_COMPONENTS[(safeModuleData?.type || "").toLowerCase()];

  return (
    <SceneLayout>
      <Title
        label={`Édition de module - ${safeModuleData ? safeModuleData.type : "..."}`}
        loading={loading}
      />

      {/* Remplacement : on n'affiche que le ModuleComponent. Le module editor interne gère visibilité, métadonnées, contenus, etc. */}
      <div className="space-y-6">
        {error ? (
          <div className="text-center py-8 text-red-600">
            Erreur: {error.message}
          </div>
        ) : !safeModuleData ? (
          <div className="text-center py-8 text-gray-500">
            Chargement du module…
          </div>
        ) : ModuleComponent ? (
          <ModuleComponent
            moduleId={moduleId}
            moduleData={safeModuleData}
            setModuleData={setModuleData}
            refetch={refetch}
            loading={Boolean(loading || !safeModuleData)}
          />
        ) : (
          <div className="text-center py-8 text-red-600">
            Type de module non supporté: {safeModuleData?.type ?? "(inconnu)"}
          </div>
        )}
      </div>
    </SceneLayout>
  );
}
