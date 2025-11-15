"use client";

import React, { useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import MediaManager from "@/components/MediaManager";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import useAddModule from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function ImageModuleEditor({
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

  // Champs spécifiques au module image
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
      label: "Titre de l'image",
      type: "text",
      placeholder: "Entrez le titre",
    },
    {
      name: "altText",
      label: "Texte alternatif (Alt)",
      type: "text",
      placeholder: "Description de l'image pour l'accessibilité",
      required: true,
    },
    {
      name: "caption",
      label: "Légende",
      type: "text",
      placeholder: "Légende de l'image",
    },
    {
      name: "link",
      label: "Lien (optionnel)",
      type: "url",
      placeholder: "https://...",
    },
  ];

  // Fonctions pour MediaManager
  const handleMediaAdd = async (contentId, mediaId) => {
    await setModuleMedia(moduleId, mediaId);
  };

  const handleMediaRemove = async (_mediaId) => {
    await setModuleMedia(moduleId, null);
  };

  // Créer un objet "content" pour MediaManager
  const moduleContent = {
    id: moduleId,
    medias: moduleData?.media ? [moduleData.media] : [],
  };

  const effectiveLoading = Boolean(parentLoading || saving);

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateModule(moduleId, {
        name: values.name,
        title: values.title,
        altText: values.altText,
        caption: values.caption,
        link: values.link,
        order: parseInt(values.order) || 0,
      });
      setSaving(false);
      refetch();
      alert("Module image mis à jour !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde du module");
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // No-op: EditablePanelV2 will reset on cancel externally
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
        title="Détails de l'image"
        fields={fields}
        initialValues={moduleData || {}}
        onSubmit={handleSubmit}
        onCancelExternal={handleCancelEdit}
        loading={saving || effectiveLoading}
        displayColumns={2}
      />

      {/* Sélecteur de média */}
      <MediaManager
        title="Image du module"
        content={moduleContent}
        onMediaAdd={handleMediaAdd}
        onMediaRemove={handleMediaRemove}
        onMediaChanged={refetch}
        maxMedias={1}
      />
    </div>
  );
}
