'use client';

import React from 'react';
import clsx from 'clsx';
import MediaImage from '@/components/MediaImage';
import {type ListContentItem, isExternalUrl, getBodyHtml} from './listContent.types';

interface Props {
    contents: ListContentItem[];
    loading?: boolean;
    isDark?: boolean;
}

/**
 * Affichage en colonnes centrées, inspiré de la section "Mission" (pillars) :
 * un repère (visuel ou numéro) au-dessus d'un titre et d'un court texte.
 * Les titres de chaque colonne démarrent à H4 (le titre du module est en H3).
 */
const ListColumnGrid: React.FC<Props> = ({contents, loading = false, isDark = true}) => {
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
            className="grid w-full justify-center gap-10 pt-6"
            style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 260px))'}}
        >
            {contents.map((content, index) => {
                const html = getBodyHtml(content.body);
                const media = content.medias?.[0];
                const hasLink = Boolean(content.linkUrl);
                const external = hasLink ? isExternalUrl(content.linkUrl as string) : false;

                return (
                    <div key={content.id} className="group flex flex-col items-center text-center">
                        {/* Repère : miniature si disponible, sinon numéro d'ordre */}
                        <div
                            className={clsx(
                                'mb-5 flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border transition-colors',
                                isDark
                                    ? 'border-accent text-accent group-hover:bg-accent/10'
                                    : 'border-secondary text-secondary group-hover:bg-secondary/10',
                            )}
                        >
                            {media ? (
                                <MediaImage
                                    mediaId={media.id}
                                    fill
                                    sizes="44px"
                                    alt={media.altText ?? media.title ?? content.title ?? 'Image'}
                                    style={{objectFit: 'cover'}}
                                    className="rounded-full"
                                />
                            ) : (
                                <span className="font-serif text-base">{index + 1}</span>
                            )}
                        </div>

                        {content.title && (
                            <h4
                                className={clsx(
                                    'mb-2 font-serif text-lg font-normal leading-snug transition-colors',
                                    isDark ? 'text-cream group-hover:text-accent' : 'text-primary-dark group-hover:text-secondary',
                                )}
                            >
                                {content.title}
                            </h4>
                        )}

                        {html && (
                            <div
                                className={clsx(
                                    'quill-content force-responsive text-sm leading-relaxed',
                                    isDark ? 'text-cream-dark' : 'text-primary/80',
                                )}
                                dangerouslySetInnerHTML={{__html: html}}
                            />
                        )}

                        {hasLink && (
                            <a
                                href={content.linkUrl}
                                target={external ? '_blank' : undefined}
                                rel={external ? 'noopener noreferrer' : undefined}
                                className={clsx(
                                    'mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] transition-colors',
                                    isDark ? 'text-accent group-hover:text-secondary' : 'text-secondary group-hover:text-primary',
                                )}
                            >
                                En savoir plus
                                <span aria-hidden="true"
                                      className="transition-transform group-hover:translate-x-1">→</span>
                            </a>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ListColumnGrid;
