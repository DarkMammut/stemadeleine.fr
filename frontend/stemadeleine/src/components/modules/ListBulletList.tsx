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

const ListBulletList: React.FC<Props> = ({contents, loading = false, isDark = true}) => {
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
        <ul className={clsx('divide-y pt-6', isDark ? 'divide-cream/10' : 'divide-primary/10')}>
            {contents.map((content) => {
                const html = getBodyHtml(content.body);
                const media = content.medias?.[0];
                const hasLink = Boolean(content.linkUrl);
                const external = hasLink ? isExternalUrl(content.linkUrl as string) : false;

                const TitleTag: React.ElementType = hasLink ? 'a' : 'h4';
                const titleProps = hasLink
                    ? {
                        href: content.linkUrl,
                        target: external ? '_blank' : undefined,
                        rel: external ? 'noopener noreferrer' : undefined,
                    }
                    : {};

                return (
                    <li key={content.id} className="group flex items-center gap-4 py-6 first:pt-0 last:pb-0">
                        {/* Puce */}
                        <span
                            className={clsx(
                                'h-2 w-2 flex-shrink-0 rounded-full transition-colors',
                                isDark ? 'bg-accent group-hover:bg-secondary' : 'bg-secondary group-hover:bg-primary',
                            )}
                            aria-hidden="true"
                        />

                        {/* Miniature optionnelle */}
                        {media && (
                            <div
                                className="relative hidden h-20 w-28 flex-shrink-0 overflow-hidden bg-[#3A3020] shadow-sm sm:flex sm:items-center sm:justify-center">
                                <MediaImage
                                    mediaId={media.id}
                                    fill
                                    sizes="112px"
                                    alt={media.altText ?? media.title ?? content.title ?? 'Image'}
                                    style={{objectFit: 'cover', objectPosition: 'center'}}
                                />
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            {content.title && (
                                <TitleTag
                                    {...titleProps}
                                    className={clsx(
                                        'mb-1 block font-serif text-lg font-normal leading-snug transition-colors',
                                        isDark ? 'text-secondary group-hover:text-accent' : 'text-secondary group-hover:text-primary',
                                    )}
                                >
                                    {content.title}
                                </TitleTag>
                            )}

                            {html && (
                                <div
                                    className={clsx(
                                        'quill-content force-responsive text-sm leading-relaxed',
                                        isDark ? 'text-cream/75' : 'text-primary/80',
                                    )}
                                    dangerouslySetInnerHTML={{__html: html}}
                                />
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default ListBulletList;
