"use client";

import React, { useEffect, useState } from "react";
import EditablePanelV2 from "@/components/ui/EditablePanel";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import { useAxiosClient } from "@/utils/axiosClient";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import useGetModule from "@/hooks/useGetModule";
import useGetCTA from "@/hooks/useGetCTA";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";

export default function CTAModuleEditor({
  moduleId,
  moduleData: _initialModuleData,
  setModuleData: setParentModuleData,
  refetch: _parentRefetch,
  loading: parentLoading = false,
}) {
  const axios = useAxiosClient();
  const { updateModuleVisibility } = useModuleOperations();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  const [savingModule, setSavingModule] = useState(false);
  const [savingCTA, setSavingCTA] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const allowedCtaVariants = ["BUTTON", "LINK"];

  // Fetch module base data (name, title, isVisible)
  const {
    module,
    refetch: refetchModule,
    loading: moduleLoading,
  } = useGetModule({ moduleId });

  // Fetch CTA-specific data (label, url, variant)
  const {
    cta,
    refetch: refetchCTA,
    loading: ctaLoading,
  } = useGetCTA({ moduleId });

  const [moduleData, setModuleData] = useState(null);
  const [ctaData, setCtaData] = useState(null);

  useEffect(() => {
    if (module) setModuleData(module);
  }, [module]);

  useEffect(() => {
    if (cta) setCtaData(cta);
  }, [cta]);

  // Sync combined data back to parent
  useEffect(() => {
    if (moduleData && ctaData && setParentModuleData) {
      setParentModuleData({ ...moduleData, ...ctaData });
    }
  }, [moduleData, ctaData, setParentModuleData]);

  // Fields: base module (name, title)
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
      label: "Titre",
      type: "text",
      placeholder: "Entrez le titre affiché",
      required: true,
    },
  ];

  // Fields: CTA-specific (label, url, variant)
  const ctaFields = [
    {
      name: "label",
      label: "Texte du bouton / lien",
      type: "text",
      placeholder: "Ex: En savoir plus, Contactez-nous...",
      required: true,
    },
    {
      name: "url",
      label: "URL ou chemin de destination",
      type: "text", // "text" pour autoriser les slugs internes (/page) et les URLs
      placeholder: "https://example.com ou /page-interne",
      required: true,
    },
    {
      name: "variant",
      label: "Type d'affichage",
      type: "select",
      required: true,
      options: [
        { value: "BUTTON", label: "Bouton" },
        { value: "LINK", label: "Lien simple" },
      ],
    },
  ];

  // Save base module fields (name, title) via PUT /api/modules/{moduleId}
  const handleModuleSubmit = async (values) => {
    setSavingModule(true);
    try {
      const response = await axios.put(`/api/modules/${module.moduleId}`, {
        name: values.name,
        title: values.title,
      });
      setModuleData((prev) => ({ ...prev, ...response.data }));
      showSuccess("Module mis à jour avec succès");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du module:", err);
      showError("Erreur", "Impossible de sauvegarder le module");
      throw err;
    } finally {
      setSavingModule(false);
    }
  };

  // Save CTA-specific fields via POST /api/cta/version (creates new version)
  const handleCTASubmit = async (values) => {
    setSavingCTA(true);
    try {
      const variant = allowedCtaVariants.includes(values.variant)
        ? values.variant
        : "BUTTON";
      const response = await axios.post("/api/cta/version", {
        moduleId: moduleId,
        name: moduleData?.name || values.label,
        title: moduleData?.title || values.label,
        label: values.label,
        url: values.url,
        variant,
      });
      setCtaData((prev) => ({ ...prev, ...response.data }));
      showSuccess("CTA mis à jour avec succès");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du CTA:", err);
      showError("Erreur", "Impossible de sauvegarder le CTA");
      throw err;
    } finally {
      setSavingCTA(false);
    }
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateModuleVisibility(moduleId, isVisible);
      setModuleData((prev) => ({ ...prev, isVisible }));
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
    } finally {
      setSavingVisibility(false);
    }
  };

  const effectiveLoading = Boolean(
    parentLoading || moduleLoading || ctaLoading,
  );

  return (
    <div className="space-y-6">
      {/* Visibilité */}
      <VisibilitySwitch
        title="Visibilité du module"
        label="Module visible sur le site"
        isVisible={moduleData?.isVisible || false}
        onChange={handleVisibilityChange}
        savingVisibility={savingVisibility}
      />

      {/* Formulaire module (name, title) */}
      <EditablePanelV2
        title="Informations du module"
        fields={moduleFields}
        initialValues={moduleData || {}}
        onSubmit={handleModuleSubmit}
        onCancelExternal={refetchModule}
        loading={savingModule || effectiveLoading}
        displayColumns={2}
      />

      {/* Formulaire CTA (label, url, variant) */}
      <EditablePanelV2
        title="Paramètres du CTA"
        fields={ctaFields}
        initialValues={ctaData || {}}
        onSubmit={handleCTASubmit}
        onCancelExternal={refetchCTA}
        loading={savingCTA || effectiveLoading}
        displayColumns={2}
      />

      {/* Aperçu */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Aperçu du CTA</h3>
        {ctaData?.label && ctaData?.url ? (
          <div className="p-4 bg-gray-50 rounded-lg space-y-1">
            {moduleData?.title && (
              <div className="font-medium text-text">{moduleData.title}</div>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
              <span>Type : {ctaData.variant || "BUTTON"}</span>
              <span>→</span>
              <span className="font-medium text-text">{ctaData.label}</span>
              <span className="italic">({ctaData.url})</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-text-muted">
            Remplissez les champs ci-dessus pour voir l'aperçu
          </div>
        )}
      </div>

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
