'use client';

import React, {useEffect} from 'react';
import {NewsPublication} from '@/types/news';
import useGetContents from '@/hooks/useGetContents';
import MediaImage from '@/components/MediaImage';
import Button from '@/components/Button';
import Contents, {type SharedContentItem} from '@/components/Contents';

interface NewsArticleProps {
    news: NewsPublication;
    organizationLogo?: string;
}

export default function NewsArticle({
                                        news,
                                    }: NewsArticleProps) {
    const {
        contents: fetchedContents,
        loading: contentsLoading,
        fetchContentsByOwnerId,
    } = useGetContents() as unknown as {
        contents: SharedContentItem[];
        loading: boolean;
        fetchContentsByOwnerId: (ownerId: string) => Promise<SharedContentItem[]>;
    };
    const [isAllNewsHovered, setIsAllNewsHovered] = React.useState(false);

    useEffect(() => {
        if (news.newsId) {
            fetchContentsByOwnerId(news.newsId).catch(console.error);
        }
    }, [news.newsId, fetchContentsByOwnerId]);

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

    return (
        <div className="bg-cream pb-12">
            <article className="mx-auto ">
                <div className="bg-primary py-12 mb-12 w-full">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] font-normal leading-[1.2] tracking-tight text-secondary">
                            {title}
                        </h1>

                        {formattedDate && (
                            <p className="mt-5 text-xs uppercase tracking-[0.1em] text-secondary-light">
                                Publié le {formattedDate}
                            </p>
                        )}

                        {news.description && (
                            <p className="mx-auto mt-7 max-w-3xl text-base leading-[1.8] text-secondary-light md:text-lg">
                                {news.description}
                            </p>
                        )}
                    </div>

                    {(news.media?.fileUrl || news.media?.id) && (
                        <figure
                            className="mx-auto mt-10 max-w-3xl overflow-hidden border border-cream-dark bg-cream shadow-sm">
                            {news.media?.fileUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={news.media.fileUrl}
                                    alt={news.media.altText || title || 'Image de l’actualité'}
                                    className="block h-auto w-full"
                                />
                            ) : news.media?.id ? (
                                <MediaImage
                                    mediaId={news.media.id}
                                    alt={news.media.altText || title || 'Image de l’actualité'}
                                    width={1600}
                                    height={1000}
                                    imgClassName="block h-auto w-full"
                                />
                            ) : null}
                            {news.media.caption && (
                                <figcaption className="px-5 py-3 text-sm italic text-secondary-light">
                                    {news.media.caption}
                                </figcaption>
                            )}
                        </figure>
                    )}
                </div>

                <div
                    className="mx-auto max-w-4xl">
                    {contentsLoading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"/>
                        </div>
                    )}

                    {!contentsLoading && contents.length === 0 && (
                        <p className="py-12 text-center italic text-secondary-light">
                            Aucun contenu disponible pour cette actualité.
                        </p>
                    )}

                    {!contentsLoading && (
                        <Contents contents={contents} theme="light"/>
                    )}
                </div>
                <div className="max-w-2xl mx-auto">
                    <div className="mt-10 mb-10 border-b border-secondary"></div>
                    <div className="flex justify-center">
                        <Button
                            as="a"
                            href="/actualites"
                            variant="outline"
                            size="lg"
                            unstyled={true}
                            onMouseEnter={() => setIsAllNewsHovered(true)}
                            onMouseLeave={() => setIsAllNewsHovered(false)}
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: isAllNewsHovered
                                    ? 'var(--color-primary-light)'
                                    : 'rgba(var(--color-primary-500),0.5)',
                                color: isAllNewsHovered
                                    ? 'rgb(var(--color-primary-50))'
                                    : 'var(--color-primary-light)',
                            }}
                            className="rounded-none border px-9 py-3 text-[11px] font-medium uppercase tracking-[0.14em]"
                        >
                            Toutes les actualités
                        </Button>
                    </div>
                </div>
            </article>
        </div>
    );
}
