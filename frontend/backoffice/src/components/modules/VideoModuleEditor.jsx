"use client";

import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import MediaManager from "@/components/MediaManager";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import useAddModule from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function VideoModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
}) {
  const { updateModule } = useAddModule();
  const { updateModuleVisibility, setModuleMedia } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [formKey, setFormKey] = useState(0); // Clé pour forcer le remontage du formulaire

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

  const attachToEntity = async (mediaId) => {
    try {
      await setModuleMedia(moduleId, mediaId);
      refetch();
    } catch (error) {
      console.error("Error setting module media:", error);
      alert("Erreur lors de l'ajout du média");
    }
  };

  const handleFormChange = () => {};

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
    // Force le remontage du formulaire pour revenir aux valeurs initiales
    setFormKey((prev) => prev + 1);
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

  const handleMediaRemove = async (contentId, mediaId) => {
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
      {moduleData && Object.keys(moduleData).length > 0 && (
        <MyForm
          key={`${moduleId || "video-module"}-${formKey}`}
          fields={fields}
          initialValues={moduleData}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          loading={saving}
          submitButtonLabel="Enregistrer le module vidéo"
          onCancel={handleCancelEdit}
          cancelButtonLabel="Annuler"
        />
      )}

      {/* Sélecteur de média */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-4">
          Image du module
        </label>
        <MediaManager
          content={moduleContent}
          onMediaAdd={handleMediaAdd}
          onMediaRemove={handleMediaRemove}
          onMediaChanged={refetch}
          maxMedias={1}
        />
      </div>
    </div>
  );
}
