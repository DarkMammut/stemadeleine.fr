"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PlusIcon, LinkIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";
import RichTextEditor from "@/components/RichTextEditor";
import DeleteButton from "@/components/ui/DeleteButton";
import { useListContentOperations } from "@/hooks/useListContentOperations";
import { useListContentMediasOperations } from "@/hooks/useListContentMediasOperations";
import MediaManager from "@/components/MediaManager";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import Panel from "@/components/ui/Panel";
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import PropTypes from "prop-types";
import { useTranslation } from "@/i18n/I18nContext";

/**
 * Composant de gestion des contenus d'un module Liste (List).
 * Reprend le design de ContentManager, avec en plus la possibilité
 * d'associer un lien/URL cliquable à chaque contenu.
 */
const ListContentManager = ({
  listId,
  onContentsChange,
  customLabels = {},
  loading: externalLoading = false,
}) => {
  const { t } = useTranslation();
  const [contents, setContents] = useState([]);
  const [expandedContents, setExpandedContents] = useState(new Set());
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [savingStates, setSavingStates] = useState({});
  const [editingContent, setEditingContent] = useState({});
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  const {
    getContents,
    createContent,
    updateContent,
    updateContentVisibility,
    deleteContent,
  } = useListContentOperations();

  const { addMedia: addContentMedia, removeMedia: removeContentMedia } =
    useListContentMediasOperations();

  // Chargement des contenus
  useEffect(() => {
    if (listId) {
      loadContents();
    }
    // eslint-disable-next-line
  }, [listId]);

  const loadContents = async () => {
    try {
      setLoadingLocal(true);
      const items = await getContents(listId);
      const sorted = [...items].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
      setContents(sorted);
      if (onContentsChange) onContentsChange(sorted);
    } catch (error) {
      console.error("Error loading list contents:", error);
      showError(
        t("pages.errors.loadContentsTitle"),
        t("pages.errors.loadContentsMessage"),
      );
    } finally {
      setLoadingLocal(false);
    }
  };

  // Toggle content expansion
  const toggleContentExpansion = (id) => {
    const newExpanded = new Set(expandedContents);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedContents(newExpanded);
  };

  // Add new content
  const handleAddContent = async () => {
    try {
      setLoadingLocal(true);
      const newContent = await createContent(
        listId,
        customLabels.defaultTitle || t("pages.common.newContent"),
      );
      await loadContents();
      setExpandedContents((prev) => new Set([...prev, newContent.id]));
      showSuccess(
        t("pages.notifications.contentAddedTitle"),
        t("pages.notifications.contentAddedMessage"),
      );
    } catch (error) {
      console.error("Error adding list content:", error);
      showError(
        t("pages.errors.genericTitle"),
        t("pages.errors.creationModuleMessage"),
      );
    } finally {
      setLoadingLocal(false);
    }
  };

  // Update content title
  const handleTitleUpdate = async (id, newTitle) => {
    try {
      setSavingStates((prev) => ({ ...prev, [id]: true }));
      const content = contents.find((c) => c.id === id);
      if (!content) return;
      await updateContent(id, {
        title: newTitle,
        body: content.body || { html: `<p>${t("pages.common.startWriting")}</p>` },
        linkUrl: content.linkUrl || null,
      });
      await loadContents();
      showSuccess(
        t("pages.notifications.contentTitleUpdatedTitle"),
        t("pages.notifications.contentTitleUpdatedMessage"),
      );
    } catch (error) {
      console.error("Error updating list content title:", error);
      showError(
        t("pages.errors.genericTitle"),
        t("pages.errors.titleUpdateMessage"),
      );
    } finally {
      setSavingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Update content body locally - NO AUTO-SAVE
  const handleContentUpdate = (id, newBody) => {
    setContents((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, body: { html: newBody }, hasLocalChanges: true }
          : c,
      ),
    );
  };

  // Update link URL locally - NO AUTO-SAVE
  const handleLinkUrlChange = (id, newLinkUrl) => {
    setContents((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, linkUrl: newLinkUrl, hasLocalChanges: true } : c,
      ),
    );
  };

  // Manual save for content body + link URL
  const handleSaveContent = async (id) => {
    try {
      setSavingStates((prev) => ({ ...prev, [id]: true }));
      const content = contents.find((c) => c.id === id);
      if (!content) return;
      await updateContent(id, {
        title: content.title,
        body: content.body,
        linkUrl: content.linkUrl || null,
      });
      await loadContents();
      setContents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, hasLocalChanges: false } : c)),
      );
      showSuccess(
        t("pages.notifications.contentSavedTitle"),
        t("pages.notifications.contentSavedMessage"),
      );
    } catch (error) {
      console.error("Error saving list content:", error);
      showError(
        t("pages.errors.genericTitle"),
        t("pages.errors.saveContentMessage"),
      );
    } finally {
      setSavingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Toggle content visibility
  const handleVisibilityToggle = async (id, isVisible) => {
    try {
      setSavingStates((prev) => ({ ...prev, [id]: true }));
      await updateContentVisibility(id, isVisible);
      setContents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isVisible } : c)),
      );
      showSuccess(
        t("pages.notifications.visibilityUpdatedTitle"),
        `${t("pages.common.content")} ${
          isVisible ? t("pages.common.visible") : t("pages.common.hidden")
        }`,
      );
    } catch (error) {
      console.error("Error updating list content visibility:", error);
      showError(
        t("pages.errors.genericTitle"),
        t("pages.errors.visibilityMessage"),
      );
    } finally {
      setSavingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Delete content
  const handleDeleteContent = async (id) => {
    try {
      setSavingStates((prev) => ({ ...prev, [id]: true }));
      await deleteContent(id);
      setContents((prev) => prev.filter((c) => c.id !== id));
      setExpandedContents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      showSuccess(
        t("pages.notifications.contentDeletedTitle"),
        t("pages.notifications.contentDeletedMessage"),
      );
    } catch (error) {
      console.error("Error deleting list content:", error);
      showError(
        t("pages.errors.genericTitle"),
        t("pages.errors.deleteContentMessage"),
      );
      throw error; // Re-throw pour que DeleteButton gère l'état
    } finally {
      setSavingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Edition state
  const startEditing = (id, field) => {
    setEditingContent((prev) => ({
      ...prev,
      [`${id}_${field}`]: true,
    }));
  };
  const stopEditing = (id, field) => {
    setEditingContent((prev) => {
      const newState = { ...prev };
      delete newState[`${id}_${field}`];
      return newState;
    });
  };
  const isEditing = (id, field) => {
    return editingContent[`${id}_${field}`] || false;
  };

  const effectiveLoading = externalLoading || loadingLocal;

  return (
    <Panel
      title={customLabels.header || t("pages.listContentManager.title")}
      actions={
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddContent}
            disabled={effectiveLoading}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            {effectiveLoading ? (
              <span className="skeleton-light w-32 h-4 inline-block" />
            ) : (
              customLabels.addButton || t("pages.common.addContent")
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
                t("pages.contentManager.empty")}
            </p>
          </div>
        )}
        <div className="space-y-3">
          <AnimatePresence>
            {contents.map((content, index) => (
              <CollapsibleCard
                key={`list-content-${content.id || index}`}
                isOpen={expandedContents.has(content.id)}
                onToggle={() => toggleContentExpansion(content.id)}
                leading={
                  <Switch
                    checked={content.isVisible}
                    onChange={(checked) =>
                      handleVisibilityToggle(content.id, checked)
                    }
                    disabled={savingStates[content.id] || effectiveLoading}
                    size="sm"
                  />
                }
                renderTitle={() =>
                  isEditing(content.id, "title") ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const newTitle = formData.get("title");
                        handleTitleUpdate(content.id, newTitle);
                        stopEditing(content.id, "title");
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
                            stopEditing(content.id, "title");
                          }
                        }}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={savingStates[content.id] || effectiveLoading}
                      >
                        {customLabels.save || t("pages.contentManager.saveInline")}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => stopEditing(content.id, "title")}
                        disabled={savingStates[content.id] || effectiveLoading}
                      >
                        {customLabels.cancel || t("pages.contentManager.cancelInline")}
                      </Button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      {effectiveLoading ? (
                        <div className="skeleton-light w-48 h-5 rounded" />
                      ) : (
                        <h4
                          className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors truncate"
                          onClick={() => startEditing(content.id, "title")}
                          title={
                            content.title ||
                            customLabels.untitled ||
                            t("pages.common.untitledContent")
                          }
                        >
                          {content.title ||
                            customLabels.untitled ||
                            t("pages.common.untitledContent")}
                        </h4>
                      )}
                      {content.linkUrl && (
                        <LinkIcon
                          className="w-4 h-4 text-indigo-500 flex-shrink-0"
                          title={content.linkUrl}
                        />
                      )}
                      {content.hasLocalChanges && !effectiveLoading && (
                        <span className="text-xs text-orange-600 flex-shrink-0">
                          • {t("pages.common.unsavedChanges")}
                        </span>
                      )}
                    </div>
                  )
                }
                actions={
                  <>
                    <DeleteButton
                      onDelete={() => handleDeleteContent(content.id)}
                      disabled={savingStates[content.id] || effectiveLoading}
                      deleteLabel={t("pages.common.delete")}
                      confirmTitle={t("pages.contentManager.deleteContentTitle")}
                      confirmMessage={t("pages.contentManager.deleteContentMessage")}
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {customLabels.linkLabel ||
                            t("pages.listContentManager.linkLabel")}
                        </label>
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <input
                            type="url"
                            value={content.linkUrl || ""}
                            onChange={(e) =>
                              handleLinkUrlChange(content.id, e.target.value)
                            }
                            placeholder={t("pages.listContentManager.linkPlaceholder")}
                            className="flex-1 px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                            disabled={savingStates[content.id]}
                          />
                        </div>
                      </div>

                      <RichTextEditor
                        value={content.body?.html || ""}
                        onChange={(newBody) =>
                          handleContentUpdate(content.id, newBody)
                        }
                        placeholder={
                          customLabels.bodyPlaceholder ||
                          t("pages.common.startWriting")
                        }
                        height="200px"
                        disabled={savingStates[content.id]}
                      />

                      <MediaManager
                        content={{
                          id: content.id,
                          medias: content.medias || [],
                        }}
                        onMediaAdd={addContentMedia}
                        onMediaRemove={removeContentMedia}
                        onMediaChanged={loadContents}
                        title={t("pages.common.mediaTitle")}
                      />

                      {content.hasLocalChanges && (
                        <div className="flex justify-end mt-4">
                          <Button
                            onClick={() => handleSaveContent(content.id)}
                            disabled={savingStates[content.id]}
                          >
                            {customLabels.saveContent ||
                              t("pages.common.saveContent")}
                          </Button>
                        </div>
                      )}

                      {savingStates[content.id] && (
                        <div className="text-sm text-blue-600 flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                          {customLabels.saving || t("pages.common.saving")}
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

      {/* Notification */}
      <Notification {...notification} onClose={hideNotification} />
    </Panel>
  );
};

ListContentManager.propTypes = {
  loading: PropTypes.bool,
  listId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onContentsChange: PropTypes.func,
  customLabels: PropTypes.object,
};

ListContentManager.defaultProps = {
  customLabels: {},
  loading: false,
};

export default ListContentManager;
