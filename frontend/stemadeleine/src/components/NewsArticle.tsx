'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { NewsPublication } from '@/types/news';
import useGetContents from '@/hooks/useGetContents';
import MediaImage from '@/components/MediaImage';

interface NewsArticleProps {
    news: NewsPublication;
    organizationLogo?: string;
}

export default function NewsArticle({
    news,
    organizationLogo = '/logo.png',
}: NewsArticleProps) {
    type MediaItem = {
        id: string;
        title?: string;
        altText?: string;
        fileUrl?: string;
        caption?: string;
    };

    type ContentItem = {
        id?: string;
        contentId?: string;
        type: string;
        data: string;
        body?: string | { html?: string };
        title?: string;
        mediaId?: string;
        medias?: MediaItem[];
        sortOrder?: number;
    };

    const {
        contents: fetchedContents,
        loading: contentsLoading,
        fetchContentsByOwnerId,
    } = useGetContents() as unknown as {
        contents: ContentItem[];
        loading: boolean;
        fetchContentsByOwnerId: (ownerId: string) => Promise<ContentItem[]>;
    };

    useEffect(() => {
        if (news.newsId) {
            fetchContentsByOwnerId(news.newsId).catch(console.error);
        }
    }, [news.newsId, fetchContentsByOwnerId]);

    const getHtmlFromBody = (content: ContentItem): string => {
        if (!content.body) return content.data || '';
        if (typeof content.body === 'string') {
            try {
                const parsed = JSON.parse(content.body);
                return parsed.html || content.data || '';
            } catch {
                return content.body;
            }
        }
        return content.body.html || content.data || '';
    };

    const isSignificantContent = (html: string): boolean => {
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

    const contents = fetchedContents && fetchedContents.length > 0
        ? [...fetchedContents].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        : [];

    const title = news.title || news.name;
    const formattedDate = news.publishedDate
        ? new Date(news.publishedDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : null;

    const renderContent = (content: ContentItem, idx: number) => {
        const key = content.id || idx;
        const htmlContent = getHtmlFromBody(content);
        const hasSignificantHtml = isSignificantContent(htmlContent);
        const hasMedia = (content.medias && content.medias.length > 0) || content.mediaId;
        const mediaId = content.medias && content.medias.length > 0
            ? content.medias[0].id
            : content.mediaId;
        const mediaAltText = content.medias && content.medias.length > 0
            ? content.medias[0].altText || content.medias[0].title
            : undefined;
        const mediaCaption = content.medias && content.medias.length > 0
            ? content.medias[0].caption
            : undefined;

        if (hasMedia && mediaId) {
            return (
                <div key={key} className="mb-8">
                    {content.title && (
                        <h3 className="text-xl font-bold mb-4 text-gray-900">{content.title}</h3>
                    )}
                    <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md mb-3">
                        <MediaImage
                            mediaId={mediaId}
                            alt={mediaAltText || content.title || 'Image'}
                            fill={true}
                            style={{ objectFit: 'cover' }}
                            className="rounded-xl"
                        />
                    </div>
                    {(mediaCaption || content.data) && (
                        <p className="text-sm text-gray-500 italic mb-4">
                            {mediaCaption || content.data}
                        </p>
                    )}
                    {hasSignificantHtml && (
                        <div
                            className="quill-content prose prose-gray prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                    )}
                </div>
            );
        }

        if (hasSignificantHtml) {
            return (
                <div key={key} className="mb-8">
                    {content.title && (
                        <h3 className="text-xl font-bold mb-4 text-gray-900">{content.title}</h3>
                    )}
                    <div
                        className="quill-content prose prose-gray prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header de la page (bannière) */}
            <div className="relative bg-gray-900 min-h-[320px] flex items-end"
                style={
                    news.media?.fileUrl
                        ? {
                              backgroundImage: `url(${news.media.fileUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                          }
                        : {}
                }
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gray-900/60" />

                <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-10">
                    {/* Fil d'Ariane */}
                    <nav className="mb-4 text-sm text-gray-300">
                        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                        <span className="mx-2">/</span>
                        <Link href="/actualites" className="hover:text-white transition-colors">Actualités</Link>
                        <span className="mx-2">/</span>
                        <span className="text-white">{title}</span>
                    </nav>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        {title}
                    </h1>

                    {formattedDate && (
                        <p className="mt-3 text-gray-300 text-sm">
                            Publié le {formattedDate}
                        </p>
                    )}

                    {news.description && (
                        <p className="mt-4 text-lg text-gray-200 max-w-2xl">
                            {news.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Corps de l'article */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Navigation retour */}
                <div className="mb-8">
                    <Link
                        href="/actualites"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <span aria-hidden="true">←</span>
                        Retour aux actualités
                    </Link>
                </div>

                {/* Contenus */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                    {contentsLoading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                        </div>
                    )}

                    {!contentsLoading && contents.length === 0 && (
                        <p className="text-gray-500 text-center py-12 italic">
                            Aucun contenu disponible pour cette actualité.
                        </p>
                    )}

                    {!contentsLoading && contents.map((content, idx) => renderContent(content, idx))}
                </div>

                {/* Footer de l'article */}
                <div className="mt-8 flex items-center justify-between">
                    <Link
                        href="/actualites"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <span aria-hidden="true">←</span>
                        Toutes les actualités
                    </Link>
                    {organizationLogo && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={organizationLogo} alt="Logo" className="h-10 w-10 object-contain opacity-60" />
                    )}
                </div>
            </div>
        </div>
    );
}

