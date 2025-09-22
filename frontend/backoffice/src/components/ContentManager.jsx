"use client";

import React, {useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {ChevronDownIcon, ChevronRightIcon, PlusIcon, TrashIcon,} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";
import RichTextEditor from "@/components/RichTextEditor";
import ContentMediaManager from "@/components/ContentMediaManager";
import {useContentOperations} from "@/hooks/useContentOperations";

/**
 * Composant générique de gestion de contenus pour section, module, etc.
 * parentType: "section", "module", ...
 * parentId: identifiant de la section ou du module
 */
const ContentManager = ({
  parentId,
  parentType = "section",
  onContentsChange,
  customLabels = {},
}) => {
  const [contents, setContents] = useState([]);
  const [expandedContents, setExpandedContents] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [savingStates, setSavingStates] = useState({});
  const [editingContent, setEditingContent] = useState({});

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
      setLoading(true);
      const uniqueContents = await getContents(parentId);
      setContents(uniqueContents);
      if (onContentsChange) onContentsChange(uniqueContents);
    } catch (error) {
      console.error("Error loading contents:", error);
      alert("Erreur lors du chargement des contenus.");
    } finally {
      setLoading(false);
    }
  };

  // ...existing code from SectionContentManager, en remplaçant sectionId par parentId et les labels par customLabels...

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
      setLoading(true);
      const newContent = await createContent(
        parentId,
        customLabels.defaultTitle || "Nouveau contenu",
      );
      await loadContents();
      setExpandedContents((prev) => new Set([...prev, newContent.contentId]));
    } catch (error) {
      console.error("Error adding content:", error);
      alert("Erreur lors de l'ajout du contenu.");
    } finally {
      setLoading(false);
    }
  };

  // ...le reste du code SectionContentManager, adapté...

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
    } catch (error) {
      console.error("Error updating content title:", error);
      alert("Erreur lors de la mise à jour du titre.");
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
    } catch (error) {
      console.error("Error saving content body:", error);
      alert("Erreur lors de la sauvegarde du contenu.");
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
    } catch (error) {
      console.error("Error updating content visibility:", error);
      alert("Erreur lors de la mise à jour de la visibilité.");
    } finally {
      setSavingStates((prev) => ({ ...prev, [contentId]: false }));
    }
  };

  // Delete content
  const handleDeleteContent = async (contentId) => {
    if (!confirm("Voulez-vous vraiment supprimer ce contenu ?")) return;
    try {
      setSavingStates((prev) => ({ ...prev, [contentId]: true }));
      await deleteContent(contentId);
      setContents((prev) => prev.filter((c) => c.contentId !== contentId));
      setExpandedContents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Erreur lors de la suppression du contenu.");
    } finally {
      setSavingStates((prev) => ({ ...prev, [contentId]: false }));
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
  return (
    <div className="content-manager space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">
          {customLabels.header || "Contenus"}
        </h3>
        <Button
          onClick={handleAddContent}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          {customLabels.addButton || "Ajouter un contenu"}
        </Button>
      </div>
      {loading && contents.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          {customLabels.loading || "Chargement des contenus..."}
        </div>
      )}
      {!loading && contents.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          <p>
            {customLabels.empty ||
              "Aucun contenu. Cliquez sur 'Ajouter un contenu'."}
          </p>
        </div>
      )}
      <div className="space-y-3">
        <AnimatePresence>
          {contents.map((content, index) => (
            <motion.div
              key={`content-${content.contentId}-${content.version}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border border-border rounded-lg bg-background shadow-sm"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleContentExpansion(content.contentId)}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {expandedContents.has(content.contentId) ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex-1">
                    {isEditing(content.contentId, "title") ? (
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
                          className="flex-1 px-2 py-1 border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              stopEditing(content.contentId, "title");
                            }
                          }}
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark"
                          disabled={savingStates[content.contentId]}
                        >
                          {customLabels.save || "Enregistrer"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            stopEditing(content.contentId, "title")
                          }
                          className="px-2 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          disabled={savingStates[content.contentId]}
                        >
                          {customLabels.cancel || "Annuler"}
                        </button>
                      </form>
                    ) : (
                      <h4
                        className="font-medium text-text cursor-pointer hover:text-primary"
                        onClick={() => startEditing(content.contentId, "title")}
                      >
                        {content.title ||
                          customLabels.untitled ||
                          "Contenu sans titre"}
                      </h4>
                    )}
                  </div>
                  <div className="text-xs text-text-muted">
                    v{content.version} • {content.authorUsername}
                    {content.hasLocalChanges && (
                      <span className="text-orange-600 ml-2">
                        • Modifications non sauvegardées
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={content.isVisible}
                    onChange={(checked) =>
                      handleVisibilityToggle(content.contentId, checked)
                    }
                    disabled={savingStates[content.contentId]}
                    size="sm"
                  />
                  <button
                    onClick={() => handleDeleteContent(content.contentId)}
                    disabled={savingStates[content.contentId]}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                    title={customLabels.delete || "Supprimer le contenu"}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {expandedContents.has(content.contentId) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          {customLabels.bodyLabel || "Contenu"}
                        </label>
                        <div className="border border-border rounded-lg overflow-hidden">
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
                        </div>
                      </div>
                      <ContentMediaManager
                        content={content}
                        onMediaAdd={handleAddMediaToContent}
                        onMediaRemove={handleRemoveMediaFromContent}
                        onMediaChanged={loadContents}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={() =>
                            handleSaveContentBody(content.contentId)
                          }
                          disabled={savingStates[content.contentId]}
                          className="px-4 py-2 text-sm"
                        >
                          {customLabels.saveContent || "Enregistrer le contenu"}
                        </Button>
                      </div>
                      {savingStates[content.contentId] && (
                        <div className="text-sm text-blue-600 flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                          {customLabels.saving || "Sauvegarde..."}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContentManager;
