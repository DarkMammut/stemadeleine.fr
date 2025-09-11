"use client";

import React, { useEffect, useState } from "react";
import RichTextEditor from "./RichTextEditor";
import { useAxiosClient } from "@/utils/axiosClient";

const SectionContentEditor = ({
  sectionId,
  contentId = null,
  initialTitle = "New Content",
  initialContent = "",
  onContentSaved,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentContentId, setCurrentContentId] = useState(contentId);
  const axios = useAxiosClient();

  // Initialize content when props change
  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setCurrentContentId(contentId);
    setHasUnsavedChanges(false);
  }, [initialTitle, initialContent, contentId]);

  const handleTitleChange = (newTitle) => {
    console.log("Title changed:", newTitle);
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (newContent) => {
    console.log("Content changed");
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges || isSaving) {
      console.log("Skipping save - no changes or already saving");
      return;
    }

    try {
      console.log("Starting manual save...");
      setIsSaving(true);

      let response;

      if (currentContentId) {
        // Update existing content (creates new version)
        console.log("Updating existing content with ID:", currentContentId);
        response = await axios.put(
          `/api/sections/contents/${currentContentId}`,
          {
            title: title,
            body: { html: content },
          },
        );
      } else {
        // Create new content
        console.log("Creating new content for section:", sectionId);
        response = await axios.post(`/api/sections/${sectionId}/contents`, {
          title: title,
        });

        // Set the contentId for future updates
        setCurrentContentId(response.data.contentId);
        console.log("New content created with ID:", response.data.contentId);

        // Update the content body if it's not empty
        if (content && content.trim() !== "") {
          console.log("Updating content body...");
          await axios.put(`/api/sections/contents/${response.data.contentId}`, {
            title: title,
            body: { html: content },
          });
        }
      }

      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      if (onContentSaved) {
        onContentSaved({
          contentId: currentContentId || response.data.contentId,
          title: title,
          content: content,
        });
      }

      console.log("Content saved successfully");
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Error saving content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastSaved = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  return (
    <div className="section-content-editor space-y-4">
      {/* Header with save status */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">Content Editor</h3>
        <div className="flex items-center gap-4">
          {/* Save status */}
          <div className="text-sm text-text-muted">
            {isSaving && <span className="text-blue-600">💾 Saving...</span>}
            {!isSaving && hasUnsavedChanges && (
              <span className="text-orange-600">⚠️ Unsaved changes</span>
            )}
            {!isSaving && !hasUnsavedChanges && lastSaved && (
              <span className="text-green-600">
                ✅ Saved at {formatLastSaved(lastSaved)}
              </span>
            )}
          </div>

          {/* Manual save button - ALWAYS VISIBLE */}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>💾 Save Content</>
            )}
          </button>
        </div>
      </div>

      {/* Title input */}
      <div className="space-y-2">
        <label
          htmlFor="content-title"
          className="block text-sm font-medium text-text"
        >
          Content Title
        </label>
        <input
          id="content-title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter content title..."
          disabled={isSaving}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Rich text editor */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text">
          Content Body
        </label>
        <div className="border border-border rounded-lg overflow-hidden">
          <RichTextEditor
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing your content here..."
            height="300px"
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Info text */}
      <div className="text-sm text-text-muted">
        <p>
          💡 Click "Save Content" to save your changes manually.{" "}
          {currentContentId
            ? `(Content ID: ${currentContentId})`
            : "(New content)"}
        </p>
        {hasUnsavedChanges && (
          <p className="text-orange-600 mt-1">
            ⚠️ You have unsaved changes. Don't forget to save!
          </p>
        )}
      </div>

      {/* Keyboard shortcut hint */}
      <div className="text-xs text-text-muted opacity-75">
        💡 Tip: Use Ctrl+S (or Cmd+S) to save quickly
      </div>
    </div>
  );
};

export default SectionContentEditor;
