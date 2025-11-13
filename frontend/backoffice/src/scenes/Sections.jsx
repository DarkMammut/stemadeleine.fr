"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@heroicons/react/16/solid";
import Utilities from "@/components/Utilities";
import useGetPage from "@/hooks/useGetPage";
import Title from "@/components/ui/Title";
import useAddSection from "@/hooks/useAddSection";
import DraggableTree from "@/components/DraggableTree";
import PagesTabs from "@/components/PagesTabs";
import { useSectionOperations } from "@/hooks/useSectionOperations";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useUpdateSectionOrder from "@/hooks/useUpdateSectionOrder";
import { useAxiosClient } from "@/utils/axiosClient";
import { buildPageBreadcrumbs } from "@/utils/breadcrumbs";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AddModuleModal from "@/components/AddModuleModal";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import SceneLayout from "@/components/ui/SceneLayout";

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
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  const [treeData, setTreeData] = useState([]);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [targetSection, setTargetSection] = useState(null);
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
        showSuccess(
          "Ordre mis à jour",
          "L'ordre des sections a été modifié avec succès",
        );
      } catch (error) {
        console.error(
          "Erreur lors du changement d'ordre des sections :",
          error,
        );
        showError(
          "Erreur de réorganisation",
          "Impossible de modifier l'ordre des sections",
        );
      }
    },
    [pageId, updateSectionOrder, showSuccess, showError],
  );

  const handleToggle = useCallback(
    async (item, newVal) => {
      try {
        if (item.type === "section") {
          await updateSectionVisibility(item.sectionId, newVal);
          showSuccess(
            "Visibilité mise à jour",
            `La section est maintenant ${newVal ? "visible" : "masquée"}`,
          );
        } else if (item.type === "module") {
          await updateModuleVisibility(item.moduleId, newVal);
          showSuccess(
            "Visibilité mise à jour",
            `Le module est maintenant ${newVal ? "visible" : "masqué"}`,
          );
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
        showError(
          "Erreur de visibilité",
          "Impossible de modifier la visibilité",
        );
      }
    },
    [updateSectionVisibility, updateModuleVisibility, showSuccess, showError],
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
        showSuccess(
          "Section supprimée",
          "La section a été supprimée avec succès",
        );
      } else if (itemToDelete.type === "module") {
        await deleteModule(itemToDelete.moduleId);
        showSuccess("Module supprimé", "Le module a été supprimé avec succès");
      }
      await refetch();
      setTreeData((prev) => removeItem(prev, itemToDelete.id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      showError(
        "Erreur de suppression",
        `Impossible de supprimer ${itemToDelete.type === "section" ? "la section" : "le module"}`,
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  }, [
    itemToDelete,
    deleteSection,
    deleteModule,
    refetch,
    showSuccess,
    showError,
  ]);

  const handleAddModule = useCallback((section) => {
    setTargetSection(section);
    setShowAddModuleModal(true);
  }, []);

  const handleConfirmAddModule = async (moduleType) => {
    if (!moduleType || !targetSection) {
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
      if (typeToEndpoint[moduleType]) {
        const childEndpoint = typeToEndpoint[moduleType];
        await axiosClient.post(childEndpoint, {
          sectionId: targetSection.sectionId,
          name: `New ${moduleType}`,
        });
      } else {
        const url = "/api/modules";
        const payload = {
          sectionId: targetSection.sectionId,
          type: moduleType,
          name: `New ${moduleType}`,
        };
        await axiosClient.post(url, payload);
      }
      setShowAddModuleModal(false);
      setTargetSection(null);
      await refetch();
      showSuccess(
        "Module créé",
        `Le module ${moduleType} a été ajouté avec succès`,
      );
    } catch (error) {
      console.error("Erreur lors de l'ajout du module :", error);
      showError("Erreur de création", "Impossible d'ajouter le module");
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

  // Construire les breadcrumbs pour la page sections
  const breadcrumbs = page ? buildPageBreadcrumbs(page) : [];

  return (
    <SceneLayout>
      <Title
        label="Content Management"
        onPublish={handlePublishSections}
        showBreadcrumbs={!!page}
        breadcrumbs={breadcrumbs}
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

      {/* Modal d'ajout de module */}
      <AddModuleModal
        open={showAddModuleModal}
        onClose={() => {
          setShowAddModuleModal(false);
          setTargetSection(null);
        }}
        onConfirm={handleConfirmAddModule}
        section={targetSection}
        isLoading={false}
      />

      {/* Modal de confirmation de suppression */}
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

      {/* Notifications */}
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
      />
    </SceneLayout>
  );
}
