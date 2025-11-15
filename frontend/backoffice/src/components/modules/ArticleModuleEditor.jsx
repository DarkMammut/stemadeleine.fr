"use client";

import React, { useEffect, useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useGetModule from "@/hooks/useGetModule";
import useGetArticle from "@/hooks/useGetArticle";
import useArticleVariants from "@/hooks/useArticleVariants";
import ContentManager from "@/components/ContentManager";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";

export default function ArticleModuleEditor({
  moduleId,
  moduleData: _initialModuleData,
  setModuleData: setParentModuleData,
  refetch: _parentRefetch,
  loading: parentLoading = false,
}) {
  const { updateModuleVisibility } = useModuleOperations();
  const axios = useAxiosClient();
  const [savingModule, setSavingModule] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // Récupérer les données du module (name, title)
  const {
    module,
    refetch: refetchModule,
    loading: moduleLoading,
  } = useGetModule({ moduleId });

  // Récupérer les données complètes de l'article (variant, writer, writingDate, contents)
  const {
    article,
    refetch: refetchArticle,
    loading: articleLoading,
  } = useGetArticle({ moduleId });

  // Récupérer les variantes disponibles depuis le backend
  const { variants: variantOptions, loading: variantsLoading } =
    useArticleVariants();

  // États locaux
  const [moduleData, setModuleData] = useState(null);
  const [articleData, setArticleData] = useState(null);

  // Synchroniser avec les données du module
  useEffect(() => {
    if (module) {
      setModuleData(module);
    }
  }, [module]);

  // Synchroniser avec les données de l'article
  useEffect(() => {
    if (article) {
      setArticleData(article);
    }
  }, [article]);

  // Mettre à jour le parent avec les données combinées
  useEffect(() => {
    if (moduleData && articleData && setParentModuleData) {
      setParentModuleData({
        ...moduleData,
        ...articleData,
      });
    }
  }, [moduleData, articleData, setParentModuleData]);

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
      label: "Titre de l'article",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
    },
  ];

  // Champs pour le formulaire Article (variant, writer, writingDate)
  const articleFields = [
    {
      name: "variant",
      label: "Variante d'affichage",
      type: "select",
      required: true,
      options: variantOptions,
    },
    {
      name: "writer",
      label: "Auteur",
      type: "text",
      placeholder: "Nom de l'auteur",
      required: false,
    },
    {
      name: "writingDate",
      label: "Date d'écriture",
      type: "date",
      required: false,
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

  // Soumission du formulaire Article
  const handleArticleSubmit = async (values) => {
    setSavingArticle(true);
    try {
      const payload = {
        variant: values.variant,
        writer: values.writer || null,
        writingDate: values.writingDate || null,
      };

      const response = await axios.put(`/api/articles/${article.id}`, payload);

      // Mettre à jour articleData
      setArticleData((prev) => ({
        ...prev,
        ...response.data,
      }));

      showSuccess("Article mis à jour avec succès");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de l'article:", err);
      throw err;
    } finally {
      setSavingArticle(false);
    }
  };

  const handleCancelModuleEdit = async () => {
    await refetchModule();
  };

  const handleCancelArticleEdit = async () => {
    await refetchArticle();
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateModuleVisibility(moduleId, isVisible);
      setSavingVisibility(false);

      // Mettre à jour les données locales
      setModuleData((prev) => ({ ...prev, isVisible }));
      if (setParentModuleData && moduleData && articleData) {
        setParentModuleData({ ...moduleData, ...articleData, isVisible });
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

  // Ne pas return tôt: laisser les composants afficher leur propre loading via props
  const effectiveLoading = Boolean(
    parentLoading || moduleLoading || articleLoading || variantsLoading,
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
        title="Détails de l'article"
        fields={moduleFields}
        initialValues={moduleData || {}}
        onSubmit={handleModuleSubmit}
        onCancelExternal={handleCancelModuleEdit}
        loading={savingModule || effectiveLoading}
        displayColumns={2}
      />

      {/* Formulaire Article (variant, writer, writingDate) */}
      <EditablePanelV2
        title="Paramètres de l'article"
        fields={articleFields}
        initialValues={articleData || {}}
        onSubmit={handleArticleSubmit}
        onCancelExternal={handleCancelArticleEdit}
        loading={savingArticle || effectiveLoading}
        displayColumns={2}
      />

      {/* Gestion des contenus */}
      <ContentManager
        parentId={moduleId}
        parentType="module"
        customLabels={{
          header: "Contenus de l'article",
          addButton: "Ajouter un contenu d'article",
          empty: "Aucun contenu pour cet article.",
          loading: "Chargement des contenus...",
          saveContent: "Enregistrer le contenu",
          bodyLabel: "Contenu de l'article",
        }}
      />

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
