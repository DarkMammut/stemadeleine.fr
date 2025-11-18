"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Utilities from "@/components/ui/Utilities";
import Title from "@/components/ui/Title";
import MediaManager from "@/components/MediaManager";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import ContentManager from "@/components/ContentManager";
import PublicationInfoCard from "@/components/PublicationInfoCard";
import Notification from "@/components/ui/Notification";
import { useNewsPublicationOperations } from "@/hooks/useNewsPublicationOperations";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SceneLayout from "@/components/ui/SceneLayout";
import EditablePanel from "@/components/ui/EditablePanel";

export default function EditNews({ newsId }) {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [error, setError] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const axios = useAxiosClient();
  const router = useRouter();
  const {
    getNewsPublicationById,
    updateNewsPublication,
    updateNewsPublicationVisibility,
    publishNewsPublication,
    deleteNewsPublication,
  } = useNewsPublicationOperations();

  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // Load news data
  useEffect(() => {
    if (newsId) {
      loadNews();
    }
  }, [newsId]);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNewsPublicationById(newsId);
      setNewsData(data);
    } catch (error) {
      console.error("Error loading news:", error);
      setError(error);
      showError("Erreur de chargement", "Impossible de charger l'actualité");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedia = async (newsId, mediaId) => {
    try {
      await axios.put(`/api/news-publications/${newsId}/media`, {
        mediaId: mediaId,
      });
      await loadNews();
      showSuccess("Média ajouté", "Le média a été ajouté avec succès");

      return {
        ...newsData,
        medias: [{ id: mediaId }],
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout du média:", error);
      showError("Erreur", "Impossible d'ajouter le média");
      throw error;
    }
  };

  const handleRemoveMedia = async (newsId) => {
    try {
      await axios.delete(`/api/news-publications/${newsId}/media`);
      await loadNews();
      showSuccess("Média supprimé", "Le média a été supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du média:", error);
      showError("Erreur", "Impossible de supprimer le média");
      throw error;
    }
  };

  // Form fields for news editing
  const fields = [
    {
      name: "name",
      label: "Nom de l'actualité",
      type: "text",
      placeholder: "Entrez le nom de l'actualité",
      required: true,
      defaultValue: newsData?.name || "",
    },
    {
      name: "title",
      label: "Titre",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
      defaultValue: newsData?.title || "",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Entrez une description",
      required: false,
      defaultValue: newsData?.description || "",
    },
    {
      name: "startDate",
      label: "Date de début",
      type: "date",
      required: true,
    },
    {
      name: "endDate",
      label: "Date de fin",
      type: "date",
      required: true,
    },
  ];

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      // Validation: endDate must be >= startDate
      if (values.startDate && values.endDate) {
        const [sy, sm, sd] = String(values.startDate)
          .split("-")
          .map((v) => parseInt(v, 10));
        const [ey, em, ed] = String(values.endDate)
          .split("-")
          .map((v) => parseInt(v, 10));
        const sdt = new Date(sy, sm - 1, sd).getTime();
        const edt = new Date(ey, em - 1, ed).getTime();
        if (edt < sdt) {
          showError(
            "Erreur de validation",
            "La date de fin ne peut pas être antérieure à la date de début",
          );
          return;
        }
      }
      await updateNewsPublication(newsId, {
        name: values.name,
        title: values.title,
        description: values.description,
        startDate: values.startDate,
        endDate: values.endDate,
      });
      await loadNews();
      showSuccess(
        "Actualité mise à jour",
        "Les modifications ont été enregistrées avec succès",
      );
    } catch (err) {
      console.error(err);
      showError(
        "Erreur de sauvegarde",
        "Impossible d'enregistrer les modifications",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    loadNews();
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateNewsPublicationVisibility(newsId, isVisible);
      setNewsData((prev) => ({ ...prev, isVisible }));
      showSuccess(
        "Visibilité mise à jour",
        `Actualité ${isVisible ? "visible" : "masquée"} avec succès`,
      );
    } catch (err) {
      console.error(err);
      showError("Erreur", "Impossible de modifier la visibilité");
    } finally {
      setSavingVisibility(false);
    }
  };

  const handlePublish = async () => {
    setShowPublishModal(true);
  };

  const confirmPublish = async () => {
    try {
      setSaving(true);
      await publishNewsPublication(newsId);
      await loadNews();
      showSuccess(
        "Actualité publiée",
        "L'actualité a été publiée avec succès !",
      );
    } catch (err) {
      console.error(err);
      showError("Erreur de publication", "Impossible de publier l'actualité");
    } finally {
      setSaving(false);
      setShowPublishModal(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNewsPublication(newsId);
      showSuccess(
        "Actualité supprimée",
        "L'actualité a été supprimée avec succès",
      );
      // Redirection vers la liste des actualités
      router.push("/news");
    } catch (err) {
      console.error(err);
      showError("Erreur de suppression", "Impossible de supprimer l'actualité");
      throw err; // Re-throw pour que DeleteButton gère l'état
    }
  };

  const effectiveLoading = loading;

  if (error)
    return (
      <div className="text-center py-8 text-red-600">
        Erreur: {error.message || "Erreur lors du chargement"}
      </div>
    );

  return (
    <SceneLayout>
      <Title label="Édition d'actualité" />

      <Utilities actions={[]} />

      {effectiveLoading || !newsData ? (
        <div className="space-y-6">
          <PublicationInfoCard loading={effectiveLoading} />
          <VisibilitySwitch loading={effectiveLoading} />
          <EditablePanel
            title="Informations de l'actualité"
            loading={effectiveLoading}
            canEdit={false}
            fields={fields}
            initialValues={newsData || {}}
            displayColumns={2}
            displayGap={4}
          />
          <ContentManager
            parentId={newsId}
            parentType="news-publication"
            customLabels={{
              header: "Contenus de l'actualité",
              addButton: "Ajouter un contenu",
              empty: "Aucun contenu pour cette actualité.",
              loading: "Chargement des contenus...",
              saveContent: "Enregistrer le contenu",
              bodyLabel: "Contenu de l'actualité",
            }}
            loading={effectiveLoading}
          />

          <MediaManager
            title="Image de l'actualité"
            content={{
              id: newsId,
              medias: newsData?.media ? [newsData.media] : [],
            }}
            onMediaAdd={handleAddMedia}
            onMediaRemove={handleRemoveMedia}
            onMediaChanged={loadNews}
            maxMedias={1}
            loading={effectiveLoading}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* News Information, Status and Actions */}
          <PublicationInfoCard
            title={newsData.name}
            status={newsData.status}
            createdAt={newsData.createdAt}
            publishedDate={newsData.publishedDate}
            updatedAt={newsData.updatedAt}
            author={newsData.author}
            entityId={newsData?.newsId || newsData?.id}
            entityIdLabel="ID Actualité"
            contentsCount={newsData?.contents ? newsData.contents.length : 0}
            onPublish={handlePublish}
            canPublish={newsData.status === "DRAFT"}
            isPublishing={saving}
            onDelete={handleDelete}
            isDeleting={saving}
            deleteConfirmTitle="Supprimer l'actualité"
            deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer cette actualité ? Cette action est irréversible."
          />

          {/* News Visibility */}
          <VisibilitySwitch
            title="Visibilité de l'actualité"
            label="Actualité visible sur le site"
            isVisible={newsData?.isVisible || false}
            onChange={handleVisibilityChange}
            savingVisibility={savingVisibility}
            loading={effectiveLoading}
          />

          {/* Main Form */}
          {newsData && Object.keys(newsData).length > 0 && (
            <EditablePanel
              title="Informations de l'actualité"
              canEdit={true}
              initialValues={newsData}
              fields={fields}
              displayColumns={2}
              onSubmit={handleSubmit}
              onCancelExternal={handleCancelEdit}
            ></EditablePanel>
          )}

          {/* Rich Text Content Editor */}
          <ContentManager
            parentId={newsId}
            parentType="news-publication"
            customLabels={{
              header: "Contenus de l'actualité",
              addButton: "Ajouter un contenu",
              empty: "Aucun contenu pour cette actualité.",
              loading: "Chargement des contenus...",
              saveContent: "Enregistrer le contenu",
              bodyLabel: "Contenu de l'actualité",
            }}
            loading={effectiveLoading}
          />
        </div>
      )}

      {/* Gestion de l'image de l'actualité (News Media) */}
      {newsData && (
        <MediaManager
          title="Image de l'actualité"
          content={{
            id: newsId,
            medias: newsData?.media ? [newsData.media] : [],
          }}
          onMediaAdd={handleAddMedia}
          onMediaRemove={handleRemoveMedia}
          onMediaChanged={loadNews}
          maxMedias={1}
          loading={effectiveLoading}
        />
      )}

      {/* Publish Confirmation Modal */}
      <ConfirmModal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={confirmPublish}
        title="Publier l'actualité"
        message="Êtes-vous sûr de vouloir publier cette actualité ?"
        confirmLabel="Publier"
        isLoading={saving}
        variant="primary"
      />

      {/* Notification */}
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
