"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAxiosClient } from "@/utils/axiosClient";
import MyForm from "@/components/ui/MyForm";
import Button from "@/components/ui/Button";

export default function MediaEditor({
  mediaId,
  attachToEntity,
  onCancel,
  onMediaAttached,
}) {
  const axios = useAxiosClient();
  const [media, setMedia] = useState(null);
  const [originalMedia, setOriginalMedia] = useState(null); // Pour comparer les modifications
  const [allMedia, setAllMedia] = useState([]);
  const [loading, setLoading] = useState(!!mediaId);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!mediaId) return;
    setLoading(true);
    axios
      .get(`/api/media/${mediaId}`)
      .then((res) => {
        setMedia(res.data);
        setOriginalMedia(res.data); // Sauvegarder l'état original
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mediaId, axios]);

  useEffect(() => {
    axios
      .get("/api/media")
      .then((res) => setAllMedia(res.data))
      .catch(console.error);
  }, [axios]);

  const handleSelectMedia = async (m) => {
    setMedia(m);
    setOriginalMedia(m); // Nouveau média sélectionné = nouvel état original
    setHasUnsavedChanges(false);
  };

  // Fonction pour détecter les modifications
  const checkForChanges = (newValues) => {
    if (!originalMedia) return false;

    return (
      newValues.title !== originalMedia.title ||
      newValues.altText !== originalMedia.altText ||
      newValues.isVisible !== originalMedia.isVisible
    );
  };

  // Fonction pour annuler les modifications
  const handleCancelChanges = () => {
    if (originalMedia) {
      setMedia(originalMedia);
      setHasUnsavedChanges(false);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress((prev) => ({ ...prev, [file.name]: percent }));
        },
      });

      const savedMedia = res.data;
      setMedia(savedMedia);
      setOriginalMedia(savedMedia); // Nouveau média uploadé = nouvel état original
      setAllMedia((prev) => [savedMedia, ...prev]);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'upload du média");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) handleUpload(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleAttachMedia = async () => {
    if (!media?.id) return;

    try {
      if (attachToEntity) {
        await attachToEntity(media.id);
      }

      if (onMediaAttached) {
        onMediaAttached(media);
      }

      alert("Média attaché avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'attachement du média");
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (loading) return <p>Chargement du média...</p>;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Drag & Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 rounded cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        style={{
          borderColor: isDragActive
            ? "var(--color-primary)"
            : "var(--color-border)",
          backgroundColor: isDragActive
            ? "var(--color-surface)"
            : "transparent",
          color: "var(--color-text)",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-center">Déposez votre fichier ici...</p>
        ) : (
          <p className="text-center">
            {media
              ? "Remplacer le média existant"
              : "Glissez-déposez ou cliquez pour sélectionner"}
          </p>
        )}
      </div>

      {uploading && (
        <div className="text-center" style={{ color: "var(--color-text)" }}>
          Upload en cours... {Object.values(progress)[0] || 0}%
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Media */}
        <div>
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            Média sélectionné
          </h3>
          {media ? (
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <img
                src={media.fileUrl}
                alt={media.altText}
                className="w-full h-auto object-contain max-h-64 rounded mb-4"
              />

              <MyForm
                key={media?.id}
                fields={[
                  {
                    name: "title",
                    label: "Titre",
                    type: "text",
                    required: true,
                  },
                  {
                    name: "altText",
                    label: "Texte alternatif",
                    type: "text",
                    required: true,
                  },
                  {
                    name: "isVisible",
                    label: "Visible",
                    type: "checkbox",
                  },
                ]}
                initialValues={{
                  title: media?.title || "",
                  altText: media?.altText || "",
                  isVisible: media?.isVisible || false,
                }}
                onChange={(name, value, allValues) => {
                  setHasUnsavedChanges(checkForChanges(allValues));
                }}
                onSubmit={async (values) => {
                  try {
                    const res = await axios.put(`/api/media/${media.id}`, {
                      ...media,
                      ...values,
                    });
                    setMedia(res.data);
                    setOriginalMedia(res.data); // Mise à jour de l'état original
                    setHasUnsavedChanges(false);
                  } catch (err) {
                    console.error(err);
                    throw err;
                  }
                }}
                submitButtonLabel="Modifier le média"
                successMessage="Le média a été mis à jour avec succès"
                errorMessage="Erreur lors de la sauvegarde du média"
                additionalButtons={
                  hasUnsavedChanges
                    ? [
                        {
                          label: "Annuler",
                          type: "button",
                          style: {
                            backgroundColor: "var(--color-border)",
                            color: "var(--color-text-muted)",
                            marginRight: "8px",
                          },
                          onClick: handleCancelChanges,
                        },
                      ]
                    : []
                }
              />
            </div>
          ) : (
            <div
              className="h-40 w-full flex items-center justify-center rounded-lg"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              Aucun média sélectionné
            </div>
          )}
        </div>

        {/* Media Library */}
        <div>
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            Bibliothèque de médias
          </h3>
          {allMedia.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)" }}>
              Aucun média disponible
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {allMedia.map((m) => (
                <div
                  key={m.id}
                  className={`rounded p-2 cursor-pointer transition-all hover:ring-2 ${
                    m.id === media?.id ? "ring-2" : ""
                  }`}
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    ringColor: "var(--color-primary)",
                  }}
                  onClick={() => handleSelectMedia(m)}
                >
                  <img
                    src={m.fileUrl}
                    alt={m.altText || ""}
                    className="object-cover w-full h-24 rounded"
                  />
                  <p
                    className="text-xs mt-1 truncate"
                    style={{ color: "var(--color-text)" }}
                  >
                    {m.title || "Sans titre"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="flex justify-end gap-3 pt-4 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <Button variant="secondary" onClick={handleCancel}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleAttachMedia} disabled={!media}>
          Utiliser ce média
        </Button>
      </div>
    </div>
  );
}
