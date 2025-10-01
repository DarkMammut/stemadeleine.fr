"use client";

import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import Switch from "@/components/ui/Switch";
import { useAddModule } from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function CTAModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
  onCancel,
}) {
  const { updateModule } = useAddModule();
  const { updateModuleVisibility } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [formValues, setFormValues] = useState({});

  // Champs basés sur le modèle Java CTA
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
      name: "label",
      label: "Texte du bouton/lien",
      type: "text",
      placeholder: "Ex: En savoir plus, Contactez-nous...",
      required: true,
    },
    {
      name: "url",
      label: "URL de destination",
      type: "url",
      placeholder: "https://... ou /page-interne",
      required: true,
    },
    {
      name: "variant",
      label: "Type d'affichage",
      type: "select",
      required: true,
      options: [
        { value: "BUTTON", label: "Bouton" },
        { value: "LINK", label: "Lien simple" },
        { value: "CARD", label: "Carte" },
      ],
    },
  ];

  // Préparer les valeurs initiales à partir de moduleData
  const initialValues = {
    name: moduleData?.name || "",
    title: moduleData?.title || "",
    label: moduleData?.label || "",
    url: moduleData?.url || "",
    variant: moduleData?.variant || "BUTTON",
  };

  const handleFormChange = (name, value, allValues) => {
    setFormValues(allValues);
    // Optionnel: mettre à jour moduleData en temps réel pour l'aperçu
    setModuleData((prev) => ({ ...prev, ...allValues }));
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateModule(moduleId, {
        name: values.name,
        title: values.title,
        label: values.label,
        url: values.url,
        variant: values.variant,
        sortOrder: parseInt(values.sortOrder) || 0,
      });
      setSaving(false);
      refetch();
      alert("Module CTA mis à jour !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde du module");
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Remettre les valeurs originales dans moduleData
    setModuleData((prev) => ({ ...prev, ...initialValues }));
    setFormValues({});

    // Appeler la fonction onCancel du parent si elle existe
    if (onCancel) {
      onCancel();
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

  // Valeurs à afficher dans l'aperçu (utiliser formValues s'il y en a, sinon initialValues)
  const previewValues =
    Object.keys(formValues).length > 0 ? formValues : initialValues;

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
        initialValues={initialValues}
        formValues={formValues}
        setFormValues={setFormValues}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
        onCancel={handleCancel}
        loading={saving}
        submitButtonLabel="Enregistrer le module CTA"
        cancelButtonLabel="Annuler les modifications"
      />

      {/* Aperçu du CTA */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Aperçu du CTA</h3>
        {previewValues?.label && previewValues?.url ? (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="font-medium text-text mb-2">
              {previewValues.title}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-muted">
                Type: {previewValues.variant || "BUTTON"}
              </span>
              <span className="text-sm text-text-muted">→</span>
              <span className="text-sm font-medium">{previewValues.label}</span>
              <span className="text-sm text-text-muted">
                ({previewValues.url})
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-text-muted">
            Remplissez les champs ci-dessus pour voir l'aperçu
          </div>
        )}
      </div>
    </div>
  );
}
