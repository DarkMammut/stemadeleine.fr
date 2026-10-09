"use client";

import React, { useEffect, useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useGetModule from "@/hooks/useGetModule";
import useGetNewsletter from "@/hooks/useGetNewsletter";
import useNewsVariants from "@/hooks/useNewsVariants";
import ContentManager from "@/components/ContentManager";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";
import { useTranslation } from "@/i18n/I18nContext";

export default function NewsletterModuleEditor({
  moduleId,
  moduleData: _initialModuleData,
  setModuleData: setParentModuleData,
  refetch: _parentRefetch,
  loading: parentLoading = false,
}) {
  const { t } = useTranslation();
  const { updateModuleVisibility } = useModuleOperations();
  const axios = useAxiosClient();
  const [savingModule, setSavingModule] = useState(false);
  const [savingNewsletter, setSavingNewsletter] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // Récupérer les données du module (name, title)
  const {
    module,
    refetch: refetchModule,
    loading: moduleLoading,
  } = useGetModule({ moduleId });

  // Récupérer les données complètes de la newsletter (variant, writer, writingDate, contents)
  const {
    newsletter,
    refetch: refetchNewsletter,
    loading: newsletterLoading,
  } = useGetNewsletter({ moduleId });

  // Récupérer les variantes disponibles depuis le backend
  const { variants: variantOptions, loading: variantsLoading } =
    useNewsVariants();

  // États locaux
  const [moduleData, setModuleData] = useState(null);
  const [newsletterData, setNewsletterData] = useState(null);

  // Synchroniser avec les données du module
  useEffect(() => {
    if (module) {
      setModuleData(module);
    }
  }, [module]);

  // Synchroniser avec les données de la newsletter
  useEffect(() => {
    if (newsletter) {
      setNewsletterData(newsletter);
    }
  }, [newsletter]);

  // Mettre à jour le parent avec les données combinées
  useEffect(() => {
    if (moduleData && newsletterData && setParentModuleData) {
      setParentModuleData({
        ...moduleData,
        ...newsletterData,
      });
    }
  }, [moduleData, newsletterData, setParentModuleData]);

  // Champs pour le formulaire Module (name, title)
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
      label: t("pages.modules.newsletter.title"),
      type: "text",
      placeholder: t("pages.modules.shared.titlePlaceholder"),
      required: true,
    },
  ];

  // Champs pour le formulaire Newsletter (variant, writer, writingDate)
  const newsletterFields = [
    {
      name: "variant",
      label: t("pages.modules.newsletter.variant"),
      type: "select",
      required: true,
      options: variantOptions,
    },
  ];

  // Soumission du formulaire Module
  const handleModuleSubmit = async (values) => {
    setSavingModule(true);
    try {
      const payload = {
        name: values.name,
        title: values.title,
      };

      const response = await axios.put(
        `/api/modules/${module.moduleId}`,
        payload,
      );

      // Mettre à jour moduleData
      setModuleData((prev) => ({
        ...prev,
        ...response.data,
      }));

      showSuccess(t("pages.notifications.moduleUpdatedMessage"));
    } catch (err) {
      console.error("❌ Erreur lors de la sauvegarde du module:", err);
      showError(t("pages.errors.saveModuleMessage"));
      throw err;
    } finally {
      setSavingModule(false);
    }
  };

  // Soumission du formulaire Newsletter
  const handleNewsletterSubmit = async (values) => {
    setSavingNewsletter(true);
    try {
      const payload = {
        variant: values.variant,
        writer: values.writer || null,
        writingDate: values.writingDate || null,
      };

      const response = await axios.put(
        `/api/newsletters/${newsletter.id}`,
        payload,
      );

      // Mettre à jour newsletterData
      setNewsletterData((prev) => ({
        ...prev,
        ...response.data,
      }));

      showSuccess(t("pages.notifications.newsletterUpdatedMessage"));
    } catch (err) {
      console.error("❌ Erreur lors de la sauvegarde de la newsletter:", err);
      showError(t("pages.errors.saveModuleMessage"));
      throw err;
    } finally {
      setSavingNewsletter(false);
    }
  };

  const handleCancelModuleEdit = async () => {
    await refetchModule();
  };

  const handleCancelNewsletterEdit = async () => {
    await refetchNewsletter();
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateModuleVisibility(moduleId, isVisible);
      setSavingVisibility(false);
      setModuleData((prev) => ({ ...prev, isVisible }));
      showSuccess(
        `${t("pages.common.moduleCapitalized")} ${t(
          isVisible ? "pages.common.visible" : "pages.common.hidden",
        )}`,
      );
    } catch (err) {
      console.error(err);
      showError(t("pages.errors.visibilityModuleMessage"));
      setSavingVisibility(false);
    }
  };

  // Ne pas return tôt; les panels gèreront leur loading via props
  const effectiveLoading = Boolean(
    parentLoading || moduleLoading || newsletterLoading || variantsLoading,
  );

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}

      {/* Section Visibilité */}
      <VisibilitySwitch
        title={t("pages.modules.shared.moduleVisibilityTitle")}
        label={t("pages.modules.shared.moduleVisibilityLabel")}
        isVisible={moduleData?.isVisible || false}
        onChange={handleVisibilityChange}
        savingVisibility={savingVisibility}
      />

      {/* Formulaire Module (name, title) */}
      <EditablePanelV2
        title={t("pages.modules.newsletter.detailsTitle")}
        fields={moduleFields}
        initialValues={moduleData || {}}
        onSubmit={handleModuleSubmit}
        onCancelExternal={handleCancelModuleEdit}
        loading={savingModule || effectiveLoading}
        displayColumns={2}
      />

      {/* Formulaire Newsletter (variant, writer, writingDate) */}
      <EditablePanelV2
        title={t("pages.modules.newsletter.settingsTitle")}
        fields={newsletterFields}
        initialValues={newsletterData || {}}
        onSubmit={handleNewsletterSubmit}
        onCancelExternal={handleCancelNewsletterEdit}
        loading={savingNewsletter || effectiveLoading}
        displayColumns={2}
      />

      {/* Gestion des contenus */}
      <ContentManager
        parentId={moduleId}
        parentType="module"
        customLabels={{
          header: t("pages.modules.newsletter.contentHeader"),
          addButton: t("pages.modules.newsletter.contentAdd"),
          empty: t("pages.modules.newsletter.contentEmpty"),
          loading: t("pages.common.loadingContents"),
          saveContent: t("pages.common.saveContent"),
          bodyLabel: t("pages.modules.newsletter.contentBodyLabel"),
        }}
      />
    </div>
  );
}
