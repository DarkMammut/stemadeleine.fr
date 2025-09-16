"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";
import RichTextEditor from "@/components/RichTextEditor";
import ContentMediaManager from "@/components/ContentMediaManager";
import { useContentOperations } from "@/hooks/useContentOperations";

const SectionContentManager = ({ sectionId, onContentsChange }) => {
  const [contents, setContents] = useState([]);
  const [expandedContents, setExpandedContents] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [savingStates, setSavingStates] = useState({});
  const [editingContent, setEditingContent] = useState({});

  // Use the new content operations hook
  const {
    getSectionContents,
    createContent,
    updateContent,
    updateContentVisibility,
    deleteContent,
    addMediaToContent,
    removeMediaFromContent,
  } = useContentOperations();

  // Load contents when component mounts or sectionId changes
  useEffect(() => {
    if (sectionId) {
      loadContents();
    }
  }, [sectionId]);

  // Load contents from API with deduplication
  const loadContents = async () => {
    try {
      setLoading(true);
      console.log("Loading contents for section:", sectionId);

      const uniqueContents = await getSectionContents(sectionId);

      console.log("Contents loaded:", uniqueContents.length);
      setContents(uniqueContents);

      if (onContentsChange) {
        onContentsChange(uniqueContents);
      }
    } catch (error) {
      console.error("Error loading contents:", error);
      alert("Error loading contents. Please try again.");
    } finally {
      setLoading(false);
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
      setLoading(true);
      console.log("Adding new content for section:", sectionId);

      const newContent = await createContent(sectionId, "New Content");
      console.log("New content created:", newContent);

      // Reload contents to get the latest state
      await loadContents();

      // Auto-expand the new content
      setExpandedContents((prev) => new Set([...prev, newContent.contentId]));
    } catch (error) {
      console.error("Error adding content:", error);
      alert("Error adding content. Please try again.");
    } finally {
      setLoading(false);
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
        body: content.body || {
          html: "<p>Start writing your content here...</p>",
        },
      });

      // Reload contents to get the updated version
      await loadContents();
      console.log("Content title updated:", contentId);
    } catch (error) {
      console.error("Error updating content title:", error);
      alert("Error updating content title. Please try again.");
    } finally {
      setSavingStates((prev) => ({ ...prev, [contentId]: false }));
    }
  };

  // Update content body - NO AUTO-SAVE
  const handleContentUpdate = (contentId, newBody) => {
    // Update only the specific content in local state
    setContents((prev) =>
      prev.map((c) =>
        c.contentId === contentId
          ? { ...c, body: { html: newBody }, hasLocalChanges: true }
          : c,
      ),
    );

    console.log("Content body changed locally for contentId:", contentId);
  };

  // Manual save for content body with proper contentId handling
  const handleSaveContentBody = async (contentId) => {
    try {
      setSavingStates((prev) => ({ ...prev, [contentId]: true }));

      const content = contents.find((c) => c.contentId === contentId);
      if (!content) {
        console.error("Content not found with contentId:", contentId);
        return;
      }

      console.log(
        "Saving content with contentId:",
        contentId,
        "title:",
        content.title,
      );

      await updateContent(contentId, {
        title: content.title,
        body: content.body,
        medias: content.medias, // Ajout de la liste des médias pour la sauvegarde complète
      });

      // Recharge les contenus pour avoir la version à jour (y compris les médias)
      await loadContents();

      // Update local state to remove the hasLocalChanges flag
      setContents((prev) =>
        prev.map((c) =>
          c.contentId === contentId ? { ...c, hasLocalChanges: false } : c,
        ),
      );

      console.log("Content body saved successfully for contentId:", contentId);
      alert("Content saved successfully!");
    } catch (error) {
      console.error("Error saving content body:", error);
      alert("Error saving content body. Please try again.");
    } finally {
      setSavingStates((prev) => ({ ...prev, [contentId]: false }));
    }
  };

  // Toggle content visibility
  const handleVisibilityToggle = async (contentId, isVisible) => {
    try {
      setSavingStates((prev) => ({ ...prev, [contentId]: true }));

      await updateContentVisibility(contentId, isVisible);

      // Update local state
      setContents((prev) =>
        prev.map((c) =>
          c.contentId === contentId ? { ...c, isVisible: isVisible } : c,
        ),
      );

      console.log("Content visibility updated:", contentId, isVisible);
    } catch (error) {
      console.error("Error updating content visibility:", error);
      alert("Error updating content visibility. Please try again.");
    } finally {
      setSavingStates((prev) => ({ ...prev, [contentId]: false }));
    }
  };

  // Delete content
  const handleDeleteContent = async (contentId) => {
    if (!confirm("Are you sure you want to delete this content?")) {
      return;
    }

    try {
      setSavingStates((prev) => ({ ...prev, [contentId]: true }));

      await deleteContent(contentId);

      // Remove from local state
      setContents((prev) => prev.filter((c) => c.contentId !== contentId));
      setExpandedContents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });

      console.log("Content deleted:", contentId);
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Error deleting content. Please try again.");
    } finally {
      setSavingStates((prev) => ({ ...prev, [contentId]: false }));
    }
  };

  // Handle media operations
  const handleAddMediaToContent = async (contentId, mediaId) => {
    try {
      const updatedContent = await addMediaToContent(contentId, mediaId);

      // Update local state with the new media
      setContents((prev) =>
        prev.map((c) => (c.contentId === contentId ? updatedContent : c)),
      );

      console.log("Media added to content:", contentId, mediaId);
    } catch (error) {
      console.error("Error adding media to content:", error);
      throw error;
    }
  };

  const handleRemoveMediaFromContent = async (contentId, mediaId) => {
    try {
      const updatedContent = await removeMediaFromContent(contentId, mediaId);

      // Update local state to remove the media
      setContents((prev) =>
        prev.map((c) => (c.contentId === contentId ? updatedContent : c)),
      );

      console.log("Media removed from content:", contentId, mediaId);
    } catch (error) {
      console.error("Error removing media from content:", error);
      throw error;
    }
  };

  // Start editing content
  const startEditing = (contentId, field) => {
    setEditingContent((prev) => ({
      ...prev,
      [`${contentId}_${field}`]: true,
    }));
  };

  // Stop editing content
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

  return (
    <div className="section-content-manager space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">Section Contents</h3>
        <Button
          onClick={handleAddContent}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Content
        </Button>
      </div>

      {/* Loading state */}
      {loading && contents.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          Loading contents...
        </div>
      )}

      {/* Empty state */}
      {!loading && contents.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          <p>
            No contents yet. Click "Add Content" to create your first content.
          </p>
        </div>
      )}

      {/* Contents list */}
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
              {/* Content header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3 flex-1">
                  {/* Expand/collapse button */}
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

                  {/* Content title */}
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
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            stopEditing(content.contentId, "title")
                          }
                          className="px-2 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          disabled={savingStates[content.contentId]}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <h4
                        className="font-medium text-text cursor-pointer hover:text-primary"
                        onClick={() => startEditing(content.contentId, "title")}
                      >
                        {content.title || "Untitled Content"}
                      </h4>
                    )}
                  </div>

                  {/* Content info */}
                  <div className="text-xs text-text-muted">
                    v{content.version} • {content.authorUsername}
                    {content.hasLocalChanges && (
                      <span className="text-orange-600 ml-2">
                        • Unsaved changes
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Visibility switch */}
                  <Switch
                    checked={content.isVisible}
                    onChange={(checked) =>
                      handleVisibilityToggle(content.contentId, checked)
                    }
                    disabled={savingStates[content.contentId]}
                    size="sm"
                  />

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteContent(content.contentId)}
                    disabled={savingStates[content.contentId]}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                    title="Delete content"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expandable content body */}
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
                      {/* Rich text editor */}
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Content Body
                        </label>
                        <div className="border border-border rounded-lg overflow-hidden">
                          <RichTextEditor
                            value={content.body?.html || ""}
                            onChange={(newBody) =>
                              handleContentUpdate(content.contentId, newBody)
                            }
                            placeholder="Start writing your content here..."
                            height="200px"
                            disabled={savingStates[content.contentId]}
                          />
                        </div>
                      </div>

                      {/* Content Media Manager */}
                      <ContentMediaManager
                        content={content}
                        onMediaAdd={handleAddMediaToContent}
                        onMediaRemove={handleRemoveMediaFromContent}
                      />

                      {/* Manual save button */}
                      <div className="flex justify-end">
                        <Button
                          onClick={() =>
                            handleSaveContentBody(content.contentId)
                          }
                          disabled={savingStates[content.contentId]}
                          className="px-4 py-2 text-sm"
                        >
                          Save Content
                        </Button>
                      </div>

                      {/* Saving indicator */}
                      {savingStates[content.contentId] && (
                        <div className="text-sm text-blue-600 flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                          Saving...
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

export default SectionContentManager;
