"use client";

import React, { useEffect, useState } from "react";
import SectionsTabs from "@/components/SectionsTabs";
import Utilities from "@/components/ui/Utilities";
import Title from "@/components/ui/Title";
import useGetSection from "@/hooks/useGetSection";
import usePublicationInfo from "@/hooks/usePublicationInfo";
import useAddSection from "@/hooks/useAddSection";
import { useSectionOperations } from "@/hooks/useSectionOperations";
import EditablePanel from "@/components/ui/EditablePanel";
import MediaManager from "@/components/MediaManager";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import ContentManager from "@/components/ContentManager";
import SceneLayout from "@/components/ui/SceneLayout";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";
import { buildPageBreadcrumbs } from "@/utils/breadcrumbs";
import { useTranslation } from "@/i18n/I18nContext";

export default function EditSection({ sectionId, pageId }) {
  const { t } = useTranslation();
  const { section, refetch, loading, error } = useGetSection({ sectionId });
  const { info, refetchInfo, resetDraft } = usePublicationInfo(
    "sections",
    sectionId,
  );
  const { updateSection } = useAddSection();
  const { updateSectionVisibility } = useSectionOperations();
  const [sectionData, setSectionData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [formKey, setFormKey] = useState(0); // Clé pour forcer le remontage du formulaire
  const axios = useAxiosClient();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    if (section) setSectionData(section);
  }, [section]);

  // Champs du formulaire pour une section
  const fields = [
    {
      name: "name",
      label: t("pages.scenes.editSection.fields.name"),
      type: "text",
      placeholder: t("pages.scenes.editSection.fields.namePlaceholder"),
      required: true,
    },
    {
      name: "title",
      label: t("pages.scenes.editSection.fields.title"),
      type: "text",
      placeholder: t("pages.scenes.editSection.fields.titlePlaceholder"),
      required: true,
    },
  ];

  const handleAddMedia = async (sectionId, mediaId) => {
    try {
      await axios.put(`/api/sections/${sectionId}/media`, {
        mediaId: mediaId,
      });
      await refetch();
      showSuccess(
        t("pages.notifications.mediaAddedTitle"),
        t("pages.notifications.mediaAddedMessage"),
      );

      // Construire l'objet content avec le média ajouté
      return {
        ...sectionData,
        medias: [{ id: mediaId }],
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout du média:", error);
      showError(t("pages.errors.genericTitle"), t("pages.errors.mediaAddMessage"));
      throw error;
    }
  };

  const handleRemoveMedia = async (sectionId, _mediaId) => {
    try {
      await axios.delete(`/api/sections/${sectionId}/media`);
      await refetch();
      showSuccess(
        t("pages.notifications.mediaDeletedTitle"),
        t("pages.notifications.mediaDeletedMessage"),
      );
    } catch (error) {
      console.error("Erreur lors de la suppression du média:", error);
      showError(
        t("pages.errors.genericTitle"),
        t("pages.errors.mediaDeleteMessage"),
      );
      throw error;
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateSection(sectionId, {
        name: values.name,
        title: values.title,
        subTitle: values.subTitle,
        content: values.content,
        order: parseInt(values.order) || 0,
      });
      refetch();
      refetchInfo();
      // MyForm gère déjà les notifications de succès
    } catch (err) {
      console.error(err);
      // MyForm gère déjà les notifications d'erreur
      throw err; // Re-lancer l'erreur pour que MyForm puisse l'afficher
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setSectionData(section);
    setFormKey((prev) => prev + 1);
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateSectionVisibility(sectionId, isVisible);
      setSavingVisibility(false);
      setSectionData((prev) => ({ ...prev, isVisible }));
      showSuccess(
        t("pages.notifications.visibilityUpdatedTitle"),
        `${t("pages.common.sectionCapitalized")} ${t(
          isVisible ? "pages.common.visible" : "pages.common.hidden",
        )}`,
      );
    } catch (err) {
      console.error(err);
      showError(
        t("pages.errors.genericTitle"),
        t("pages.errors.visibilityMessage"),
      );
      setSavingVisibility(false);
    }
  };

  // Fonction pour publier la section courante
  const handlePublishSection = async () => {
    try {
      await axios.put(`/api/sections/${sectionId}/publish`);
      await refetch();
      await refetchInfo();
      showSuccess(
        t("pages.notifications.publishedTitle"),
        t("pages.notifications.sectionPublishedMessage"),
      );
    } catch (err) {
      console.error(err);
      showError(
        t("pages.errors.genericTitle"),
        t("pages.errors.publishSectionMessage"),
      );
    }
  };

  const handleResetSection = async () => {
    try {
      await resetDraft();
      await refetch();
      setFormKey((prev) => prev + 1);
      showSuccess(
        t("pages.notifications.resetSectionTitle"),
        t("pages.notifications.resetSectionMessage"),
      );
    } catch (err) {
      console.error(err);
      showError(
        t("pages.errors.genericTitle"),
        t("pages.errors.resetSectionMessage"),
      );
    }
  };

  // Suppression gérée par les scènes parent (Sections/Modules) via DraggableTree.

  // On ne retourne plus tôt : on laisse `Title` et `Utilities` gérer le disabled via `loading`.
  // Les erreurs restent affichées dans la zone de contenu.

  // Construire les breadcrumbs
  const breadcrumbs = section
    ? buildPageBreadcrumbs(
        { id: pageId, name: section.page?.name || t("pages.common.pageCapitalized") },
        section,
      )
    : [];

  return (
    <SceneLayout>
      <Title
        label={t("pages.scenes.editSection.title")}
        onPublish={handlePublishSection}
        onReset={handleResetSection}
        publicationInfo={info}
        showBreadcrumbs={!!section}
        breadcrumbs={breadcrumbs}
        loading={loading}
      />

      <SectionsTabs pageId={pageId} sectionId={sectionId} />

      <Utilities actions={[]} loading={loading} />

      <div className="space-y-6">
        {/* Section Visibilité séparée */}
        <VisibilitySwitch
          title={t("pages.scenes.editSection.visibilityTitle")}
          label={t("pages.scenes.editSection.visibilityLabel")}
          isVisible={sectionData?.isVisible || false}
          onChange={handleVisibilityChange}
          savingVisibility={savingVisibility}
          loading={!sectionData}
        />

        <EditablePanel
          key={`${(sectionData && sectionData.sectionId) || "section-form"}-${formKey}`}
          title={t("pages.scenes.editSection.detailsTitle")}
          fields={fields}
          initialValues={sectionData || {}}
          onSubmit={handleSubmit}
          loading={saving || !sectionData}
          onCancelExternal={handleCancelEdit}
          displayColumns={2}
        />

        {/* Rich Text Content Editor */}
        <ContentManager
          key={`contents-${formKey}`}
          parentId={section?.sectionId}
          parentType="section"
          customLabels={{
            header: t("pages.scenes.editSection.contentHeader"),
            addButton: t("pages.common.addContent"),
            empty: t("pages.scenes.editSection.contentEmpty"),
            loading: t("pages.common.loadingContents"),
            saveContent: t("pages.common.saveContent"),
            bodyLabel: t("pages.scenes.editSection.contentBodyLabel"),
          }}
        />
      </div>

      {/* Gestion de l'image de la section (Section Media) */}
      {sectionData && (
        <MediaManager
          title={t("pages.scenes.editSection.sectionMediaTitle")}
          content={{
            id: sectionId,
            medias: section?.media ? [section.media] : [],
          }}
          onMediaAdd={handleAddMedia}
          onMediaRemove={handleRemoveMedia}
          onMediaChanged={refetch}
          maxMedias={1}
        />
      )}

      {/* Affichage d'erreur global si besoin */}
      {error && (
        <div className="text-center py-4 text-red-600">
          {t("pages.errors.loadingPrefix")}: {error.message}
        </div>
      )}

      {/* Notification */}
      <Notification {...notification} onClose={hideNotification} />
    </SceneLayout>
  );
}
