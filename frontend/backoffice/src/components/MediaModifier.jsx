"use client";

import React, { useEffect, useState } from 'react';
import { useAxiosClient } from '@/utils/axiosClient';
import MyForm from '@/components/MyForm';
import { useNotification } from '@/hooks/useNotification';
import Notification from '@/components/ui/Notification';

/**
 * MediaModifier - Composant pour modifier les métadonnées d'un média
 * @param {number} mediaId - ID du média à modifier
 * @param {Function} onMediaUpdated - Callback appelé après la mise à jour du média
 * @param {Function} onConfirm - Callback pour confirmer et utiliser le média
 * @param {Function} onCancel - Callback pour annuler
 */
export default function MediaModifier({
  mediaId,
  onMediaUpdated,
  onConfirm,
  onCancel,
}) {
  const axios = useAxiosClient();
  const [media, setMedia] = useState(null);
  const [originalMedia, setOriginalMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { notification, showError, hideNotification } = useNotification();

  // Charger le média
  useEffect(() => {
    if (!mediaId) return;

    setLoading(true);
    axios
      .get(`/api/media/${mediaId}`)
      .then((res) => {
        setMedia(res.data);
        setOriginalMedia(res.data);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement du média:", err);
        showError(
          "Erreur de chargement",
          "Impossible de charger le média. Veuillez réessayer.",
        );
      })
      .finally(() => setLoading(false));
  }, [mediaId, axios]);

  // Fonction pour détecter les modifications
  const checkForChanges = (newValues) => {
    if (!originalMedia) return false;

    return (
      newValues.title !== originalMedia.title ||
      newValues.altText !== originalMedia.altText ||
      newValues.isVisible !== originalMedia.isVisible
    );
  };

  // Fonction pour annuler les modifications et fermer le modal
  const handleCancelAndClose = () => {
    if (hasUnsavedChanges && originalMedia) {
      setMedia(originalMedia);
      setHasUnsavedChanges(false);
    }
    if (onCancel) {
      onCancel();
    }
  };

  const handleSaveAndConfirm = async (values) => {
    try {
      // Sauvegarder les modifications si nécessaire
      if (hasUnsavedChanges || values) {
        const res = await axios.put(`/api/media/${mediaId}`, {
          ...media,
          ...values,
        });
        const updatedMedia = res.data;
        setMedia(updatedMedia);
        setOriginalMedia(updatedMedia);
        setHasUnsavedChanges(false);

        if (onMediaUpdated) {
          onMediaUpdated(updatedMedia);
        }

        // Confirmer et utiliser le média
        if (onConfirm) {
          onConfirm(updatedMedia);
        }
      } else {
        // Pas de modifications, utiliser directement le média
        if (onConfirm) {
          onConfirm(media);
        }
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      showError(
        "Erreur de sauvegarde",
        "Impossible de sauvegarder les modifications. Veuillez réessayer.",
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
        <p className="mt-2 text-gray-600">Chargement du média...</p>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Erreur : Média introuvable</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Aperçu de l'image */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Aperçu de l'image
        </h3>
        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
          <img
            src={media.fileUrl}
            alt={media.altText || ""}
            className="max-w-full max-h-96 object-contain rounded"
          />
        </div>
      </div>

      {/* Formulaire de modification */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Informations du média
        </h3>
        <MyForm
          key={media?.id}
          fields={[
            {
              name: "title",
              label: "Titre",
              type: "text",
              placeholder: "Titre du média",
              required: true,
            },
            {
              name: "altText",
              label: "Texte alternatif",
              type: "text",
              placeholder: "Description pour l'accessibilité",
              required: true,
            },
            {
              name: "isVisible",
              label: "Visible dans la bibliothèque",
              type: "checkbox",
            },
          ]}
          initialValues={{
            title: media?.title || "",
            altText: media?.altText || "",
            isVisible: media?.isVisible ?? true,
          }}
          onChange={(name, value, allValues) => {
            setHasUnsavedChanges(checkForChanges(allValues));
          }}
          onSubmit={handleSaveAndConfirm}
          onCancel={handleCancelAndClose}
          submitButtonLabel="Enregistrer"
        />
      </div>

      {/* Notification */}
      {notification.show && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </div>
  );
}
