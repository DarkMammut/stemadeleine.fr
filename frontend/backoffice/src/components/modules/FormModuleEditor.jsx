"use client";

import React, { useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import MediaManager from "@/components/MediaManager";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useAddModule } from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function FormModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
  loading: parentLoading = false,
}) {
  const { updateModule } = useAddModule();
  const { updateModuleVisibility, setModuleMedia } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

  // Champs basés sur le modèle Java Form
  const fields = [
    {
      name: "name",
      label: "Nom du module",
      type: "text",
      placeholder: "Entrez le nom du module",
      required: true,
    },
    {
      name: "title",
      label: "Titre du formulaire",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Description du formulaire (max 1000 caractères)",
    },
  ];

  const handleMediaAdd = async (contentId, mediaId) => {
    try {
      await setModuleMedia(moduleId, mediaId);
      await refetch();
    } catch (error) {
      console.error("Error setting module media:", error);
      alert("Erreur lors de l'ajout du média");
    }
  };

  const handleMediaRemove = async (contentId, mediaId) => {
    try {
      // remove media by setting it to null (API expects module media id or null)
      await setModuleMedia(moduleId, null);
      await refetch();
      // Log pour montrer d'où provient la suppression et quel mediaId a été retiré
      console.debug("Media removed", { contentId, mediaId });
    } catch (error) {
      console.error("Error removing module media:", error);
      alert("Erreur lors de la suppression du média");
    }
  };

  const effectiveLoading = Boolean(parentLoading || saving);

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateModule(moduleId, {
        name: values.name,
        title: values.title,
        description: values.description,
        sortOrder: parseInt(values.sortOrder) || 0,
      });
      setSaving(false);
      refetch();
      alert("Module formulaire mis à jour !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde du module");
      setSaving(false);
    }
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateModuleVisibility(moduleId, isVisible);
      setSavingVisibility(false);
      setModuleData((prev) => ({ ...prev, isVisible }));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour de la visibilité");
      setSavingVisibility(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Visibilité */}
      <VisibilitySwitch
        title="Visibilité du module"
        label="Module visible sur le site"
        isVisible={moduleData?.isVisible || false}
        onChange={handleVisibilityChange}
        savingVisibility={savingVisibility}
      />

      {/* Formulaire principal */}
      <EditablePanelV2
        title="Détails du formulaire"
        fields={fields}
        initialValues={moduleData || {}}
        onSubmit={handleSubmit}
        onCancelExternal={() => {}}
        loading={saving || effectiveLoading}
        displayColumns={2}
      />

      {/* Media manager (remplace MediaPicker) */}
      <MediaManager
        title="Image du formulaire"
        content={{
          id: moduleId,
          medias: moduleData?.media ? [moduleData.media] : [],
        }}
        onMediaAdd={handleMediaAdd}
        onMediaRemove={handleMediaRemove}
        onMediaChanged={refetch}
        maxMedias={1}
      />
    </div>
  );
}
