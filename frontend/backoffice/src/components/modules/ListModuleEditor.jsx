"use client";

import React, { useEffect, useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useGetModule from "@/hooks/useGetModule";
import useGetList from "@/hooks/useGetList";
import useListVariants from "@/hooks/useListVariants";
import ListContentManager from "@/components/ListContentManager";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";
import { useTranslation } from "@/i18n/I18nContext";

export default function ListModuleEditor({
  moduleId,
  moduleData: _initialModuleData,
  setModuleData: setParentModuleData,
  refetch: _parentRefetch,
  loading: parentLoading = false,
}) {
  const { t } = useTranslation();
  const { updateModuleVisibility } = useModuleOperations();
  const axios = useAxiosClient();
  const [savingModule, setSavingModule] = useState(false);
  const [savingList, setSavingList] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // Récupérer les données du module (name, title)
  const {
    module,
    refetch: refetchModule,
    loading: moduleLoading,
  } = useGetModule({ moduleId });

  // Récupérer les données complètes de la liste (variant, contents)
  const {
    list,
    refetch: refetchList,
    loading: listLoading,
  } = useGetList({ moduleId });

  // Récupérer les variantes disponibles depuis le backend
  const { variants: variantOptions, loading: variantsLoading } =
    useListVariants();

  // États locaux
  const [moduleData, setModuleData] = useState(null);
  const [listData, setListData] = useState(null);

  // Synchroniser avec les données du module
  useEffect(() => {
    if (module) {
      setModuleData(module);
    }
  }, [module]);

  // Synchroniser avec les données de la liste
  useEffect(() => {
    if (list) {
      setListData(list);
    }
  }, [list]);

  // Mettre à jour le parent avec les données combinées
  useEffect(() => {
    if (moduleData && listData && setParentModuleData) {
      setParentModuleData({
        ...moduleData,
        ...listData,
      });
    }
  }, [moduleData, listData, setParentModuleData]);

  // Champs pour le formulaire Module (name, title)
  const moduleFields = [
    {
      name: "name",
      label: t("pages.modules.shared.moduleName"),
      type: "text",
      placeholder: t("pages.modules.shared.moduleNamePlaceholder"),
      required: true,
    },
    {
      name: "title",
      label: t("pages.modules.list.title"),
      type: "text",
      placeholder: t("pages.modules.shared.titlePlaceholder"),
      required: true,
    },
  ];

  // Champs pour le formulaire List (variant)
  const listFields = [
    {
      name: "variant",
      label: t("pages.modules.list.variant"),
      type: "select",
      required: true,
      options: variantOptions,
    },
  ];

  // Soumission du formulaire Module
  const handleModuleSubmit = async (values) => {
    setSavingModule(true);
    try {
      const payload = {
        name: values.name,
        title: values.title,
      };

      const response = await axios.put(
        `/api/modules/${module.moduleId}`,
        payload,
      );

      // Mettre à jour moduleData
      setModuleData((prev) => ({
        ...prev,
        ...response.data,
      }));

      showSuccess(t("pages.notifications.moduleUpdatedMessage"));
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du module:", err);
      throw err;
    } finally {
      setSavingModule(false);
    }
  };

  // Soumission du formulaire List
  const handleListSubmit = async (values) => {
    setSavingList(true);
    try {
      const payload = {
        variant: values.variant,
      };

      const response = await axios.put(`/api/lists/${list.id}`, payload);

      // Mettre à jour listData
      setListData((prev) => ({
        ...prev,
        ...response.data,
      }));

      showSuccess(t("pages.notifications.listUpdatedMessage"));
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de la liste:", err);
      throw err;
    } finally {
      setSavingList(false);
    }
  };

  const handleCancelModuleEdit = async () => {
    await refetchModule();
  };

  const handleCancelListEdit = async () => {
    await refetchList();
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateModuleVisibility(moduleId, isVisible);
      setSavingVisibility(false);

      // Mettre à jour les données locales
      setModuleData((prev) => ({ ...prev, isVisible }));
      if (setParentModuleData && moduleData && listData) {
        setParentModuleData({ ...moduleData, ...listData, isVisible });
      }

      showSuccess(
        t("pages.notifications.visibilityUpdatedTitle"),
        `${t("pages.common.moduleCapitalized")} ${t(
          isVisible ? "pages.common.visible" : "pages.common.hidden",
        )}`,
      );
    } catch (err) {
      console.error(err);
      showError(
        t("pages.errors.visibilityTitle"),
        t("pages.errors.visibilityModuleMessage"),
      );
      setSavingVisibility(false);
    }
  };

  // Ne pas return tôt: laisser les composants gérer leurs states de loading/saving.
  const effectiveLoading = Boolean(
    parentLoading || moduleLoading || listLoading || variantsLoading,
  );

  return (
    <div className="space-y-6">
      {/* Section Visibilité */}
      <VisibilitySwitch
        title={t("pages.modules.shared.moduleVisibilityTitle")}
        label={t("pages.modules.shared.moduleVisibilityLabel")}
        isVisible={moduleData?.isVisible || false}
        onChange={handleVisibilityChange}
        savingVisibility={savingVisibility}
      />

      {/* Formulaire Module (name, title) */}
      <EditablePanelV2
        title={t("pages.modules.list.detailsTitle")}
        fields={moduleFields}
        initialValues={moduleData || {}}
        onSubmit={handleModuleSubmit}
        onCancelExternal={handleCancelModuleEdit}
        loading={savingModule || effectiveLoading}
        displayColumns={2}
      />

      {/* Formulaire List (variant) */}
      <EditablePanelV2
        title={t("pages.modules.list.settingsTitle")}
        fields={listFields}
        initialValues={listData || {}}
        onSubmit={handleListSubmit}
        onCancelExternal={handleCancelListEdit}
        loading={savingList || effectiveLoading}
        displayColumns={2}
      />

      {/* Gestion des contenus de la liste (avec lien/URL et médias par contenu) */}
      {list?.id ? (
        <ListContentManager
          listId={list.id}
          loading={effectiveLoading}
          customLabels={{
            header: t("pages.modules.list.contentHeader"),
            addButton: t("pages.common.addContent"),
            empty: t("pages.modules.list.contentEmpty"),
          }}
        />
      ) : (
        !listLoading && (
          <Notification
            show={true}
            type="info"
            title={t("pages.modules.list.unavailableTitle")}
            message={t("pages.modules.list.unavailableMessage")}
            onClose={() => {}}
          />
        )
      )}

      {/* Notifications */}
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
      />
    </div>
  );
}
