"use client";

import React, { useEffect, useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useAxiosClient } from "@/utils/axiosClient";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useGetModule from "@/hooks/useGetModule";
import useGetCTA from "@/hooks/useGetCTA";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useTranslation } from "@/i18n/I18nContext";

export default function CTAModuleEditor({
  moduleId,
  moduleData: _initialModuleData,
  setModuleData: setParentModuleData,
  refetch: _parentRefetch,
  loading: parentLoading = false,
}) {
  const { t } = useTranslation();
  const axios = useAxiosClient();
  const { updateModuleVisibility } = useModuleOperations();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  const [savingModule, setSavingModule] = useState(false);
  const [savingCTA, setSavingCTA] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const allowedCtaVariants = ["BUTTON", "LINK"];

  // Fetch module base data (name, title, isVisible)
  const {
    module,
    refetch: refetchModule,
    loading: moduleLoading,
  } = useGetModule({ moduleId });

  // Fetch CTA-specific data (label, url, variant)
  const {
    cta,
    refetch: refetchCTA,
    loading: ctaLoading,
  } = useGetCTA({ moduleId });

  const [moduleData, setModuleData] = useState(null);
  const [ctaData, setCtaData] = useState(null);

  useEffect(() => {
    if (module) setModuleData(module);
  }, [module]);

  useEffect(() => {
    if (cta) setCtaData(cta);
  }, [cta]);

  // Sync combined data back to parent
  useEffect(() => {
    if (moduleData && ctaData && setParentModuleData) {
      setParentModuleData({ ...moduleData, ...ctaData });
    }
  }, [moduleData, ctaData, setParentModuleData]);

  // Fields: base module (name, title)
  const moduleFields = [
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
      placeholder: t("pages.modules.cta.displayedTitlePlaceholder"),
      required: true,
    },
  ];

  // Fields: CTA-specific (label, url, variant)
  const ctaFields = [
    {
      name: "label",
      label: t("pages.modules.cta.label"),
      type: "text",
      placeholder: t("pages.modules.cta.labelPlaceholder"),
      required: true,
    },
    {
      name: "url",
      label: t("pages.modules.cta.url"),
      type: "text", // "text" pour autoriser les slugs internes (/page) et les URLs
      placeholder: t("pages.modules.cta.urlPlaceholder"),
      required: true,
    },
    {
      name: "variant",
      label: t("pages.modules.cta.variant"),
      type: "select",
      required: true,
      options: [
        { value: "BUTTON", label: t("pages.modules.cta.button") },
        { value: "LINK", label: t("pages.modules.cta.link") },
      ],
    },
  ];

  // Save base module fields (name, title) via PUT /api/modules/{moduleId}
  const handleModuleSubmit = async (values) => {
    setSavingModule(true);
    try {
      const response = await axios.put(`/api/modules/${module.moduleId}`, {
        name: values.name,
        title: values.title,
      });
      setModuleData((prev) => ({ ...prev, ...response.data }));
      showSuccess(t("pages.notifications.moduleUpdatedMessage"));
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du module:", err);
      showError(t("pages.errors.genericTitle"), t("pages.errors.saveModuleMessage"));
      throw err;
    } finally {
      setSavingModule(false);
    }
  };

  // Save CTA-specific fields via POST /api/cta/version (creates new version)
  const handleCTASubmit = async (values) => {
    setSavingCTA(true);
    try {
      const variant = allowedCtaVariants.includes(values.variant)
        ? values.variant
        : "BUTTON";
      const response = await axios.post("/api/cta/version", {
        moduleId: moduleId,
        name: moduleData?.name || values.label,
        title: moduleData?.title || values.label,
        label: values.label,
        url: values.url,
        variant,
      });
      setCtaData((prev) => ({ ...prev, ...response.data }));
      showSuccess(t("pages.notifications.ctaUpdatedMessage"));
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du CTA:", err);
      showError(t("pages.errors.genericTitle"), t("pages.errors.saveModuleMessage"));
      throw err;
    } finally {
      setSavingCTA(false);
    }
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateModuleVisibility(moduleId, isVisible);
      setModuleData((prev) => ({ ...prev, isVisible }));
      showSuccess(
        t("pages.notifications.visibilityUpdatedTitle"),
        `${t("pages.common.moduleCapitalized")} ${t(
          isVisible ? "pages.common.visible" : "pages.common.hidden",
        )}`,
      );
    } catch (err) {
      console.error(err);
      showError(
        t("pages.errors.visibilityTitle"),
        t("pages.errors.visibilityModuleMessage"),
      );
    } finally {
      setSavingVisibility(false);
    }
  };

  const effectiveLoading = Boolean(
    parentLoading || moduleLoading || ctaLoading,
  );

  return (
    <div className="space-y-6">
      {/* Visibilité */}
      <VisibilitySwitch
        title={t("pages.modules.shared.moduleVisibilityTitle")}
        label={t("pages.modules.shared.moduleVisibilityLabel")}
        isVisible={moduleData?.isVisible || false}
        onChange={handleVisibilityChange}
        savingVisibility={savingVisibility}
      />

      {/* Formulaire module (name, title) */}
      <EditablePanelV2
        title={t("pages.modules.cta.detailsTitle")}
        fields={moduleFields}
        initialValues={moduleData || {}}
        onSubmit={handleModuleSubmit}
        onCancelExternal={refetchModule}
        loading={savingModule || effectiveLoading}
        displayColumns={2}
      />

      {/* Formulaire CTA (label, url, variant) */}
      <EditablePanelV2
        title={t("pages.modules.cta.settingsTitle")}
        fields={ctaFields}
        initialValues={ctaData || {}}
        onSubmit={handleCTASubmit}
        onCancelExternal={refetchCTA}
        loading={savingCTA || effectiveLoading}
        displayColumns={2}
      />

      {/* Aperçu */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          {t("pages.modules.cta.previewTitle")}
        </h3>
        {ctaData?.label && ctaData?.url ? (
          <div className="p-4 bg-gray-50 rounded-lg space-y-1">
            {moduleData?.title && (
              <div className="font-medium text-text">{moduleData.title}</div>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
              <span>
                {t("pages.modules.cta.previewType")} :{" "}
                {ctaData.variant || "BUTTON"}
              </span>
              <span>→</span>
              <span className="font-medium text-text">{ctaData.label}</span>
              <span className="italic">({ctaData.url})</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-text-muted">
            {t("pages.modules.cta.previewHint")}
          </div>
        )}
      </div>

      {/* Notifications */}
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
      />
    </div>
  );
}
