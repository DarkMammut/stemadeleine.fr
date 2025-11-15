"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";

// Hooks
import useGetSection from "@/hooks/useGetSection";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import { useAxiosClient } from "@/utils/axiosClient";
import { useNotification } from "@/hooks/useNotification";
import { buildPageBreadcrumbs } from "@/utils/breadcrumbs";
import { removeItem } from "@/utils/treeHelpers";

// UI / Components
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import SectionsTabs from "@/components/SectionsTabs";
import DraggableTree from "@/components/ui/DraggableTree";
import AddModuleModal from "@/components/AddModuleModal";
import Utilities from "@/components/ui/Utilities";
import Notification from "@/components/ui/Notification";

export default function Modules({ pageId, sectionId }) {
  const router = useRouter();
  const axiosClient = useAxiosClient();
  const { section, refetch, loading, error } = useGetSection({ sectionId });
  const { updateModuleVisibility, deleteModule } = useModuleOperations();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  const [treeData, setTreeData] = useState([]);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);

  useEffect(() => {
    if (section?.modules) {
      const tree = section.modules
        .filter((module) => module.status !== "DELETED")
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
        }, []);
      setTreeData(tree);
    }
  }, [section]);

  const handleTreeChange = useCallback(
    async (newTree) => {
      setTreeData(newTree);
      try {
        // Mise à jour de l'ordre des modules
        const moduleOrders = newTree.map((module, index) => ({
          moduleId: module.moduleId,
          order: index,
        }));
        await axiosClient.patch(`/api/sections/${sectionId}/modules/order`, {
          modules: moduleOrders,
        });
        showSuccess(
          "Ordre mis à jour",
          "L'ordre des modules a été modifié avec succès",
        );
      } catch (error) {
        console.error("Erreur lors du changement d'ordre des modules :", error);
        showError(
          "Erreur de réorganisation",
          "Impossible de modifier l'ordre des modules",
        );
      }
    },
    [sectionId, axiosClient, showSuccess, showError],
  );

  const handleToggle = useCallback(
    async (item, newVal) => {
      try {
        await updateModuleVisibility(item.moduleId, newVal);
        showSuccess(
          "Visibilité mise à jour",
          `Le module est maintenant ${newVal ? "visible" : "masqué"}`,
        );
        setTreeData((prev) =>
          prev.map((module) =>
            module.id === item.id ? { ...module, isVisible: newVal } : module,
          ),
        );
      } catch (error) {
        console.error("Erreur lors du changement de visibilité :", error);
        showError(
          "Erreur de visibilité",
          "Impossible de modifier la visibilité",
        );
      }
    },
    [updateModuleVisibility, showSuccess, showError],
  );

  const handleEdit = useCallback(
    (item) => {
      router.push(
        `/pages/${pageId}/sections/${sectionId}/modules/${item.moduleId}`,
      );
    },
    [router, pageId, sectionId],
  );

  const handleDelete = useCallback(
    async (item) => {
      try {
        await deleteModule(item.moduleId);
        showSuccess("Module supprimé", "Le module a été supprimé avec succès");
        await refetch();
        setTreeData((prev) => removeItem(prev, item.id));
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        showError("Erreur de suppression", "Impossible de supprimer le module");
      }
    },
    [deleteModule, refetch, showSuccess, showError],
  );

  const handleConfirmAddModule = async (moduleType) => {
    if (!moduleType) {
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
          sectionId: sectionId,
          name: `New ${moduleType}`,
        });
      } else {
        const url = "/api/modules";
        const payload = {
          sectionId: sectionId,
          type: moduleType,
          name: `New ${moduleType}`,
        };
        await axiosClient.post(url, payload);
      }
      setShowAddModuleModal(false);
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

  if (error) return <p>Erreur: {error.message}</p>;

  // Construire les breadcrumbs
  const breadcrumbs = section
    ? buildPageBreadcrumbs(
        { id: pageId, name: section.page?.name || "Page" },
        section,
      )
    : [];

  return (
    <SceneLayout>
      <Title
        label={`Modules de ${section?.name || "la section"}`}
        showBreadcrumbs={!!section}
        breadcrumbs={breadcrumbs}
        loading={loading}
      />

      <SectionsTabs pageId={pageId} sectionId={sectionId} />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouveau Module",
            callback: () => setShowAddModuleModal(true),
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
        canHaveChildren={() => false}
        canDrop={() => true}
        loading={loading}
      />

      {/* Modal d'ajout de module */}
      <AddModuleModal
        open={showAddModuleModal}
        onClose={() => setShowAddModuleModal(false)}
        onConfirm={handleConfirmAddModule}
      />

      {/* ConfirmModal removed: DeleteButton shows its own confirmation modal */}

      {/* Notification */}
      <Notification {...notification} onClose={hideNotification} />
    </SceneLayout>
  );
}
