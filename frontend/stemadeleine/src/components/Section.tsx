'use client';

import React, {useCallback, useEffect, useState} from 'react';
import clsx from 'clsx';
import useGetMedia from '../hooks/useGetMedia';
import useGetContents from '../hooks/useGetContents';
import Contents from './Contents';
import type {ModuleType} from './ModulesList';
import ModulesList from './ModulesList';
import Image from 'next/image';

// Types répliquant la shape attendue par Contents.jsx
export type Media = {
    id: string | number;
    fileName?: string;
    fileUrl: string;
};

export type ContentItem = {
    id: string | number;
    title?: string;
    body?: string | { html?: string } | Record<string, unknown>;
    layout?: 'left' | 'right' | 'staggered';
    medias?: Media[];
};

type SectionProps = {
    sectionId?: string | null;
    title?: string | null;
    mediaId?: string | number | null;
    contents?: ContentItem[]; // static contents fallback
    align?: 'left' | 'center' | 'right';
    className?: string;
    showModules?: boolean;
    variant?: string; // ajouté pour compatibilité
};

type UseGetContentsReturn = {
    contents: ContentItem[];
    loading: boolean;
    fetchContentsByOwnerId: (ownerId: string) => Promise<ContentItem[]>;
    clearContents?: () => void;
    error?: string | null;
};

export default function Section({
                                    sectionId,
                                    title,
                                    mediaId,
                                    contents: staticContents = [],
                                    align = 'left',
                                    className = '',
                                    showModules = true,
                                }: SectionProps) {
    const [hasDarkModules, setHasDarkModules] = useState(false);

    // Convertir mediaId en string/undefined pour useGetMedia
    const mediaIdStr = mediaId ? String(mediaId) : undefined;
    const {mediaUrl} = useGetMedia(mediaIdStr);

    // Typage de retour du hook JS
    const {
        contents: apiContents,
        loading,
        fetchContentsByOwnerId,
    } = useGetContents() as unknown as UseGetContentsReturn;

    useEffect(() => {
        if (sectionId) fetchContentsByOwnerId(sectionId).catch(console.error);
    }, [sectionId, fetchContentsByOwnerId]);

    const contents = sectionId ? apiContents : staticContents;
    const handleModulesChange = useCallback((modules: ModuleType[]) => {
        const darkModuleTypes = new Set(['NEWS', 'NEWSLETTER', 'GALLERY']);
        const sectionHasDarkModules = modules.some((module) =>
            darkModuleTypes.has(String(module.type ?? '').toUpperCase()),
        );
        setHasDarkModules(sectionHasDarkModules);
    }, []);

    // Taper proprement le composant Contents importé depuis JS
    const ContentsTyped = Contents as unknown as React.ComponentType<{
        contents: ContentItem[];
        loading?: boolean;
        loadingMessage?: string;
        layout?: 'staggered' | 'left' | 'right';
        theme?: 'light' | 'dark';
    }>;

    return (
        <section
            className={clsx(
                'w-full py-20 md:py-5 px-5 md:px-0',
                hasDarkModules ? 'bg-primary' : 'bg-cream',
                className,
            )}
        >
            <div className={clsx('w-full max-w-[960px] mx-auto')}>
                <div
                    className={clsx(
                        'grid gap-16 md:gap-4 items-center',
                        mediaId && mediaUrl ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
                        align === 'right' && 'md:grid-flow-dense',
                    )}
                >
                    {/* Text content */}
                    <div
                        className={clsx(
                            'content-container',
                            align === 'right' && mediaId && mediaUrl && 'md:col-start-2',
                        )}
                    >
                        {title && (
                            <div className="mb-3 md:mb-4">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-secondary leading-none">
                                    {title}
                                </h2>
                            </div>
                        )}

                        <ContentsTyped
                            contents={contents}
                            loading={!!(loading && sectionId)}
                            loadingMessage="Chargement des contenus..."
                            theme={hasDarkModules ? 'dark' : 'light'}
                        />
                    </div>

                    {/* Image */}
                    {mediaId && mediaUrl && (
                        <div className={clsx('about-img-wrap relative', align === 'right' && 'md:col-start-1')}>
                            <div className="relative w-full aspect-3/4 overflow-hidden shadow-lg">
                                <Image
                                    src={mediaUrl}
                                    alt={title || 'Image de section'}
                                    fill
                                    style={{objectFit: 'cover'}}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority={false}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Modules Section */}
                {sectionId && showModules && (
                    <div className="">
                        <ModulesList sectionId={sectionId} isDark={hasDarkModules}
                                     onModulesChange={handleModulesChange}/>
                    </div>
                )}
            </div>
        </section>
    );
}
