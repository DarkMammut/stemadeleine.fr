"use client";

import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import MediaPicker from "@/components/MediaPicker";
import Switch from "@/components/ui/Switch";
import useAddModule from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";

export default function EventModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
}) {
  const { updateModule } = useAddModule();
  const { updateModuleVisibility, setModuleMedia } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

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
      label: "Titre de l'événement",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
      defaultValue: moduleData?.title || "",
    },
    {
      name: "description",
      label: "Description",
      type: "richtext",
      placeholder: "Description de l'événement",
      defaultValue: moduleData?.description || "",
    },
    {
      name: "startDate",
      label: "Date et heure de début",
      type: "datetime-local",
      required: true,
      defaultValue:
        moduleData?.startDate || new Date().toISOString().slice(0, 16),
    },
    {
      name: "endDate",
      label: "Date et heure de fin",
      type: "datetime-local",
      defaultValue: moduleData?.endDate || "",
    },
    {
      name: "location",
      label: "Lieu",
      type: "text",
      placeholder: "Adresse ou nom du lieu",
      defaultValue: moduleData?.location || "",
    },
    {
      name: "price",
      label: "Prix (€)",
      type: "number",
      step: "0.01",
      min: "0",
      placeholder: "0.00",
      defaultValue: moduleData?.price || "",
    },
    {
      name: "maxAttendees",
      label: "Nombre maximum de participants",
      type: "number",
      min: "1",
      placeholder: "Illimité si vide",
      defaultValue: moduleData?.maxAttendees || "",
    },
    {
      name: "registrationRequired",
      label: "Inscription requise",
      type: "checkbox",
      defaultValue: moduleData?.registrationRequired || false,
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
        startDate: values.startDate,
        endDate: values.endDate,
        location: values.location,
        price: values.price ? parseFloat(values.price) : null,
        maxAttendees: values.maxAttendees
          ? parseInt(values.maxAttendees)
          : null,
        registrationRequired: values.registrationRequired,
        order: parseInt(values.order) || 0,
      });
      setSaving(false);
      refetch();
      alert("Module événement mis à jour !");
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
          </span>
        </label>
      </div>

      <MyForm
        fields={fields}
        formValues={moduleData}
        setFormValues={setModuleData}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
        loading={saving}
        submitButtonLabel="Enregistrer le module événement"
      />

      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Image de l'événement
        </h3>
        <MediaPicker
          mediaId={moduleData?.media?.id}
          attachToEntity={attachToEntity}
          entityType="modules"
          entityId={moduleId}
          acceptedTypes="image/*"
        />
      </div>
    </div>
  );
}
