"use client";

import React, { useState } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import MediaPicker from "@/components/MediaPicker";
import MediaGrid from "@/components/MediaGrid";

const ContentMediaManager = ({
  content,
  onMediaAdd,
  onMediaRemove,
  onMediaChanged,
}) => {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaIdToRemove, setMediaIdToRemove] = useState(null);

  const handleAddMedia = async (mediaId) => {
    try {
      setLoading(true);
      await onMediaAdd(content.id, mediaId);
      setShowMediaPicker(false);
      if (onMediaChanged) onMediaChanged();
    } catch (error) {
      console.error("Error adding media to content:", error);
      alert("Error adding media. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMedia = async (mediaId) => {
    if (!window.confirm("Are you sure you want to remove this media?")) {
      return;
    }

    try {
      setLoading(true);
      setMediaIdToRemove(mediaId);
      await onMediaRemove(content.id, mediaId);
      if (onMediaChanged) onMediaChanged();
    } catch (error) {
      console.error("Error removing media from content:", error);
      alert("Error removing media. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-media-manager">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-text">
          Media Gallery ({content.medias?.length || 0})
        </label>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowMediaPicker(true)}
          disabled={loading || !content.id}
          className="flex items-center gap-1"
          title={
            !content.id
              ? "Vous devez d'abord sauvegarder le contenu avant d'ajouter un média."
              : undefined
          }
        >
          <PlusIcon className="w-3 h-3" />
          Add Media
        </Button>
      </div>
      {!content.id && (
        <div className="text-xs text-orange-600 mb-2">
          Vous devez d'abord sauvegarder le contenu avant d'ajouter un média.
        </div>
      )}

      {/* Media Grid */}
      {content.medias && content.medias.length > 0 ? (
        <MediaGrid
          medias={content.medias}
          onRemove={handleRemoveMedia}
          loading={loading}
          columns={3}
          className="mb-4"
        />
      ) : null}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-background border border-border rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text">Select Media</h3>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <MediaPicker
              onMediaSelect={handleAddMedia}
              entityType="content-media"
              entityId={content.id}
              attachToEntity={handleAddMedia}
              allowMultiple={true}
              mediaIdToRemove={mediaIdToRemove}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentMediaManager;
