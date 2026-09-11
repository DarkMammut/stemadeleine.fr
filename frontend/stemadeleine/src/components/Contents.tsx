import React from 'react';
import clsx from 'clsx';
import MediaImage from '@/components/MediaImage';

type Media = {
    id: string | number;
    fileName?: string;
    fileUrl: string;
    title?: string;
    altText?: string;
    caption?: string;
};

export type SharedContentItem = {
    id?: string | number;
    contentId?: string;
    title?: string;
    type?: string;
    data?: string;
    body?: string | { html?: string } | Record<string, unknown>;
    mediaId?: string | number;
    layout?: 'left' | 'right' | 'staggered';
    medias?: Media[];
    sortOrder?: number;
};

export type ContentsTheme = 'light' | 'dark';

type Props = {
    contents?: SharedContentItem[];
    loading?: boolean;
    loadingMessage?: string;
    layout?: 'left' | 'right' | 'staggered';
    variant?: 'default' | 'news';
    theme?: ContentsTheme;
};

export default function Contents({
                                     contents = [],
                                     loading = false,
                                     loadingMessage = 'Chargement des contenus...',
                                     layout = 'staggered',
                                     variant = 'default',
                                     theme = 'light',
                                 }: Props): React.ReactElement | null {
    const isDarkTheme = theme === 'dark';
    // Type guard pour détecter les objets contenant du HTML
    const isHtmlBody = (b: SharedContentItem['body']): b is { html: string } => {
        return (
            typeof b === 'object' &&
            b !== null &&
            'html' in b &&
            typeof (b as { html?: unknown }).html === 'string'
        );
    };

    const renderContentBody = (body: SharedContentItem['body']): React.ReactNode => {
        if (isHtmlBody(body)) {
            return <div className="quill-content force-responsive no-word-break"
                        dangerouslySetInnerHTML={{__html: body.html}}/>;
        }

        if (typeof body === 'object') {
            return (
                <pre
                    className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm max-w-full overflow-x-auto">
          {JSON.stringify(body, null, 2)}
        </pre>
            );
        }

        return <p className="force-responsive">{body}</p>;
    };

    const getNewsHtmlFromBody = (content: SharedContentItem): string => {
        if (!content.body) return content.data || '';
        if (typeof content.body === 'string') {
            try {
                const parsed = JSON.parse(content.body);
                return parsed.html || content.data || '';
            } catch {
                return content.body;
            }
        }
        if (isHtmlBody(content.body)) {
            return content.body.html || content.data || '';
        }
        return content.data || '';
    };

    const isSignificantNewsHtml = (html: string): boolean => {
        if (!html || !html.trim()) return false;
        const placeholders = [
            '<p>Start writing your news content here...</p>',
            '<p></p>',
            '<p><br></p>',
            '<p><br/></p>',
            '<p>&nbsp;</p>',
        ];
        return !placeholders.includes(html.trim());
    };

    const renderDefaultContent = (content: SharedContentItem, index: number) => {
        if (!content.body) return null;

        const contentLayout = content.layout || layout;
        let imageFirst: boolean;

        const medias = content.medias ?? [];

        switch (contentLayout) {
            case 'left':
                imageFirst = false;
                break;
            case 'right':
                imageFirst = true;
                break;
            case 'staggered':
            default:
                imageFirst = index % 2 !== 0;
                break;
        }

        const key = content.id != null ? String(content.id) : `content-${index}`;

        return (
            <div key={key} className="">
                <div
                    className={clsx(
                        'mx-auto max-w-7xl mb-4 md:mb-8 flex flex-col items-start md:gap-4 gap-10',
                        medias.length > 0 && 'lg:flex-row',
                    )}
                >
                    {/* Texte */}
                    <div
                        className={clsx(
                            'flex-1',
                            medias.length > 0 && 'flex-basis-full lg:flex-basis-auto',
                            imageFirst && medias.length > 0 && 'lg:order-2',
                        )}
                    >
                        {content.title && (
                            <h3 className={clsx('mb-6 text-4xl tracking-tight no-word-break', isDarkTheme ? 'text-accent' : 'text-text-mid')}>
                                {content.title}
                            </h3>
                        )}

                        <div
                            className={clsx(
                                'tracking-tight leading-relaxed text-justify force-responsive no-word-break',
                                isDarkTheme ? 'text-accent' : 'text-text-mid',
                            )}
                        >
                            {renderContentBody(content.body)}
                        </div>
                    </div>

                    {/* Images */}
                    {medias.length > 0 && (
                        <div
                            className={clsx(
                                'flex-1 flex justify-center',
                                imageFirst && medias.length > 0 && 'lg:order-1',
                            )}
                        >
                            {medias.length === 1 ? (
                                // Single image: about-grid style
                                <div className="about-img-wrap relative w-full lg:w-80">
                                    <div className="relative w-full aspect-[3/4] overflow-hidden">
                                        <MediaImage
                                            mediaId={medias[0].id}
                                            style={{objectFit: 'cover'}}
                                            fill={true}
                                            sizes="(max-width: 1024px) 100vw, 320px"
                                            preload={index === 0}
                                            alt={medias[0].altText || medias[0].title || 'Image'}
                                        />
                                    </div>
                                </div>
                            ) : (
                                // Multiple images: gallery grid style
                                <div className="w-full">
                                    <div
                                        className={clsx(
                                            'grid gap-3',
                                            medias.length === 2 && 'grid-cols-2',
                                            medias.length === 3 && 'grid-cols-3',
                                            medias.length >= 4 &&
                                            'grid-cols-2 lg:grid-cols-4',
                                        )}
                                    >
                                        {medias.slice(0, 6).map((media, i) => (
                                            <div
                                                key={String(media.id)}
                                                className={clsx(
                                                    'relative overflow-hidden aspect-square',
                                                    medias.length >= 4 && i === 0 &&
                                                    'col-span-2 lg:col-span-2 row-span-2',
                                                )}
                                            >
                                                <MediaImage
                                                    mediaId={media.id}
                                                    style={{objectFit: 'cover'}}
                                                    fill={true}
                                                    sizes="(max-width: 768px) 50vw, 300px"
                                                    preload={index === 0 && i === 0}
                                                    alt={media.altText || media.title || 'Image'}
                                                />
                                                {/* Gallery caption on hover */}
                                                {media.title && (
                                                    <div
                                                        className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                                                        <p className="text-xs text-accent italic">
                                                            {media.title}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderNewsContent = (content: SharedContentItem, index: number) => {
        const key = content.id != null ? String(content.id) : content.contentId || `content-${index}`;
        const htmlContent = getNewsHtmlFromBody(content);
        const hasSignificantHtml = isSignificantNewsHtml(htmlContent);
        const hasMedia = (content.medias && content.medias.length > 0) || content.mediaId;
        const mediaId = content.medias && content.medias.length > 0 ? content.medias[0].id : content.mediaId;
        const mediaAltText = content.medias && content.medias.length > 0
            ? content.medias[0].altText || content.medias[0].title
            : undefined;
        const mediaCaption = content.medias && content.medias.length > 0
            ? content.medias[0].caption
            : undefined;

        if (!hasSignificantHtml && !mediaId) {
            return null;
        }

        return (
            <article
                key={key}
                className={clsx(
                    'py-8 first:pt-0 last:pb-0',
                    isDarkTheme ? 'border-b border-accent-light' : 'border-b border-accent-dark',
                )}
            >
                {content.title && (
                    <h3 className={clsx('mb-4 text-2xl font-normal tracking-tight', isDarkTheme ? 'text-accent' : 'text-text-mid')}>
                        {content.title}
                    </h3>
                )}

                {hasMedia && mediaId && (
                    <div
                        className={clsx('mb-4 w-full overflow-hidden rounded-xl', isDarkTheme ? 'bg-white/5' : 'bg-primary/10')}>
                        <MediaImage
                            mediaId={mediaId}
                            alt={mediaAltText || content.title || 'Image'}
                            width={1400}
                            height={900}
                            imgClassName="block h-auto w-full rounded-xl"
                            className="rounded-xl"
                        />
                    </div>
                )}

                {(mediaCaption || content.data) && (
                    <p className={clsx('mb-4 text-sm italic', isDarkTheme ? 'text-accent-dark' : 'text-secondary-light')}>
                        {mediaCaption || content.data}
                    </p>
                )}

                {hasSignificantHtml && (
                    <div
                        className={clsx(
                            'quill-content prose prose-lg max-w-none leading-relaxed',
                            isDarkTheme ? 'text-accent prose-headings:text-accent prose-p:text-accent prose-a:text-accent prose-strong:text-accent' : 'text-secondary-light prose-headings:text-text-dark prose-p:text-text-mid prose-a:text-secondary prose-strong:text-text-dark',
                        )}
                        dangerouslySetInnerHTML={{__html: htmlContent}}
                    />
                )}
            </article>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">{loadingMessage}</span>
            </div>
        );
    }

    if (!contents || contents.length === 0) {
        return null;
    }

    return <div>{contents.map(variant === 'news' ? renderNewsContent : renderDefaultContent)}</div>;
}
