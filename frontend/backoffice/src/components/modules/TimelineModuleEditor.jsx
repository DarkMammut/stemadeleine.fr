"use client";

import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import Switch from "@/components/ui/Switch";
import { useAddModule } from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function TimelineModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
}) {
  const { updateModule } = useAddModule();
  const { updateModuleVisibility } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

  // Champs basés sur le modèle Java Timeline
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
      label: "Titre de la chronologie",
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
        { value: "TABS", label: "Onglets" },
        { value: "VERTICAL", label: "Timeline verticale" },
        { value: "HORIZONTAL", label: "Timeline horizontale" },
        // Ajoutez d'autres variantes selon votre enum TimelineVariants
      ],
      defaultValue: moduleData?.variant || "TABS",
    },
  ];

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
        sortOrder: parseInt(values.sortOrder) || 0,
      });
      setSaving(false);
      refetch();
      alert("Module chronologie mis à jour !");
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
        submitButtonLabel="Enregistrer le module chronologie"
      />

      {/* Gestion des événements de la chronologie */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Événements de la chronologie
        </h3>
        <div className="text-sm text-text-muted mb-4">
          Gestion des contenus chronologiques (événements, dates importantes,
          étapes)
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
          onClick={() =>
            alert(
              "Fonctionnalité à implémenter : gestionnaire d'événements chronologiques",
            )
          }
        >
          Gérer les événements
        </button>

        {/* Affichage des contenus existants */}
        {moduleData?.contents && moduleData.contents.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-text mb-2">
              Événements actuels ({moduleData.contents.length}) :
            </h4>
            <div className="space-y-3">
              {moduleData.contents.map((content, index) => (
                <div
                  key={content.id || index}
                  className="bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {content.title || `Événement ${index + 1}`}
                    </span>
                    <span className="text-xs text-text-muted">
                      {content.date
                        ? new Date(content.date).toLocaleDateString()
                        : `Ordre: ${index + 1}`}
                    </span>
                  </div>
                  {content.text && (
                    <div className="text-sm text-text-muted">
                      {content.text.substring(0, 100)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
