"use client";

import React, { useEffect, useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useGetModule from "@/hooks/useGetModule";
import useGetGallery from "@/hooks/useGetGallery";
import useGalleryVariants from "@/hooks/useGalleryVariants";
import MediaManager from "@/components/MediaManager";
import { useGalleriesMediasOperations } from "@/hooks/useGalleriesMediasOperations";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";

export default function GalleryModuleEditor({
  moduleId,
  moduleData: _initialModuleData,
  setModuleData: setParentModuleData,
  refetch: _parentRefetch,
  loading: parentLoading = false,
}) {
  const { updateModuleVisibility } = useModuleOperations();
  const axios = useAxiosClient();
  const [savingModule, setSavingModule] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const { addMedia, removeMedia } = useGalleriesMediasOperations({
    entityType: "gallery",
  });

  // Récupérer les données du module (name, title)
  const {
    module,
    refetch: refetchModule,
    loading: moduleLoading,
  } = useGetModule({ moduleId });

  // Récupérer les données complètes de la galerie (variant, medias)
  const {
    gallery,
    refetch: refetchGallery,
    loading: galleryLoading,
  } = useGetGallery({ moduleId });

  // Récupérer les variantes disponibles depuis le backend
  const { variants: variantOptions, loading: variantsLoading } =
    useGalleryVariants();

  // États locaux
  const [moduleData, setModuleData] = useState(null);
  const [galleryData, setGalleryData] = useState(null);

  // Synchroniser avec les données du module
  useEffect(() => {
    if (module) {
      setModuleData(module);
    }
  }, [module]);

  // Synchroniser avec les données de la galerie
  useEffect(() => {
    if (gallery) {
      setGalleryData(gallery);
    }
  }, [gallery]);

  // Mettre à jour le parent avec les données combinées
  useEffect(() => {
    if (moduleData && galleryData && setParentModuleData) {
      setParentModuleData({
        ...moduleData,
        ...galleryData,
      });
    }
  }, [moduleData, galleryData, setParentModuleData]);

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
      label: "Titre de la galerie",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
    },
  ];

  // Champs pour le formulaire Gallery (variant)
  const galleryFields = [
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

  // Soumission du formulaire Gallery
  const handleGallerySubmit = async (values) => {
    setSavingGallery(true);
    try {
      const payload = {
        variant: values.variant,
      };

      const response = await axios.put(`/api/galleries/${gallery.id}`, payload);

      // Mettre à jour galleryData
      setGalleryData((prev) => ({
        ...prev,
        ...response.data,
      }));

      showSuccess("Galerie mise à jour avec succès");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de la galerie:", err);
      throw err;
    } finally {
      setSavingGallery(false);
    }
  };

  const handleCancelModuleEdit = async () => {
    await refetchModule();
  };

  const handleCancelGalleryEdit = async () => {
    await refetchGallery();
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateModuleVisibility(moduleId, isVisible);
      setSavingVisibility(false);

      // Mettre à jour les données locales
      setModuleData((prev) => ({ ...prev, isVisible }));
      if (setParentModuleData && moduleData && galleryData) {
        setParentModuleData({ ...moduleData, ...galleryData, isVisible });
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
    parentLoading || moduleLoading || galleryLoading || variantsLoading,
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
        title="Détails de la galerie"
        fields={moduleFields}
        initialValues={moduleData || {}}
        onSubmit={handleModuleSubmit}
        onCancelExternal={handleCancelModuleEdit}
        loading={savingModule || effectiveLoading}
        displayColumns={2}
      />

      {/* Formulaire Gallery (variant) */}
      <EditablePanelV2
        title="Paramètres de la galerie"
        fields={galleryFields}
        initialValues={galleryData || {}}
        onSubmit={handleGallerySubmit}
        onCancelExternal={handleCancelGalleryEdit}
        loading={savingGallery || effectiveLoading}
        displayColumns={2}
      />

      {/* Gestion des médias avec MediaManager */}
      <MediaManager
        content={{ id: moduleId, medias: galleryData?.medias || [] }}
        onMediaAdd={addMedia}
        onMediaRemove={removeMedia}
        onMediaChanged={refetchGallery}
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
