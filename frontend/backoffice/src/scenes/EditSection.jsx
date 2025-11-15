"use client";

import React, { useEffect, useState } from "react";
import SectionsTabs from "@/components/SectionsTabs";
import Utilities from "@/components/ui/Utilities";
import Title from "@/components/ui/Title";
import useGetSection from "@/hooks/useGetSection";
import useAddSection from "@/hooks/useAddSection";
import { useSectionOperations } from "@/hooks/useSectionOperations";
import EditablePanel from "@/components/ui/EditablePanel";
import MediaManager from "@/components/MediaManager";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import ContentManager from "@/components/ContentManager";
import SceneLayout from "@/components/ui/SceneLayout";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";
import { buildPageBreadcrumbs } from "@/utils/breadcrumbs";

export default function EditSection({ sectionId, pageId }) {
  const { section, refetch, loading, error } = useGetSection({ sectionId });
  const { updateSection } = useAddSection();
  const { updateSectionVisibility } = useSectionOperations();
  const [sectionData, setSectionData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [formKey, setFormKey] = useState(0); // Clé pour forcer le remontage du formulaire
  const axios = useAxiosClient();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    if (section) setSectionData(section);
  }, [section]);

  // Champs du formulaire pour une section
  const fields = [
    {
      name: "name",
      label: "Nom de la section",
      type: "text",
      placeholder: "Entrez le nom de la section",
      required: true,
    },
    {
      name: "title",
      label: "Titre",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
    },
  ];

  const handleAddMedia = async (sectionId, mediaId) => {
    try {
      await axios.put(`/api/sections/${sectionId}/media`, {
        mediaId: mediaId,
      });
      await refetch();
      showSuccess("Média ajouté", "Le média a été ajouté avec succès");

      // Construire l'objet content avec le média ajouté
      return {
        ...sectionData,
        medias: [{ id: mediaId }],
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout du média:", error);
      showError("Erreur", "Impossible d'ajouter le média");
      throw error;
    }
  };

  const handleRemoveMedia = async (sectionId, _mediaId) => {
    try {
      await axios.delete(`/api/sections/${sectionId}/media`);
      await refetch();
      showSuccess("Média supprimé", "Le média a été supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du média:", error);
      showError("Erreur", "Impossible de supprimer le média");
      throw error;
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateSection(sectionId, {
        name: values.name,
        title: values.title,
        subTitle: values.subTitle,
        content: values.content,
        order: parseInt(values.order) || 0,
      });
      refetch();
      // MyForm gère déjà les notifications de succès
    } catch (err) {
      console.error(err);
      // MyForm gère déjà les notifications d'erreur
      throw err; // Re-lancer l'erreur pour que MyForm puisse l'afficher
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setSectionData(section);
    setFormKey((prev) => prev + 1);
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateSectionVisibility(sectionId, isVisible);
      setSavingVisibility(false);
      setSectionData((prev) => ({ ...prev, isVisible }));
      showSuccess(
        "Visibilité modifiée",
        `La section est maintenant ${isVisible ? "visible" : "masquée"}`,
      );
    } catch (err) {
      console.error(err);
      showError("Erreur", "Impossible de modifier la visibilité");
      setSavingVisibility(false);
    }
  };

  // Fonction pour publier la section courante
  const handlePublishSection = async () => {
    try {
      await axios.put(`/api/sections/${sectionId}/publish`);
      await refetch();
      showSuccess("Section publiée", "La section a été publiée avec succès");
    } catch (err) {
      console.error(err);
      showError("Erreur", "Impossible de publier la section");
    }
  };

  // Suppression gérée par les scènes parent (Sections/Modules) via DraggableTree.

  // On ne retourne plus tôt : on laisse `Title` et `Utilities` gérer le disabled via `loading`.
  // Les erreurs restent affichées dans la zone de contenu.

  // Construire les breadcrumbs
  const breadcrumbs = section
    ? buildPageBreadcrumbs(
        { id: pageId, name: section.page?.name || "Page" },
        section,
      )
    : [];

  return (
    <SceneLayout>
      <Title
        label="Gestion de la section"
        onPublish={handlePublishSection}
        showBreadcrumbs={!!section}
        breadcrumbs={breadcrumbs}
        loading={loading}
      />

      <SectionsTabs pageId={pageId} sectionId={sectionId} />

      <Utilities actions={[]} loading={loading} />

      <div className="space-y-6">
        {/* Section Visibilité séparée */}
        <VisibilitySwitch
          title="Visibilité de la section"
          label="Section visible sur le site"
          isVisible={sectionData?.isVisible || false}
          onChange={handleVisibilityChange}
          savingVisibility={savingVisibility}
          loading={!sectionData}
        />

        <EditablePanel
          key={`${(sectionData && sectionData.sectionId) || "section-form"}-${formKey}`}
          title="Détails de la section"
          fields={fields}
          initialValues={sectionData || {}}
          onSubmit={handleSubmit}
          loading={saving || !sectionData}
          onCancelExternal={handleCancelEdit}
          displayColumns={2}
        />

        {/* Rich Text Content Editor */}
        <ContentManager
          parentId={section?.sectionId}
          parentType="section"
          customLabels={{
            header: "Contenus de la section",
            addButton: "Ajouter un contenu",
            empty: "Aucun contenu pour cette section.",
            loading: "Chargement des contenus...",
            saveContent: "Enregistrer le contenu",
            bodyLabel: "Contenu de la section",
          }}
        />
      </div>

      {/* Gestion de l'image de la section (Section Media) */}
      {sectionData && (
        <MediaManager
          title="Image de la section"
          content={{
            id: sectionId,
            medias: section?.media ? [section.media] : [],
          }}
          onMediaAdd={handleAddMedia}
          onMediaRemove={handleRemoveMedia}
          onMediaChanged={refetch}
          maxMedias={1}
        />
      )}

      {/* Affichage d'erreur global si besoin */}
      {error && (
        <div className="text-center py-4 text-red-600">
          Erreur: {error.message}
        </div>
      )}

      {/* Notification */}
      <Notification {...notification} onClose={hideNotification} />
    </SceneLayout>
  );
}
