"use client";

import React, { useEffect, useState } from "react";
import SceneLayout from "@/components/ui/SceneLayout";
import PagesTabs from "@/components/PagesTabs";
import Utilities from "@/components/ui/Utilities";
import Title from "@/components/ui/Title";
import useGetPage from "@/hooks/useGetPage";
import useAddPage from "@/hooks/useAddPage";
import useUpdatePageVisibility from "@/hooks/useUpdatePageVisibility";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import MediaManager from "@/components/MediaManager";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useAxiosClient } from "@/utils/axiosClient";
import { buildPageBreadcrumbs } from "@/utils/breadcrumbs";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";

export default function EditPage({ pageId }) {
  const { page, refetch } = useGetPage({ route: pageId });
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
      label: "Nom de la page",
      type: "text",
      placeholder: "Entrez le nom de page",
      required: true,
    },
    {
      name: "title",
      label: "Titre",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
    },
    {
      name: "subTitle",
      label: "Sous-titre",
      type: "text",
      placeholder: "Entrez le sous-titre",
      required: false,
    },
    {
      name: "slug",
      label: "Slug",
      type: "readonly",
      placeholder: "Le slug sera généré automatiquement",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Entrez une description",
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
      showSuccess("Page enregistrée", "La page a été mise à jour avec succès");
    } catch (err) {
      console.error(err);
      showError("Erreur de sauvegarde", "Impossible d'enregistrer la page");
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setPageData(page);
    setFormKey((prev) => prev + 1);
    showSuccess("Modifications annulées", "Les changements ont été annulés");
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updatePageVisibility(pageId, isVisible);
      setSavingVisibility(false);
      setPageData((prev) => ({ ...prev, isVisible }));
      refetch();
      showSuccess(
        `Page ${isVisible ? "rendue visible" : "masquée"}`,
        "La visibilité a été mise à jour automatiquement",
      );
    } catch (err) {
      console.error(err);
      showError("Erreur de visibilité", "Impossible de modifier la visibilité");
      setSavingVisibility(false);
    }
  };

  // Fonction pour publier la page courante
  const handlePublishPage = async () => {
    try {
      await axios.put(`/api/pages/${pageId}/publish`);
      await refetch();
      showSuccess("Page publiée", "La page a été publiée avec succès");
    } catch (err) {
      console.error(err);
      showError("Erreur de publication", "Impossible de publier la page");
    }
  };

  const breadcrumbs = pageData ? buildPageBreadcrumbs(pageData) : [];

  return (
    <SceneLayout>
      <Title
        label={
          pageData ? pageData.name || "Page sans nom" : "Gestion des pages"
        }
        onPublish={handlePublishPage}
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
          title="Visibilité de la page"
          label="Page visible sur le site"
          isVisible={pageData?.isVisible || false}
          onChange={handleVisibilityChange}
          savingVisibility={savingVisibility}
          loading={!pageData}
        />

        {/* Formulaire principal */}
        <EditablePanelV2
          key={`${(pageData && pageData.id) || "page-form"}-${formKey}`}
          title="Détails de la page"
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
          title="Image de bannière"
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
