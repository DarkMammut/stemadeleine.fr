'use client';

import React from 'react';
import clsx from 'clsx';
import MediaImage from '@/components/MediaImage';
import {isExternalUrl, type ListContentItem} from './listContent.types';

interface Props {
    contents: ListContentItem[];
    loading?: boolean;
    isDark?: boolean;
}

/**
 * Cartes simples de navigation : visuel en avant, titre, sans corps de texte.
 * Sert uniquement à naviguer vers une page/section liée (variante NAV_CARD).
 */
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-6">
            {contents.map((content) => {
                const media = content.medias?.[0];
                const hasLink = Boolean(content.linkUrl);
                const external = hasLink ? isExternalUrl(content.linkUrl as string) : false;

                const tileClasses = clsx(
                    'group relative flex aspect-square w-full flex-col justify-end overflow-hidden rounded-xl border border-secondary/60 bg-[#3A3020] transition-all duration-300 hover:border-accent',
                );

                const tileContent = (
                    <>
                        {media ? (
                            <MediaImage
                                mediaId={media.id}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                alt={media.altText ?? media.title ?? content.title ?? 'Image'}
                                style={{objectFit: 'cover'}}
                                className="transition-transform duration-500 ease-out group-hover:scale-110"
                            />
                        ) : (
                            <div
                                aria-hidden="true"
                                className={clsx(
                                    'absolute inset-0 flex items-center justify-center text-3xl',
                                    isDark ? 'text-cream/20' : 'text-primary/20',
                                )}
                            >
                                ✦
                            </div>
                        )}

                        {/* Voile sombre pour la lisibilité du titre */}
                        <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1E1810]/90 via-[#1E1810]/20 to-transparent transition-opacity duration-300 group-hover:from-[#1E1810]/95"
                            aria-hidden="true"
                        />

                        {content.title && (
                            <h4 className="relative z-10 px-4 pb-4 font-serif text-base font-normal leading-snug text-cream">
                                {content.title}
                            </h4>
                        )}

                        {hasLink && (
                            <span
                                aria-hidden="true"
                                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-cream/40 text-cream transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-accent group-hover:text-accent"
                            >
                                →
                            </span>
                        )}
                    </>
                );

                if (hasLink) {
                    return (
                        <a
                            key={content.id}
                            href={content.linkUrl}
                            target={external ? '_blank' : undefined}
                            rel={external ? 'noopener noreferrer' : undefined}
                            className={tileClasses}
                        >
                            {tileContent}
                        </a>
                    );
                }

                return (
                    <div key={content.id} className={tileClasses}>
                        {tileContent}
                    </div>
                );
            })}
        </div>
    );
};

export default ListCardGrid;
