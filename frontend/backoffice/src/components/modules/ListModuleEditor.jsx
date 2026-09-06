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

export default function ListModuleEditor({
  moduleId,
  moduleData: _initialModuleData,
  setModuleData: setParentModuleData,
  refetch: _parentRefetch,
  loading: parentLoading = false,
}) {
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
      label: "Nom du module",
      type: "text",
      placeholder: "Entrez le nom du module",
      required: true,
    },
    {
      name: "title",
      label: "Titre de la liste",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
    },
  ];

  // Champs pour le formulaire List (variant)
  const listFields = [
    {
      name: "variant",
      label: "Variante d'affichage",
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

      showSuccess("Module mis à jour avec succès");
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

      showSuccess("Liste mise à jour avec succès");
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
        "Visibilité mise à jour",
        `Le module est maintenant ${isVisible ? "visible" : "masqué"}`,
      );
    } catch (err) {
      console.error(err);
      showError(
        "Erreur de visibilité",
        "Impossible de mettre à jour la visibilité du module",
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
        title="Visibilité du module"
        label="Module visible sur le site"
        isVisible={moduleData?.isVisible || false}
        onChange={handleVisibilityChange}
        savingVisibility={savingVisibility}
      />

      {/* Formulaire Module (name, title) */}
      <EditablePanelV2
        title="Détails du module liste"
        fields={moduleFields}
        initialValues={moduleData || {}}
        onSubmit={handleModuleSubmit}
        onCancelExternal={handleCancelModuleEdit}
        loading={savingModule || effectiveLoading}
        displayColumns={2}
      />

      {/* Formulaire List (variant) */}
      <EditablePanelV2
        title="Paramètres de la liste"
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
            header: "Contenus de la liste",
            addButton: "Ajouter un contenu",
            empty: "Aucun contenu pour cette liste.",
          }}
        />
      ) : (
        !listLoading && (
          <Notification
            show={true}
            type="info"
            title="Contenus indisponibles"
            message="Enregistrez d'abord le module pour pouvoir ajouter des contenus."
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
