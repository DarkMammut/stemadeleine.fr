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

export default function Pages() {
  const router = useRouter();
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
        showSuccess("Page supprimée", "La page a été supprimée avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        showError("Erreur de suppression", "Impossible de supprimer la page");
      }
    },
    [axios, refetch, showSuccess, showError],
  );

  // Création directe d'une page racine
  const handleCreateRootPage = useCallback(async () => {
    try {
      await createPage({
        parentPageId: null,
        name: "Nouvelle page",
      });
      await refetch();
      showSuccess("Page créée", "Une nouvelle page a été créée avec succès");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la page:", error);
      showError("Erreur de création", "Impossible de créer la page");
    }
  }, [createPage, refetch, showSuccess, showError]);

  // Fonction pour publier toutes les pages (et enfants) via la nouvelle route backend
  const handlePublishPages = async () => {
    try {
      if (!treeData || treeData.length === 0) return;
      await Promise.all(
        treeData.map((page) => axios.put(`/api/pages/${page.pageId}/publish`)),
      );
      await refetch();
      showSuccess(
        "Publication terminée",
        "Toutes les pages ont été publiées avec succès",
      );
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      showError("Erreur de publication", "Impossible de publier les pages");
    }
  };

  if (error) return <p>Erreur: {error.message}</p>;

  return (
    <SceneLayout>
      <Title label="Website" onPublish={handlePublishPages} loading={loading} />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouvelle Page",
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
