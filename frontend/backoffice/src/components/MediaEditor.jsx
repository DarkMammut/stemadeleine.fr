"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAxiosClient } from "@/utils/axiosClient";
import MyForm from "@/components/MyForm";

export default function MediaEditor({ mediaId, attachToEntity }) {
  const axios = useAxiosClient();
  const [media, setMedia] = useState(null);
  const [allMedia, setAllMedia] = useState([]);
  const [loading, setLoading] = useState(!!mediaId);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (!mediaId) return;
    setLoading(true);
    axios
      .get(`/api/media/${mediaId}`)
      .then((res) => setMedia(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mediaId, axios]);

  useEffect(() => {
    axios
      .get("/api/media")
      .then((res) => setAllMedia(res.data))
      .catch(console.error);
  }, [axios]);

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

      if (attachToEntity) {
        await attachToEntity(savedMedia.id);
      }

      setAllMedia((prev) => [savedMedia, ...prev]);
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

  const handleSave = async () => {
    if (!media?.id) return;
    try {
      const res = await axios.put(`/api/media/${media.id}`, media);
      setMedia(res.data);

      if (attachToEntity) {
        await attachToEntity(media.id);
      }

      alert("Média mis à jour et attaché !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleSelectMedia = async (m) => {
    setMedia(m);
  };

  if (loading) return <p>Chargement du média...</p>;

  return (
    <div className="mt-6 space-y-6">
      {/* Drag & Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 rounded cursor-pointer ${
          isDragActive ? "border-blue-500" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Déposez votre fichier ici...</p>
        ) : (
          <p>
            {media
              ? "Remplacer le média existant"
              : "Glissez-déposez ou cliquez pour sélectionner"}
          </p>
        )}
      </div>

      {uploading && (
        <p>Upload en cours... {Object.values(progress)[0] || 0}%</p>
      )}

      {/* Selected Media */}
      {media ? (
        <div className="border p-4 rounded mt-2 max-w-md">
          <img
            src={media.fileUrl}
            alt={media.altText}
            className="w-full h-auto object-contain max-h-64"
          />

          <MyForm
            fields={[
              {
                name: "title",
                label: "Titre",
                type: "text",
                required: true,
                defaultValue: media?.title || "",
              },
              {
                name: "altText",
                label: "Texte alternatif",
                type: "text",
                required: true,
                defaultValue: media?.altText || "",
              },
              {
                name: "isVisible",
                label: "Visible",
                type: "checkbox",
                defaultValue: media?.isVisible || false,
              },
            ]}
            onSubmit={async (values) => {
              try {
                const res = await axios.put(`/api/media/${media.id}`, {
                  ...media,
                  ...values,
                });
                setMedia(res.data);

                if (attachToEntity) {
                  await attachToEntity(res.data.id);
                }

                alert("Média mis à jour et attaché !");
              } catch (err) {
                console.error(err);
                alert("Erreur lors de la sauvegarde");
              }
            }}
          />
        </div>
      ) : (
        <div className="border h-40 w-full flex items-center justify-center text-gray-400">
          Aucun média sélectionné
        </div>
      )}

      {/* Medias librarie */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Médias existants</h3>
        {allMedia.length === 0 ? (
          <p className="text-gray-500">Aucun média disponible</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {allMedia.map((m) => (
              <div
                key={m.id}
                className={`border rounded p-2 cursor-pointer hover:ring-2 hover:ring-blue-500 ${
                  m.id === media?.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => handleSelectMedia(m)}
              >
                <img
                  src={m.fileUrl}
                  alt={m.altText || ""}
                  className="object-cover w-full h-32 rounded"
                />
                <p className="text-xs mt-1 truncate">
                  {m.title || "Sans titre"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
