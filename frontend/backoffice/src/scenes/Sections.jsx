"use client";

import React, {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {motion} from "framer-motion";
import {PlusIcon} from "@heroicons/react/16/solid";

import Utilities from "@/components/Utilities";
import useGetPage from "@/hooks/useGetPage";
import {removeItem} from "@/utils/treeHelpers";
import Title from "@/components/Title";
import useAddSection from "@/hooks/useAddSection";
import DraggableTree from "@/components/DraggableTree";
import PagesTabs from "@/components/PagesTabs";
import {useAddModule} from '@/hooks/useAddModule';
import {useAxiosClient} from "@/utils/axiosClient";

export default function Sections({pageId}) {
    const router = useRouter();
    const axios = useAxiosClient();
    const {page, refetch, loading, error} = useGetPage({
        route: `${pageId}/sections`,
    });

    console.log(page);

    const {createSection} = useAddSection();
    const {addModule} = useAddModule();

    const [treeData, setTreeData] = useState([]);
    // Nouveaux états pour le modal d'ajout de module
    const [showAddModuleModal, setShowAddModuleModal] = useState(false);
    const [targetSection, setTargetSection] = useState(null);
    const [selectedModuleType, setSelectedModuleType] = useState("");

    useEffect(() => {
        if (page?.sections) {
            const tree = page.sections.map((section) => ({
                id: section.sectionId,
                name: section.name,
                type: "section",
                isVisible: section.isVisible,
                children:
                    section.modules?.map((module) => ({
                        id: module.id,
                        name: module.name,
                        type: "module",
                        moduleType: module.type,
                        children: [],
                    })) || [],
            }));

            setTreeData(tree);
        }
    }, [page]);

    const handleTreeChange = useCallback((newTree) => {
        setTreeData(newTree);
    }, []);

    // Toggle visible - avec axiosClient
    const handleToggle = useCallback(async (item, newVal) => {
        try {
            if (item.type === "section") {
                await axios.put(`/api/sections/${item.id}`, {
                    name: item.name,
                    isVisible: newVal
                });
            } else if (item.type === "module") {
                await axios.put(`/api/modules/${item.id}/visibility`, newVal);
            }

            // Mettre à jour l'état local
            setTreeData((prev) =>
                prev.map((section) => {
                    if (section.id === item.id) {
                        return {...section, isVisible: newVal};
                    }
                    if (section.children) {
                        return {
                            ...section,
                            children: section.children.map((module) =>
                                module.id === item.id ? {...module, isVisible: newVal} : module
                            )
                        };
                    }
                    return section;
                })
            );
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la visibilité :", error);
        }
    }, [axios]);

    // Edit - avec navigation intelligente
    const handleEdit = useCallback((item) => {
        if (item.type === "section") {
            router.push(`/pages/${pageId}/sections/${item.id}`);
        } else if (item.type === "module") {
            router.push(`/modules/${item.moduleType.toLowerCase()}/${item.id}`);
        }
    }, [router]);

    // Delete - avec axiosClient
    const handleDelete = useCallback(async (item) => {
        const itemType = item.type === "section" ? "section" : "module";
        const confirmDelete = window.confirm(
            `Êtes-vous sûr de vouloir supprimer cette ${itemType} ?`,
        );
        if (!confirmDelete) return;

        try {
            if (item.type === "section") {
                await axios.delete(`/api/sections/${item.id}`);
            } else if (item.type === "module") {
                await axios.delete(`/api/modules/${item.id}`);
            }

            await refetch();
            setTreeData((prev) => removeItem(prev, item.id));
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    }, [refetch, axios]);

    // Fonction appelée par le bouton "Ajouter un module"
    const handleAddModule = useCallback((section) => {
        setTargetSection(section);
        setShowAddModuleModal(true);
    }, []);

    // Fonction de validation du modal (placeholder pour la requête d'ajout)
    const handleConfirmAddModule = async () => {
        try {
            await addModule({
                sectionId: targetSection.id,
                type: selectedModuleType,
                name: `Nouveau ${selectedModuleType}`
            });
            setShowAddModuleModal(false);
            setTargetSection(null);
            setSelectedModuleType("");
            await refetch();
        } catch (error) {
            console.error("Erreur lors de l'ajout du module:", error);
            // TODO: Ajouter un feedback d'erreur à l'utilisateur
        }
    };

    if (loading) return <p>Chargement…</p>;
    if (error) return <p>Erreur: {error.message}</p>;

    return (
        <motion.div
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            className="w-full max-w-6xl mx-auto p-6 space-y-6"
        >
            <Title
                label="Gestion du contenu"
                apiUrl="/api/pages/tree"
                data={treeData}
            />

            <PagesTabs pageId={pageId}/>

            <Utilities
                actions={[
                    {
                        icon: PlusIcon,
                        label: "Nouvelle Section",
                        callback: async () => {
                            await createSection({pageId: pageId, name: "Nouvelle section"});
                            await refetch();
                        },
                    },
                ]}
            />

            <DraggableTree
                initialData={treeData}
                onChange={handleTreeChange}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canHaveChildren={(item) => item.type !== "module"}
                canDrop={({dragged, targetParent, projected}) => {
                    if (dragged.type === "section") return projected.parentId === null;
                    if (dragged.type === "module") return targetParent && targetParent.type === "section";
                    return true;
                }}
                onAddChild={handleAddModule} // Ajout de la prop pour le bouton
            />

            {/* Modal d'ajout de module */}
            {showAddModuleModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <div className="p-6 rounded-xl shadow-xl min-w-[300px]"
                         style={{
                             backgroundColor: 'var(--color-surface)',
                             borderColor: 'var(--color-border)',
                             color: 'var(--color-text)'
                         }}>
                        <h2 className="text-lg font-bold mb-4" style={{color: 'var(--color-text)'}}>
                            Ajouter un module à {targetSection?.name}
                        </h2>
                        <label className="block mb-2" style={{color: 'var(--color-text)'}}>
                            Type de module :
                        </label>
                        <select
                            className="rounded px-2 py-1 w-full mb-4"
                            style={{
                                backgroundColor: 'var(--color-background)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-border)'
                            }}
                            value={selectedModuleType}
                            onChange={e => setSelectedModuleType(e.target.value)}
                        >
                            <option value="">Sélectionner un type</option>
                            <option value="article">Article</option>
                            <option value="gallery">Galerie</option>
                            <option value="news">Actualité</option>
                            <option value="newsletter">Newsletter</option>
                            <option value="cta">CTA</option>
                            <option value="timeline">Timeline</option>
                            <option value="form">Formulaire</option>
                            <option value="list">Liste</option>
                        </select>
                        <div className="flex gap-2 justify-end">
                            <button
                                className="px-3 py-1 rounded transition-colors"
                                style={{
                                    backgroundColor: 'var(--color-border)',
                                    color: 'var(--color-text-muted)'
                                }}
                                onClick={() => {
                                    setShowAddModuleModal(false);
                                    setTargetSection(null);
                                    setSelectedModuleType("");
                                }}
                            >Annuler
                            </button>
                            <button
                                className="px-3 py-1 rounded text-white transition-colors disabled:opacity-50"
                                style={{
                                    backgroundColor: 'var(--color-primary)',
                                }}
                                onClick={handleConfirmAddModule}
                                disabled={!selectedModuleType}
                            >Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
