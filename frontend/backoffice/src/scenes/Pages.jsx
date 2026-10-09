"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@heroicons/react/16/solid";

// Hooks
import useGetPages from "@/hooks/useGetPages";
import useAddPage from "@/hooks/useAddPage";
import useUpdatePageVisibility from "@/hooks/useUpdatePageVisibility";
import useUpdatePageOrder from "@/hooks/useUpdatePageOrder";
import { useAxiosClient } from "@/utils/axiosClient";
import { useNotification } from "@/hooks/useNotification";
import { removeItem } from "@/utils/treeHelpers";

// UI / Components
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Utilities from "@/components/ui/Utilities";
import DraggableTree from "@/components/ui/DraggableTree";
import Notification from "@/components/ui/Notification";
import { useTranslation } from "@/i18n/I18nContext";

export default function Pages() {
  const router = useRouter();
  const { t } = useTranslation();
  const axios = useAxiosClient();
  const { pages, refetch, loading, error } = useGetPages({ route: "tree" });
  const { createPage } = useAddPage();
  const { updatePageVisibility } = useUpdatePageVisibility();
  const { updatePageOrder } = useUpdatePageOrder();

  const [treeData, setTreeData] = useState([]);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    if (pages) setTreeData(pages);
  }, [pages]);

  const handleTreeChange = useCallback(
    async (newTree) => {
      setTreeData(newTree);

      try {
        // Automatically save page order
        await updatePageOrder(newTree);
      } catch (error) {
        console.error("Error during automatic order saving:", error);
        // Optional: show error notification to user
      }
    },
    [updatePageOrder],
  );

  // Toggle visible - avec le nouveau hook dédié
  const handleToggle = useCallback(
    async (item, newVal) => {
      try {
        // Appel API pour mettre à jour la visibilité
        await updatePageVisibility(item.pageId || item.id, newVal);

        // Mettre à jour l'état local immédiatement après succès
        setTreeData((prev) => {
          const updateRecursive = (nodes) => {
            return nodes.map((node) => {
              if (node.id === item.id) {
                return { ...node, isVisible: newVal };
              }
              if (node.children && node.children.length > 0) {
                return { ...node, children: updateRecursive(node.children) };
              }
              return node;
            });
          };
          return updateRecursive(prev);
        });
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour de la visibilité :",
          error,
        );
      }
    },
    [updatePageVisibility],
  );

  // Edit - navigation vers l'édition
  const handleEdit = useCallback(
    (item) => {
      router.push(`/pages/${item.pageId}`);
    },
    [router],
  );

  // Delete - appelé après confirmation interne du DeleteButton
  const handleDelete = useCallback(
    async (item) => {
      try {
        await axios.delete(`/api/pages/${item.pageId}`);
        await refetch();
        setTreeData((prev) => removeItem(prev, item.id));
        showSuccess(
          t("pages.notifications.pageDeletedTitle"),
          t("pages.notifications.pageDeletedMessage"),
        );
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        showError(
          t("pages.errors.deleteTitle"),
          t("pages.errors.deletePageMessage"),
        );
      }
    },
    [axios, refetch, showSuccess, showError, t],
  );

  // Création directe d'une page racine
  const handleCreateRootPage = useCallback(async () => {
    try {
      await createPage({
        parentPageId: null,
        name: t("pages.defaultNames.page"),
      });
      await refetch();
      showSuccess(
        t("pages.notifications.pageCreatedTitle"),
        t("pages.notifications.pageCreatedMessage"),
      );
    } catch (error) {
      console.error("Erreur lors de l'ajout de la page:", error);
      showError(
        t("pages.errors.creationTitle"),
        t("pages.errors.creationPageMessage"),
      );
    }
  }, [createPage, refetch, showSuccess, showError, t]);

  // Fonction pour publier toutes les pages (et enfants) via la nouvelle route backend
  const handlePublishPages = async () => {
    try {
      await axios.put("/api/pages/tree/publish");
      await refetch();
      showSuccess(
        t("pages.notifications.publishCompletedTitle"),
        t("pages.notifications.publishCompletedMessage"),
      );
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      showError(
        t("pages.errors.publishTitle"),
        t("pages.errors.publishPageMessage"),
      );
    }
  };

  if (error) return <p>{t("pages.errors.loadingPrefix")}: {error.message}</p>;

  return (
    <SceneLayout>
      <Title
        label={t("pages.scenes.pages.title")}
        onPublish={handlePublishPages}
        loading={loading}
      />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: t("pages.scenes.pages.newPage"),
            callback: handleCreateRootPage,
          },
        ]}
        loading={loading}
      />

      <DraggableTree
        initialData={treeData}
        onChange={handleTreeChange}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canHaveChildren={() => true}
        loading={loading}
      />

      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />

      {/* ConfirmModal removed: DeleteButton shows its own confirmation modal */}
    </SceneLayout>
  );
}
