"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlusIcon } from "@heroicons/react/16/solid";

import Utilities from "@/components/Utilities";
import DraggableTree from "@/components/DraggableTree";
import useGetPages from "@/hooks/useGetPages";
import useAddPage from "@/hooks/useAddPage";
import { deletePage } from "@/utils/deletePage";
import { removeItem } from "@/utils/treeHelpers";
import Title from "@/components/Title";

export default function Pages() {
  const router = useRouter();
  const { pages, refetch, loading, error } = useGetPages({ route: "tree" });
  const { createPage } = useAddPage();

  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    if (pages) setTreeData(pages);
  }, [pages]);

  useEffect(() => {
    if (pages) setTreeData(pages);
  }, [pages]);

  const handleTreeChange = (newTree) => {
    setTreeData(newTree);
  };

  // Toggle visible
  const toggleRecursive = (nodes, itemId, newVal) => {
    return nodes.map((node) => {
      if (node.id === itemId) {
        return { ...node, isVisible: newVal };
      }
      if (node.children && node.children.length > 0) {
        return { ...node, children: toggleRecursive(node.children, itemId, newVal) };
      }
      return node;
    });
  };

  const handleToggle = (item, newVal) => {
    setTreeData((prev) => toggleRecursive(prev, item.id, newVal));
  };

  // Edit
  const handleEdit = (item) => {
    router.push(`/pages/${item.pageId}`);
  };

  // Delete
  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette page ?",
    );
    if (!confirmDelete) return;

    try {
      await deletePage(item.id);
      await refetch();
      setTreeData((prev) => removeItem(prev, item.id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p>Erreur: {error.message}</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-10"
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
            callback: async () => {
              await createPage({ name: "Nouvelle page" });
              await refetch();
            },
          },
        ]}
        apiUrl="/api/pages/tree"
        data={{ initial: pages, current: treeData }}
      />

      <DraggableTree
        initialData={pages || []}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onChange={handleTreeChange}
      />
    </motion.div>
  );
}
