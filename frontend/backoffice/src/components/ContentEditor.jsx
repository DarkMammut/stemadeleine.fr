"use client";

import React, {useEffect, useState} from "react";
import RichTextEditor from "./RichTextEditor";
import {useContentOperations} from "@/hooks/useContentOperations";

/**
 * Composant générique d'édition de contenu pour section, module, etc.
 * parentType: "section", "module", ...
 * parentId: identifiant de la section ou du module
 */
const ContentEditor = ({
  parentId,
  parentType = "section",
  contentId = null,
  initialTitle = "Nouveau contenu",
  initialContent = "",
  onContentSaved,
  customLabels = {},
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentContentId, setCurrentContentId] = useState(contentId);

  // Utilise le hook d'opérations, adapté pour le parentType
  const { createContent, updateContent } = useContentOperations({ parentType });

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setCurrentContentId(contentId);
    setHasUnsavedChanges(false);
  }, [initialTitle, initialContent, contentId]);

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges || isSaving) return;
    try {
      setIsSaving(true);
      let response;
      if (currentContentId) {
        // Mise à jour d'un contenu existant
        await updateContent(currentContentId, {
          title: title,
          body: { html: content },
        });
        response = { data: { contentId: currentContentId } };
      } else {
        // Création d'un nouveau contenu
        const newContent = await createContent(parentId, title);
        setCurrentContentId(newContent.contentId);
        response = { data: { contentId: newContent.contentId } };
        // Mise à jour du body si besoin
        if (content && content.trim() !== "") {
          await updateContent(newContent.contentId, {
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
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du contenu:", error);
      alert("Erreur lors de la sauvegarde du contenu.");
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
    <div className="content-editor space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">
          {customLabels.header || "Éditeur de contenu"}
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-text-muted">
            {isSaving && (
              <span className="text-blue-600">💾 Sauvegarde...</span>
            )}
            {!isSaving && hasUnsavedChanges && (
              <span className="text-orange-600">
                ⚠️ Modifications non sauvegardées
              </span>
            )}
            {!isSaving && !hasUnsavedChanges && lastSaved && (
              <span className="text-green-600">
                ✅ Sauvegardé à {formatLastSaved(lastSaved)}
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {customLabels.saving || "Sauvegarde..."}
              </>
            ) : (
              <>💾 {customLabels.saveButton || "Enregistrer le contenu"}</>
            )}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <label
          htmlFor="content-title"
          className="block text-sm font-medium text-text"
        >
          {customLabels.titleLabel || "Titre du contenu"}
        </label>
        <input
          id="content-title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={customLabels.titlePlaceholder || "Titre..."}
          disabled={isSaving}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text">
          {customLabels.bodyLabel || "Contenu"}
        </label>
        <div className="border border-border rounded-lg overflow-hidden">
          <RichTextEditor
            value={content}
            onChange={handleContentChange}
            placeholder={
              customLabels.bodyPlaceholder || "Commencez à écrire..."
            }
            height="300px"
            disabled={isSaving}
          />
        </div>
      </div>
      <div className="text-sm text-text-muted">
        <p>
          💡 Cliquez sur "{customLabels.saveButton || "Enregistrer le contenu"}"
          pour sauvegarder.{" "}
          {currentContentId ? `(ID: ${currentContentId})` : "(Nouveau contenu)"}
        </p>
        {hasUnsavedChanges && (
          <p className="text-orange-600 mt-1">
            ⚠️ Modifications non sauvegardées
          </p>
        )}
      </div>
      <div className="text-xs text-text-muted opacity-75">
        💡 Astuce : Ctrl+S pour sauvegarder rapidement
      </div>
    </div>
  );
};

export default ContentEditor;
