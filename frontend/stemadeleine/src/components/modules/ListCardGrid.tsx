'use client';

import React from 'react';
import clsx from 'clsx';
import MediaImage from '@/components/MediaImage';

export type ListContentMedia = {
    id: string;
    fileUrl?: string;
    fileType?: string;
    title?: string;
    altText?: string;
};

export type ListContentItem = {
    id: string;
    contentId?: string;
    title?: string;
    body?: { html?: string } | Record<string, unknown> | null;
    sortOrder?: number;
    isVisible?: boolean;
    linkUrl?: string;
    medias?: ListContentMedia[];
};

interface Props {
    contents: ListContentItem[];
    loading?: boolean;
    isDark?: boolean;
}

function isExternalUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
}

function getBodyHtml(body: ListContentItem['body']): string {
    if (body && typeof body === 'object' && 'html' in body && typeof (body as { html?: unknown }).html === 'string') {
        return (body as { html: string }).html;
    }
    return '';
}

const ListCardGrid: React.FC<Props> = ({contents, loading = false, isDark = true}) => {
    if (loading) {
        return <div className="text-center text-cream/80">Chargement de la liste...</div>;
    }

    if (!contents || contents.length === 0) {
        return (
            <div className="w-full text-center text-cream/70">
                <p>Aucun contenu à afficher</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {contents.map((content) => {
                const html = getBodyHtml(content.body);
                const media = content.medias?.[0];
                const hasLink = Boolean(content.linkUrl);
                const external = hasLink ? isExternalUrl(content.linkUrl as string) : false;

                const cardClasses = clsx(
                    'group flex h-full flex-col overflow-hidden rounded-2xl border border-secondary bg-primary transition-colors duration-300 hover:border-accent/60',
                );

                const cardContent = (
                    <>
                        {media && (
                            <div className="relative aspect-video w-full overflow-hidden bg-[#3A3020]">
                                <MediaImage
                                    mediaId={media.id}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    alt={media.altText ?? media.title ?? content.title ?? 'Image'}
                                    style={{objectFit: 'cover'}}
                                    className="transition-transform duration-500 ease-out group-hover:scale-105"
                                />
                            </div>
                        )}

                        <div className="flex flex-1 flex-col p-6">
                            {content.title && (
                                <h4 className="mb-2 font-serif text-lg font-normal leading-snug text-cream">
                                    {content.title}
                                </h4>
                            )}

                            {html && (
                                <div
                                    className="quill-content force-responsive line-clamp-4 text-sm leading-relaxed text-cream-dark"
                                    dangerouslySetInnerHTML={{__html: html}}
                                />
                            )}

                            {hasLink && (
                                <span
                                    className={clsx(
                                        'mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] transition-colors',
                                        isDark ? 'text-accent group-hover:text-secondary' : 'text-secondary group-hover:text-primary',
                                    )}
                                >
                                    En savoir plus
                                    <span aria-hidden="true"
                                          className="transition-transform group-hover:translate-x-1">→</span>
                                </span>
                            )}
                        </div>
                    </>
                );

                if (hasLink) {
                    return (
                        <a
                            key={content.id}
                            href={content.linkUrl}
                            target={external ? '_blank' : undefined}
                            rel={external ? 'noopener noreferrer' : undefined}
                            className={cardClasses}
                        >
                            {cardContent}
                        </a>
                    );
                }

                return (
                    <div key={content.id} className={cardClasses}>
                        {cardContent}
                    </div>
                );
            })}
        </div>
    );
};

export default ListCardGrid;
