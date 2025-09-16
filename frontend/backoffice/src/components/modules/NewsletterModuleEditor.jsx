"use client";

import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import MediaPicker from "@/components/MediaPicker";
import Switch from "@/components/ui/Switch";
import { useAddModule } from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function NewsletterModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
}) {
  const { updateModule } = useAddModule();
  const { updateModuleVisibility, setModuleMedia } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

  // Champs basés sur le modèle Java Newsletter
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
      label: "Titre de la newsletter",
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
        { value: "LAST3", label: "Les 3 dernières newsletters" },
        { value: "ARCHIVE", label: "Archive complète" },
        { value: "SUBSCRIPTION", label: "Formulaire d'inscription" },
        // Ajoutez d'autres variantes selon votre enum NewsVariants (réutilisé pour Newsletter)
      ],
      defaultValue: moduleData?.variant || "LAST3",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Description du module newsletter",
      defaultValue: moduleData?.description || "",
    },
    {
      name: "startDate",
      label: "Date de début de publication",
      type: "datetime-local",
      required: true,
      defaultValue: moduleData?.startDate
        ? new Date(moduleData.startDate).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
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
        sortOrder: parseInt(values.sortOrder) || 0,
      });
      setSaving(false);
      refetch();
      alert("Module newsletter mis à jour !");
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
        submitButtonLabel="Enregistrer le module newsletter"
      />

      {/* Média de la newsletter */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Image de la newsletter
        </h3>
        <MediaPicker
          mediaId={moduleData?.media?.id}
          attachToEntity={attachToEntity}
          entityType="modules"
          entityId={moduleId}
          acceptedTypes="image/*"
        />
        <p className="text-sm text-text-muted mt-2">
          Image représentative pour le module newsletter
        </p>
      </div>

      {/* Gestion des contenus de la newsletter */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Contenus de la newsletter
        </h3>
        <div className="text-sm text-text-muted mb-4">
          Gestion des contenus multiples pour ce module newsletter (articles,
          sections, etc.)
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
          onClick={() =>
            alert(
              "Fonctionnalité à implémenter : gestionnaire de contenus de newsletter",
            )
          }
        >
          Gérer les contenus de la newsletter
        </button>

        {/* Affichage des contenus existants */}
        {moduleData?.contents && moduleData.contents.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-text mb-2">
              Contenus actuels ({moduleData.contents.length}) :
            </h4>
            <div className="space-y-2">
              {moduleData.contents.map((content, index) => (
                <div
                  key={content.id || index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <div>
                    <span className="font-medium">
                      {content.title || `Contenu ${index + 1}`}
                    </span>
                    {content.text && (
                      <div className="text-sm text-text-muted mt-1">
                        {content.text.substring(0, 100)}...
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-text-muted">
                    Ordre: {content.order || index + 1}
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
