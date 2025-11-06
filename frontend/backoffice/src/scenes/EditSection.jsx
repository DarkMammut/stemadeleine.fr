"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Utilities from "@/components/Utilities";
import Title from "@/components/Title";
import useGetSection from "@/hooks/useGetSection";
import useAddSection from "@/hooks/useAddSection";
import { useSectionOperations } from "@/hooks/useSectionOperations";
import MyForm from "@/components/MyForm";
import MediaManager from "@/components/MediaManager";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import ContentManager from "@/components/ContentManager";
import { useAxiosClient } from "@/utils/axiosClient";

export default function EditSection({ sectionId }) {
  const { section, refetch, loading, error } = useGetSection({ sectionId });
  const { updateSection } = useAddSection();
  const { updateSectionVisibility } = useSectionOperations();
  const [sectionData, setSectionData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [formKey, setFormKey] = useState(0); // Clé pour forcer le remontage du formulaire
  const axios = useAxiosClient();

  useEffect(() => {
    if (section) setSectionData(section);
  }, [section]);

  // Champs du formulaire pour une section
  const fields = [
    {
      name: "name",
      label: "Nom de la section",
      type: "text",
      placeholder: "Entrez le nom de la section",
      required: true,
    },
    {
      name: "title",
      label: "Titre",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
    },
  ];

  const handleAddMedia = async (sectionId, mediaId) => {
    try {
      await axios.put(`/api/sections/${sectionId}/media`, {
        mediaId: mediaId,
      });
      await refetch();

      // Construire l'objet content avec le média ajouté
      return {
        ...sectionData,
        medias: [{ id: mediaId }],
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout du média:", error);
      throw error;
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleRemoveMedia = async (sectionId, mediaId) => {
    try {
      await axios.delete(`/api/sections/${sectionId}/media`);
      await refetch();
    } catch (error) {
      console.error("Erreur lors de la suppression du média:", error);
      throw error;
    }
  };

  const handleFormChange = () => {
    // MyForm gère déjà son état interne
    // Cette fonction peut être utilisée pour des effets de bord si nécessaire
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateSection(sectionId, {
        name: values.name,
        title: values.title,
        subTitle: values.subTitle,
        content: values.content,
        order: parseInt(values.order) || 0,
      });
      setSaving(false);
      refetch();
      alert("Section mise à jour !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde de la section");
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setSectionData(section);
    setFormKey((prev) => prev + 1);
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateSectionVisibility(sectionId, isVisible);
      setSavingVisibility(false);
      setSectionData((prev) => ({ ...prev, isVisible }));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour de la visibilité");
      setSavingVisibility(false);
    }
  };

  // Fonction pour publier la section courante
  const handlePublishSection = async () => {
    await axios.put(`/api/sections/${sectionId}/publish`);
    await refetch();
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (error)
    return (
      <div className="text-center py-8 text-red-600">
        Erreur: {error.message}
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      <Title label="Gestion de la section" onPublish={handlePublishSection} />

      <Utilities actions={[]} />

      {!sectionData ? (
        <div className="text-center py-8 text-text-muted">
          Chargement des données...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section Visibilité séparée */}
          <VisibilitySwitch
            title="Visibilité de la section"
            label="Section visible sur le site"
            isVisible={sectionData?.isVisible || false}
            onChange={handleVisibilityChange}
            savingVisibility={savingVisibility}
          />

          {/* Formulaire principal - Ne s'affiche que quand sectionData est complètement chargé */}
          {sectionData && Object.keys(sectionData).length > 0 && (
            <MyForm
              key={`${sectionData.sectionId || "section-form"}-${formKey}`} // Clé combinée pour forcer le remontage
              fields={fields}
              initialValues={sectionData}
              onSubmit={handleSubmit}
              onChange={handleFormChange}
              loading={saving}
              submitButtonLabel="Enregistrer la section"
              onCancel={handleCancelEdit}
              cancelButtonLabel="Annuler"
            />
          )}

          {/* Rich Text Content Editor */}
          <ContentManager
            parentId={section?.sectionId}
            parentType="section"
            customLabels={{
              header: "Contenus de la section",
              addButton: "Ajouter un contenu",
              empty: "Aucun contenu pour cette section.",
              loading: "Chargement des contenus...",
              saveContent: "Enregistrer le contenu",
              bodyLabel: "Contenu de la section",
            }}
          />
        </div>
      )}

      {/* Gestion de l'image de la section (Section Media) */}
      {sectionData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Image de la section
          </h3>
          <MediaManager
            content={{
              id: sectionId,
              medias: section?.media ? [section.media] : [],
            }}
            onMediaAdd={handleAddMedia}
            onMediaRemove={handleRemoveMedia}
            onMediaChanged={refetch}
            maxMedias={1}
          />
        </div>
      )}
    </motion.div>
  );
}
