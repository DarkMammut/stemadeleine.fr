"use client";

import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import { useAddModule } from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function ListModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
}) {
  const { updateModule } = useAddModule();
  const { updateModuleVisibility } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [formKey, setFormKey] = useState(0); // Clé pour forcer le remontage du formulaire

  // Champs basés sur le modèle Java List
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
      label: "Titre de la liste",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
    },
    {
      name: "variant",
      label: "Variante d'affichage",
      type: "select",
      required: true,
      options: [
        { value: "CARD", label: "Cartes" },
        { value: "LIST", label: "Liste simple" },
        { value: "GRID", label: "Grille" },
      ],
    },
  ];

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
        variant: values.variant,
        sortOrder: parseInt(values.sortOrder) || 0,
      });
      setSaving(false);
      refetch();
      alert("Module liste mis à jour !");
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
          key={`${moduleId || "list-module"}-${formKey}`}
          fields={fields}
          initialValues={moduleData}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          loading={saving}
          submitButtonLabel="Enregistrer le module liste"
          onCancel={handleCancelEdit}
          cancelButtonLabel="Annuler"
          successMessage="Le module liste a été mis à jour avec succès"
          errorMessage="Impossible d'enregistrer le module liste"
        />
      )}
    </div>
  );
}
