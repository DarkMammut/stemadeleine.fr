"use client";

import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import MediaPicker from "@/components/MediaPicker";
import Switch from "@/components/ui/Switch";
import { useAddModule } from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function NewsModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
}) {
  const { updateModule } = useAddModule();
  const { updateModuleVisibility, setModuleMedia } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

  // Champs basés sur le modèle Java News
  const fields = [
    {
      name: "name",
      label: "Nom du module",
      type: "text",
      placeholder: "Entrez le nom du module",
      required: true,
      defaultValue: moduleData?.name || "",
    },
    {
      name: "title",
      label: "Titre",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
      defaultValue: moduleData?.title || "",
    },
    {
      name: "variant",
      label: "Variante d'affichage",
      type: "select",
      required: true,
      options: [
        { value: "LAST3", label: "Les 3 dernières actualités" },
        // Ajoutez d'autres variantes si elles existent dans NewsVariants
      ],
      defaultValue: moduleData?.variant || "LAST3",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Description du module actualités",
      defaultValue: moduleData?.description || "",
    },
    {
      name: "startDate",
      label: "Date de début",
      type: "datetime-local",
      required: true,
      defaultValue: moduleData?.startDate
        ? new Date(moduleData.startDate).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    },
    {
      name: "endDate",
      label: "Date de fin",
      type: "datetime-local",
      required: true,
      defaultValue: moduleData?.endDate
        ? new Date(moduleData.endDate).toISOString().slice(0, 16)
        : "",
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

  const handleFormChange = (name, value, allValues) => {
    setModuleData((prev) => ({ ...prev, ...allValues }));
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateModule(moduleId, {
        name: values.name,
        title: values.title,
        variant: values.variant,
        description: values.description,
        startDate: values.startDate,
        endDate: values.endDate,
        sortOrder: parseInt(values.sortOrder) || 0,
      });
      setSaving(false);
      refetch();
      alert("Module actualités mis à jour !");
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
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Visibilité du module
        </h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <Switch
            checked={moduleData?.isVisible || false}
            onChange={handleVisibilityChange}
            disabled={savingVisibility}
          />
          <span className="font-medium text-text">
            Module visible sur le site
            {savingVisibility && (
              <span className="text-text-muted ml-2">(Sauvegarde...)</span>
            )}
          </span>
        </label>
      </div>

      {/* Formulaire principal */}
      <MyForm
        fields={fields}
        formValues={moduleData}
        setFormValues={setModuleData}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
        loading={saving}
        submitButtonLabel="Enregistrer le module actualités"
      />

      {/* Média du module */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Média du module
        </h3>
        <MediaPicker
          mediaId={moduleData?.media?.id}
          attachToEntity={attachToEntity}
          entityType="modules"
          entityId={moduleId}
          acceptedTypes="image/*,video/*"
        />
      </div>

      {/* Gestion des contenus */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Contenus associés
        </h3>
        <div className="text-sm text-text-muted mb-4">
          Gestion des contenus multiples pour ce module actualités (à
          implémenter avec un gestionnaire de contenus)
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
          onClick={() =>
            alert(
              "Fonctionnalité à implémenter : gestionnaire de contenus multiples",
            )
          }
        >
          Gérer les contenus
        </button>
      </div>
    </div>
  );
}
