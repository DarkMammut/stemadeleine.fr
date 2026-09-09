'use client';

import React from 'react';
import clsx from 'clsx';
import MediaImage from '@/components/MediaImage';
import {getBodyHtml, isExternalUrl, type ListContentItem} from './listContent.types';

interface Props {
    contents: ListContentItem[];
    loading?: boolean;
    isDark?: boolean;
}

/**
 * Cartes classiques avec visuel, titre, extrait de texte et lien optionnel.
 * Variante par défaut de la liste (CARD).
 */
const ListNavCard: React.FC<Props> = ({contents, loading = false, isDark = true}) => {
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
        <div
            className="grid justify-center gap-8 pt-6"
            style={{gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 360px))'}}
        >
            {contents.map((content) => {
                const html = getBodyHtml(content.body);
                const media = content.medias?.[0];
                const hasLink = Boolean(content.linkUrl);
                const external = hasLink ? isExternalUrl(content.linkUrl as string) : false;

                const cardClasses = clsx(
                    'group flex h-full flex-col overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl',
                    isDark ? 'bg-primary border border-secondary hover:border-accent/60' : 'bg-white',
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
                                <h4
                                    className={clsx(
                                        'mb-3 font-serif text-xl font-normal leading-snug',
                                        isDark ? 'text-cream' : 'text-gray-900',
                                    )}
                                >
                                    {content.title}
                                </h4>
                            )}

                            {html && (
                                <div
                                    className={clsx(
                                        'quill-content force-responsive line-clamp-3 text-sm leading-relaxed',
                                        isDark ? 'text-cream-dark' : 'text-gray-600',
                                    )}
                                    dangerouslySetInnerHTML={{__html: html}}
                                />
                            )}

                            {hasLink && (
                                <span
                                    className={clsx(
                                        'mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors',
                                        isDark ? 'text-accent group-hover:text-secondary' : 'text-primary group-hover:text-secondary',
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

export default ListNavCard;
