"use client";

import React, { useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import MediaManager from "@/components/MediaManager";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useAddModule } from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import { useTranslation } from "@/i18n/I18nContext";

export default function FormModuleEditor({
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

  // Champs basés sur le modèle Java Form
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
      label: t("pages.modules.form.title"),
      type: "text",
      placeholder: t("pages.modules.shared.titlePlaceholder"),
      required: true,
    },
    {
      name: "description",
      label: t("pages.modules.form.description"),
      type: "textarea",
      placeholder: t("pages.modules.form.descriptionPlaceholder"),
    },
  ];

  const handleMediaAdd = async (contentId, mediaId) => {
    try {
      await setModuleMedia(moduleId, mediaId);
      await refetch();
    } catch (error) {
      console.error("Error setting module media:", error);
      alert(t("pages.errors.mediaAddMessage"));
    }
  };

  const handleMediaRemove = async (contentId, mediaId) => {
    try {
      // remove media by setting it to null (API expects module media id or null)
      await setModuleMedia(moduleId, null);
      await refetch();
      // Log pour montrer d'où provient la suppression et quel mediaId a été retiré
      console.debug("Media removed", { contentId, mediaId });
    } catch (error) {
      console.error("Error removing module media:", error);
      alert(t("pages.errors.mediaDeleteMessage"));
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
        sortOrder: parseInt(values.sortOrder) || 0,
      });
      setSaving(false);
      refetch();
      alert(t("pages.modules.form.updated"));
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
        title={t("pages.modules.form.detailsTitle")}
        fields={fields}
        initialValues={moduleData || {}}
        onSubmit={handleSubmit}
        onCancelExternal={() => {}}
        loading={saving || effectiveLoading}
        displayColumns={2}
      />

      {/* Media manager (remplace MediaPicker) */}
      <MediaManager
        title={t("pages.modules.form.imageTitle")}
        content={{
          id: moduleId,
          medias: moduleData?.media ? [moduleData.media] : [],
        }}
        onMediaAdd={handleMediaAdd}
        onMediaRemove={handleMediaRemove}
        onMediaChanged={refetch}
        maxMedias={1}
      />
    </div>
  );
}
