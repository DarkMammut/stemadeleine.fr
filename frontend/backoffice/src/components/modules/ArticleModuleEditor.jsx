"use client";

import React, { useEffect, useState } from "react";
import MyForm from "@/components/MyForm";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useGetModule from "@/hooks/useGetModule";
import useGetArticle from "@/hooks/useGetArticle";
import useArticleVariants from "@/hooks/useArticleVariants";
import ContentManager from "@/components/ContentManager";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";

export default function ArticleModuleEditor({
  moduleId,
  moduleData: _initialModuleData,
  setModuleData: setParentModuleData,
  refetch: _parentRefetch,
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
      console.log("📦 Données de module chargées:", module);
      setModuleData(module);
    }
  }, [module]);

  // Synchroniser avec les données de l'article
  useEffect(() => {
    if (article) {
      console.log("📝 Données d'article chargées:", article);
      console.log("  - variant:", article.variant);
      console.log("  - writer:", article.writer);
      console.log("  - writingDate:", article.writingDate);
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
    console.log("📝 Soumission du formulaire Module avec values:", values);
    setSavingModule(true);
    try {
      const payload = {
        name: values.name,
        title: values.title,
      };
      console.log("📤 Envoi au serveur (endpoint: /api/modules):", payload);

      const response = await axios.put(
        `/api/modules/${module.moduleId}`,
        payload,
      );

      console.log("📥 Réponse du serveur:", response.data);

      // Mettre à jour moduleData
      setModuleData((prev) => ({
        ...prev,
        ...response.data,
      }));

      console.log("✅ Module mis à jour");
    } catch (err) {
      console.error("❌ Erreur lors de la sauvegarde du module:", err);
      throw err;
    } finally {
      setSavingModule(false);
    }
  };

  // Soumission du formulaire Article
  const handleArticleSubmit = async (values) => {
    console.log("📝 Soumission du formulaire Article avec values:", values);
    setSavingArticle(true);
    try {
      const payload = {
        variant: values.variant,
        writer: values.writer || null,
        writingDate: values.writingDate || null,
      };
      console.log("📤 Envoi au serveur (endpoint: /api/articles):", payload);

      const response = await axios.put(`/api/articles/${article.id}`, payload);

      console.log("📥 Réponse du serveur:", response.data);
      console.log("  - variant dans réponse:", response.data?.variant);
      console.log("  - writer dans réponse:", response.data?.writer);
      console.log("  - writingDate dans réponse:", response.data?.writingDate);

      // Mettre à jour articleData
      setArticleData((prev) => ({
        ...prev,
        ...response.data,
      }));

      console.log("✅ Article mis à jour");
    } catch (err) {
      console.error("❌ Erreur lors de la sauvegarde de l'article:", err);
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

  // Afficher un loader pendant le chargement initial
  if (
    (moduleLoading && !moduleData) ||
    (articleLoading && !articleData) ||
    variantsLoading
  ) {
    return <div className="text-center py-8">Chargement de l'article...</div>;
  }

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
      {moduleData && (
        <MyForm
          title="Détails de l'article"
          fields={moduleFields}
          initialValues={moduleData}
          onSubmit={handleModuleSubmit}
          loading={savingModule}
          submitButtonLabel="Enregistrer"
          onCancel={handleCancelModuleEdit}
          cancelButtonLabel="Annuler"
          successMessage="Les informations du module ont été mises à jour avec succès"
          errorMessage="Impossible de mettre à jour le module"
        />
      )}

      {/* Formulaire Article (variant, writer, writingDate) */}
      {articleData && (
        <MyForm
          title="Paramètres de l'article"
          fields={articleFields}
          initialValues={articleData}
          onSubmit={handleArticleSubmit}
          loading={savingArticle}
          submitButtonLabel="Enregistrer"
          onCancel={handleCancelArticleEdit}
          cancelButtonLabel="Annuler"
          successMessage="Les paramètres de l'article ont été mis à jour avec succès"
          errorMessage="Impossible de mettre à jour l'article"
        />
      )}

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
