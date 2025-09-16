"use client";

import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import Switch from "@/components/ui/Switch";
import { useAddModule } from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function GalleryModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
}) {
  const { updateModule } = useAddModule();
  const { updateModuleVisibility } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

  // Champs basés sur le modèle Java Gallery
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
      label: "Titre de la galerie",
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
        { value: "GRID", label: "Grille" },
        // Ajoutez d'autres variantes si elles existent dans GalleryVariants
      ],
      defaultValue: moduleData?.variant || "GRID",
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
      alert("Module galerie mis à jour !");
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
        submitButtonLabel="Enregistrer le module galerie"
      />

      {/* Gestion des médias de la galerie */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Médias de la galerie
        </h3>
        <div className="text-sm text-text-muted mb-4">
          Gestion des médias multiples pour cette galerie (images, vidéos)
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
          onClick={() =>
            alert(
              "Fonctionnalité à implémenter : gestionnaire de médias multiples",
            )
          }
        >
          Gérer les médias de la galerie
        </button>

        {/* Affichage des médias existants */}
        {moduleData?.medias && moduleData.medias.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-text mb-2">
              Médias actuels ({moduleData.medias.length}) :
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {moduleData.medias.map((media, index) => (
                <div
                  key={media.id || index}
                  className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500"
                >
                  {media.type === "image"
                    ? "🖼️"
                    : media.type === "video"
                      ? "🎥"
                      : "📄"}
                  <br />
                  {media.filename || `Média ${index + 1}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
