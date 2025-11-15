"use client";

import React, { useRef, useState } from 'react';
import { MagnifyingGlassIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import IconButton from '@/components/ui/IconButton';
import Button from '@/components/ui/Button';
import MediaSelector from '@/components/MediaSelector';
import MediaModifier from '@/components/MediaModifier';
import MediaGrid from '@/components/MediaGrid';
import Notification from '@/components/ui/Notification';
import Panel from '@/components/ui/Panel';
import { useNotification } from '@/hooks/useNotification';
import { useAxiosClient } from '@/utils/axiosClient';
import PropTypes from 'prop-types';

/**
 * MediaPickerWrapper - Zone de drag & drop ou recherche de média
 */
const MediaPickerWrapper = ({
  onUploadComplete,
  onBrowseClick,
  disabled = false,
}) => {
  const axios = useAxiosClient();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileInputChange = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      });

      const uploadedMedia = res.data;
      if (onUploadComplete) {
        onUploadComplete(uploadedMedia);
      }
    } catch (err) {
      console.error("Erreur lors de l'upload:", err);
      alert("Erreur lors de l'upload du média");
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Zone de drag & drop */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all
          ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-gray-50"}
          ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"}
        `}
        onClick={!uploading ? handleFileSelect : undefined}
      >
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-700 font-medium">
          {uploading
            ? "Upload en cours..."
            : isDragging
              ? "Déposez le fichier ici"
              : "Glissez-déposez un fichier ou cliquez pour sélectionner"}
        </p>
        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF jusqu'à 10MB</p>
      </div>

      {/* Barre de progression */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Bouton pour rechercher dans la bibliothèque */}
      <div className="flex justify-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={!disabled && !uploading ? onBrowseClick : undefined}
          disabled={disabled || uploading}
          className="flex items-center gap-2"
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          Rechercher dans la bibliothèque
        </Button>
      </div>
    </div>
  );
};

const MediaManager = ({
  content,
  onMediaAdd,
  onMediaRemove,
  onMediaChanged,
  maxMedias = null, // Limite optionnelle du nombre de médias
  title = "Galerie de médias", // Titre personnalisable
  loading = false,
}) => {
  const effectiveLoading = loading;
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [showMediaModifier, setShowMediaModifier] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  const canAddMedia = !maxMedias || (content.medias?.length || 0) < maxMedias;

  // Appelé quand un média est sélectionné depuis MediaSelector
  const handleMediaSelected = (media) => {
    setShowMediaSelector(false);
    setSelectedMediaId(media.id);
    setShowMediaModifier(true);
  };

  // Appelé quand un média est uploadé via MediaPicker (drag & drop)
  const handleMediaUploaded = async (uploadedMedia) => {
    // Ouvrir directement MediaModifier avec le média uploadé
    setSelectedMediaId(uploadedMedia.id);
    setShowMediaModifier(true);
  };

  // Appelé quand le média est confirmé dans MediaModifier
  const handleMediaConfirmed = async (media) => {
    try {
      // Vérifier si le média est déjà dans la liste (édition) ou s'il faut l'ajouter
      const isExistingMedia = content.medias?.some((m) => m.id === media.id);

      if (!isExistingMedia) {
        // Nouveau média : l'ajouter
        await onMediaAdd(content.id, media.id);
        showSuccess(
          "Média ajouté",
          "Le média a été ajouté avec succès à la galerie",
        );
      } else {
        // Média existant : juste rafraîchir
        showSuccess("Média modifié", "Le média a été modifié avec succès");
      }

      setShowMediaModifier(false);
      setSelectedMediaId(null);
      if (onMediaChanged) onMediaChanged();
    } catch (error) {
      console.error("Error adding media to content:", error);
      showError(
        "Erreur d'ajout",
        "Impossible d'ajouter le média. Veuillez réessayer.",
      );
    }
  };

  const handleRemoveMedia = async (mediaId) => {
    try {
      await onMediaRemove(content.id, mediaId);
      if (onMediaChanged) onMediaChanged();
      showSuccess("Média supprimé", "Le média a été supprimé de la galerie");
    } catch (error) {
      console.error("Error removing media from content:", error);
      showError(
        "Erreur de suppression",
        "Impossible de supprimer le média. Veuillez réessayer.",
      );
    }
  };

  const handleEditMedia = (media) => {
    setSelectedMediaId(media.id);
    setShowMediaModifier(true);
  };

  return (
    <Panel
      title={`${title} (${content.medias?.length || 0}${maxMedias ? ` / ${maxMedias}` : ""})`}
      loading={effectiveLoading}
    >
      <div className="space-y-4">
        {/* Avertissement si pas de content.id */}
        {!content.id && !effectiveLoading && (
          <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-4">
            Vous devez d'abord sauvegarder le contenu avant d'ajouter un média.
          </div>
        )}

        {/* MediaGrid pour afficher les médias existants (ou placeholders en loading) */}
        {content.medias && (
          <MediaGrid
            medias={content.medias || []}
            onRemove={handleRemoveMedia}
            onEdit={handleEditMedia}
            loading={effectiveLoading}
          />
        )}

        {/* MediaPicker pour ajouter de nouveaux médias (désactivé en loading) */}
        {content.id && canAddMedia && (
          <MediaPickerWrapper
            onUploadComplete={handleMediaUploaded}
            onBrowseClick={() => setShowMediaSelector(true)}
            disabled={effectiveLoading}
          />
        )}

        {!canAddMedia && maxMedias && !effectiveLoading && (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-4">
            Limite de {maxMedias} média{maxMedias > 1 ? "s" : ""} atteinte.
            Supprimez un média existant pour en ajouter un nouveau.
          </div>
        )}
      </div>

      {/* Modal de sélection de média */}
      {showMediaSelector && !effectiveLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ajouter un média
              </h3>
              <IconButton
                icon={XMarkIcon}
                label="Fermer"
                variant="ghost"
                size="sm"
                onClick={() => setShowMediaSelector(false)}
              />
            </div>

            <MediaSelector
              onMediaSelected={handleMediaSelected}
              onCancel={() => setShowMediaSelector(false)}
            />
          </div>
        </div>
      )}

      {/* Modal de modification de média */}
      {showMediaModifier && selectedMediaId && !effectiveLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Modifier le média
              </h3>
              <IconButton
                icon={XMarkIcon}
                label="Fermer"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowMediaModifier(false);
                  setSelectedMediaId(null);
                }}
              />
            </div>

            <MediaModifier
              mediaId={selectedMediaId}
              // no-op handler to avoid unused param warning in the parent
              onMediaUpdated={() => {}}
              onConfirm={handleMediaConfirmed}
              onCancel={() => {
                setShowMediaModifier(false);
                setSelectedMediaId(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </Panel>
  );
};

MediaManager.propTypes = {
  content: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    medias: PropTypes.array,
  }).isRequired,
  onMediaAdd: PropTypes.func,
  onMediaRemove: PropTypes.func,
  onMediaChanged: PropTypes.func,
  maxMedias: PropTypes.number,
  title: PropTypes.string,
  loading: PropTypes.bool,
};

MediaManager.defaultProps = {
  onMediaAdd: null,
  onMediaRemove: null,
  onMediaChanged: null,
  maxMedias: null,
  title: "Galerie de médias",
  loading: false,
};

export default MediaManager;
