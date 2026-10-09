"use client";

import React, { useEffect, useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useGetModule from "@/hooks/useGetModule";
import useGetNews from "@/hooks/useGetNews";
import useNewsVariants from "@/hooks/useNewsVariants";
import ContentManager from "@/components/ContentManager";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";
import { useTranslation } from "@/i18n/I18nContext";

export default function NewsModuleEditor({
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
  const [savingNews, setSavingNews] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // Récupérer les données du module (name, title)
  const {
    module,
    refetch: refetchModule,
    loading: moduleLoading,
  } = useGetModule({ moduleId });

  // Récupérer les données complètes de l'actualité (variant, writer, writingDate, contents)
  const {
    news,
    refetch: refetchNews,
    loading: newsLoading,
  } = useGetNews({ moduleId });

  // Récupérer les variantes disponibles depuis le backend
  const { variants: variantOptions, loading: variantsLoading } =
    useNewsVariants();

  // États locaux
  const [moduleData, setModuleData] = useState(null);
  const [newsData, setNewsData] = useState(null);

  // Synchroniser avec les données du module
  useEffect(() => {
    if (module) {
      setModuleData(module);
    }
  }, [module]);

  // Synchroniser avec les données de l'actualité
  useEffect(() => {
    if (news) {
      setNewsData(news);
    }
  }, [news]);

  // Mettre à jour le parent avec les données combinées
  useEffect(() => {
    if (moduleData && newsData && setParentModuleData) {
      setParentModuleData({
        ...moduleData,
        ...newsData,
      });
    }
  }, [moduleData, newsData, setParentModuleData]);

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
      label: t("pages.modules.news.title"),
      type: "text",
      placeholder: t("pages.modules.shared.titlePlaceholder"),
      required: true,
    },
  ];

  // Champs pour le formulaire News (variant, writer, writingDate)
  const newsFields = [
    {
      name: "variant",
      label: t("pages.modules.news.variant"),
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
      console.error("Erreur lors de la sauvegarde du module:", err);
      showError(t("pages.errors.saveModuleMessage"));
      throw err;
    } finally {
      setSavingModule(false);
    }
  };

  // Soumission du formulaire News
  const handleNewsSubmit = async (values) => {
    setSavingNews(true);
    try {
      const payload = {
        variant: values.variant,
        writer: values.writer || null,
        writingDate: values.writingDate || null,
      };

      const response = await axios.put(`/api/news/${news.id}`, payload);

      // Mettre à jour newsData
      setNewsData((prev) => ({
        ...prev,
        ...response.data,
      }));

      showSuccess(t("pages.notifications.newsUpdatedMessage"));
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de l'actualité:", err);
      showError(t("pages.errors.saveModuleMessage"));
      throw err;
    } finally {
      setSavingNews(false);
    }
  };

  const handleCancelModuleEdit = async () => {
    await refetchModule();
  };

  const handleCancelNewsEdit = async () => {
    await refetchNews();
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

  const effectiveLoading = Boolean(
    parentLoading || moduleLoading || newsLoading || variantsLoading,
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
        title={t("pages.modules.news.detailsTitle")}
        fields={moduleFields}
        initialValues={moduleData || {}}
        onSubmit={handleModuleSubmit}
        onCancelExternal={handleCancelModuleEdit}
        loading={savingModule || effectiveLoading}
        displayColumns={2}
      />

      {/* Formulaire News (variant, writer, writingDate) */}
      <EditablePanelV2
        title={t("pages.modules.news.settingsTitle")}
        fields={newsFields}
        initialValues={newsData || {}}
        onSubmit={handleNewsSubmit}
        onCancelExternal={handleCancelNewsEdit}
        loading={savingNews || effectiveLoading}
        displayColumns={2}
      />

      {/* Gestion des contenus */}
      <ContentManager
        parentId={moduleId}
        parentType="module"
        customLabels={{
          header: t("pages.modules.news.contentHeader"),
          addButton: t("pages.modules.news.contentAdd"),
          empty: t("pages.modules.news.contentEmpty"),
          loading: t("pages.common.loadingContents"),
          saveContent: t("pages.common.saveContent"),
          bodyLabel: t("pages.modules.news.contentBodyLabel"),
        }}
      />
    </div>
  );
}
