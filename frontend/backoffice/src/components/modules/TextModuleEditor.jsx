"use client";

import React, { useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import MediaPicker from "@/components/MediaPicker";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import useAddModule from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import { useTranslation } from "@/i18n/I18nContext";

export default function TextModuleEditor({
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

  // Champs spécifiques au module texte
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
      label: t("pages.modules.shared.title"),
      type: "text",
      placeholder: t("pages.modules.shared.titlePlaceholder"),
      required: true,
    },
    {
      name: "content",
      label: t("pages.modules.text.content"),
      type: "textarea",
      placeholder: t("pages.modules.text.contentPlaceholder"),
    },
  ];

  const attachToEntity = async (mediaId) => {
    try {
      await setModuleMedia(moduleId, mediaId);
      refetch();
    } catch (error) {
      console.error("Error setting module media:", error);
      alert(t("pages.modules.text.mediaError"));
    }
  };

  const effectiveLoading = Boolean(parentLoading || saving);

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateModule(moduleId, {
        name: values.name,
        title: values.title,
        content: values.content,
        order: parseInt(values.order) || 0,
      });
      setSaving(false);
      refetch();
      alert(t("pages.modules.text.updated"));
    } catch (err) {
      console.error(err);
      alert(t("pages.modules.shared.saveError"));
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // No-op: EditablePanelV2 gère l'annulation
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
        title={t("pages.modules.text.detailsTitle")}
        fields={fields}
        initialValues={moduleData || {}}
        onSubmit={handleSubmit}
        onCancelExternal={handleCancelEdit}
        loading={saving || effectiveLoading}
        displayColumns={2}
      />

      {/* Sélecteur de média */}
      <MediaPicker
        mediaId={moduleData?.media?.id}
        attachToEntity={attachToEntity}
        entityType="modules"
        entityId={moduleId}
        label={t("pages.modules.text.illustrationTitle")}
      />
    </div>
  );
}
