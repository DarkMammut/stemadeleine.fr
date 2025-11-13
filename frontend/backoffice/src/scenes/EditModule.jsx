"use client";

import React, { useEffect, useState } from "react";
import Title from "@/components/ui/Title";
import useGetModule from "@/hooks/useGetModule";

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
import EditablePanel from "@/components/ui/EditablePanel";
import { useAxiosClient } from "@/utils/axiosClient";

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
  const axiosClient = useAxiosClient();

  // Hook pour les breadcrumbs
  // we don't need breadcrumb values here, but keep hook call for side-effects if any
  useBreadcrumbData({ pageId, sectionId, moduleId });

  useEffect(() => {
    if (module) {
      console.log("📦 Module reçu dans EditModule:", module);
      console.log("  - type:", module.type);
      setModuleData(module);
    }
  }, [module]);

  // Centralized metadata submit for module (name, title, description)
  const handleModuleMetadataSubmit = async (values) => {
    try {
      // Build payload minimally
      const payload = {
        name: values.name,
        title: values.title,
        description: values.description,
      };
      const res = await axiosClient.put(`/api/modules/${moduleId}`, payload);
      // update local state with server response
      setModuleData((prev) => ({ ...(prev || {}), ...(res.data || {}) }));
      // refetch other data if needed
      await refetch();
    } catch (err) {
      console.error(
        "Erreur lors de la sauvegarde des métadonnées du module",
        err,
      );
      throw err;
    }
  };

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

      <EditablePanel
        title={`Module - ${moduleData.name || moduleData.title || moduleData.type}`}
        initialValues={moduleData}
        onSubmit={handleModuleMetadataSubmit}
        fields={[
          { name: "name", label: "Nom", type: "text" },
          { name: "title", label: "Titre", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
        ]}
        renderForm={({ initialValues }) => (
          <ModuleComponent
            moduleId={moduleId}
            moduleData={initialValues}
            setModuleData={setModuleData}
            refetch={refetch}
          />
        )}
      >
        {/* read-only summary when not editing: richer info */}
        <div className="p-2 space-y-1">
          <div className="text-sm font-medium">
            {moduleData.title || moduleData.name}
          </div>
          <div className="text-xs text-text-muted">Type: {moduleData.type}</div>
          <div className="text-xs text-text-muted">
            Visibilité: {moduleData.isVisible ? "visible" : "masqué"}
          </div>
          <div className="text-xs text-text-muted">
            Contenus: {moduleData.contents ? moduleData.contents.length : 0}
          </div>
          {moduleData.description && (
            <div className="text-xs text-text-muted">
              {moduleData.description}
            </div>
          )}
        </div>
      </EditablePanel>
    </SceneLayout>
  );
}
