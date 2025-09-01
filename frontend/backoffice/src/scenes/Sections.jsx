"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import PagesTabs from "@/components/PagesTabs";

export default function Sections({ pageId }) {
  const router = useRouter();
  const { page, refetch, loading, error } = useGetPage({
    route: `${pageId}/sections`,
  });

  console.log(page);

  const { createSection } = useAddSection();

  const [treeData, setTreeData] = useState([]);
  // Nouveaux états pour le modal d'ajout de module
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [targetSection, setTargetSection] = useState(null);
  const [selectedModuleType, setSelectedModuleType] = useState("");

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
    }
  }, [page]);

  const handleTreeChange = useCallback((newTree) => {
    setTreeData(newTree);
  }, []);

  // Toggle visible
  const handleToggle = useCallback((item, newVal) => {
    setTreeData((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, isVisible: newVal } : p)),
    );
  }, []);

  // Edit
  const handleEdit = useCallback((item) => {
    router.push(`/pages/${item.pageId}`);
  }, [router]);

  // Delete
  const handleDelete = useCallback(async (item) => {
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
  }, [refetch]);

  // Fonction appelée par le bouton "Ajouter un module"
  const handleAddModule = useCallback((section) => {
    setTargetSection(section);
    setShowAddModuleModal(true);
  }, []);

  // Fonction de validation du modal (placeholder pour la requête d'ajout)
  const handleConfirmAddModule = async () => {
    // TODO: faire la requête d'ajout du module selon le type sélectionné
    // Exemple : await createModule({ sectionId: targetSection.id, type: selectedModuleType, name: "Nouveau module" });
    setShowAddModuleModal(false);
    setTargetSection(null);
    setSelectedModuleType("");
    await refetch();
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

      <PagesTabs pageId={pageId} />

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
          canDrop={({ dragged, targetParent, projected }) => {
            if (dragged.type === "section") return projected.parentId === null;
            if (dragged.type === "module") return targetParent && targetParent.type === "section";
            return true;
          }}
          onAddChild={handleAddModule} // Ajout de la prop pour le bouton
      />

      {/* Modal d'ajout de module */}
      {showAddModuleModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-xl min-w-[300px]">
            <h2 className="text-lg font-bold mb-4">Ajouter un module à {targetSection?.name}</h2>
            <label className="block mb-2">Type de module :</label>
            <select
              className="border rounded px-2 py-1 w-full mb-4"
              value={selectedModuleType}
              onChange={e => setSelectedModuleType(e.target.value)}
            >
              <option value="">Sélectionner un type</option>
              <option value="article">Article</option>
              <option value="timeline">Timeline</option>
              {/* Ajouter d'autres types ici si besoin */}
            </select>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => { setShowAddModuleModal(false); setTargetSection(null); setSelectedModuleType(""); }}
              >Annuler</button>
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={handleConfirmAddModule}
                disabled={!selectedModuleType}
              >Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
