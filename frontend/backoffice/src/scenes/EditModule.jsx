"use client";

import React, { useEffect, useState } from "react";
import Title from "@/components/ui/Title";
import useGetModule from "@/hooks/useGetModule";
import usePublicationInfo from "@/hooks/usePublicationInfo";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";
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
  const [resetKey, setResetKey] = useState(0);
  const axios = useAxiosClient();
  const { info, refetchInfo, resetDraft } = usePublicationInfo(
    "modules",
    moduleId,
  );
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  const handlePublishModule = async () => {
    try {
      await axios.put(`/api/modules/${moduleId}/publish`);
      await refetch();
      await refetchInfo();
      showSuccess("Module publié", "Le module a été publié avec succès");
    } catch (err) {
      console.error(err);
      showError("Erreur de publication", "Impossible de publier le module");
    }
  };

  const handleResetModule = async () => {
    try {
      await resetDraft();
      await refetch();
      setResetKey((prev) => prev + 1);
      showSuccess(
        "Module réinitialisé",
        "Le module est revenu à la version publiée",
      );
    } catch (err) {
      console.error(err);
      showError("Erreur", "Impossible de réinitialiser le module");
    }
  };

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
        onPublish={handlePublishModule}
        onReset={handleResetModule}
        publicationInfo={info}
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
            key={resetKey}
            moduleId={moduleId}
            moduleData={safeModuleData}
            setModuleData={setModuleData}
            refetch={async () => {
              await refetch();
              refetchInfo();
            }}
            loading={Boolean(loading || !safeModuleData)}
          />
        ) : (
          <div className="text-center py-8 text-red-600">
            Type de module non supporté: {safeModuleData?.type ?? "(inconnu)"}
          </div>
        )}
      </div>
      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </SceneLayout>
  );
}
