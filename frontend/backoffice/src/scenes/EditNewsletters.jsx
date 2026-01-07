"use client";

import React, {useEffect, useState} from "react";
import Utilities from "@/components/ui/Utilities";
import Title from "@/components/ui/Title";
import MediaManager from "@/components/MediaManager";
import VisibilitySwitch from "@/components/VisibiltySwitch";
import ContentManager from "@/components/ContentManager";
import NewsletterPreviewModal from "@/components/NewsletterPreviewModal";
import PublicationInfoCard from "@/components/PublicationInfoCard";
import DownloadButton from "@/components/ui/DownloadButton";
import SendButton from "@/components/ui/SendButton";
import IconButton from "@/components/ui/IconButton";
import Notification from "@/components/ui/Notification";
import {useNewsletterPublicationOperations} from "@/hooks/useNewsletterPublicationOperations";
import {useNotification} from "@/hooks/useNotification";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {useAxiosClient} from "@/utils/axiosClient";
import {EyeIcon} from "@heroicons/react/24/outline";
import SceneLayout from "@/components/ui/SceneLayout";
import {useRouter} from "next/navigation";
import EditablePanel from "@/components/ui/EditablePanel";

export default function EditNewsletters({newsletterId}) {
    const [newsletterData, setNewsletterData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingVisibility, setSavingVisibility] = useState(false);
    const [error, setError] = useState(null);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const axios = useAxiosClient();
    const router = useRouter();
    const {
        getNewsletterPublicationByNewsletterId,
        updateNewsletterPublication,
        updateNewsletterPublicationVisibility,
        publishNewsletterPublication,
        deleteNewsletterPublication,
    } = useNewsletterPublicationOperations();

    const {notification, showSuccess, showError, hideNotification} =
        useNotification();

    // Load newsletter data
    useEffect(() => {
        if (newsletterId) {
            loadNewsletter();
        }
    }, [newsletterId]);

    const loadNewsletter = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getNewsletterPublicationByNewsletterId(newsletterId);
            setNewsletterData(data);
        } catch (error) {
            // Use notification for user-facing error and keep console for development
            console.error("Error loading newsletter:", error);
            setError(error);
            showError("Erreur de chargement", "Impossible de charger la newsletter");
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedia = async (publicationId, mediaId) => {
        try {
            await axios.put(`/api/newsletter-publication/${publicationId}/media`, {
                mediaId: mediaId,
            });
            await loadNewsletter();
            showSuccess("Média ajouté", "Le média a été ajouté avec succès");

            return {
                ...newsletterData,
                medias: [{id: mediaId}],
            };
        } catch (error) {
            console.error("Erreur lors de l'ajout du média:", error);
            showError("Erreur", "Impossible d'ajouter le média");
            throw error;
        }
    };

    const handleRemoveMedia = async (publicationId) => {
        try {
            await axios.delete(`/api/newsletter-publication/${publicationId}/media`);
            await loadNewsletter();
            showSuccess("Média supprimé", "Le média a été supprimé avec succès");
        } catch (error) {
            console.error("Erreur lors de la suppression du média:", error);
            showError("Erreur", "Impossible de supprimer le média");
            throw error;
        }
    };

    // Form fields for newsletter editing
    const fields = [
        {
            name: "name",
            label: "Nom de la newsletter",
            type: "text",
            placeholder: "Entrez le nom de la newsletter",
            required: true,
            defaultValue: newsletterData?.name || "",
        },
        {
            name: "title",
            label: "Titre",
            type: "text",
            placeholder: "Entrez le titre",
            required: true,
            defaultValue: newsletterData?.title || "",
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Entrez une description",
            required: false,
            defaultValue: newsletterData?.description || "",
        },
    ];

    const handleSubmit = async (values) => {
        try {
            setSaving(true);
            await updateNewsletterPublication(newsletterData.id, {
                name: values.name,
                title: values.title,
                description: values.description,
            });
            await loadNewsletter();
            showSuccess(
                "Newsletter mise à jour",
                "Les modifications ont été enregistrées avec succès",
            );
        } catch (err) {
            console.error(err);
            showError(
                "Erreur de sauvegarde",
                "Impossible d'enregistrer les modifications",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        loadNewsletter();
    };

    const handleVisibilityChange = async (isVisible) => {
        try {
            setSavingVisibility(true);
            await updateNewsletterPublicationVisibility(newsletterData.id, isVisible);
            setNewsletterData((prev) => ({...prev, isVisible}));
            showSuccess(
                "Visibilité mise à jour",
                `Newsletter ${isVisible ? "visible" : "masquée"} avec succès`,
            );
        } catch (err) {
            console.error(err);
            showError("Erreur", "Impossible de modifier la visibilité");
        } finally {
            setSavingVisibility(false);
        }
    };

    const handlePublish = async () => {
        setShowPublishModal(true);
    };

    const confirmPublish = async () => {
        try {
            await publishNewsletterPublication(newsletterData.id);
            await loadNewsletter();
            showSuccess(
                "Newsletter publiée",
                "La newsletter a été publiée avec succès !",
            );
        } catch (err) {
            console.error(err);
            showError("Erreur de publication", "Impossible de publier la newsletter");
        } finally {
            setSaving(false);
            setShowPublishModal(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteNewsletterPublication(newsletterData.id);
            showSuccess(
                "Newsletter supprimée",
                "La newsletter a été supprimée avec succès",
            );
            // Redirection vers la liste des newsletters
            router.push("/newsletters");
        } catch (err) {
            console.error(err);
            showError(
                "Erreur de suppression",
                "Impossible de supprimer la newsletter",
            );
            throw err; // Re-throw pour que DeleteButton gère l'état
        }
    };

    const handleDownloadPDF = async () => {
        // TODO: Implémenter la génération de PDF
        showError("Non implémenté", "Téléchargement PDF non encore disponible");
    };

    const handleSend = async () => {
        // TODO: Implémenter le publipostage
        showError("Non implémenté", "Envoi de newsletter non encore disponible");
    };

    const effectiveLoading = loading;

    if (error)
        return (
            <div className="text-center py-8 text-red-600">
                Erreur: {error.message || "Erreur lors du chargement"}
            </div>
        );

    return (
        <SceneLayout>
            <Title label="Édition de newsletter"/>

            <Utilities actions={[]}/>

            {effectiveLoading || !newsletterData ? (
                <div className="space-y-6">
                    <PublicationInfoCard loading={effectiveLoading}/>
                    <VisibilitySwitch loading={effectiveLoading}/>
                    <EditablePanel
                        title="Informations de la newsletter"
                        loading={effectiveLoading}
                        canEdit={false}
                        fields={fields}
                        initialValues={newsletterData || {}}
                        displayColumns={2}
                    />

                    <ContentManager
                        parentId={newsletterId}
                        parentType="newsletter-publication"
                        customLabels={{
                            header: "Contenus de la newsletter",
                            addButton: "Ajouter un contenu",
                            empty: "Aucun contenu pour cette newsletter.",
                            loading: "Chargement des contenus...",
                            saveContent: "Enregistrer le contenu",
                            bodyLabel: "Contenu de la newsletter",
                        }}
                        loading={effectiveLoading}
                    />
                    <MediaManager
                        title="Image de la newsletter"
                        content={{
                            id: newsletterData?.id,
                            medias: newsletterData?.media ? [newsletterData.media] : [],
                        }}
                        onMediaAdd={handleAddMedia}
                        onMediaRemove={handleRemoveMedia}
                        onMediaChanged={loadNewsletter}
                        maxMedias={1}
                        loading={effectiveLoading}
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Newsletter Information, Status and Actions */}
                    <PublicationInfoCard
                        title={newsletterData.name}
                        status={newsletterData.status}
                        createdAt={newsletterData.createdAt}
                        publishedDate={newsletterData.publishedDate}
                        updatedAt={newsletterData.updatedAt}
                        author={newsletterData.author}
                        entityId={newsletterData?.newsletterId || newsletterData?.id}
                        entityIdLabel="ID Newsletter"
                        contentsCount={
                            newsletterData?.contents ? newsletterData.contents.length : 0
                        }
                        onPublish={handlePublish}
                        canPublish={newsletterData.status === "DRAFT"}
                        isPublishing={saving}
                        onDelete={handleDelete}
                        isDeleting={saving}
                        deleteConfirmTitle="Supprimer la newsletter"
                        deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer cette newsletter ? Cette action est irréversible."
                        additionalButtons={
                            <>
                                <IconButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowPreviewModal(true)}
                                    icon={EyeIcon}
                                    label="Aperçu"
                                    hoverExpand={true}
                                    title="Voir l'aperçu"
                                />
                                <DownloadButton
                                    onDownload={handleDownloadPDF}
                                    downloadLabel="PDF"
                                    size="sm"
                                    hoverExpand={true}
                                />
                                <SendButton
                                    onSend={handleSend}
                                    sendLabel="Envoyer"
                                    size="sm"
                                    hoverExpand={true}
                                    disabled={newsletterData.status !== "PUBLISHED"}
                                />
                            </>
                        }
                    />

                    {/* Newsletter Visibility */}
                    <VisibilitySwitch
                        title="Visibilité de la newsletter"
                        label="Newsletter visible sur le site"
                        isVisible={newsletterData?.isVisible || false}
                        onChange={handleVisibilityChange}
                        savingVisibility={savingVisibility}
                        loading={effectiveLoading}
                    />

                    {/* Main Form */}
                    {newsletterData && Object.keys(newsletterData).length > 0 && (
                        <EditablePanel
                            title="Informations de la newsletter"
                            loading={effectiveLoading}
                            canEdit={true}
                            initialValues={newsletterData}
                            fields={fields}
                            displayColumns={2}
                            onSubmit={handleSubmit}
                            onCancelExternal={handleCancelEdit}
                        />
                    )}

                    {/* Rich Text Content Editor */}
                    <ContentManager
                        parentId={newsletterId}
                        parentType="newsletter-publication"
                        customLabels={{
                            header: "Contenus de la newsletter",
                            addButton: "Ajouter un contenu",
                            empty: "Aucun contenu pour cette newsletter.",
                            loading: "Chargement des contenus...",
                            saveContent: "Enregistrer le contenu",
                            bodyLabel: "Contenu de la newsletter",
                        }}
                        loading={effectiveLoading}
                    />
                </div>
            )}

            {/* Gestion de l'image de la newsletter (Newsletter Media) */}
            {newsletterData && (
                <MediaManager
                    title="Image de la newsletter"
                    content={{
                        id: newsletterData.id,
                        medias: newsletterData?.media ? [newsletterData.media] : [],
                    }}
                    onMediaAdd={handleAddMedia}
                    onMediaRemove={handleRemoveMedia}
                    onMediaChanged={loadNewsletter}
                    maxMedias={1}
                    loading={effectiveLoading}
                />
            )}

            {/* Newsletter Preview Modal */}
            <NewsletterPreviewModal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                newsletterData={newsletterData}
            />

            {/* Publish Confirmation Modal */}
            <ConfirmModal
                open={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                onConfirm={confirmPublish}
                title="Publier la newsletter"
                message="Êtes-vous sûr de vouloir publier cette newsletter ?"
                confirmLabel="Publier"
                isLoading={saving}
                variant="primary"
            />

            {/* Notification */}
            <Notification
                show={notification.show}
                onClose={hideNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
            />
        </SceneLayout>
    );
}
