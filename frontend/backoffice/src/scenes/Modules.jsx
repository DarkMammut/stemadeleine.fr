"use client";

import React, {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {PlusIcon} from "@heroicons/react/24/outline";

// Hooks
import useGetSection from "@/hooks/useGetSection";
import usePublicationInfo from "@/hooks/usePublicationInfo";
import {useModuleOperations} from "@/hooks/useModuleOperations";
import {useAxiosClient} from "@/utils/axiosClient";
import {useNotification} from "@/hooks/useNotification";
import {buildPageBreadcrumbs} from "@/utils/breadcrumbs";
import {removeItem} from "@/utils/treeHelpers";

// UI / Components
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import SectionsTabs from "@/components/SectionsTabs";
import DraggableTree from "@/components/ui/DraggableTree";
import AddModuleModal from "@/components/AddModuleModal";
import Utilities from "@/components/ui/Utilities";
import Notification from "@/components/ui/Notification";
import { useTranslation } from "@/i18n/I18nContext";

export default function Modules({pageId, sectionId}) {
    const router = useRouter();
    const { t } = useTranslation();
    const axiosClient = useAxiosClient();
    const {section, refetch, loading, error} = useGetSection({sectionId});
    const {info, refetchInfo, resetDraft} = usePublicationInfo("sections", sectionId);
    const {updateModuleVisibility, deleteModule} = useModuleOperations();
    const {notification, showSuccess, showError, hideNotification} =
        useNotification();

    const [treeData, setTreeData] = useState([]);
    const [showAddModuleModal, setShowAddModuleModal] = useState(false);

    const getModuleTypeLabel = useCallback(
        (moduleType) => t(`pages.moduleTypes.${moduleType}`),
        [t],
    );

    const getDefaultModuleName = useCallback(
        (moduleType) => t(`pages.defaultNames.${moduleType}`),
        [t],
    );

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
                    t("pages.notifications.orderUpdatedTitle"),
                    t("pages.notifications.modulesOrderUpdatedMessage"),
                );
            } catch (error) {
                console.error("Erreur lors du changement d'ordre des modules :", error);
                showError(
                    t("pages.errors.reorderTitle"),
                    t("pages.errors.reorderModulesMessage"),
                );
            }
        },
        [sectionId, axiosClient, showSuccess, showError, t],
    );

    const handleToggle = useCallback(
        async (item, newVal) => {
            try {
                await updateModuleVisibility(item.moduleId, newVal);
                showSuccess(
                    t("pages.notifications.visibilityUpdatedTitle"),
                    `${t("pages.common.moduleCapitalized")} ${t(
                        newVal ? "pages.common.visible" : "pages.common.hidden",
                    )}`,
                );
                setTreeData((prev) =>
                    prev.map((module) =>
                        module.id === item.id ? {...module, isVisible: newVal} : module,
                    ),
                );
            } catch (error) {
                console.error("Erreur lors du changement de visibilité :", error);
                showError(
                    t("pages.errors.visibilityTitle"),
                    t("pages.errors.visibilityMessage"),
                );
            }
        },
        [updateModuleVisibility, showSuccess, showError, t],
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
                showSuccess(
                    t("pages.notifications.moduleDeletedTitle"),
                    t("pages.notifications.moduleDeletedMessage"),
                );
                await refetch();
                setTreeData((prev) => removeItem(prev, item.id));
            } catch (error) {
                console.error("Erreur lors de la suppression :", error);
                showError(
                    t("pages.errors.deleteTitle"),
                    t("pages.errors.deleteModuleMessage"),
                );
            }
        },
        [deleteModule, refetch, showSuccess, showError, t],
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
                    name: getDefaultModuleName(moduleType),
                });
            } else {
                const url = "/api/modules";
                const payload = {
                    sectionId: sectionId,
                    type: moduleType,
                    name: getDefaultModuleName(moduleType),
                };
                await axiosClient.post(url, payload);
            }
            setShowAddModuleModal(false);
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

    if (error) return <p>{t("pages.errors.loadingPrefix")}: {error.message}</p>;

    // Publie la section (modules et contenus compris)
    const handlePublishModules = async () => {
        await axiosClient.put(`/api/sections/${sectionId}/publish`);
        await refetch();
        await refetchInfo();
    };

    const handleResetSection = async () => {
        try {
            await resetDraft();
            await refetch();
            showSuccess(
                t("pages.notifications.resetSectionTitle"),
                t("pages.notifications.resetSectionMessage"),
            );
        } catch (error) {
            console.error("Erreur lors de la réinitialisation :", error);
            showError(
                t("pages.errors.genericTitle"),
                t("pages.errors.resetSectionMessage"),
            );
        }
    };

    // Construire les breadcrumbs
    const breadcrumbs = section
        ? buildPageBreadcrumbs(
            {id: pageId, name: section.page?.name || t("pages.common.pageCapitalized")},
            section,
        )
        : [];

    return (
        <SceneLayout>
            <Title
                label={`${t("pages.scenes.modules.titlePrefix")} ${
                    section?.name || t("pages.scenes.modules.titleFallback")
                }`}
                onPublish={handlePublishModules}
                onReset={handleResetSection}
                publicationInfo={info}
                showBreadcrumbs={!!section}
                breadcrumbs={breadcrumbs}
                loading={loading}
            />

            <SectionsTabs pageId={pageId} sectionId={sectionId}/>

            <Utilities
                actions={[
                    {
                        icon: PlusIcon,
                        label: t("pages.scenes.modules.newModule"),
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
            <Notification {...notification} onClose={hideNotification}/>
        </SceneLayout>
    );
}
