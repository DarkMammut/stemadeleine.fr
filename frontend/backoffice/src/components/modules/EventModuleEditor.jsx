"use client";

import React, { useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import useAddModule from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import { useTranslation } from "@/i18n/I18nContext";

export default function EventModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
  loading: parentLoading = false,
}) {
  const { t } = useTranslation();
  const { updateModule } = useAddModule();
  const { updateModuleVisibility, setModuleMedia } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [formKey, setFormKey] = useState(0); // Clé pour forcer le remontage du formulaire

  const fields = [
    {
      name: "name",
      label: t("pages.modules.shared.moduleName"),
      type: "text",
      placeholder: t("pages.modules.shared.moduleNamePlaceholder"),
      required: true,
    },
    {
      name: "title",
      label: t("pages.modules.event.title"),
      type: "text",
      placeholder: t("pages.modules.shared.titlePlaceholder"),
      required: true,
    },
    {
      name: "description",
      label: t("pages.modules.event.description"),
      type: "textarea",
      placeholder: t("pages.modules.event.descriptionPlaceholder"),
    },
    {
      name: "startDate",
      label: t("pages.modules.event.startDate"),
      type: "datetime-local",
      required: true,
    },
    {
      name: "endDate",
      label: t("pages.modules.event.endDate"),
      type: "datetime-local",
    },
    {
      name: "location",
      label: t("pages.modules.event.location"),
      type: "text",
      placeholder: t("pages.modules.event.locationPlaceholder"),
    },
    {
      name: "price",
      label: t("pages.modules.event.price"),
      type: "number",
      step: "0.01",
      min: "0",
      placeholder: t("pages.modules.event.pricePlaceholder"),
    },
    {
      name: "maxAttendees",
      label: t("pages.modules.event.maxAttendees"),
      type: "number",
      min: "1",
      placeholder: t("pages.modules.event.maxAttendeesPlaceholder"),
    },
  ];

  const attachToEntity = async (mediaId) => {
    try {
      await setModuleMedia(moduleId, mediaId);
      refetch();
    } catch (error) {
      console.error("Error setting module media:", error);
      alert(t("pages.modules.event.mediaError"));
    }
  };

  const effectiveLoading = Boolean(parentLoading || saving);

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
        price: parseFloat(values.price) || 0,
        maxAttendees: parseInt(values.maxAttendees) || null,
        order: parseInt(values.order) || 0,
      });
      setSaving(false);
      refetch();
      alert(t("pages.modules.event.updated"));
    } catch (err) {
      console.error(err);
      alert(t("pages.modules.shared.saveError"));
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
      alert(t("pages.modules.shared.visibilityError"));
      setSavingVisibility(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Visibilité */}
      <VisibilitySwitch
        title={t("pages.modules.shared.moduleVisibilityTitle")}
        label={t("pages.modules.shared.moduleVisibilityLabel")}
        isVisible={moduleData?.isVisible || false}
        onChange={handleVisibilityChange}
        savingVisibility={savingVisibility}
      />

      {/* Formulaire principal */}
      <EditablePanelV2
        title={t("pages.modules.event.detailsTitle")}
        fields={fields}
        initialValues={moduleData || {}}
        onSubmit={handleSubmit}
        onCancelExternal={handleCancelEdit}
        loading={saving || effectiveLoading}
        displayColumns={2}
      />
    </div>
  );
}
