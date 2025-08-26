"use client";

import React, { useEffect, useState } from "react";
import MediaEditor from "./MediaEditor";
import { useAxiosClient } from "@/utils/axiosClient";

export default function MediaPicker({ mediaId, attachToEntity }) {
  const axios = useAxiosClient();
  const [open, setOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    if (!mediaId) return;
    axios
      .get(`/api/media/${mediaId}`)
      .then((res) => setSelectedMedia(res.data))
      .catch(console.error);
  }, [mediaId, axios]);

  return (
    <div className="mt-6">
      <span className="mb-1 font-medium">Bannière</span>
      {selectedMedia ? (
        <div
          className="border rounded cursor-pointer hover:opacity-80 max-w-sm"
          onClick={() => setOpen(true)}
        >
          <img
            src={selectedMedia.fileUrl}
            alt={selectedMedia.altText || ""}
            className="object-contain max-h-48 w-full"
          />
        </div>
      ) : (
        <div
          className="border h-40 flex items-center justify-center text-gray-400 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          Cliquer pour choisir une image
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto p-6">
            <button
              className="absolute top-2 right-2 text-gray-600 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              Choisir ou importer un média
            </h2>

            <MediaEditor
              mediaId={selectedMedia?.id}
              attachToEntity={attachToEntity}
            />
          </div>
        </div>
      )}
    </div>
  );
}
