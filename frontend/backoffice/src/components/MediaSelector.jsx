"use client";

import React, {useEffect, useRef, useState} from 'react';
import {useAxiosClient} from '@/utils/axiosClient';
import Button from '@/components/ui/Button';
import {PlusIcon} from '@heroicons/react/24/outline';

/**
 * MediaSelector - Composant pour sélectionner ou uploader un média
 * @param {Function} onMediaSelected - Callback appelé quand un média est sélectionné (reçoit l'objet media)
 * @param {Function} onCancel - Callback pour annuler la sélection
 */
export default function MediaSelector({onMediaSelected, onCancel}) {
    const axios = useAxiosClient();
    const fileInputRef = useRef(null);
    const [allMedia, setAllMedia] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);

    // Charger la bibliothèque de médias
    useEffect(() => {
        setLoading(true);
        axios
            .get("/api/media")
            .then((res) => setAllMedia(res.data))
            .catch((err) =>
                console.error("Erreur lors du chargement des médias:", err),
            )
            .finally(() => setLoading(false));
    }, [axios]);

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await axios.post("/api/media/upload", formData, {
                onUploadProgress: (event) => {
                    const percent = Math.round((event.loaded * 100) / event.total);
                    setProgress(percent);
                },
            });

            const uploadedMedia = res.data;
            // Ajouter le nouveau média à la liste
            setAllMedia((prev) => [uploadedMedia, ...prev]);
            // Sélectionner automatiquement le média uploadé et ouvrir le modal de modification
            if (onMediaSelected) {
                onMediaSelected(uploadedMedia);
            }
        } catch (err) {
            console.error("Erreur lors de l'upload:", err);
            alert("Erreur lors de l'upload du média");
        } finally {
            setUploading(false);
            setProgress(0);
            // Réinitialiser l'input pour permettre de sélectionner le même fichier
            if (event.target) {
                event.target.value = "";
            }
        }
    };

    const handleSelectMedia = (media) => {
        // Sélectionner le média et ouvrir directement le modal de modification
        if (onMediaSelected) {
            onMediaSelected(media);
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Input file caché */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Bouton pour ajouter un nouveau média */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                    Bibliothèque de médias
                </h3>
                <Button
                    onClick={handleUploadClick}
                    disabled={uploading}
                    className="flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4"/>
                    {uploading ? "Upload en cours..." : "Ajouter un média"}
                </Button>
            </div>

            {/* Barre de progression pour l'upload */}
            {uploading && (
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Upload en cours...</span>
                        <span className="text-sm font-medium text-indigo-600">
              {progress}%
            </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{width: `${progress}%`}}
                        ></div>
                    </div>
                </div>
            )}

            {/* Bibliothèque de médias */}
            <div>
                {loading ? (
                    <div className="text-center py-8 text-gray-500">
                        Chargement de la bibliothèque...
                    </div>
                ) : allMedia.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Aucun média disponible. Cliquez sur "Ajouter un média" pour uploader
                        votre première image.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-1">
                        {allMedia.map((media) => (
                            <div
                                key={media.id}
                                className="relative rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-indigo-400 ring-1 ring-gray-200"
                                onClick={() => handleSelectMedia(media)}
                            >
                                <div className="aspect-square bg-gray-100">
                                    <img
                                        src={media.fileUrl}
                                        alt={media.altText || ""}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-2 bg-white border-t border-gray-200">
                                    <p className="text-xs text-gray-700 truncate font-medium">
                                        {media.title || "Sans titre"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bouton d'annulation */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="secondary" onClick={onCancel}>
                    Annuler
                </Button>
            </div>
        </div>
    );
}
