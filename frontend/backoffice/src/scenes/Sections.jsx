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
import { useAddModule } from "@/hooks/useAddModule";
import { useSectionOperations } from "@/hooks/useSectionOperations";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useUpdateSectionOrder from "@/hooks/useUpdateSectionOrder";
import Button from "@/components/ui/Button";
import { useAxiosClient } from "@/utils/axiosClient";

export default function Sections({ pageId }) {
  const router = useRouter();
  const { page, refetch, loading, error } = useGetPage({
    route: `${pageId}/sections`,
  });

  console.log(page);

  const { createSection } = useAddSection();
  const { addModule } = useAddModule();
  const { updateSectionOrder } = useUpdateSectionOrder();
  const { updateSectionVisibility, deleteSection } = useSectionOperations();
  const { updateModuleVisibility, deleteModule } = useModuleOperations();
  const axiosClient = useAxiosClient();

  const [treeData, setTreeData] = useState([]);
  // New states for module addition modal
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [targetSection, setTargetSection] = useState(null);
  const [selectedModuleType, setSelectedModuleType] = useState("");

  useEffect(() => {
    if (page?.sections) {
      console.log("Raw page data:", page.sections);

      // Dédupliquer les sections par sectionId avant de construire l'arbre
      const uniqueSections = page.sections.reduce((acc, section) => {
        // Vérifier si cette section n'existe pas déjà dans l'accumulateur
        const existingSection = acc.find(
          (s) => s.sectionId === section.sectionId,
        );
        if (!existingSection) {
          acc.push(section);
        } else {
          console.warn(
            "Duplicate section found and removed:",
            section.sectionId,
          );
        }
        return acc;
      }, []);

      console.log("Deduplicated sections:", uniqueSections);

      // Log détaillé de chaque section et de ses modules
      uniqueSections.forEach((section, idx) => {
        console.log(`[DEBUG] Section ${idx}:`, section.sectionId, section.name);
        if (section.modules && section.modules.length > 0) {
          section.modules.forEach((mod, mIdx) => {
            console.log(
              `  [DEBUG]   Module ${mIdx}:`,
              mod.id,
              mod.name,
              mod.type,
            );
          });
        } else {
          console.log("  [DEBUG]   Aucun module");
        }
      });

      const tree = uniqueSections.map((section) => ({
        id: `section-${section.sectionId}`,
        sectionId: section.sectionId,
        name: section.name,
        type: "section",
        isVisible: section.isVisible,
        children:
          section.modules
            ?.filter(
              (module) =>
                !module.isDeleted &&
                !module.deletedAt &&
                module.status !== "DELETED",
            )
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
                  children: [],
                });
              } else {
                console.warn(
                  "Duplicate module found and removed:",
                  module.moduleId || module.id,
                );
              }
              return moduleAcc;
            }, []) || [],
      }));

      console.log("Generated tree data:", tree);

      const allIds = [];
      const collectIds = (items) => {
        items.forEach((item) => {
          allIds.push(item.id);
          if (item.children) {
            collectIds(item.children);
          }
        });
      };
      collectIds(tree);

      const duplicates = allIds.filter(
        (id, index) => allIds.indexOf(id) !== index,
      );
      if (duplicates.length > 0) {
        console.error("Duplicate IDs found after deduplication:", duplicates);
      } else {
        console.log("✅ No duplicate IDs found after deduplication");
      }

      setTreeData(tree);
    }
  }, [page]);

  const handleTreeChange = useCallback(
    async (newTree) => {
      setTreeData(newTree);

      try {
        await updateSectionOrder(pageId, newTree);
        console.log("Section order saved automatically");
      } catch (error) {
        console.error("Error during automatic order saving:", error);
      }
    },
    [pageId, updateSectionOrder],
  );

  // Toggle visibility using the new hook
  const handleToggle = useCallback(
    async (item, newVal) => {
      try {
        if (item.type === "section") {
          await updateSectionVisibility(item.sectionId, newVal);
        } else if (item.type === "module") {
          console.log("Updating module visibility with hook:", {
            moduleId: item.moduleId,
            isVisible: newVal,
          });

          await updateModuleVisibility(item.moduleId, newVal);
        }

        // Update local state
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
        console.error("Error updating visibility:", error);
        console.error("Error response data:", error.response?.data);
        console.error("Error status:", error.response?.status);
      }
    },
    [updateSectionVisibility, updateModuleVisibility],
  );

  // Edit - with intelligent navigation
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

  // Delete using the new hook
  const handleDelete = useCallback(
    async (item) => {
      const itemType = item.type === "section" ? "section" : "module";
      const confirmDelete = window.confirm(
        `Are you sure you want to delete this ${itemType}?`,
      );
      if (!confirmDelete) return;

      try {
        if (item.type === "section") {
          await deleteSection(item.sectionId);
        } else if (item.type === "module") {
          await deleteModule(item.moduleId);
        }

        await refetch();
        setTreeData((prev) => removeItem(prev, item.id));
      } catch (error) {
        console.error("Error during deletion:", error);
      }
    },
    [deleteSection, deleteModule, refetch],
  );

  // Function called by "Add module" button
  const handleAddModule = useCallback((section) => {
    console.log("🔵 handleAddModule called with section:", section);
    setTargetSection(section);
    setShowAddModuleModal(true);
    console.log("🔵 Modal should now be showing:", true);
  }, []);

  // Modal validation function
  const handleConfirmAddModule = async () => {
    if (!selectedModuleType || !targetSection) {
      console.error("Missing data for module creation:", {
        selectedModuleType,
        targetSection,
      });
      return;
    }

    // Mapping type → endpoint
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
      let result;
      if (typeToEndpoint[selectedModuleType]) {
        // Création uniquement via l'endpoint spécifique
        const childEndpoint = typeToEndpoint[selectedModuleType];
        const response = await axiosClient.post(childEndpoint, {
          sectionId: targetSection.sectionId,
          name: `New ${selectedModuleType}`,
        });
        result = response.data;
        console.log(`Module spécifique créé dans ${childEndpoint}:`, result);
      } else {
        // Création via l'endpoint générique
        const url = "/api/modules";
        const payload = {
          sectionId: targetSection.sectionId,
          type: selectedModuleType,
          name: `New ${selectedModuleType}`,
        };
        const response = await axiosClient.post(url, payload);
        result = response.data;
        console.log("Module générique créé:", result);
      }

      setShowAddModuleModal(false);
      setTargetSection(null);
      setSelectedModuleType("");

      console.log("Starting refetch...");
      await refetch();
      console.log("Refetch completed");
      console.log("[DEBUG] page.sections après refetch:", page.sections);
    } catch (error) {
      console.error("Error adding module:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      alert(`Error while adding module: ${error.message}`);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      <Title
        label="Content Management"
        apiUrl="/api/pages/tree"
        data={treeData}
      />

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
    </motion.div>
  );
}
