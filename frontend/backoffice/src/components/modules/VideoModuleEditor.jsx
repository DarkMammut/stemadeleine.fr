"use client";

import React, { useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import MediaManager from "@/components/MediaManager";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import useAddModule from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import { useTranslation } from "@/i18n/I18nContext";

export default function VideoModuleEditor({
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
  const effectiveLoading = Boolean(parentLoading || saving);

  // Champs spécifiques au module vidéo
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
      label: t("pages.modules.video.title"),
      type: "text",
      placeholder: t("pages.modules.shared.titlePlaceholder"),
    },
    {
      name: "videoUrl",
      label: t("pages.modules.video.videoUrl"),
      type: "url",
      placeholder: t("pages.modules.video.videoUrlPlaceholder"),
    },
    {
      name: "description",
      label: t("pages.modules.video.description"),
      type: "textarea",
      placeholder: t("pages.modules.video.descriptionPlaceholder"),
    },
    {
      name: "autoplay",
      label: t("pages.modules.video.autoplay"),
      type: "checkbox",
    },
    {
      name: "controls",
      label: t("pages.modules.video.controls"),
      type: "checkbox",
    },
  ];

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateModule(moduleId, {
        name: values.name,
        title: values.title,
        videoUrl: values.videoUrl,
        description: values.description,
        autoplay: values.autoplay,
        controls: values.controls,
        order: parseInt(values.order) || 0,
      });
      setSaving(false);
      refetch();
      alert(t("pages.modules.video.updated"));
    } catch (err) {
      console.error(err);
      alert(t("pages.modules.shared.saveError"));
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // No-op
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

  // Fonctions pour MediaManager
  const handleMediaAdd = async (contentId, mediaId) => {
    await setModuleMedia(moduleId, mediaId);
  };

  const handleMediaRemove = async (_contentId, _mediaId) => {
    await setModuleMedia(moduleId, null);
  };

  // Créer un objet "content" pour MediaManager
  const moduleContent = {
    id: moduleId,
    medias: moduleData?.media ? [moduleData.media] : [],
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
        title={t("pages.modules.video.detailsTitle")}
        fields={fields}
        initialValues={moduleData || {}}
        onSubmit={handleSubmit}
        onCancelExternal={handleCancelEdit}
        loading={saving || effectiveLoading}
        displayColumns={2}
      />

      {/* Sélecteur de média */}
      <MediaManager
        title={t("pages.modules.shared.moduleImageTitle")}
        content={moduleContent}
        onMediaAdd={handleMediaAdd}
        onMediaRemove={handleMediaRemove}
        onMediaChanged={refetch}
        maxMedias={1}
      />
    </div>
  );
}
