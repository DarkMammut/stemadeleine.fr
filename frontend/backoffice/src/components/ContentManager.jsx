"use client";

import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Switch from '@/components/ui/Switch';
import RichTextEditor from '@/components/RichTextEditor';
import MediaManager from '@/components/MediaManager';
import PublishButton from '@/components/ui/PublishButton';
import DeleteButton from '@/components/ui/DeleteButton';
import { useContentOperations } from '@/hooks/useContentOperations';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Notification from '@/components/ui/Notification';
import { useNotification } from '@/hooks/useNotification';
import Panel from '@/components/ui/Panel';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import PropTypes from 'prop-types';

/**
 * Composant générique de gestion de contenus pour section, module, etc.
 * parentType: "section", "module", ...
 * parentId: identifiant de la section ou du module
 * showSaveButton: true = toujours visible, false = visible seulement si modifications
 */
const ContentManager = ({
  parentId,
  parentType = "section",
  onContentsChange,
  customLabels = {},
  showSaveButton = false,
  loading: externalLoading = false,
}) => {
  const [contents, setContents] = useState([]);
  const [expandedContents, setExpandedContents] = useState(new Set());
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [savingStates, setSavingStates] = useState({});
  const [editingContent, setEditingContent] = useState({});
  const [showPublishAllModal, setShowPublishAllModal] = useState(false);
  const [isPublishingAll, setIsPublishingAll] = useState(false);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // Utilise le hook d'opérations, adapté pour le parentType
  const {
    getContents,
    createContent,
    updateContent,
    updateContentVisibility,
    deleteContent,
    addMediaToContent,
    removeMediaFromContent,
  } = useContentOperations({ parentType });

  // Chargement des contenus
  useEffect(() => {
    if (parentId) {
      loadContents();
    }
    // eslint-disable-next-line
  }, [parentId]);

  const loadContents = async () => {
    try {
      setLoadingLocal(true);
      const uniqueContents = await getContents(parentId);
      setContents(uniqueContents);
      if (onContentsChange) onContentsChange(uniqueContents);
    } catch (error) {
      console.error("Error loading contents:", error);
      showError(
        "Erreur de chargement",
        "Erreur lors du chargement des contenus",
      );
    } finally {
      setLoadingLocal(false);
    }
  };

  // Toggle content expansion
  const toggleContentExpansion = (contentId) => {
    const newExpanded = new Set(expandedContents);
    if (newExpanded.has(contentId)) {
      newExpanded.delete(contentId);
    } else {
      newExpanded.add(contentId);
    }
    setExpandedContents(newExpanded);
  };

  // Add new content
  const handleAddContent = async () => {
    try {
      setLoadingLocal(true);
      const newContent = await createContent(
        parentId,
        customLabels.defaultTitle || "Nouveau contenu",
      );
      await loadContents();
      setExpandedContents((prev) => new Set([...prev, newContent.contentId]));
      showSuccess(
        "Contenu ajouté",
        "Le nouveau contenu a été créé avec succès",
      );
    } catch (error) {
      console.error("Error adding content:", error);
      showError("Erreur", "Erreur lors de l'ajout du contenu");
    } finally {
      setLoadingLocal(false);
    }
  };

  // Update content title
  const handleTitleUpdate = async (contentId, newTitle) => {
    try {
      setSavingStates((prev) => ({ ...prev, [contentId]: true }));
      const content = contents.find((c) => c.contentId === contentId);
      if (!content) return;
      await updateContent(contentId, {
        title: newTitle,
        body: content.body || { html: "<p>Commencez à écrire...</p>" },
      });
      await loadContents();
      showSuccess("Titre modifié", "Le titre a été mis à jour avec succès");
    } catch (error) {
      console.error("Error updating content title:", error);
      showError("Erreur", "Erreur lors de la mise à jour du titre");
    } finally {
      setSavingStates((prev) => ({ ...prev, [contentId]: false }));
    }
  };

  // Update content body - NO AUTO-SAVE
  const handleContentUpdate = (contentId, newBody) => {
    setContents((prev) =>
      prev.map((c) =>
        c.contentId === contentId
          ? { ...c, body: { html: newBody }, hasLocalChanges: true }
          : c,
      ),
    );
  };

  // Manual save for content body
  const handleSaveContentBody = async (contentId) => {
    try {
      setSavingStates((prev) => ({ ...prev, [contentId]: true }));
      const content = contents.find((c) => c.contentId === contentId);
      if (!content) return;
      await updateContent(contentId, {
        title: content.title,
        body: content.body,
        medias: content.medias,
      });
      await loadContents();
      setContents((prev) =>
        prev.map((c) =>
          c.contentId === contentId ? { ...c, hasLocalChanges: false } : c,
        ),
      );
      showSuccess(
        "Contenu enregistré",
        "Le contenu a été sauvegardé avec succès",
      );
    } catch (error) {
      console.error("Error saving content body:", error);
      showError("Erreur", "Erreur lors de la sauvegarde du contenu");
    } finally {
      setSavingStates((prev) => ({ ...prev, [contentId]: false }));
    }
  };

  // Toggle content visibility
  const handleVisibilityToggle = async (contentId, isVisible) => {
    try {
      setSavingStates((prev) => ({ ...prev, [contentId]: true }));
      await updateContentVisibility(contentId, isVisible);
      setContents((prev) =>
        prev.map((c) =>
          c.contentId === contentId ? { ...c, isVisible: isVisible } : c,
        ),
      );
      showSuccess(
        "Visibilité modifiée",
        `Le contenu est maintenant ${isVisible ? "visible" : "masqué"}`,
      );
    } catch (error) {
      console.error("Error updating content visibility:", error);
      showError("Erreur", "Erreur lors de la mise à jour de la visibilité");
    } finally {
      setSavingStates((prev) => ({ ...prev, [contentId]: false }));
    }
  };

  // Delete content
  const handleDeleteContent = async (contentId) => {
    try {
      setSavingStates((prev) => ({ ...prev, [contentId]: true }));
      await deleteContent(contentId);
      setContents((prev) => prev.filter((c) => c.contentId !== contentId));
      setExpandedContents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });
      showSuccess("Contenu supprimé", "Le contenu a été supprimé avec succès");
    } catch (error) {
      console.error("Error deleting content:", error);
      showError("Erreur", "Erreur lors de la suppression du contenu");
      throw error; // Re-throw pour que DeleteButton gère l'état
    } finally {
      setSavingStates((prev) => ({ ...prev, [contentId]: false }));
    }
  };

  // Fonction pour ouvrir la modal de publication
  const handleOpenPublishAllModal = () => {
    setShowPublishAllModal(true);
  };

  // Fonction pour publier tous les contenus (après confirmation)
  const handleConfirmPublishAll = async () => {
    try {
      setIsPublishingAll(true);
      // Utilise l'endpoint de publication en lot
      const response = await fetch(`/api/content/owner/${parentId}/publish`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Afficher une erreur utilisateur au lieu de lancer une exception capturée localement
        showError("Erreur", "Erreur lors de la publication");
        return;
      }

      const result = await response.json();

      // Recharger les contenus pour voir les nouveaux statuts
      await loadContents();

      // Afficher le résultat
      showSuccess(
        "Publication terminée",
        `${result.publishedCount} contenu(s) publié(s), ${result.skippedCount} ignoré(s)`,
      );
    } catch (error) {
      console.error("Error publishing all contents:", error);
      showError("Erreur", "Erreur lors de la publication des contenus");
    } finally {
      setIsPublishingAll(false);
      setShowPublishAllModal(false);
    }
  };

  // Media operations
  const handleAddMediaToContent = async (contentId, mediaId) => {
    try {
      const updatedContent = await addMediaToContent(contentId, mediaId);
      setContents((prev) =>
        prev.map((c) => (c.contentId === contentId ? updatedContent : c)),
      );
    } catch (error) {
      console.error("Error adding media to content:", error);
      throw error;
    }
  };

  const handleRemoveMediaFromContent = async (contentId, mediaId) => {
    try {
      const updatedContent = await removeMediaFromContent(contentId, mediaId);
      setContents((prev) =>
        prev.map((c) => (c.contentId === contentId ? updatedContent : c)),
      );
    } catch (error) {
      console.error("Error removing media from content:", error);
      throw error;
    }
  };

  // Edition state
  const startEditing = (contentId, field) => {
    setEditingContent((prev) => ({
      ...prev,
      [`${contentId}_${field}`]: true,
    }));
  };
  const stopEditing = (contentId, field) => {
    setEditingContent((prev) => {
      const newState = { ...prev };
      delete newState[`${contentId}_${field}`];
      return newState;
    });
  };
  const isEditing = (contentId, field) => {
    return editingContent[`${contentId}_${field}`] || false;
  };

  // Rendu UI (labels personnalisables)
  const effectiveLoading = externalLoading || loadingLocal;

  return (
    <Panel
      title={customLabels.header || "Contenus"}
      actions={
        <div className="flex items-center gap-2">
          <PublishButton
            onPublish={handleOpenPublishAllModal}
            disabled={
              effectiveLoading || contents.length === 0 || isPublishingAll
            }
            publishLabel={customLabels.publishButton || "Publier tous"}
            publishedLabel="Tous publiés"
            size="md"
            resetAfterDelay={true}
          />
          <Button
            onClick={handleAddContent}
            disabled={effectiveLoading}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            {effectiveLoading ? (
              <span className="skeleton-light w-32 h-4 inline-block" />
            ) : (
              customLabels.addButton || "Ajouter un contenu"
            )}
          </Button>
        </div>
      }
    >
      <div className="content-manager">
        {effectiveLoading && contents.length === 0 && (
          <div className="space-y-3 px-4 py-8">
            <div className="skeleton-light h-4 w-1/3 rounded" />
            <div className="skeleton-light h-4 w-1/2 rounded" />
            <div className="skeleton-light h-4 w-2/3 rounded" />
          </div>
        )}
        {!effectiveLoading && contents.length === 0 && (
          <div className="text-center py-8 text-gray-500 px-4 sm:px-8">
            <p>
              {customLabels.empty ||
                "Aucun contenu. Cliquez sur 'Ajouter un contenu'."}
            </p>
          </div>
        )}
        <div className="space-y-3">
          <AnimatePresence>
            {(!effectiveLoading ? contents : contents).map((content, index) => (
              <CollapsibleCard
                key={`content-${content.contentId || index}-${content.version || 0}`}
                isOpen={expandedContents.has(content.contentId)}
                onToggle={() => toggleContentExpansion(content.contentId)}
                leading={
                  <Switch
                    checked={content.isVisible}
                    onChange={(checked) =>
                      handleVisibilityToggle(content.contentId, checked)
                    }
                    disabled={
                      savingStates[content.contentId] || effectiveLoading
                    }
                    size="sm"
                  />
                }
                renderTitle={() =>
                  isEditing(content.contentId, "title") ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const newTitle = formData.get("title");
                        handleTitleUpdate(content.contentId, newTitle);
                        stopEditing(content.contentId, "title");
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        name="title"
                        defaultValue={content.title}
                        className="flex-1 px-3 py-1.5 text-base text-gray-900 border border-gray-300 rounded-md focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            stopEditing(content.contentId, "title");
                          }
                        }}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={
                          savingStates[content.contentId] || effectiveLoading
                        }
                      >
                        {customLabels.save || "Enregistrer"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => stopEditing(content.contentId, "title")}
                        disabled={
                          savingStates[content.contentId] || effectiveLoading
                        }
                      >
                        {customLabels.cancel || "Annuler"}
                      </Button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      {effectiveLoading ? (
                        <div className="skeleton-light w-48 h-5 rounded" />
                      ) : (
                        <h4
                          className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors truncate"
                          onClick={() =>
                            startEditing(content.contentId, "title")
                          }
                          title={
                            content.title ||
                            customLabels.untitled ||
                            "Contenu sans titre"
                          }
                        >
                          {content.title ||
                            customLabels.untitled ||
                            "Contenu sans titre"}
                        </h4>
                      )}
                      <div className="text-xs text-gray-500 flex-shrink-0">
                        {effectiveLoading ? (
                          <span className="skeleton-light w-20 h-3 inline-block rounded" />
                        ) : (
                          <>
                            v{content.version} • {content.authorUsername}
                          </>
                        )}
                        {content.hasLocalChanges && !effectiveLoading && (
                          <span className="text-orange-600 ml-2">
                            • Modifications non sauvegardées
                          </span>
                        )}
                      </div>
                    </div>
                  )
                }
                actions={
                  <>
                    <DeleteButton
                      onDelete={() => handleDeleteContent(content.contentId)}
                      disabled={
                        savingStates[content.contentId] || effectiveLoading
                      }
                      deleteLabel="Supprimer"
                      confirmTitle="Supprimer le contenu"
                      confirmMessage="Êtes-vous sûr de vouloir supprimer ce contenu ? Cette action est irréversible."
                      size="sm"
                      hoverExpand={true}
                    />
                  </>
                }
              >
                <div className="space-y-6">
                  {effectiveLoading ? (
                    <div className="space-y-3">
                      <div className="skeleton-light h-40 rounded" />
                      <div className="skeleton-light h-4 w-1/3 rounded" />
                    </div>
                  ) : (
                    <>
                      <RichTextEditor
                        value={content.body?.html || ""}
                        onChange={(newBody) =>
                          handleContentUpdate(content.contentId, newBody)
                        }
                        placeholder={
                          customLabels.bodyPlaceholder ||
                          "Commencez à écrire..."
                        }
                        height="200px"
                        disabled={savingStates[content.contentId]}
                      />
                      {(() => {
                        const shouldShow =
                          showSaveButton === true ||
                          (showSaveButton === false && content.hasLocalChanges);
                        return (
                          shouldShow && (
                            <div className="flex justify-end mt-4">
                              <Button
                                onClick={() =>
                                  handleSaveContentBody(content.contentId)
                                }
                                disabled={
                                  savingStates[content.contentId] ||
                                  !content.hasLocalChanges
                                }
                              >
                                {customLabels.saveContent ||
                                  "Enregistrer le contenu"}
                              </Button>
                            </div>
                          )
                        );
                      })()}

                      <MediaManager
                        content={content}
                        onMediaAdd={handleAddMediaToContent}
                        onMediaRemove={handleRemoveMediaFromContent}
                        onMediaChanged={loadContents}
                        loading={effectiveLoading}
                      />

                      {savingStates[content.contentId] && (
                        <div className="text-sm text-blue-600 flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                          {customLabels.saving || "Sauvegarde..."}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CollapsibleCard>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Publish All Confirmation Modal */}
      <ConfirmModal
        open={showPublishAllModal}
        onClose={() => setShowPublishAllModal(false)}
        onConfirm={handleConfirmPublishAll}
        title="Publier tous les contenus"
        message={`Êtes-vous sûr de vouloir publier tous les contenus de ce ${parentType} ? Cette action créera une nouvelle version pour chaque contenu modifié.`}
        confirmLabel="Publier tous"
        isLoading={isPublishingAll}
        variant="primary"
      />

      {/* Notification */}
      <Notification {...notification} onClose={hideNotification} />
    </Panel>
  );
};

ContentManager.propTypes = {
  loading: PropTypes.bool,
  parentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  parentType: PropTypes.string,
  onContentsChange: PropTypes.func,
  customLabels: PropTypes.object,
  showSaveButton: PropTypes.bool,
};

ContentManager.defaultProps = {
  parentType: "section",
  customLabels: {},
  showSaveButton: false,
  loading: false,
};

export default ContentManager;
