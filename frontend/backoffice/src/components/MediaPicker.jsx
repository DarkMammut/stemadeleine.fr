"use client";

import React, { useEffect, useState } from "react";
import MediaEditor from "./MediaEditor";
import { useAxiosClient } from "@/utils/axiosClient";
import useRemoveMedia from "@/hooks/useRemoveMedia";
import Button from "@/components/ui/Button";

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
  const [open, setOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    if (!mediaId) return;
    axios
      .get(`/api/media/${mediaId}`)
      .then((res) => setSelectedMedia(res.data))
      .catch(console.error);
  }, [mediaId, axios]);

  const handleRemoveMedia = async () => {
    if (!selectedMedia || !entityId) return;

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

  return (
    <div className="mt-6">
      <span className="mb-1 font-medium" style={{ color: "var(--color-text)" }}>
        {label}
      </span>
      {selectedMedia ? (
        <div className="space-y-3">
          <div
            className="border rounded cursor-pointer hover:opacity-80 max-w-sm"
            onClick={() => setOpen(true)}
            style={{ borderColor: "var(--color-border)" }}
          >
            <img
              src={selectedMedia.fileUrl}
              alt={selectedMedia.altText || ""}
              className="object-contain max-h-48 w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
              Modifier
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRemoveMedia}
              loading={removeLoading}
            >
              Supprimer
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border h-40 flex items-center justify-center cursor-pointer"
          onClick={() => setOpen(true)}
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          Cliquer pour choisir une image
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className="relative rounded-xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto p-6"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <button
              className="absolute top-2 right-2 cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => setOpen(false)}
              style={{ color: "var(--color-text-muted)" }}
            >
              ✕
            </button>

            <h2
              className="text-xl font-bold mb-4"
              style={{ color: "var(--color-text)" }}
            >
              Choisir ou importer un média
            </h2>

            <MediaEditor
              mediaId={selectedMedia?.id}
              attachToEntity={attachToEntity}
              onCancel={() => setOpen(false)}
              onMediaAttached={(media) => {
                setSelectedMedia(media);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
