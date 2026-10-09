"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@heroicons/react/16/solid";

// Hooks
import useGetPage from "@/hooks/useGetPage";
import usePublicationInfo from "@/hooks/usePublicationInfo";
import useAddSection from "@/hooks/useAddSection";
import { useSectionOperations } from "@/hooks/useSectionOperations";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useUpdateSectionOrder from "@/hooks/useUpdateSectionOrder";
import { useAxiosClient } from "@/utils/axiosClient";
import { useNotification } from "@/hooks/useNotification";
import { buildPageBreadcrumbs } from "@/utils/breadcrumbs";
import { removeItem } from "@/utils/treeHelpers";

// UI / Components
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Notification from "@/components/ui/Notification";
import Utilities from "@/components/ui/Utilities";
import PagesTabs from "@/components/PagesTabs";
import DraggableTree from "@/components/ui/DraggableTree";
import AddModuleModal from "@/components/AddModuleModal";
import { useTranslation } from "@/i18n/I18nContext";

export default function Sections({ pageId }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { page, refetch, loading, error } = useGetPage({
    route: `${pageId}/sections`,
  });

  const { info, refetchInfo, resetDraft } = usePublicationInfo("pages", pageId);
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

  const getModuleTypeLabel = useCallback(
    (moduleType) => t(`pages.moduleTypes.${moduleType}`),
    [t],
  );

  const getDefaultModuleName = useCallback(
    (moduleType) => t(`pages.defaultNames.${moduleType}`),
    [t],
  );

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
          t("pages.notifications.orderUpdatedTitle"),
          t("pages.notifications.sectionsOrderUpdatedMessage"),
        );
      } catch (error) {
        console.error(
          "Erreur lors du changement d'ordre des sections :",
          error,
        );
        showError(
          t("pages.errors.reorderTitle"),
          t("pages.errors.reorderSectionsMessage"),
        );
      }
    },
    [pageId, updateSectionOrder, showSuccess, showError, t],
  );

  const handleToggle = useCallback(
    async (item, newVal) => {
      try {
        if (item.type === "section") {
          await updateSectionVisibility(item.sectionId, newVal);
          showSuccess(
            t("pages.notifications.visibilityUpdatedTitle"),
            `${t("pages.common.sectionCapitalized")} ${t(
              newVal ? "pages.common.visible" : "pages.common.hidden",
            )}`,
          );
        } else if (item.type === "module") {
          await updateModuleVisibility(item.moduleId, newVal);
          showSuccess(
            t("pages.notifications.visibilityUpdatedTitle"),
            `${t("pages.common.moduleCapitalized")} ${t(
              newVal ? "pages.common.visible" : "pages.common.hidden",
            )}`,
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
          t("pages.errors.visibilityTitle"),
          t("pages.errors.visibilityMessage"),
        );
      }
    },
    [
      updateSectionVisibility,
      updateModuleVisibility,
      showSuccess,
      showError,
      t,
    ],
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

  const handleDelete = useCallback(
    async (item) => {
      try {
        if (item.type === "section") {
          await deleteSection(item.sectionId);
          showSuccess(
            t("pages.notifications.sectionDeletedTitle"),
            t("pages.notifications.sectionDeletedMessage"),
          );
        } else if (item.type === "module") {
          await deleteModule(item.moduleId);
          showSuccess(
            t("pages.notifications.moduleDeletedTitle"),
            t("pages.notifications.moduleDeletedMessage"),
          );
        }
        await refetch();
        setTreeData((prev) => removeItem(prev, item.id));
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        showError(
          t("pages.errors.deleteTitle"),
          item.type === "section"
            ? t("pages.errors.deleteSectionMessage")
            : t("pages.errors.deleteModuleMessage"),
        );
      }
    },
    [deleteSection, deleteModule, refetch, showSuccess, showError, t],
  );

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
          name: getDefaultModuleName(moduleType),
        });
      } else {
        const url = "/api/modules";
        const payload = {
          sectionId: targetSection.sectionId,
          type: moduleType,
          name: getDefaultModuleName(moduleType),
        };
        await axiosClient.post(url, payload);
      }
      setShowAddModuleModal(false);
      setTargetSection(null);
      await refetch();
      showSuccess(
        t("pages.notifications.moduleCreatedTitle"),
        `${getModuleTypeLabel(moduleType)} · ${t(
          "pages.notifications.moduleCreatedMessage",
        )}`,
      );
    } catch (error) {
      console.error("Erreur lors de l'ajout du module :", error);
      showError(
        t("pages.errors.creationTitle"),
        t("pages.errors.creationModuleMessage"),
      );
    }
  };

  // Publie la page (sections, modules et contenus compris)
  const handlePublishSections = async () => {
    await axiosClient.put(`/api/pages/${pageId}/publish`);
    await refetch();
    await refetchInfo();
  };

  const handleResetPage = async () => {
    try {
      await resetDraft();
      await refetch();
      showSuccess(
        t("pages.notifications.resetPageTitle"),
        t("pages.notifications.resetPageMessage"),
      );
    } catch (err) {
      console.error(err);
      showError(t("pages.errors.genericTitle"), t("pages.errors.resetPageMessage"));
    }
  };

  // Construire les breadcrumbs pour la page sections
  const breadcrumbs = page ? buildPageBreadcrumbs(page) : [];

  return (
    <SceneLayout>
      <Title
        label={t("pages.scenes.sections.title")}
        onPublish={handlePublishSections}
        onReset={handleResetPage}
        publicationInfo={info}
        showBreadcrumbs={!!page}
        breadcrumbs={breadcrumbs}
        loading={loading}
      />

      <PagesTabs pageId={pageId} />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: t("pages.scenes.sections.newSection"),
            callback: async () => {
              await createSection({
                pageId: pageId,
                name: t("pages.defaultNames.section"),
              });
              await refetch();
            },
          },
        ]}
        loading={loading}
      />

      {/* Le DraggableTree gère désormais l'affichage de chargement via sa prop `loading` */}
      {error ? (
        <p>{t("pages.errors.loadingPrefix")}: {error.message}</p>
      ) : (
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
          loading={loading}
        />
      )}

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

      {/* ConfirmModal removed: DeleteButton shows its own confirmation modal */}

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
