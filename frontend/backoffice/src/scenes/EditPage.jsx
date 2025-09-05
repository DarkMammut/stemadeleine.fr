"use client";

import React, {useEffect, useState} from "react";
import {motion} from "framer-motion";
import PagesTabs from "@/components/PagesTabs";
import Utilities from "@/components/Utilities";
import Title from "@/components/Title";
import useGetPage from "@/hooks/useGetPage";
import useAddPage from "@/hooks/useAddPage";
import useUpdatePageVisibility from "@/hooks/useUpdatePageVisibility";
import MyForm from "@/components/MyForm";
import MediaPicker from "@/components/MediaPicker";
import Switch from "@/components/ui/Switch";
import {useAxiosClient} from "@/utils/axiosClient";

export default function EditPage({pageId}) {
    const {page, refetch, loading, error} = useGetPage({route: pageId});
    const {updatePage} = useAddPage();
    const {updatePageVisibility} = useUpdatePageVisibility();
    const [pageData, setPageData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [savingVisibility, setSavingVisibility] = useState(false);
    const axios = useAxiosClient();

    useEffect(() => {
        if (page) setPageData(page);
    }, [page]);

    // Champs du formulaire SANS isVisible
    const fields = [
        {
            name: "name",
            label: "Nom de la page",
            type: "text",
            placeholder: "Entrez le nom de page",
            required: true,
            defaultValue: pageData?.name || "",
        },
        {
            name: "title",
            label: "Titre",
            type: "text",
            placeholder: "Entrez le titre",
            required: true,
            defaultValue: pageData?.title || "",
        },
        {
            name: "subTitle",
            label: "Sous-titre",
            type: "text",
            placeholder: "Entrez le sous-titre",
            required: false,
            defaultValue: pageData?.subTitle || "",
        },
        {
            name: "slug",
            label: "Slug",
            type: "readonly",
            placeholder: "Le slug sera généré automatiquement",
            required: true,
            defaultValue: pageData?.slug || "",
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Entrez une description",
            required: false,
            defaultValue: pageData?.description || "",
        },
    ];

    const attachToEntity = async (mediaId) => {
        await axios.put(`/api/pages/${pageId}/hero-media`, {
            heroMediaId: mediaId,
        });
        refetch();
    };

    const handleFormChange = (name, value, allValues) => {
        setPageData((prev) => ({...prev, ...allValues}));
    };

    const handleSubmit = async (values) => {
        try {
            setSaving(true);
            await updatePage(pageId, {
                name: values.name,
                title: values.title,
                subTitle: values.subTitle,
                slug: values.slug,
                description: values.description,
                // Retire isVisible du formulaire principal
            });
            setSaving(false);
            refetch();
            alert("Page mise à jour !");
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la sauvegarde de la page");
            setSaving(false);
        }
    };

    const handleVisibilityChange = async (isVisible) => {
        try {
            setSavingVisibility(true);
            await updatePageVisibility(pageId, isVisible);
            setSavingVisibility(false);
            setPageData(prev => ({...prev, isVisible}));
            refetch();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la mise à jour de la visibilité");
            setSavingVisibility(false);
        }
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            className="w-full max-w-6xl mx-auto p-6 space-y-6"
        >
            <Title
                label="Gestion des pages"
                apiUrl={`/api/pages/${pageId}`}
                data={page}
            />

            <PagesTabs pageId={pageId}/>

            <Utilities actions={[]}/>

            {!pageData ? (
                <div className="text-center py-8 text-text-muted">Chargement des données...</div>
            ) : (
                <div className="space-y-6">
                    {/* Section Visibilité séparée */}
                    <div className="bg-surface border border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-text mb-4">Visibilité de la page</h3>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Switch
                                checked={pageData?.isVisible || false}
                                onChange={handleVisibilityChange}
                                disabled={savingVisibility}
                            />
                            <span className="font-medium text-text">
                                Page visible sur le site
                                {savingVisibility && <span className="text-text-muted ml-2">(Sauvegarde...)</span>}
                            </span>
                        </label>
                        <p className="text-sm text-text-muted mt-2">
                            Cette option se sauvegarde automatiquement
                        </p>
                    </div>

                    {/* Formulaire principal */}
                    <MyForm
                        fields={fields}
                        formValues={pageData}
                        setFormValues={setPageData}
                        onSubmit={handleSubmit}
                        onChange={handleFormChange}
                        loading={saving}
                        submitButtonLabel="Enregistrer la page"
                    />
                </div>
            )}

            <MediaPicker
                mediaId={page?.heroMedia?.id}
                attachToEntity={attachToEntity}
                entityType="pages"
                entityId={pageId}
            />
        </motion.div>
    );
}
