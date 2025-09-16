"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import MediaPicker from "@/components/MediaPicker";

const ContentMediaManager = ({ content, onMediaAdd, onMediaRemove }) => {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddMedia = async (mediaId) => {
    try {
      setLoading(true);
      await onMediaAdd(content.contentId, mediaId);
      setShowMediaPicker(false);
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
      await onMediaRemove(content.contentId, mediaId);
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
          disabled={loading}
          className="flex items-center gap-1"
        >
          <PlusIcon className="w-3 h-3" />
          Add Media
        </Button>
      </div>

      {/* Media Grid */}
      {content.medias && content.medias.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <AnimatePresence>
            {content.medias.map((media) => (
              <motion.div
                key={media.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-border"
              >
                <img
                  src={media.fileUrl}
                  alt={media.altText || media.title}
                  className="w-full h-full object-cover"
                />

                {/* Remove button overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleRemoveMedia(media.id)}
                    disabled={loading}
                    className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                    title="Remove media"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Media info tooltip */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 transform translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="truncate" title={media.title || "Untitled"}>
                    {media.title || "Untitled"}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-6 text-text-muted bg-gray-50 rounded-lg border-2 border-dashed border-border">
          <p className="text-sm">No media attached</p>
          <p className="text-xs mt-1">Click "Add Media" to attach images</p>
        </div>
      )}

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
              entityType="content"
              entityId={content.contentId}
              attachToEntity={handleAddMedia}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentMediaManager;
