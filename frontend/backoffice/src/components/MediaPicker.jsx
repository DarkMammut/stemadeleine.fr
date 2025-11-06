"use client";

import React, { useEffect, useState } from "react";
import MediaSelector from "./MediaSelector";
import MediaModifier from "./MediaModifier";
import { useAxiosClient } from "@/utils/axiosClient";
import useRemoveMedia from "@/hooks/useRemoveMedia";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function MediaPicker({
  mediaId,
  attachToEntity,
  entityType = "pages",
  entityId,
  label = "Image",
  allowMultiple = false,
  mediaIdToRemove = null,
}) {
  const axios = useAxiosClient();
  const { removeMedia, loading: removeLoading } = useRemoveMedia();
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [showMediaModifier, setShowMediaModifier] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaId, setSelectedMediaId] = useState(null);

  useEffect(() => {
    if (!mediaId) return;
    axios
      .get(`/api/media/${mediaId}`)
      .then((res) => setSelectedMedia(res.data))
      .catch(console.error);
  }, [mediaId, axios]);

  const handleRemoveMedia = async () => {
    if (!selectedMedia || !entityId) return;

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce média ?")) {
      return;
    }

    try {
      await removeMedia(entityType, entityId, {
        allowMultiple,
        mediaId: mediaIdToRemove || selectedMedia?.id,
      });
      setSelectedMedia(null);
      if (attachToEntity) {
        window.location.reload();
      }
    } catch (error) {
      alert("Erreur lors de la suppression du média");
    }
  };

  const handleMediaSelected = (media) => {
    // Fermer le sélecteur et ouvrir le modificateur
    setShowMediaSelector(false);
    setSelectedMediaId(media.id);
    setShowMediaModifier(true);
  };

  const handleMediaConfirmed = async (media) => {
    try {
      if (attachToEntity) {
        await attachToEntity(media.id);
      }
      setSelectedMedia(media);
      setShowMediaModifier(false);
      setSelectedMediaId(null);
    } catch (error) {
      console.error("Error attaching media:", error);
      alert("Erreur lors de l'attachement du média");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        {label}
      </label>

      {selectedMedia ? (
        <div className="flex items-center gap-4">
          {/* Aperçu du média */}
          <div
            className="h-40 w-40 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setSelectedMediaId(selectedMedia.id);
              setShowMediaModifier(true);
            }}
          >
            <img
              src={selectedMedia.fileUrl}
              alt={selectedMedia.altText || ""}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Informations */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {selectedMedia.title || "Sans titre"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {selectedMedia.altText || "Pas de description"}
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedMediaId(selectedMedia.id);
                setShowMediaModifier(true);
              }}
            >
              Modifier
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRemoveMedia}
              disabled={removeLoading}
            >
              {removeLoading ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => setShowMediaSelector(true)}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-700 font-medium">
            Cliquez pour choisir une image
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
        </div>
      )}

      {/* Modal de sélection de média */}
      {showMediaSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Choisir ou importer un média
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
      {showMediaModifier && selectedMediaId && (
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
              onMediaUpdated={(media) => {
                // Optionnel
              }}
              onConfirm={handleMediaConfirmed}
              onCancel={() => {
                setShowMediaModifier(false);
                setSelectedMediaId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
