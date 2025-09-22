"use client";

import React, { useEffect, useState } from "react";
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
  const [editingMedia, setEditingMedia] = useState(null); // Pour la modale d'édition
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
      defaultValue: moduleData?.name || "",
    },
    {
      name: "title",
      label: "Titre de la galerie",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
      defaultValue: moduleData?.title || "",
    },
    {
      name: "variant",
      label: "Variante d'affichage",
      type: "select",
      required: true,
      options: [
        { value: "GRID", label: "Grille" },
        // Ajoutez d'autres variantes si elles existent dans GalleryVariants
      ],
      defaultValue: moduleData?.variant || "GRID",
    },
  ];

  const handleFormChange = (name, value, allValues) => {
    setModuleData((prev) => ({ ...prev, ...allValues }));
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

  // Gestion des médias de la galerie
  const mapMedia = (media) => ({
    ...media,
    url: media.url || media.fileUrl || "",
    filename:
      media.filename || media.title || media.fileUrl?.split("/").pop() || "",
    type: media.fileType?.startsWith("image")
      ? "image"
      : media.fileType?.startsWith("video")
        ? "video"
        : "file",
  });

  const handleAddMedia = async (media) => {
    console.log("handleAddMedia appelé avec :", media);
    try {
      const attachedMedia = await addMedia(moduleId, media);
      const mappedMedia = mapMedia(attachedMedia);
      setModuleData((prev) => ({
        ...prev,
        medias: [...(prev.medias || []), mappedMedia],
      }));
      setShowMediaPicker(false);
    } catch (err) {
      alert("Erreur lors de l'ajout du média");
    }
  };

  const handleRemoveMedia = async (mediaId) => {
    if (!window.confirm("Supprimer ce média de la galerie ?")) return;
    try {
      await removeMedia(moduleId, mediaId);
      setModuleData((prev) => ({
        ...prev,
        medias: (prev.medias || []).filter((m) => m.id !== mediaId),
      }));
    } catch (err) {
      alert("Erreur lors de la suppression du média");
    }
  };

  // Ouvre la modale d'édition
  const handleEditMedia = (media) => {
    setEditingMedia(media);
  };

  // Callback après édition ou annulation
  const handleMediaEditorClose = (updatedMedia) => {
    setEditingMedia(null);
    if (updatedMedia) {
      // Met à jour le média dans la liste locale
      setModuleData((prev) => ({
        ...prev,
        medias: prev.medias.map((m) =>
          m.id === updatedMedia.id ? { ...m, ...updatedMedia } : m,
        ),
      }));
    }
  };

  // Appliquer le mapping des médias à chaque changement de moduleData
  useEffect(() => {
    if (moduleData?.medias && Array.isArray(moduleData.medias)) {
      const mapped = moduleData.medias.map(mapMedia);
      // Vérifie si un mapping est nécessaire (évite les boucles infinies)
      const needsUpdate = mapped.some(
        (m, i) =>
          m.url !== moduleData.medias[i]?.url ||
          m.filename !== moduleData.medias[i]?.filename,
      );
      if (needsUpdate) {
        setModuleData((prev) => ({ ...prev, medias: mapped }));
      }
    }
  }, [moduleData?.medias]);

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
      <MyForm
        fields={fields}
        formValues={moduleData}
        setFormValues={setModuleData}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
        loading={saving}
        submitButtonLabel="Enregistrer le module galerie"
      />

      {/* Gestion des médias de la galerie */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">
              Médias de la galerie
            </h3>
            <div className="text-sm text-text-muted mb-4">
              Ajoutez ou supprimez des médias pour cette galerie (images,
              vidéos)
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            className="flex items-center gap-2"
            onClick={() => setShowMediaPicker(true)}
            disabled={mediaLoading}
          >
            <PlusIcon className="w-4 h-4" />
            Ajouter un média
          </Button>
        </div>

        {showMediaPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-background border border-border rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text">
                  Sélectionner un média
                </h3>
                <button
                  onClick={() => setShowMediaPicker(false)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  ✕
                </button>
              </div>
              <MediaPicker
                attachToEntity={handleAddMedia}
                entityType="gallery"
                entityId={moduleId}
                label="Médias de la galerie"
              />
            </div>
          </div>
        )}
        {/* Affichage des médias existants */}
        {moduleData?.medias && moduleData.medias.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-text mb-2">
              Médias actuels ({moduleData.medias.length}) :
            </h4>
            <MediaGrid
              medias={moduleData.medias}
              onRemove={handleRemoveMedia}
              onEdit={handleEditMedia}
              loading={mediaLoading}
              columns={4}
            />
          </div>
        )}
        {/* Modale d'édition de média */}
        {editingMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-background border border-border rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
              <MediaEditor
                mediaId={editingMedia.id}
                onCancel={() => handleMediaEditorClose()}
                onMediaAttached={handleMediaEditorClose}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
