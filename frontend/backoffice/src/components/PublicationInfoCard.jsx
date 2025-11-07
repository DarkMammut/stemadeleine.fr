"use client";

import React from 'react';
import StatusTag from '@/components/ui/StatusTag';
import PublishButton from '@/components/ui/PublishButton';
import DeleteButton from '@/components/ui/DeleteButton';

/**
 * Composant d'affichage des informations et du statut d'une publication
 * (Newsletter, News, etc.)
 */
export default function PublicationInfoCard({
  title = "Informations",
  status,
  createdAt,
  publishedDate,
  updatedAt,
  author,
  entityId,
  entityIdLabel = "ID",
  contentsCount = 0,
  onPublish,
  canPublish = false,
  isPublishing = false,
  onDelete,
  isDeleting = false,
  deleteConfirmTitle,
  deleteConfirmMessage,
  additionalButtons = null, // Boutons supplémentaires à afficher
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          {additionalButtons}
          {onDelete && (
            <DeleteButton
              onDelete={onDelete}
              disabled={isDeleting}
              deleteLabel="Supprimer"
              confirmTitle={deleteConfirmTitle}
              confirmMessage={deleteConfirmMessage}
              size="sm"
              hoverExpand={true}
            />
          )}
          {canPublish && (
            <PublishButton
              onPublish={onPublish}
              disabled={isPublishing}
              publishLabel="Publier"
              publishedLabel="Publiée"
              size="sm"
              resetAfterDelay={true}
            />
          )}
        </div>
      </div>

      {/* Information Grid */}
      <div className="space-y-4">
        {/* Statut - Ligne 1 complète */}
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium text-gray-900">Statut:</span>
          <StatusTag status={status} />
        </div>

        {/* Grid 2 colonnes pour les autres infos */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Ligne 2 : ID | Auteur */}
          <div>
            <span className="font-medium text-gray-900">{entityIdLabel}:</span>
            <span className="text-gray-500 ml-2">{entityId}</span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Auteur:</span>
            <span className="text-gray-500 ml-2">
              {author ? `${author.firstname} ${author.lastname}` : "Non défini"}
            </span>
          </div>

          {/* Ligne 3 : Créée le | Publiée le */}
          <div>
            <span className="font-medium text-gray-900">Créée le:</span>
            <span className="text-gray-500 ml-2">
              {new Date(createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            {publishedDate ? (
              <>
                <span className="font-medium text-gray-900">Publiée le:</span>
                <span className="text-gray-500 ml-2">
                  {new Date(publishedDate).toLocaleDateString()}
                </span>
              </>
            ) : (
              <span className="text-gray-400 text-xs">Non publiée</span>
            )}
          </div>

          {/* Ligne 4 : Dernière modification | Contenus */}
          <div>
            <span className="font-medium text-gray-900">
              Dernière modification:
            </span>
            <span className="text-gray-500 ml-2">
              {updatedAt
                ? new Date(updatedAt).toLocaleDateString()
                : "Non disponible"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Contenus:</span>
            <span className="text-gray-500 ml-2">
              {contentsCount} contenu(s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
