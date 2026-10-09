"use client";

import React, { useEffect, useState } from "react";
import SceneLayout from "@/components/ui/SceneLayout";
import PagesTabs from "@/components/PagesTabs";
import Utilities from "@/components/ui/Utilities";
import Title from "@/components/ui/Title";
import useGetPage from "@/hooks/useGetPage";
import usePublicationInfo from "@/hooks/usePublicationInfo";
import useAddPage from "@/hooks/useAddPage";
import useUpdatePageVisibility from "@/hooks/useUpdatePageVisibility";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import MediaManager from "@/components/MediaManager";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useAxiosClient } from "@/utils/axiosClient";
import { buildPageBreadcrumbs } from "@/utils/breadcrumbs";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useTranslation } from "@/i18n/I18nContext";

export default function EditPage({ pageId }) {
  const { t } = useTranslation();
  const { page, refetch } = useGetPage({ route: pageId });
  const { info, refetchInfo, resetDraft } = usePublicationInfo("pages", pageId);
  const { updatePage } = useAddPage();
  const { updatePageVisibility } = useUpdatePageVisibility();
  const [pageData, setPageData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [formKey, setFormKey] = useState(0); // Clé pour forcer le remontage du formulaire
  const axios = useAxiosClient();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    if (page) setPageData(page);
  }, [page]);

  const fields = [
    {
      name: "name",
      label: t("pages.scenes.editPage.fields.name"),
      type: "text",
      placeholder: t("pages.scenes.editPage.fields.namePlaceholder"),
      required: true,
    },
    {
      name: "title",
      label: t("pages.scenes.editPage.fields.title"),
      type: "text",
      placeholder: t("pages.scenes.editPage.fields.titlePlaceholder"),
      required: true,
    },
    {
      name: "subTitle",
      label: t("pages.scenes.editPage.fields.subTitle"),
      type: "text",
      placeholder: t("pages.scenes.editPage.fields.subTitlePlaceholder"),
      required: false,
    },
    {
      name: "slug",
      label: t("pages.scenes.editPage.fields.slug"),
      type: "readonly",
      placeholder: t("pages.scenes.editPage.fields.slugPlaceholder"),
      required: true,
    },
    {
      name: "description",
      label: t("pages.scenes.editPage.fields.description"),
      type: "textarea",
      placeholder: t("pages.scenes.editPage.fields.descriptionPlaceholder"),
      required: false,
    },
  ];

  const handleAddMedia = async (pageId, mediaId) => {
    try {
      await axios.put(`/api/pages/${pageId}/hero-media`, {
        heroMediaId: mediaId,
      });
      await refetch();

      // Construire l'objet content avec le média ajouté
      return {
        ...pageData,
        medias: [{ id: mediaId }],
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout du média:", error);
      throw error;
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleRemoveMedia = async (pageId, _mediaId) => {
    try {
      await axios.delete(`/api/pages/${pageId}/media`);
      await refetch();
    } catch (error) {
      console.error("Erreur lors de la suppression du média:", error);
      throw error;
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updatePage(pageId, {
        name: values.name,
        title: values.title,
        subTitle: values.subTitle,
        description: values.description,
      });
      setSaving(false);
      refetch();
      refetchInfo();
      showSuccess(
        t("pages.notifications.pageUpdatedTitle"),
        t("pages.notifications.pageUpdatedMessage"),
      );
    } catch (err) {
      console.error(err);
      showError(t("pages.errors.saveTitle"), t("pages.errors.savePageMessage"));
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setPageData(page);
    setFormKey((prev) => prev + 1);
    showSuccess(
      t("pages.notifications.changesCancelledTitle"),
      t("pages.notifications.changesCancelledMessage"),
    );
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updatePageVisibility(pageId, isVisible);
      setSavingVisibility(false);
      setPageData((prev) => ({ ...prev, isVisible }));
      refetch();
      showSuccess(
        `${t("pages.common.pageCapitalized")} ${
          isVisible ? t("pages.common.visible") : t("pages.common.hidden")
        }`,
        t("pages.notifications.visibilityUpdatedAutomaticMessage"),
      );
    } catch (err) {
      console.error(err);
      showError(
        t("pages.errors.visibilityTitle"),
        t("pages.errors.visibilityMessage"),
      );
      setSavingVisibility(false);
    }
  };

  // Fonction pour publier la page courante
  const handlePublishPage = async () => {
    try {
      await axios.put(`/api/pages/${pageId}/publish`);
      await refetch();
      await refetchInfo();
      showSuccess(
        t("pages.notifications.publishedTitle"),
        t("pages.notifications.pagePublishedMessage"),
      );
    } catch (err) {
      console.error(err);
      showError(
        t("pages.errors.publishTitle"),
        t("pages.errors.publishPageMessage"),
      );
    }
  };

  const handleResetPage = async () => {
    try {
      await resetDraft();
      await refetch();
      setFormKey((prev) => prev + 1);
      showSuccess(
        t("pages.notifications.resetPageTitle"),
        t("pages.notifications.resetPageMessage"),
      );
    } catch (err) {
      console.error(err);
      showError(t("pages.errors.genericTitle"), t("pages.errors.resetPageMessage"));
    }
  };

  const breadcrumbs = pageData ? buildPageBreadcrumbs(pageData) : [];

  return (
    <SceneLayout>
      <Title
        label={
          pageData
            ? pageData.name || t("pages.scenes.editPage.unnamedPage")
            : t("pages.scenes.editPage.fallbackTitle")
        }
        onPublish={handlePublishPage}
        onReset={handleResetPage}
        publicationInfo={info}
        showBreadcrumbs={!!pageData}
        breadcrumbs={breadcrumbs}
        loading={!page}
      />
      <PagesTabs pageId={pageId} />
      <Utilities actions={[]} loading={!page} />
      {/* On laisse les composants gérer le loading via leurs props */}
      <div className="space-y-6">
        {/* Section Visibilité séparée */}
        <VisibilitySwitch
          title={t("pages.scenes.editPage.visibilityTitle")}
          label={t("pages.scenes.editPage.visibilityLabel")}
          isVisible={pageData?.isVisible || false}
          onChange={handleVisibilityChange}
          savingVisibility={savingVisibility}
          loading={!pageData}
        />

        {/* Formulaire principal */}
        <EditablePanelV2
          key={`${(pageData && pageData.id) || "page-form"}-${formKey}`}
          title={t("pages.scenes.editPage.detailsTitle")}
          fields={fields}
          initialValues={pageData || {}}
          onSubmit={handleSubmit}
          loading={saving || !pageData}
          onCancelExternal={handleCancelEdit}
          displayColumns={2}
        />
      </div>
      {/* Gestion de l'image de bannière (Hero Media) */}
      {pageData && (
        <MediaManager
          title={t("pages.scenes.editPage.heroMediaTitle")}
          content={{
            id: pageId,
            medias: page?.heroMedia ? [page.heroMedia] : [],
          }}
          onMediaAdd={handleAddMedia}
          onMediaRemove={handleRemoveMedia}
          onMediaChanged={refetch}
          maxMedias={1}
        />
      )}
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
