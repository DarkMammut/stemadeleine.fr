"use client";

import React, { useEffect, useState } from "react";
import Title from "@/components/ui/Title";
import useGetModule from "@/hooks/useGetModule";
import usePublicationInfo from "@/hooks/usePublicationInfo";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";
import SceneLayout from "@/components/ui/SceneLayout";
import { useTranslation } from "@/i18n/I18nContext";

// Import des composants spécialisés par type de module (basés sur votre backend Java)
import NewsModuleEditor from "@/components/modules/NewsModuleEditor";
import ArticleModuleEditor from "@/components/modules/ArticleModuleEditor";
import GalleryModuleEditor from "@/components/modules/GalleryModuleEditor";
import CTAModuleEditor from "@/components/modules/CTAModuleEditor";
import FormModuleEditor from "@/components/modules/FormModuleEditor";
import ListModuleEditor from "@/components/modules/ListModuleEditor";
import TimelineModuleEditor from "@/components/modules/TimelineModuleEditor";
import NewsletterModuleEditor from "@/components/modules/NewsletterModuleEditor";

// Mapping des types de modules vers leurs composants d'édition (basé sur vos modèles Java)
const MODULE_COMPONENTS = {
  news: NewsModuleEditor,
  article: ArticleModuleEditor,
  gallery: GalleryModuleEditor,
  cta: CTAModuleEditor,
  form: FormModuleEditor,
  list: ListModuleEditor,
  timeline: TimelineModuleEditor,
  newsletter: NewsletterModuleEditor,
};

export default function EditModule({
  moduleId,
  pageId: _pageId,
  sectionId: _sectionId,
}) {
  const { t } = useTranslation();
  const { module, refetch, loading, error } = useGetModule({ moduleId });
  const [moduleData, setModuleData] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const axios = useAxiosClient();
  const { info, refetchInfo, resetDraft } = usePublicationInfo(
    "modules",
    moduleId,
  );
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  const handlePublishModule = async () => {
    try {
      await axios.put(`/api/modules/${moduleId}/publish`);
      await refetch();
      await refetchInfo();
      showSuccess(
        t("pages.notifications.publishedTitle"),
        t("pages.notifications.modulePublishedMessage"),
      );
    } catch (err) {
      console.error(err);
      showError(
        t("pages.errors.publishTitle"),
        t("pages.errors.publishModuleMessage"),
      );
    }
  };

  const handleResetModule = async () => {
    try {
      await resetDraft();
      await refetch();
      setResetKey((prev) => prev + 1);
      showSuccess(
        t("pages.notifications.resetModuleTitle"),
        t("pages.notifications.resetModuleMessage"),
      );
    } catch (err) {
      console.error(err);
      showError(
        t("pages.errors.genericTitle"),
        t("pages.errors.resetModuleMessage"),
      );
    }
  };

  // Ne pas retourner tôt — laisser les composants afficher leur état `loading` via props.
  useEffect(() => {
    if (module) {
      setModuleData(module);
    }
  }, [module]);

  // Ensure moduleData.type is never null to avoid downstream components calling .toLowerCase() or accessing .type when null
  const safeModuleData = moduleData
    ? { ...moduleData, type: moduleData?.type ?? "" }
    : null;
  const moduleTypeKey = (safeModuleData?.type || "").toLowerCase();
  const translatedModuleType = moduleTypeKey
    ? t(`pages.moduleTypes.${moduleTypeKey}`)
    : "";
  const moduleTypeLabel =
    translatedModuleType !== `pages.moduleTypes.${moduleTypeKey}`
      ? translatedModuleType
      : safeModuleData?.type;

  // Sélectionner le composant approprié en fonction du type de module (protéger les accès)
  const ModuleComponent =
    MODULE_COMPONENTS[(safeModuleData?.type || "").toLowerCase()];

  return (
    <SceneLayout>
      <Title
        label={`${t("pages.scenes.editModule.titlePrefix")} ${
          safeModuleData ? moduleTypeLabel : "..."
        }`}
        onPublish={handlePublishModule}
        onReset={handleResetModule}
        publicationInfo={info}
        loading={loading}
      />

      {/* Remplacement : on n'affiche que le ModuleComponent. Le module editor interne gère visibilité, métadonnées, contenus, etc. */}
      <div className="space-y-6">
        {error ? (
          <div className="text-center py-8 text-red-600">
            {t("pages.errors.loadingPrefix")}: {error.message}
          </div>
        ) : !safeModuleData ? (
          <div className="text-center py-8 text-gray-500">
            {t("pages.common.loadingModule")}
          </div>
        ) : ModuleComponent ? (
          <ModuleComponent
            key={resetKey}
            moduleId={moduleId}
            moduleData={safeModuleData}
            setModuleData={setModuleData}
            refetch={async () => {
              await refetch();
              refetchInfo();
            }}
            loading={Boolean(loading || !safeModuleData)}
          />
        ) : (
          <div className="text-center py-8 text-red-600">
            {t("pages.scenes.editModule.unsupportedTypePrefix")}:{" "}
            {moduleTypeLabel ?? `(${t("pages.common.unknown")})`}
          </div>
        )}
      </div>
      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </SceneLayout>
  );
}
