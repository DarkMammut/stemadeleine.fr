import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon } from '@heroicons/react/16/solid';
import Button from '@/components/ui/Button';
import DeleteButton from '@/components/ui/DeleteButton';

/**
 * MediaGrid - composant réutilisable pour afficher une grille de médias (images, vidéos, etc.)
 * @param {Object[]} medias - Liste des médias à afficher
 * @param {Function} onRemove - Fonction appelée avec l'id du média à supprimer
 * @param {Function} onEdit - Fonction appelée avec l'objet média à éditer
 * @param {Function} onMove - Fonction appelée avec (id, direction) où direction vaut -1 (gauche) ou 1 (droite)
 * @param {Boolean} loading - Désactive les boutons si true
 * @param {String} className - Classes CSS additionnelles
 */
export default function MediaGrid({
  medias = [],
  onRemove,
  onEdit,
  onMove,
  loading = false,
  className = "",
}) {
  // Classes responsive pour la grille : 1 col mobile, 2 tablet, 3 desktop, 4 large screen
  const gridClasses =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

  // If loading, show 3 placeholder boxes resembling images
  if (loading) {
    return (
      <div className={`${gridClasses} ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`placeholder-${i}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group aspect-square skeleton rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center"
          >
            <div className="w-3/4 h-3/4 bg-white/10 rounded" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`${gridClasses} ${className}`}>
      <AnimatePresence>
        {medias.map((media, index) => {
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
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
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
              {(onRemove || onEdit || onMove) && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    {onMove && medias.length > 1 && index > 0 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="p-1 rounded-full"
                        title="Déplacer vers la gauche"
                        onClick={() => onMove(media.id, -1)}
                        disabled={loading}
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        type="button"
                        variant="primary"
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
                      <DeleteButton
                        onDelete={() => onRemove(media.id)}
                        size="sm"
                        deleteLabel=""
                        confirmTitle="Supprimer ce média"
                        confirmMessage={`Êtes-vous sûr de vouloir supprimer "${media.title || media.filename || "ce média"}" ?`}
                        disabled={loading}
                        hoverExpand={false}
                      />
                    )}
                    {onMove && medias.length > 1 && index < medias.length - 1 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="p-1 rounded-full"
                        title="Déplacer vers la droite"
                        onClick={() => onMove(media.id, 1)}
                        disabled={loading}
                      >
                        <ChevronRightIcon className="w-4 h-4" />
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
