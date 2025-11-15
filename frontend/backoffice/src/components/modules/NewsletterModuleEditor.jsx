"use client";

import React, { useEffect, useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useGetModule from "@/hooks/useGetModule";
import useGetNewsletter from "@/hooks/useGetNewsletter";
import useNewsVariants from "@/hooks/useNewsVariants";
import ContentManager from "@/components/ContentManager";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";

export default function NewsletterModuleEditor({
  moduleId,
  moduleData: _initialModuleData,
  setModuleData: setParentModuleData,
  refetch: _parentRefetch,
  loading: parentLoading = false,
}) {
  const { updateModuleVisibility } = useModuleOperations();
  const axios = useAxiosClient();
  const [savingModule, setSavingModule] = useState(false);
  const [savingNewsletter, setSavingNewsletter] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // Récupérer les données du module (name, title)
  const {
    module,
    refetch: refetchModule,
    loading: moduleLoading,
  } = useGetModule({ moduleId });

  // Récupérer les données complètes de la newsletter (variant, writer, writingDate, contents)
  const {
    newsletter,
    refetch: refetchNewsletter,
    loading: newsletterLoading,
  } = useGetNewsletter({ moduleId });

  // Récupérer les variantes disponibles depuis le backend
  const { variants: variantOptions, loading: variantsLoading } =
    useNewsVariants();

  // États locaux
  const [moduleData, setModuleData] = useState(null);
  const [newsletterData, setNewsletterData] = useState(null);

  // Synchroniser avec les données du module
  useEffect(() => {
    if (module) {
      setModuleData(module);
    }
  }, [module]);

  // Synchroniser avec les données de la newsletter
  useEffect(() => {
    if (newsletter) {
      setNewsletterData(newsletter);
    }
  }, [newsletter]);

  // Mettre à jour le parent avec les données combinées
  useEffect(() => {
    if (moduleData && newsletterData && setParentModuleData) {
      setParentModuleData({
        ...moduleData,
        ...newsletterData,
      });
    }
  }, [moduleData, newsletterData, setParentModuleData]);

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
      label: "Titre de la newsletter",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
    },
  ];

  // Champs pour le formulaire Newsletter (variant, writer, writingDate)
  const newsletterFields = [
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
      console.error("❌ Erreur lors de la sauvegarde du module:", err);
      showError("Erreur lors de la sauvegarde du module");
      throw err;
    } finally {
      setSavingModule(false);
    }
  };

  // Soumission du formulaire Newsletter
  const handleNewsletterSubmit = async (values) => {
    setSavingNewsletter(true);
    try {
      const payload = {
        variant: values.variant,
        writer: values.writer || null,
        writingDate: values.writingDate || null,
      };

      const response = await axios.put(
        `/api/newsletters/${newsletter.id}`,
        payload,
      );

      // Mettre à jour newsletterData
      setNewsletterData((prev) => ({
        ...prev,
        ...response.data,
      }));

      showSuccess("Newsletter mise à jour avec succès");
    } catch (err) {
      console.error("❌ Erreur lors de la sauvegarde de la newsletter:", err);
      showError("Erreur lors de la sauvegarde de la newsletter");
      throw err;
    } finally {
      setSavingNewsletter(false);
    }
  };

  const handleCancelModuleEdit = async () => {
    await refetchModule();
  };

  const handleCancelNewsletterEdit = async () => {
    await refetchNewsletter();
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

  // Ne pas return tôt; les panels gèreront leur loading via props
  const effectiveLoading = Boolean(
    parentLoading || moduleLoading || newsletterLoading || variantsLoading,
  );

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
      <EditablePanelV2
        title="Informations du module"
        fields={moduleFields}
        initialValues={moduleData || {}}
        onSubmit={handleModuleSubmit}
        onCancelExternal={handleCancelModuleEdit}
        loading={savingModule || effectiveLoading}
        displayColumns={2}
      />

      {/* Formulaire Newsletter (variant, writer, writingDate) */}
      <EditablePanelV2
        title="Détails de la newsletter"
        fields={newsletterFields}
        initialValues={newsletterData || {}}
        onSubmit={handleNewsletterSubmit}
        onCancelExternal={handleCancelNewsletterEdit}
        loading={savingNewsletter || effectiveLoading}
        displayColumns={2}
      />

      {/* Gestion des contenus */}
      <ContentManager
        parentId={moduleId}
        parentType="module"
        customLabels={{
          header: "Contenus du module newsletter",
          addButton: "Ajouter un contenu de newsletter",
          empty: "Aucun contenu pour ce module newsletter.",
          loading: "Chargement des contenus...",
          saveContent: "Enregistrer le contenu",
          bodyLabel: "Contenu de la newsletter",
        }}
      />
    </div>
  );
}
