"use client";

import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import MediaPicker from "@/components/MediaPicker";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useAddModule } from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function FormModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
}) {
  const { updateModule } = useAddModule();
  const { updateModuleVisibility, setModuleMedia } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [formKey, setFormKey] = useState(0);

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

  const attachToEntity = async (mediaId) => {
    try {
      await setModuleMedia(moduleId, mediaId);
      refetch();
    } catch (error) {
      console.error("Error setting module media:", error);
      alert("Erreur lors de l'ajout du média");
    }
  };

  const handleFormChange = () => {
    // MyForm gère déjà son état interne
    // Cette fonction peut être utilisée pour des effets de bord si nécessaire
  };

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
          key={`${moduleId || "form-module"}-${formKey}`}
          fields={fields}
          initialValues={moduleData}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          loading={saving}
          submitButtonLabel="Enregistrer le module formulaire"
          onCancel={handleCancelEdit}
          cancelButtonLabel="Annuler"
        />
      )}

      {/* Sélecteur de média */}
      <MediaPicker
        mediaId={moduleData?.media?.id}
        attachToEntity={attachToEntity}
        entityType="modules"
        entityId={moduleId}
        label="Image du formulaire"
      />
    </div>
  );
}
