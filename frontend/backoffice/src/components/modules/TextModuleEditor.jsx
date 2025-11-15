"use client";

import React, { useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import MediaPicker from "@/components/MediaPicker";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import useAddModule from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function TextModuleEditor({
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

  // Champs spécifiques au module texte
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
      label: "Titre",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
    },
    {
      name: "content",
      label: "Contenu texte",
      type: "textarea",
      placeholder: "Entrez le contenu",
    },
  ];

  const attachToEntity = async (mediaId) => {
    try {
      await setModuleMedia(moduleId, mediaId);
      refetch();
    } catch (error) {
      console.error("Error setting module media:", error);
      alert("Erreur lors de l'ajout du média");
    }
  };

  const effectiveLoading = Boolean(parentLoading || saving);

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateModule(moduleId, {
        name: values.name,
        title: values.title,
        content: values.content,
        order: parseInt(values.order) || 0,
      });
      setSaving(false);
      refetch();
      alert("Module texte mis à jour !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde du module");
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // No-op: EditablePanelV2 gère l'annulation
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
        title="Détails du module texte"
        fields={fields}
        initialValues={moduleData || {}}
        onSubmit={handleSubmit}
        onCancelExternal={handleCancelEdit}
        loading={saving || effectiveLoading}
        displayColumns={2}
      />

      {/* Sélecteur de média */}
      <MediaPicker
        mediaId={moduleData?.media?.id}
        attachToEntity={attachToEntity}
        entityType="modules"
        entityId={moduleId}
        label="Image d'illustration"
      />
    </div>
  );
}
