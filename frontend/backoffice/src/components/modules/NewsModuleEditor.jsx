"use client";

import React, { useEffect, useState } from "react";
import MyForm from "@/components/MyForm";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useGetModule from "@/hooks/useGetModule";
import useGetNews from "@/hooks/useGetNews";
import useNewsVariants from "@/hooks/useNewsVariants";
import ContentManager from "@/components/ContentManager";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";

export default function NewsModuleEditor({
  moduleId,
  moduleData: _initialModuleData,
  setModuleData: setParentModuleData,
  refetch: _parentRefetch,
}) {
  const { updateModuleVisibility } = useModuleOperations();
  const axios = useAxiosClient();
  const [savingModule, setSavingModule] = useState(false);
  const [savingNews, setSavingNews] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // Récupérer les données du module (name, title)
  const {
    module,
    refetch: refetchModule,
    loading: moduleLoading,
  } = useGetModule({ moduleId });

  // Récupérer les données complètes de l'actualité (variant, writer, writingDate, contents)
  const {
    news,
    refetch: refetchNews,
    loading: newsLoading,
  } = useGetNews({ moduleId });

  // Récupérer les variantes disponibles depuis le backend
  const { variants: variantOptions, loading: variantsLoading } =
    useNewsVariants();

  // États locaux
  const [moduleData, setModuleData] = useState(null);
  const [newsData, setNewsData] = useState(null);

  // Synchroniser avec les données du module
  useEffect(() => {
    if (module) {
      console.log("📦 Données de module chargées:", module);
      setModuleData(module);
    }
  }, [module]);

  // Synchroniser avec les données de l'actualité
  useEffect(() => {
    if (news) {
      console.log("📝 Données d'actualité chargées:", news);
      console.log("  - variant:", news.variant);
      console.log("  - writer:", news.writer);
      console.log("  - writingDate:", news.writingDate);
      setNewsData(news);
    }
  }, [news]);

  // Mettre à jour le parent avec les données combinées
  useEffect(() => {
    if (moduleData && newsData && setParentModuleData) {
      setParentModuleData({
        ...moduleData,
        ...newsData,
      });
    }
  }, [moduleData, newsData, setParentModuleData]);

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
      label: "Titre de l'actualité",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
    },
  ];

  // Champs pour le formulaire News (variant, writer, writingDate)
  const newsFields = [
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

      showSuccess("Module mis à jour avec succès");
      console.log("✅ Module mis à jour");
    } catch (err) {
      console.error("❌ Erreur lors de la sauvegarde du module:", err);
      showError("Erreur lors de la sauvegarde du module");
      throw err;
    } finally {
      setSavingModule(false);
    }
  };

  // Soumission du formulaire News
  const handleNewsSubmit = async (values) => {
    console.log("📝 Soumission du formulaire News avec values:", values);
    setSavingNews(true);
    try {
      const payload = {
        variant: values.variant,
        writer: values.writer || null,
        writingDate: values.writingDate || null,
      };
      console.log("📤 Envoi au serveur (endpoint: /api/news):", payload);

      const response = await axios.put(`/api/news/${news.id}`, payload);

      console.log("📥 Réponse du serveur:", response.data);
      console.log("  - variant dans réponse:", response.data?.variant);
      console.log("  - writer dans réponse:", response.data?.writer);
      console.log("  - writingDate dans réponse:", response.data?.writingDate);

      // Mettre à jour newsData
      setNewsData((prev) => ({
        ...prev,
        ...response.data,
      }));

      showSuccess("Actualité mise à jour avec succès");
      console.log("✅ Actualité mise à jour");
    } catch (err) {
      console.error("❌ Erreur lors de la sauvegarde de l'actualité:", err);
      showError("Erreur lors de la sauvegarde de l'actualité");
      throw err;
    } finally {
      setSavingNews(false);
    }
  };

  const handleCancelModuleEdit = async () => {
    await refetchModule();
  };

  const handleCancelNewsEdit = async () => {
    await refetchNews();
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateModuleVisibility(moduleId, isVisible);
      setSavingVisibility(false);
      setModuleData((prev) => ({ ...prev, isVisible }));
      showSuccess(`Module ${isVisible ? "visible" : "masqué"}`);
    } catch (err) {
      console.error(err);
      showError("Erreur lors de la mise à jour de la visibilité");
      setSavingVisibility(false);
    }
  };

  if (moduleLoading || newsLoading || variantsLoading) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}

      {/* Section Visibilité */}
      <VisibilitySwitch
        title="Visibilité du module"
        label="Module visible sur le site"
        isVisible={moduleData?.isVisible || false}
        onChange={handleVisibilityChange}
        savingVisibility={savingVisibility}
      />

      {/* Formulaire Module (name, title) */}
      {moduleData && Object.keys(moduleData).length > 0 && (
        <MyForm
          key={`module-${moduleId}`}
          title="Détails du module"
          fields={moduleFields}
          initialValues={moduleData}
          onSubmit={handleModuleSubmit}
          loading={savingModule}
          submitButtonLabel="Enregistrer les informations du module"
          onCancel={handleCancelModuleEdit}
          cancelButtonLabel="Annuler"
        />
      )}

      {/* Formulaire News (variant, writer, writingDate) */}
      {newsData && Object.keys(newsData).length > 0 && (
        <MyForm
          key={`news-${news?.id}`}
          title="Détails de l'actualité"
          fields={newsFields}
          initialValues={newsData}
          onSubmit={handleNewsSubmit}
          loading={savingNews}
          submitButtonLabel="Enregistrer les détails de l'actualité"
          onCancel={handleCancelNewsEdit}
          cancelButtonLabel="Annuler"
        />
      )}

      {/* Gestion des contenus */}
      <ContentManager
        parentId={moduleId}
        parentType="module"
        customLabels={{
          header: "Contenus du module actualités",
          addButton: "Ajouter un contenu d'actualité",
          empty: "Aucun contenu pour ce module actualités.",
          loading: "Chargement des contenus...",
          saveContent: "Enregistrer le contenu",
          bodyLabel: "Contenu de l'actualité",
        }}
      />
    </div>
  );
}
