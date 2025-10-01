"use client";

import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import Switch from "@/components/ui/Switch";
import { useAddModule } from "@/hooks/useAddModule";
import { useModuleOperations } from "@/hooks/useModuleOperations";
import MediaPicker from "@/components/MediaPicker";
import Button from "@/components/ui/Button";
import { PlusIcon } from "@heroicons/react/16/solid";
import { useGalleriesMediasOperations } from "@/hooks/useGalleriesMediasOperations";
import MediaGrid from "@/components/MediaGrid";
import MediaEditor from "@/components/MediaEditor";

export default function GalleryModuleEditor({
  moduleId,
  moduleData,
  setModuleData,
  refetch,
}) {
  const { updateModule } = useAddModule();
  const { updateModuleVisibility } = useModuleOperations();
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [formKey, setFormKey] = useState(0); // Clé pour forcer le remontage du formulaire
  const { addMedia, removeMedia, mediaLoading } = useGalleriesMediasOperations({
    entityType: "gallery",
  });

  // Champs basés sur le modèle Java Gallery
  const fields = [
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
    {
      name: "variant",
      label: "Variante d'affichage",
      type: "select",
      required: true,
      options: [{ value: "GRID", label: "Grille" }],
    },
  ];

  const handleFormChange = () => {
    // MyForm gère déjà son état interne
    // Cette fonction peut être utilisée pour des effets de bord si nécessaire
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateModule(moduleId, {
        name: values.name,
        title: values.title,
        variant: values.variant,
        sortOrder: parseInt(values.sortOrder) || 0,
      });
      setSaving(false);
      refetch();
      alert("Module galerie mis à jour !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde du module");
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Force le remontage du formulaire pour revenir aux valeurs initiales
    setFormKey((prev) => prev + 1);
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateModuleVisibility(moduleId, isVisible);
      setSavingVisibility(false);
      setModuleData((prev) => ({ ...prev, isVisible }));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour de la visibilité");
      setSavingVisibility(false);
    }
  };

  const handleAddMedia = async (mediaId) => {
    try {
      await addMedia(moduleId, mediaId);
      setShowMediaPicker(false);
      refetch();
    } catch (error) {
      console.error("Erreur lors de l'ajout du média :", error);
      alert("Erreur lors de l'ajout du média");
    }
  };

  const handleRemoveMedia = async (mediaId) => {
    try {
      await removeMedia(moduleId, mediaId);
      refetch();
    } catch (error) {
      console.error("Erreur lors de la suppression du média :", error);
      alert("Erreur lors de la suppression du média");
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Visibilité */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Visibilité du module
        </h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <Switch
            checked={moduleData?.isVisible || false}
            onChange={handleVisibilityChange}
            disabled={savingVisibility}
          />
          <span className="font-medium text-text">
            Module visible sur le site
            {savingVisibility && (
              <span className="text-text-muted ml-2">(Sauvegarde...)</span>
            )}
          </span>
        </label>
      </div>

      {/* Formulaire principal */}
      {moduleData && Object.keys(moduleData).length > 0 && (
        <MyForm
          key={`${moduleId || "gallery-module"}-${formKey}`}
          fields={fields}
          initialValues={moduleData}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          loading={saving}
          submitButtonLabel="Enregistrer le module galerie"
          onCancel={handleCancelEdit}
          cancelButtonLabel="Annuler"
        />
      )}

      {/* Gestion des médias de la galerie */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-text">
            Médias de la galerie
          </h3>
          <Button
            onClick={() => setShowMediaPicker(true)}
            variant="primary"
            size="sm"
            loading={mediaLoading}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Ajouter un média
          </Button>
        </div>

        <MediaGrid
          medias={moduleData?.medias || []}
          onEdit={setEditingMedia}
          onRemove={handleRemoveMedia}
          entityType="gallery"
          entityId={moduleId}
        />
      </div>

      {/* Sélecteur de média */}
      {showMediaPicker && (
        <MediaPicker
          attachToEntity={handleAddMedia}
          entityType="gallery"
          entityId={moduleId}
          onClose={() => setShowMediaPicker(false)}
        />
      )}

      {/* Éditeur de média */}
      {editingMedia && (
        <MediaEditor
          media={editingMedia}
          onClose={() => setEditingMedia(null)}
          onSave={() => {
            setEditingMedia(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
