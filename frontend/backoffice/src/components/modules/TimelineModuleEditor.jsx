"use client";

import React, { useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import { useTranslation } from "@/i18n/I18nContext";

export default function TimelineModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
  loading: parentLoading = false,
}) {
  const { t } = useTranslation();
  const { updateModule, updateModuleVisibility } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

  // Champs basés sur le modèle Java Timeline
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
      label: t("pages.modules.timeline.title"),
      type: "text",
      placeholder: t("pages.modules.shared.titlePlaceholder"),
      required: true,
    },
    {
      name: "variant",
      label: t("pages.modules.timeline.variant"),
      type: "select",
      required: true,
      options: [
        { value: "TABS", label: t("pages.modules.timeline.tabs") },
        { value: "VERTICAL", label: t("pages.modules.timeline.vertical") },
        { value: "HORIZONTAL", label: t("pages.modules.timeline.horizontal") },
      ],
    },
  ];

  const effectiveLoading = Boolean(parentLoading || saving);

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateModule("timelines", {
        moduleId: moduleId,
        name: values.name,
        title: values.title,
        variant: values.variant,
      });
      setSaving(false);
      refetch();
      alert(t("pages.modules.timeline.updated"));
    } catch (err) {
      console.error(err);
      alert(t("pages.modules.shared.saveError"));
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
        title={t("pages.modules.timeline.detailsTitle")}
        fields={fields}
        initialValues={moduleData || {}}
        onSubmit={handleSubmit}
        onCancelExternal={() => {}}
        loading={saving || effectiveLoading}
        displayColumns={2}
      />
    </div>
  );
}
