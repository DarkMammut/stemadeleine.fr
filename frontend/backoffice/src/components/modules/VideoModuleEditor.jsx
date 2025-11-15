"use client";

import React, { useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import MediaManager from "@/components/MediaManager";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import useAddModule from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function VideoModuleEditor({
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
  const effectiveLoading = Boolean(parentLoading || saving);

  // Champs spécifiques au module vidéo
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
      label: "Titre de la vidéo",
      type: "text",
      placeholder: "Entrez le titre",
    },
    {
      name: "videoUrl",
      label: "URL de la vidéo",
      type: "url",
      placeholder: "https://www.youtube.com/watch?v=... ou lien direct",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Description de la vidéo",
    },
    {
      name: "autoplay",
      label: "Lecture automatique",
      type: "checkbox",
    },
    {
      name: "controls",
      label: "Afficher les contrôles",
      type: "checkbox",
    },
  ];

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateModule(moduleId, {
        name: values.name,
        title: values.title,
        videoUrl: values.videoUrl,
        description: values.description,
        autoplay: values.autoplay,
        controls: values.controls,
        order: parseInt(values.order) || 0,
      });
      setSaving(false);
      refetch();
      alert("Module vidéo mis à jour !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde du module");
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // No-op
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

  // Fonctions pour MediaManager
  const handleMediaAdd = async (contentId, mediaId) => {
    await setModuleMedia(moduleId, mediaId);
  };

  const handleMediaRemove = async (_contentId, _mediaId) => {
    await setModuleMedia(moduleId, null);
  };

  // Créer un objet "content" pour MediaManager
  const moduleContent = {
    id: moduleId,
    medias: moduleData?.media ? [moduleData.media] : [],
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
        title="Détails du module vidéo"
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
