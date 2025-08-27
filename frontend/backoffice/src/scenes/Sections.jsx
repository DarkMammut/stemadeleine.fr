"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlusIcon } from "@heroicons/react/16/solid";

import Utilities from "@/components/Utilities";
import useGetPage from "@/hooks/useGetPage";
import { deletePage } from "@/utils/deletePage";
import { removeItem } from "@/utils/treeHelpers";
import Title from "@/components/Title";
import useAddSection from "@/hooks/useAddSection";
import DraggableTree from "@/components/DraggableTree";

export default function Sections({ pageId }) {
  const router = useRouter();
  const { page, refetch, loading, error } = useGetPage({
    route: `${pageId}/sections`,
  });

  console.log(page);

  const { createSection } = useAddSection();

  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    if (page?.sections) {
      const tree = page.sections.map((section) => ({
        id: section.sectionId,
        name: section.name,
        type: "section",
        isVisible: section.isVisible,
        children:
          section.modules?.map((module) => ({
            id: module.id,
            name: module.name,
            type: "module",
            children: [],
          })) || [],
      }));

      setTreeData(tree);

      console.log("tree", treeData);
    }
  }, [page]);

  const handleTreeChange = (newTree) => {
    setTreeData(newTree);
  };

  // Toggle visible
  const handleToggle = (item, newVal) => {
    setTreeData((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, isVisible: newVal } : p)),
    );
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
            label: "Nouvelle Section",
            callback: async () => {
              await createSection({ pageId: pageId, name: "Nouvelle section" });
              await refetch();
            },
          },
        ]}
      />

      <DraggableTree
        initialData={treeData}
        onChange={handleTreeChange}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canHaveChildren={(item) => item.type !== "module"}
      />
    </motion.div>
  );
}
