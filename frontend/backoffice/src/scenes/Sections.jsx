"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlusIcon } from "@heroicons/react/16/solid";

import Utilities from "@/components/Utilities";
import useGetPage from "@/hooks/useGetPage";
import { removeItem } from "@/utils/treeHelpers";
import Title from "@/components/Title";
import useAddSection from "@/hooks/useAddSection";
import DraggableTree from "@/components/DraggableTree";
import PagesTabs from "@/components/PagesTabs";
import { useSectionOperations } from "@/hooks/useSectionOperations";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useUpdateSectionOrder from "@/hooks/useUpdateSectionOrder";
import Button from "@/components/ui/Button";
import { useAxiosClient } from "@/utils/axiosClient";
import ConfirmModal from "@/components/ConfirmModal";

export default function Sections({ pageId }) {
  const router = useRouter();
  const { page, refetch, loading, error } = useGetPage({
    route: `${pageId}/sections`,
  });

  const { createSection } = useAddSection();
  const { updateSectionOrder } = useUpdateSectionOrder();
  const { updateSectionVisibility, deleteSection } = useSectionOperations();
  const { updateModuleVisibility, deleteModule } = useModuleOperations();
  const axiosClient = useAxiosClient();

  const [treeData, setTreeData] = useState([]);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [targetSection, setTargetSection] = useState(null);
  const [selectedModuleType, setSelectedModuleType] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    if (page?.sections) {
      const tree = page.sections.map((section) => ({
        id: `section-${section.sectionId}`,
        sectionId: section.sectionId,
        name: section.name,
        type: "section",
        isVisible: section.isVisible,
        children:
          section.modules
            ?.filter((module) => module.status !== "DELETED")
            .reduce((moduleAcc, module) => {
              const existingModule = moduleAcc.find(
                (m) => m.moduleId === (module.moduleId || module.id),
              );
              if (!existingModule) {
                moduleAcc.push({
                  id: `module-${module.id}`,
                  moduleId: module.moduleId || module.id,
                  name: module.name,
                  type: "module",
                  moduleType: module.type,
                  sectionId: section.sectionId,
                  isVisible: module.isVisible,
                  children: [],
                });
              }
              return moduleAcc;
            }, []) || [],
      }));
      setTreeData(tree);
    }
  }, [page]);

  const handleTreeChange = useCallback(
    async (newTree) => {
      setTreeData(newTree);
      try {
        await updateSectionOrder(pageId, newTree);
      } catch (error) {
        console.error(
          "Erreur lors du changement d'ordre des sections :",
          error,
        );
        alert("Erreur lors du changement d'ordre des sections.");
      }
    },
    [pageId, updateSectionOrder],
  );

  const handleToggle = useCallback(
    async (item, newVal) => {
      try {
        if (item.type === "section") {
          await updateSectionVisibility(item.sectionId, newVal);
        } else if (item.type === "module") {
          await updateModuleVisibility(item.moduleId, newVal);
        }
        setTreeData((prev) =>
          prev.map((section) => {
            if (section.id === item.id) {
              return { ...section, isVisible: newVal };
            }
            if (section.children) {
              return {
                ...section,
                children: section.children.map((module) =>
                  module.id === item.id
                    ? { ...module, isVisible: newVal }
                    : module,
                ),
              };
            }
            return section;
          }),
        );
      } catch (error) {
        console.error("Erreur lors du changement de visibilité :", error);
        alert("Erreur lors du changement de visibilité.");
      }
    },
    [updateSectionVisibility, updateModuleVisibility],
  );

  const handleEdit = useCallback(
    (item) => {
      if (item.type === "section") {
        router.push(`/pages/${pageId}/sections/${item.sectionId}`);
      } else if (item.type === "module") {
        router.push(
          `/pages/${pageId}/sections/${item.sectionId}/modules/${item.moduleId}`,
        );
      }
    },
    [router, pageId],
  );

  const handleDelete = useCallback(async (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      if (itemToDelete.type === "section") {
        await deleteSection(itemToDelete.sectionId);
      } else if (itemToDelete.type === "module") {
        await deleteModule(itemToDelete.moduleId);
      }
      await refetch();
      setTreeData((prev) => removeItem(prev, itemToDelete.id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Erreur lors de la suppression.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, deleteSection, deleteModule, refetch]);

  const handleAddModule = useCallback((section) => {
    setTargetSection(section);
    setShowAddModuleModal(true);
  }, []);

  const handleConfirmAddModule = async () => {
    if (!selectedModuleType || !targetSection) {
      return;
    }
    const typeToEndpoint = {
      article: "/api/articles",
      news: "/api/news",
      newsletter: "/api/newsletters",
      cta: "/api/cta",
      timeline: "/api/timelines",
      form: "/api/forms",
      list: "/api/lists",
      gallery: "/api/galleries",
    };
    try {
      if (typeToEndpoint[selectedModuleType]) {
        const childEndpoint = typeToEndpoint[selectedModuleType];
        await axiosClient.post(childEndpoint, {
          sectionId: targetSection.sectionId,
          name: `New ${selectedModuleType}`,
        });
      } else {
        const url = "/api/modules";
        const payload = {
          sectionId: targetSection.sectionId,
          type: selectedModuleType,
          name: `New ${selectedModuleType}`,
        };
        await axiosClient.post(url, payload);
      }
      setShowAddModuleModal(false);
      setTargetSection(null);
      setSelectedModuleType("");
      await refetch();
    } catch (error) {
      console.error("Erreur lors de l'ajout du module :", error);
      alert("Erreur lors de l'ajout du module.");
    }
  };

  // Fonction pour publier toutes les sections de la page
  const handlePublishSections = async () => {
    if (!page?.sections) return;
    await Promise.all(
      page.sections.map((section) =>
        axiosClient.put(`/api/sections/${section.sectionId}/publish`),
      ),
    );
    await refetch();
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      <Title label="Content Management" onPublish={handlePublishSections} />

      <PagesTabs pageId={pageId} />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "New Section",
            callback: async () => {
              await createSection({ pageId: pageId, name: "New section" });
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
          if (dragged.type === "module")
            return targetParent && targetParent.type === "section";
          return true;
        }}
        onAddChild={handleAddModule}
      />

      {/* Module addition modal */}
      {showAddModuleModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div
            className="p-6 rounded-xl shadow-xl min-w-[300px]"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: "var(--color-text)" }}
            >
              Add a module to {targetSection?.name}
            </h2>
            <label
              className="block mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Module type:
            </label>
            <select
              className="rounded px-2 py-1 w-full mb-4"
              style={{
                backgroundColor: "var(--color-background)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              }}
              value={selectedModuleType}
              onChange={(e) => setSelectedModuleType(e.target.value)}
            >
              <option value="">Select a type</option>
              <option value="article">Article</option>
              <option value="gallery">Gallery</option>
              <option value="news">News</option>
              <option value="newsletter">Newsletter</option>
              <option value="cta">CTA</option>
              <option value="timeline">Timeline</option>
              <option value="form">Form</option>
              <option value="list">List</option>
            </select>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  setShowAddModuleModal(false);
                  setTargetSection(null);
                  setSelectedModuleType("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleConfirmAddModule}
                disabled={!selectedModuleType}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={`Supprimer ${itemToDelete?.type === "section" ? "la section" : "le module"}`}
        message={`Êtes-vous sûr de vouloir supprimer ${itemToDelete?.type === "section" ? "cette section" : "ce module"} ? Cette action est irréversible.`}
        isLoading={isDeleting}
        variant="danger"
      />
    </motion.div>
  );
}
