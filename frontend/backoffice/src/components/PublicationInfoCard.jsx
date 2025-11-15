"use client";

import React from 'react';
import StatusTag from '@/components/ui/StatusTag';
import PublishButton from '@/components/ui/PublishButton';
import DeleteButton from '@/components/ui/DeleteButton';
import Panel from '@/components/ui/Panel';
import VariableDisplay from '@/components/ui/VariableDisplay';
import PropTypes from 'prop-types';

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
  loading = false,
}) {
  const effectiveLoading = loading || isPublishing || isDeleting;
  return (
    <Panel
      title={title}
      loading={effectiveLoading}
      actions={
        <>
          {additionalButtons}
          {onDelete && (
            <DeleteButton
              onDelete={onDelete}
              disabled={effectiveLoading}
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
              disabled={effectiveLoading}
              publishLabel="Publier"
              publishedLabel="Publiée"
              size="sm"
              resetAfterDelay={true}
            />
          )}
        </>
      }
    >
      <div className="space-y-4">
        {/* Statut - Ligne 1 complète */}
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium text-gray-900">Statut:</span>
          <StatusTag status={status} loading={effectiveLoading} />
        </div>

        {/* Grid 2 colonnes pour les autres infos */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Ligne 2 : ID | Auteur */}
          <div>
            <VariableDisplay
              label={`${entityIdLabel}:`}
              value={entityId ?? "-"}
              loading={effectiveLoading}
            />
          </div>
          <div>
            <VariableDisplay
              label="Auteur:"
              value={
                author ? `${author.firstname} ${author.lastname}` : "Non défini"
              }
              loading={effectiveLoading}
            />
          </div>

          {/* Ligne 3 : Créée le | Publiée le */}
          <div>
            <VariableDisplay
              label="Créée le:"
              value={
                createdAt
                  ? new Date(createdAt).toLocaleDateString("fr-FR")
                  : "-"
              }
              loading={effectiveLoading}
            />
          </div>
          <div>
            {publishedDate ? (
              <VariableDisplay
                label="Publiée le:"
                value={new Date(publishedDate).toLocaleDateString("fr-FR")}
                loading={effectiveLoading}
              />
            ) : (
              <span className="text-gray-400 text-xs">Non publiée</span>
            )}
          </div>

          {/* Ligne 4 : Dernière modification | Contenus */}
          <div>
            <VariableDisplay
              label="Dernière modification:"
              value={
                updatedAt
                  ? new Date(updatedAt).toLocaleDateString("fr-FR")
                  : "Non disponible"
              }
              loading={effectiveLoading}
            />
          </div>
          <div>
            <VariableDisplay
              label="Contenus:"
              value={`${contentsCount} contenu(s)`}
              loading={effectiveLoading}
            />
          </div>
        </div>
      </div>
    </Panel>
  );
}

PublicationInfoCard.propTypes = {
  title: PropTypes.node,
  status: PropTypes.string,
  createdAt: PropTypes.string,
  publishedDate: PropTypes.string,
  updatedAt: PropTypes.string,
  author: PropTypes.object,
  entityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  entityIdLabel: PropTypes.string,
  contentsCount: PropTypes.number,
  onPublish: PropTypes.func,
  canPublish: PropTypes.bool,
  isPublishing: PropTypes.bool,
  onDelete: PropTypes.func,
  isDeleting: PropTypes.bool,
  deleteConfirmTitle: PropTypes.string,
  deleteConfirmMessage: PropTypes.string,
  additionalButtons: PropTypes.node,
  loading: PropTypes.bool,
};

PublicationInfoCard.defaultProps = {
  title: "Informations",
  status: null,
  createdAt: null,
  publishedDate: null,
  updatedAt: null,
  author: null,
  entityId: null,
  entityIdLabel: "ID",
  contentsCount: 0,
  onPublish: null,
  canPublish: false,
  isPublishing: false,
  onDelete: null,
  isDeleting: false,
  deleteConfirmTitle: null,
  deleteConfirmMessage: null,
  additionalButtons: null,
  loading: false,
};
