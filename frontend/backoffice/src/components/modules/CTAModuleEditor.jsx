"use client";

import React, { useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useAddModule } from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function CTAModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
  onCancel,
  loading: parentLoading = false,
}) {
  const { updateModule } = useAddModule();
  const { updateModuleVisibility } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const effectiveLoading = Boolean(parentLoading || saving);

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
        title="Détails du CTA"
        fields={fields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancelExternal={handleCancel}
        loading={saving || effectiveLoading}
        displayColumns={2}
      />

      {/* Aperçu du CTA */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Aperçu du CTA</h3>
        {moduleData?.label && moduleData?.url ? (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="font-medium text-text mb-2">{moduleData.title}</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-muted">
                Type: {moduleData.variant || "BUTTON"}
              </span>
              <span className="text-sm text-text-muted">→</span>
              <span className="text-sm font-medium">{moduleData.label}</span>
              <span className="text-sm text-text-muted">
                ({moduleData.url})
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
