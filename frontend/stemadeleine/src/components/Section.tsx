'use client';

import React, {useEffect} from 'react';
import clsx from 'clsx';
import useGetMedia from '../hooks/useGetMedia';
import useGetContents from '../hooks/useGetContents';
import Contents from './Contents';
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

    // Taper proprement le composant Contents importé depuis JS
    const ContentsTyped = Contents as unknown as React.ComponentType<{
        contents: ContentItem[];
        loading?: boolean;
        loadingMessage?: string;
        layout?: 'staggered' | 'left' | 'right';
    }>;

    return (
        <section className={clsx('w-full py-16 md:py-20', 'bg-transparent', className)}>
            <div
                className={clsx(
                    'w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-start gap-10 md:gap-16',
                    align === 'right' && 'md:flex-row-reverse',
                )}
            >
                {/* Texte */}
                <div className="w-full flex-1">
                    <div className="flex items-center mb-10 gap-6 ">
                        {/* Image */}
                        {mediaId && mediaUrl && (
                            <div className="flex-shrink-0 md:w-1/5 w-full">
                                <div className="relative w-full h-48 md:h-40 rounded-xl overflow-hidden shadow-sm">
                                    <Image
                                        src={mediaUrl}
                                        alt={title || 'Image de section'}
                                        fill
                                        style={{objectFit: 'cover'}}
                                        sizes="(max-width: 768px) 100vw, 20vw"
                                        priority={false}
                                    />
                                </div>
                            </div>
                        )}
                        {title && (
                            <div className="flex-1 flex flex-col items-start">
                                <h2
                                    className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl mb-6 justify-self-start">
                                    {title}
                                </h2>
                                <div className="w-full border-b-1 border-secondary"/>
                            </div>
                        )}
                    </div>

                    <ContentsTyped
                        contents={contents}
                        loading={!!(loading && sectionId)}
                        loadingMessage="Chargement des contenus..."
                    />

                    {/* Modules Section */}
                    {sectionId && showModules && (
                        <div className="mt-10">
                            <ModulesList sectionId={sectionId}/>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
