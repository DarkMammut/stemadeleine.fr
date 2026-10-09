"use client";

import React, {useEffect, useRef, useState} from "react";
import {AnimatePresence} from "framer-motion";
import {PlusIcon} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";
import RichTextEditor from "@/components/RichTextEditor";
import MediaManager from "@/components/MediaManager";
import PublishButton from "@/components/ui/PublishButton";
import DeleteButton from "@/components/ui/DeleteButton";
import {useContentOperations} from "@/hooks/useContentOperations";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Notification from "@/components/ui/Notification";
import {useNotification} from "@/hooks/useNotification";
import Panel from "@/components/ui/Panel";
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import PropTypes from "prop-types";
import { useTranslation } from "@/i18n/I18nContext";

/**
 * Composant générique de gestion de contenus.
 *
 * parentId:
 *     Identifiant du parent utilisé par les endpoints spécifiques
 *     au parent (section, module, news-publication, etc.).
 *
 * contentOwnerId:
 *     Identifiant réel utilisé comme Content.ownerId.
 *
 * Pour une news-publication :
 *     parentId       = news_publications.id
 *     contentOwnerId = news.id
 *
 * Pour les autres types de parents, contentOwnerId peut être omis
 * et parentId sera utilisé comme ownerId.
 */
const ContentManager = ({
                            parentId,
                            contentOwnerId,
                            parentType = "section",
                            onContentsChange,
                            customLabels = {},
                            showSaveButton = false,
                            loading: externalLoading = false,
                        }) => {
    const { t } = useTranslation();
    const [contents, setContents] = useState([]);
    const skipNotifyRef = useRef(true);
    const [expandedContents, setExpandedContents] = useState(new Set());
    const [loadingLocal, setLoadingLocal] = useState(false);
    const [savingStates, setSavingStates] = useState({});
    const [editingContent, setEditingContent] = useState({});
    const [showPublishAllModal, setShowPublishAllModal] = useState(false);
    const [isPublishingAll, setIsPublishingAll] = useState(false);

    const {
        notification,
        showSuccess,
        showError,
        hideNotification,
    } = useNotification();

    const {
        getContents,
        createContent,
        updateContent,
        updateContentVisibility,
        deleteContent,
        addMediaToContent,
        removeMediaFromContent,
        publishAllContents,
    } = useContentOperations({parentType});

    /**
     * Chargement des contenus.
     *
     * Ici parentId est volontairement utilisé.
     * Pour news-publication, il s'agit de news_publications.id.
     */
    useEffect(() => {
        if (parentId) {
            loadContents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentId]);

    const loadContents = async () => {
        try {
            setLoadingLocal(true);

            const uniqueContents = await getContents(parentId);

            skipNotifyRef.current = true;
            setContents(uniqueContents);

            if (onContentsChange) {
                onContentsChange(uniqueContents);
            }
        } catch (error) {
            console.error("Error loading contents:", error);

            showError(
                t("pages.errors.loadContentsTitle"),
                t("pages.errors.loadContentsMessage"),
            );
        } finally {
            setLoadingLocal(false);
        }
    };

    // Les contenus modifiés changent l'état de publication des parents (page, section, module)
    useEffect(() => {
        if (skipNotifyRef.current) {
            skipNotifyRef.current = false;
            return;
        }
        window.dispatchEvent(new Event("publication-info-changed"));
    }, [contents]);

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
                customLabels.defaultTitle || t("pages.common.newContent"),
            );

            await loadContents();

            setExpandedContents(
                (prev) => new Set([...prev, newContent.contentId]),
            );

            showSuccess(
                t("pages.notifications.contentAddedTitle"),
                t("pages.notifications.contentAddedMessage"),
            );
        } catch (error) {
            console.error("Error adding content:", error);

            showError(
                t("pages.errors.genericTitle"),
                t("pages.errors.creationModuleMessage"),
            );
        } finally {
            setLoadingLocal(false);
        }
    };

    // Update content title
    const handleTitleUpdate = async (contentId, newTitle) => {
        try {
            setSavingStates((prev) => ({
                ...prev,
                [contentId]: true,
            }));

            const content = contents.find(
                (c) => c.contentId === contentId,
            );

            if (!content) {
                return;
            }

            await updateContent(contentId, {
                title: newTitle,
                body: content.body || {
                    html: `<p>${t("pages.common.startWriting")}</p>`,
                },
            });

            await loadContents();

            showSuccess(
                t("pages.notifications.contentTitleUpdatedTitle"),
                t("pages.notifications.contentTitleUpdatedMessage"),
            );
        } catch (error) {
            console.error(
                "Error updating content title:",
                error,
            );

            showError(
                t("pages.errors.genericTitle"),
                t("pages.errors.titleUpdateMessage"),
            );
        } finally {
            setSavingStates((prev) => ({
                ...prev,
                [contentId]: false,
            }));
        }
    };

    // Update content body - NO AUTO-SAVE
    const handleContentUpdate = (contentId, newBody) => {
        setContents((prev) =>
            prev.map((c) =>
                c.contentId === contentId
                    ? {
                        ...c,
                        body: {html: newBody},
                        hasLocalChanges: true,
                    }
                    : c,
            ),
        );
    };

    // Manual save for content body
    const handleSaveContentBody = async (contentId) => {
        try {
            setSavingStates((prev) => ({
                ...prev,
                [contentId]: true,
            }));

            const content = contents.find(
                (c) => c.contentId === contentId,
            );

            if (!content) {
                return;
            }

            await updateContent(contentId, {
                title: content.title,
                body: content.body,
                medias: content.medias,
            });

            await loadContents();

            setContents((prev) =>
                prev.map((c) =>
                    c.contentId === contentId
                        ? {...c, hasLocalChanges: false}
                        : c,
                ),
            );

            showSuccess(
                t("pages.notifications.contentSavedTitle"),
                t("pages.notifications.contentSavedMessage"),
            );
        } catch (error) {
            console.error(
                "Error saving content body:",
                error,
            );

            showError(
                t("pages.errors.genericTitle"),
                t("pages.errors.saveContentMessage"),
            );
        } finally {
            setSavingStates((prev) => ({
                ...prev,
                [contentId]: false,
            }));
        }
    };

    // Toggle content visibility
    const handleVisibilityToggle = async (
        contentId,
        isVisible,
    ) => {
        try {
            setSavingStates((prev) => ({
                ...prev,
                [contentId]: true,
            }));

            await updateContentVisibility(
                contentId,
                isVisible,
            );

            setContents((prev) =>
                prev.map((c) =>
                    c.contentId === contentId
                        ? {
                            ...c,
                            isVisible,
                        }
                        : c,
                ),
            );

            showSuccess(
                t("pages.notifications.visibilityUpdatedTitle"),
                `${t("pages.common.content")} ${
                    isVisible
                        ? t("pages.common.visible")
                        : t("pages.common.hidden")
                }`,
            );
        } catch (error) {
            console.error(
                "Error updating content visibility:",
                error,
            );

            showError(
                t("pages.errors.genericTitle"),
                t("pages.errors.visibilityMessage"),
            );
        } finally {
            setSavingStates((prev) => ({
                ...prev,
                [contentId]: false,
            }));
        }
    };

    // Delete content
    const handleDeleteContent = async (contentId) => {
        try {
            setSavingStates((prev) => ({
                ...prev,
                [contentId]: true,
            }));

            await deleteContent(contentId);

            setContents((prev) =>
                prev.filter(
                    (c) => c.contentId !== contentId,
                ),
            );

            setExpandedContents((prev) => {
                const newSet = new Set(prev);
                newSet.delete(contentId);
                return newSet;
            });

            showSuccess(
                t("pages.notifications.contentDeletedTitle"),
                t("pages.notifications.contentDeletedMessage"),
            );
        } catch (error) {
            console.error(
                "Error deleting content:",
                error,
            );

            showError(
                t("pages.errors.genericTitle"),
                t("pages.errors.deleteContentMessage"),
            );

            throw error;
        } finally {
            setSavingStates((prev) => ({
                ...prev,
                [contentId]: false,
            }));
        }
    };

    // Ouvre la modal de publication
    const handleOpenPublishAllModal = () => {
        setShowPublishAllModal(true);
    };

    /**
     * Publie tous les contenus.
     *
     * IMPORTANT :
     *
     * - Pour une section/module :
     *       contentOwnerId peut être absent
     *       => parentId est utilisé.
     *
     * - Pour une news-publication :
     *       parentId       = news_publications.id
     *       contentOwnerId = news.id
     *
     * L'endpoint /api/content/owner/{ownerId}/publish
     * attend donc contentOwnerId.
     */
    const handleConfirmPublishAll = async () => {
        try {
            setIsPublishingAll(true);

            const ownerId = contentOwnerId || parentId;

            if (!ownerId) {
                throw new Error(t("pages.contentManager.publishMissingOwner"));
            }

            const result = await publishAllContents(ownerId);

            console.log("📢 Publication result:", result);

            await loadContents();

            showSuccess(
                t("pages.notifications.publishCompletedTitle"),
                `${result.publishedCount} ${t(
                    "pages.contentManager.publishResultPublished",
                )}, ${result.skippedCount || 0} ${t(
                    "pages.contentManager.publishResultSkipped",
                )}`,
            );
        } catch (error) {
            console.error(
                "Error publishing all contents:",
                error,
            );

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                t("pages.errors.publishContentsMessage");

            showError(
                t("pages.errors.genericTitle"),
                errorMessage,
            );
        } finally {
            setIsPublishingAll(false);
            setShowPublishAllModal(false);
        }
    };

    // Media operations
    const handleAddMediaToContent = async (
        contentId,
        mediaId,
    ) => {
        try {
            const updatedContent =
                await addMediaToContent(
                    contentId,
                    mediaId,
                );

            setContents((prev) =>
                prev.map((c) =>
                    c.contentId === contentId
                        ? updatedContent
                        : c,
                ),
            );
        } catch (error) {
            console.error(
                "Error adding media to content:",
                error,
            );

            throw error;
        }
    };

    const handleRemoveMediaFromContent = async (
        contentId,
        mediaId,
    ) => {
        try {
            const updatedContent =
                await removeMediaFromContent(
                    contentId,
                    mediaId,
                );

            setContents((prev) =>
                prev.map((c) =>
                    c.contentId === contentId
                        ? updatedContent
                        : c,
                ),
            );
        } catch (error) {
            console.error(
                "Error removing media from content:",
                error,
            );

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
            const newState = {...prev};

            delete newState[
                `${contentId}_${field}`
                ];

            return newState;
        });
    };

    const isEditing = (contentId, field) => {
        return (
            editingContent[
                `${contentId}_${field}`
                ] || false
        );
    };

    const isStandalonePublication = [
        "news-publication",
        "newsletter-publication",
    ].includes(parentType);

    const effectiveLoading =
        externalLoading || loadingLocal;

    return (
        <Panel
            title={customLabels.header || t("pages.contentManager.title")}
            actions={
                <div className="flex items-center gap-2">
                    {/* Sections/modules : la publication est portée par le parent (page, section, module).
                        Les publications news/newsletter n'ont pas de parent versionné. */}
                    {isStandalonePublication && (
                        <PublishButton
                            onPublish={handleOpenPublishAllModal}
                            disabled={
                                effectiveLoading ||
                                contents.length === 0 ||
                                isPublishingAll ||
                                (parentType === "news-publication" &&
                                    !contentOwnerId)
                            }
                            publishLabel={
                                customLabels.publishButton ||
                                t("pages.contentManager.publishAllButton")
                            }
                            publishedLabel={t("pages.contentManager.publishAllDone")}
                            size="md"
                            resetAfterDelay={true}
                        />
                    )}

                    <Button
                        onClick={handleAddContent}
                        disabled={effectiveLoading}
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4"/>

                        {effectiveLoading ? (
                            <span className="skeleton-light w-32 h-4 inline-block"/>
                        ) : (
                            customLabels.addButton ||
                            t("pages.contentManager.addButton")
                        )}
                    </Button>
                </div>
            }
        >
            <div className="content-manager">
                {effectiveLoading &&
                    contents.length === 0 && (
                        <div className="space-y-3 px-4 py-8">
                            <div className="skeleton-light h-4 w-1/3 rounded"/>
                            <div className="skeleton-light h-4 w-1/2 rounded"/>
                            <div className="skeleton-light h-4 w-2/3 rounded"/>
                        </div>
                    )}

                {!effectiveLoading &&
                    contents.length === 0 && (
                        <div className="text-center py-8 text-gray-500 px-4 sm:px-8">
                            <p>
                                {customLabels.empty ||
                                    t("pages.contentManager.empty")}
                            </p>
                        </div>
                    )}

                <div className="space-y-3">
                    <AnimatePresence>
                        {(!effectiveLoading
                                ? contents
                                : contents
                        ).map((content, index) => (
                            <CollapsibleCard
                                key={`content-${content.contentId || index}-${content.version || 0}`}
                                isOpen={expandedContents.has(
                                    content.contentId,
                                )}
                                onToggle={() =>
                                    toggleContentExpansion(
                                        content.contentId,
                                    )
                                }
                                leading={
                                    <Switch
                                        checked={
                                            content.isVisible
                                        }
                                        onChange={(checked) =>
                                            handleVisibilityToggle(
                                                content.contentId,
                                                checked,
                                            )
                                        }
                                        disabled={
                                            savingStates[
                                                content.contentId
                                                ] ||
                                            effectiveLoading
                                        }
                                        size="sm"
                                    />
                                }
                                renderTitle={() =>
                                    isEditing(
                                        content.contentId,
                                        "title",
                                    ) ? (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();

                                                const formData =
                                                    new FormData(
                                                        e.target,
                                                    );

                                                const newTitle =
                                                    formData.get(
                                                        "title",
                                                    );

                                                handleTitleUpdate(
                                                    content.contentId,
                                                    newTitle,
                                                );

                                                stopEditing(
                                                    content.contentId,
                                                    "title",
                                                );
                                            }}
                                            className="flex items-center gap-2"
                                        >
                                            <input
                                                name="title"
                                                defaultValue={
                                                    content.title
                                                }
                                                className="flex-1 px-3 py-1.5 text-base text-gray-900 border border-gray-300 rounded-md focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key ===
                                                        "Escape"
                                                    ) {
                                                        stopEditing(
                                                            content.contentId,
                                                            "title",
                                                        );
                                                    }
                                                }}
                                            />

                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={
                                                    savingStates[
                                                        content.contentId
                                                        ] ||
                                                    effectiveLoading
                                                }
                                            >
                                                {customLabels.save ||
                                                    t("pages.contentManager.saveInline")}
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    stopEditing(
                                                        content.contentId,
                                                        "title",
                                                    )
                                                }
                                                disabled={
                                                    savingStates[
                                                        content.contentId
                                                        ] ||
                                                    effectiveLoading
                                                }
                                            >
                                                {customLabels.cancel ||
                                                    t("pages.contentManager.cancelInline")}
                                            </Button>
                                        </form>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {effectiveLoading ? (
                                                <div className="skeleton-light w-48 h-5 rounded"/>
                                            ) : (
                                                <h4
                                                    className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors truncate"
                                                    onClick={() =>
                                                        startEditing(
                                                            content.contentId,
                                                            "title",
                                                        )
                                                    }
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

                                            <div className="text-xs text-gray-500 flex-shrink-0">
                                                {effectiveLoading ? (
                                                    <span className="skeleton-light w-20 h-3 inline-block rounded"/>
                                                ) : (
                                                    <>
                                                        {t("pages.contentManager.versionPrefix")}
                                                        {
                                                            content.version
                                                        }{" "}
                                                        •{" "}
                                                        {
                                                            content.authorUsername
                                                        }
                                                    </>
                                                )}

                                                {content.hasLocalChanges &&
                                                    !effectiveLoading && (
                                                        <span className="text-orange-600 ml-2">
                                                            • {t("pages.common.unsavedChanges")}
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    )
                                }
                                actions={
                                    <DeleteButton
                                        onDelete={() =>
                                            handleDeleteContent(
                                                content.contentId,
                                            )
                                        }
                                        disabled={
                                            savingStates[
                                                content.contentId
                                                ] ||
                                            effectiveLoading
                                        }
                                        deleteLabel={t("pages.common.delete")}
                                        confirmTitle={t("pages.contentManager.deleteContentTitle")}
                                        confirmMessage={t("pages.contentManager.deleteContentMessage")}
                                        size="sm"
                                        hoverExpand={true}
                                    />
                                }
                            >
                                <div className="space-y-6">
                                    {effectiveLoading ? (
                                        <div className="space-y-3">
                                            <div className="skeleton-light h-40 rounded"/>
                                            <div className="skeleton-light h-4 w-1/3 rounded"/>
                                        </div>
                                    ) : (
                                        <>
                                            <RichTextEditor
                                                value={
                                                    content.body?.html ||
                                                    ""
                                                }
                                                onChange={(newBody) =>
                                                    handleContentUpdate(
                                                        content.contentId,
                                                        newBody,
                                                    )
                                                }
                                                placeholder={
                                                    customLabels.bodyPlaceholder ||
                                                    t("pages.common.startWriting")
                                                }
                                                height="200px"
                                                disabled={
                                                    savingStates[
                                                        content.contentId
                                                        ]
                                                }
                                            />

                                            {(() => {
                                                const shouldShow =
                                                    showSaveButton ===
                                                    true ||
                                                    (showSaveButton ===
                                                        false &&
                                                        content.hasLocalChanges);

                                                return (
                                                    shouldShow && (
                                                        <div className="flex justify-end mt-4">
                                                            <Button
                                                                onClick={() =>
                                                                    handleSaveContentBody(
                                                                        content.contentId,
                                                                    )
                                                                }
                                                                disabled={
                                                                    savingStates[
                                                                        content.contentId
                                                                        ] ||
                                                                    !content.hasLocalChanges
                                                                }
                                                            >
                                                                {customLabels.saveContent ||
                                                                    t("pages.common.saveContent")}
                                                            </Button>
                                                        </div>
                                                    )
                                                );
                                            })()}

                                            <MediaManager
                                                content={content}
                                                onMediaAdd={
                                                    handleAddMediaToContent
                                                }
                                                onMediaRemove={
                                                    handleRemoveMediaFromContent
                                                }
                                                onMediaChanged={
                                                    loadContents
                                                }
                                                loading={
                                                    effectiveLoading
                                                }
                                            />

                                            {savingStates[
                                                content.contentId
                                                ] && (
                                                <div className="text-sm text-blue-600 flex items-center gap-2">
                                                    <div
                                                        className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"/>

                                                    {customLabels.saving ||
                                                        t("pages.common.saving")}
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

            {isStandalonePublication && <ConfirmModal
                open={showPublishAllModal}
                onClose={() =>
                    setShowPublishAllModal(false)
                }
                onConfirm={handleConfirmPublishAll}
                title={t("pages.contentManager.publishAllTitle")}
                message={
                    parentType === "section"
                        ? t("pages.contentManager.publishAllConfirmationSection")
                        : parentType === "module"
                          ? t("pages.contentManager.publishAllConfirmationModule")
                          : parentType === "news-publication"
                            ? t(
                                "pages.contentManager.publishAllConfirmationNewsPublication",
                              )
                            : t(
                                "pages.contentManager.publishAllConfirmationNewsletterPublication",
                              )
                }
                confirmLabel={t("pages.contentManager.publishAllButton")}
                isLoading={isPublishingAll}
                variant="primary"
            />}

            <Notification
                {...notification}
                onClose={hideNotification}
            />
        </Panel>
    );
};

ContentManager.propTypes = {
    loading: PropTypes.bool,

    /**
     * ID du parent métier.
     *
     * Pour news-publication :
     * news_publications.id
     */
    parentId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),

    /**
     * ID réel utilisé comme Content.ownerId.
     *
     * Pour news-publication :
     * news.id
     */
    contentOwnerId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),

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
    contentOwnerId: null,
};

export default ContentManager;