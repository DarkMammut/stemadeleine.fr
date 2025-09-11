"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlusIcon } from "@heroicons/react/16/solid";

import Utilities from "@/components/Utilities";
import DraggableTree from "@/components/DraggableTree";
import useGetPages from "@/hooks/useGetPages";
import useAddPage from "@/hooks/useAddPage";
import useUpdatePageVisibility from "@/hooks/useUpdatePageVisibility";
import useUpdatePageOrder from "@/hooks/useUpdatePageOrder";
import { removeItem } from "@/utils/treeHelpers";
import Title from "@/components/Title";
import { useAxiosClient } from "@/utils/axiosClient";

export default function Pages() {
  const router = useRouter();
  const axios = useAxiosClient();
  const { pages, refetch, loading, error } = useGetPages({ route: "tree" });
  const { createPage } = useAddPage();
  const { updatePageVisibility } = useUpdatePageVisibility();
  const { updatePageOrder } = useUpdatePageOrder();

  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    if (pages) setTreeData(pages);
  }, [pages]);

  const handleTreeChange = useCallback(
    async (newTree) => {
      setTreeData(newTree);

      try {
        // Automatically save page order
        await updatePageOrder(newTree);
        console.log("Page order saved automatically");
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

        console.log(`Visibilité mise à jour pour ${item.name}: ${newVal}`);
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

  // Delete - avec axiosClient
  const handleDelete = useCallback(
    async (item) => {
      const confirmDelete = window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette page ?",
      );
      if (!confirmDelete) return;

      try {
        await axios.delete(`/api/pages/${item.pageId}`);
        await refetch();
        setTreeData((prev) => removeItem(prev, item.id));
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    },
    [refetch, axios],
  );

  // Création directe d'une page racine
  const handleCreateRootPage = useCallback(async () => {
    try {
      await createPage({
        parentPageId: null,
        name: "Nouvelle page",
      });
      await refetch();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la page:", error);
    }
  }, [createPage, refetch]);

  if (loading) return <p>Chargement…</p>;
  if (error) return <p>Erreur: {error.message}</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto p-6 space-y-6"
    >
      <Title
        label="Gestion des pages"
        apiUrl="/api/pages/tree"
        data={treeData}
      />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouvelle Page",
            callback: handleCreateRootPage,
          },
        ]}
      />

      <DraggableTree
        initialData={treeData}
        onChange={handleTreeChange}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canHaveChildren={() => true}
      />
    </motion.div>
  );
}
