"use client";

import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import MediaPicker from "@/components/MediaPicker";
import Switch from "@/components/ui/Switch";
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

  // Champs basés sur le modèle Java Form
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
      label: "Titre du formulaire",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
      defaultValue: moduleData?.title || "",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Description du formulaire (max 1000 caractères)",
      maxLength: 1000,
      defaultValue: moduleData?.description || "",
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
        submitButtonLabel="Enregistrer le module formulaire"
      />

      {/* Média du formulaire */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Média du formulaire
        </h3>
        <MediaPicker
          mediaId={moduleData?.media?.id}
          attachToEntity={attachToEntity}
          entityType="modules"
          entityId={moduleId}
          acceptedTypes="image/*"
        />
        <p className="text-sm text-text-muted mt-2">
          Image optionnelle à afficher avec le formulaire
        </p>
      </div>

      {/* Gestion des champs du formulaire */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Champs du formulaire
        </h3>
        <div className="text-sm text-text-muted mb-4">
          Gestion des champs personnalisés de ce formulaire
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
          onClick={() =>
            alert(
              "Fonctionnalité à implémenter : éditeur de champs de formulaire",
            )
          }
        >
          Gérer les champs du formulaire
        </button>

        {/* Affichage des champs existants */}
        {moduleData?.fields && moduleData.fields.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-text mb-2">
              Champs actuels ({moduleData.fields.length}) :
            </h4>
            <div className="space-y-2">
              {moduleData.fields.map((field, index) => (
                <div
                  key={field.id || index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <div>
                    <span className="font-medium">
                      {field.label || field.name}
                    </span>
                    <span className="text-sm text-text-muted ml-2">
                      ({field.type || "text"})
                    </span>
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </div>
                  <div className="text-xs text-text-muted">
                    Ordre: {field.order || index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
