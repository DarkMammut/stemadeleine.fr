import React from "react";
import {AnimatePresence, motion} from "framer-motion";
import {PencilIcon, XMarkIcon} from "@heroicons/react/16/solid";
import Button from "@/components/ui/Button";

/**
 * MediaGrid - composant réutilisable pour afficher une grille de médias (images, vidéos, etc.)
 * @param {Object[]} medias - Liste des médias à afficher
 * @param {Function} onRemove - Fonction appelée avec l'id du média à supprimer
 * @param {Function} onEdit - Fonction appelée avec l'objet média à éditer
 * @param {Boolean} loading - Désactive les boutons si true
 * @param {Number} columns - Nombre de colonnes (par défaut 4)
 * @param {String} className - Classes CSS additionnelles
 */
export default function MediaGrid({
  medias = [],
  onRemove,
  onEdit,
  loading = false,
  columns = 4,
  className = "",
}) {
  return (
    <div className={`grid grid-cols-${columns} gap-2 ${className}`}>
      <AnimatePresence>
        {medias.map((media) => {
          // Compatibilité : fileUrl ou url, title ou filename
          const url = media.fileUrl || media.url || "";
          const title = media.title || media.filename || "";
          const alt = media.altText || title || "Média";
          return (
            <motion.div
              key={media.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-border"
            >
              {url ? (
                <img
                  src={url}
                  alt={alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  🖼️
                </div>
              )}

              {/* Action buttons overlay */}
              {(onRemove || onEdit) && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="p-1 rounded-full"
                        title="Éditer ce média"
                        onClick={() => onEdit(media)}
                        disabled={loading}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    )}
                    {onRemove && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        className="p-1 rounded-full"
                        title="Supprimer ce média"
                        onClick={() => onRemove(media.id)}
                        disabled={loading}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Media info tooltip */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 transform translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="truncate" title={title || "Untitled"}>
                  {title || "Untitled"}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
