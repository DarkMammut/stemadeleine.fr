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

const NewsletterContentManager = ({ newsletterId, onContentsChange }) => {
  const [contents, setContents] = useState([]);
  const [expandedContents, setExpandedContents] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [savingStates, setSavingStates] = useState({});
  const [editingContent, setEditingContent] = useState({});

  // Use the content operations hook (we'll adapt it for newsletters)
  const {
    createContent,
    updateContent,
    updateContentVisibility,
    deleteContent,
    addMediaToContent,
    removeMediaFromContent,
  } = useContentOperations();

  // Load contents when component mounts or newsletterId changes
  useEffect(() => {
    if (newsletterId) {
      loadContents();
    }
  }, [newsletterId]);

  // Load contents from API (adapted for newsletters)
  const loadContents = async () => {
    try {
      setLoading(true);
      console.log("Loading contents for newsletter:", newsletterId);

      // For newsletters, we need to get contents by ownerId (newsletterId)
      const response = await fetch(
        `/api/newsletter-publications/${newsletterId}/contents`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch newsletter contents");
      }

      const data = await response.json();

      // Remove duplicates based on contentId and keep only the latest version
      const uniqueContents = data.reduce((acc, content) => {
        const existingIndex = acc.findIndex(
          (c) => c.contentId === content.contentId,
        );
        if (existingIndex === -1) {
          acc.push(content);
        } else {
          if (content.version > acc[existingIndex].version) {
            acc[existingIndex] = content;
          }
        }
        return acc;
      }, []);

      console.log("Newsletter contents loaded:", uniqueContents.length);
      setContents(uniqueContents);

      if (onContentsChange) {
        onContentsChange(uniqueContents);
      }
    } catch (error) {
      console.error("Error loading newsletter contents:", error);
      alert("Error loading newsletter contents. Please try again.");
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

  // Add new content to newsletter
  const handleAddContent = async () => {
    try {
      setLoading(true);
      console.log("Adding new content for newsletter:", newsletterId);

      // Create content with newsletterId as ownerId
      const response = await fetch(
        `/api/newsletter-publications/${newsletterId}/contents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "New Newsletter Content",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create newsletter content");
      }

      const newContent = await response.json();
      console.log("New newsletter content created:", newContent);

      // Reload contents to get the latest state
      await loadContents();

      // Auto-expand the new content
      setExpandedContents((prev) => new Set([...prev, newContent.contentId]));
    } catch (error) {
      console.error("Error adding content to newsletter:", error);
      alert("Error adding content to newsletter. Please try again.");
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
          html: "<p>Start writing your newsletter content here...</p>",
        },
      });

      // Reload contents to get the updated version
      await loadContents();
      console.log("Newsletter content title updated:", contentId);
    } catch (error) {
      console.error("Error updating newsletter content title:", error);
      alert("Error updating newsletter content title. Please try again.");
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

    console.log(
      "Newsletter content body changed locally for contentId:",
      contentId,
    );
  };

  // Manual save for content body
  const handleSaveContentBody = async (contentId) => {
    try {
      setSavingStates((prev) => ({ ...prev, [contentId]: true }));

      const content = contents.find((c) => c.contentId === contentId);
      if (!content) {
        console.error(
          "Newsletter content not found with contentId:",
          contentId,
        );
        return;
      }

      console.log(
        "Saving newsletter content with contentId:",
        contentId,
        "title:",
        content.title,
      );

      await updateContent(contentId, {
        title: content.title,
        body: content.body,
      });

      // Update local state to remove the hasLocalChanges flag
      setContents((prev) =>
        prev.map((c) =>
          c.contentId === contentId ? { ...c, hasLocalChanges: false } : c,
        ),
      );

      console.log(
        "Newsletter content body saved successfully for contentId:",
        contentId,
      );
      alert("Newsletter content saved successfully!");
    } catch (error) {
      console.error("Error saving newsletter content body:", error);
      alert("Error saving newsletter content body. Please try again.");
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

      console.log(
        "Newsletter content visibility updated:",
        contentId,
        isVisible,
      );
    } catch (error) {
      console.error("Error updating newsletter content visibility:", error);
      alert("Error updating newsletter content visibility. Please try again.");
    } finally {
      setSavingStates((prev) => ({ ...prev, [contentId]: false }));
    }
  };

  // Delete content
  const handleDeleteContent = async (contentId) => {
    if (!confirm("Are you sure you want to delete this newsletter content?")) {
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

      console.log("Newsletter content deleted:", contentId);
    } catch (error) {
      console.error("Error deleting newsletter content:", error);
      alert("Error deleting newsletter content. Please try again.");
    } finally {
      setSavingStates((prev) => ({ ...prev, [contentId]: false }));
    }
  };

  // Handle media operations (same as section content manager)
  const handleAddMediaToContent = async (contentId, mediaId) => {
    try {
      const updatedContent = await addMediaToContent(contentId, mediaId);

      // Update local state with the new media
      setContents((prev) =>
        prev.map((c) => (c.contentId === contentId ? updatedContent : c)),
      );

      console.log("Media added to newsletter content:", contentId, mediaId);
    } catch (error) {
      console.error("Error adding media to newsletter content:", error);
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

      console.log("Media removed from newsletter content:", contentId, mediaId);
    } catch (error) {
      console.error("Error removing media from newsletter content:", error);
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
    <div className="newsletter-content-manager space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">Newsletter Contents</h3>
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
          Loading newsletter contents...
        </div>
      )}

      {/* Empty state */}
      {!loading && contents.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          <p>
            No contents yet. Click "Add Content" to create your first newsletter
            content.
          </p>
        </div>
      )}

      {/* Contents list */}
      <div className="space-y-3">
        <AnimatePresence>
          {contents.map((content, index) => (
            <motion.div
              key={`newsletter-content-${content.contentId}-${content.version}-${index}`}
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
                        {content.title || "Untitled Newsletter Content"}
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
                          Newsletter Content Body
                        </label>
                        <div className="border border-border rounded-lg overflow-hidden">
                          <RichTextEditor
                            value={content.body?.html || ""}
                            onChange={(newBody) =>
                              handleContentUpdate(content.contentId, newBody)
                            }
                            placeholder="Start writing your newsletter content here..."
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
                          Save Newsletter Content
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

export default NewsletterContentManager;
