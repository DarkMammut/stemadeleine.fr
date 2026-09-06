'use client';

import React from 'react';
import clsx from 'clsx';
import MediaImage from '@/components/MediaImage';
import type {ListContentItem} from './ListCardGrid';

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
                    <li key={content.id} className="group flex items-start gap-4 py-6 first:pt-0 last:pb-0">
                        {/* Puce */}
                        <span
                            className={clsx(
                                'mt-2.5 h-2 w-2 flex-shrink-0 rounded-full transition-colors',
                                isDark ? 'bg-accent group-hover:bg-secondary' : 'bg-secondary group-hover:bg-primary',
                            )}
                            aria-hidden="true"
                        />

                        {/* Miniature optionnelle */}
                        {media && (
                            <div className="relative hidden h-20 w-28 flex-shrink-0 overflow-hidden bg-[#3A3020] sm:block">
                                <MediaImage
                                    mediaId={media.id}
                                    fill
                                    sizes="112px"
                                    alt={media.altText ?? media.title ?? content.title ?? 'Image'}
                                    style={{objectFit: 'cover'}}
                                />
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            {content.title && (
                                <TitleTag
                                    {...titleProps}
                                    className={clsx(
                                        'mb-1 block font-serif text-lg font-normal leading-snug transition-colors',
                                        isDark ? 'text-cream group-hover:text-accent' : 'text-primary-dark group-hover:text-secondary',
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
