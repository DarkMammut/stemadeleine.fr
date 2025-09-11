"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Utilities from "@/components/Utilities";
import Title from "@/components/Title";
import useGetSection from "@/hooks/useGetSection";
import useAddSection from "@/hooks/useAddSection";
import MyForm from "@/components/MyForm";
import MediaPicker from "@/components/MediaPicker";
import Switch from "@/components/ui/Switch";
import SectionContentManager from "@/components/SectionContentManager";
import { useAxiosClient } from "@/utils/axiosClient";

export default function EditSection({ sectionId }) {
  const { section, refetch, loading, error } = useGetSection({ sectionId });
  const { updateSection } = useAddSection();
  const [sectionData, setSectionData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
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
      defaultValue: sectionData?.name || "",
    },
    {
      name: "title",
      label: "Titre",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
      defaultValue: sectionData?.title || "",
    },
  ];

  const attachToEntity = async (mediaId) => {
    await axios.put(`/api/sections/${sectionId}/media`, {
      mediaId: mediaId,
    });
    refetch();
  };

  const handleFormChange = (name, value, allValues) => {
    setSectionData((prev) => ({ ...prev, ...allValues }));
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

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await axios.put(`/api/sections/${sectionId}/visibility`, { isVisible });
      setSavingVisibility(false);
      setSectionData((prev) => ({ ...prev, isVisible }));
      // Removed refetch() to prevent page flash - local state is already updated
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour de la visibilité");
      setSavingVisibility(false);
    }
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
      className="w-full max-w-6xl mx-auto p-6 space-y-6"
    >
      <Title
        label="Édition de section"
        apiUrl={`/api/sections/${sectionId}`}
        data={section}
      />

      <Utilities actions={[]} />

      {!sectionData ? (
        <div className="text-center py-8 text-text-muted">
          Chargement des données...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section Visibilité séparée */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text mb-4">
              Visibilité de la section
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch
                checked={sectionData?.isVisible || false}
                onChange={handleVisibilityChange}
                disabled={savingVisibility}
              />
              <span className="font-medium text-text">
                Section visible sur le site
                {savingVisibility && (
                  <span className="text-text-muted ml-2">(Sauvegarde...)</span>
                )}
              </span>
            </label>
            <p className="text-sm text-text-muted mt-2">
              Cette option se sauvegarde automatiquement
            </p>
          </div>

          {/* Formulaire principal */}
          <MyForm
            fields={fields}
            formValues={sectionData}
            setFormValues={setSectionData}
            onSubmit={handleSubmit}
            onChange={handleFormChange}
            loading={saving}
            submitButtonLabel="Enregistrer la section"
          />

          {/* Rich Text Content Editor */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <SectionContentManager
              sectionId={sectionId}
              initialContents={sectionData?.contents || []}
            />
          </div>
        </div>
      )}

      <MediaPicker
        mediaId={section?.media?.id}
        attachToEntity={attachToEntity}
        entityType="sections"
        entityId={sectionId}
      />
    </motion.div>
  );
}
