'use client';

import React, {useEffect, useMemo} from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import useGetNewsPublications from '@/hooks/useGetNewsPublications';
import {NewsPublication} from '@/types/news';

type NewsVariant = 'LAST' | 'LAST3' | 'LAST5' | 'ALL';
const ALL_NEWS_PAGE_SIZE = 6;

export interface NewsModuleType {
    id: string;
    moduleId?: string;
    title?: string;
    name?: string;
    type: string;
    isVisible?: boolean;
    sortOrder?: number;
    description?: string;
    variant?: string;

    [key: string]: unknown;
}

interface Props {
    module: NewsModuleType;
    className?: string;
}

function formatNewsDate(publishedDate?: string): string | null {
    if (!publishedDate) {
        return null;
    }

    const date = new Date(publishedDate);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const monthYear = date.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
    });

    return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
}

function getNewsImageUrl(news: NewsPublication): string | null {
    const media = news.media as (NewsPublication['media'] & { url?: string }) | undefined;
    return media?.fileUrl ?? media?.url ?? null;
}

function getNewsHref(news: NewsPublication): string | null {
    const newsId = news.newsId?.trim();
    return newsId ? `/actualites/${encodeURIComponent(newsId)}` : null;
}

function NewsGridCard({news}: { news: NewsPublication }) {
    const imageUrl = getNewsImageUrl(news);
    const dateLabel = formatNewsDate(news.publishedDate);
    const title = news.title || news.name;
    const description = news.description || '';
    const newsHref = getNewsHref(news);
    const card = (
        <article className="bg-primary p-7 transition-colors duration-200 hover:bg-primary-dark">
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={title}
                    className="mb-5 h-40 w-full object-cover bg-primary transition duration-300"
                    style={{filter: 'brightness(0.82)'}}
                />
            ) : (
                <div className="mb-5 h-40 w-full bg-primary flex items-center justify-center text-secondary">
                    ✦
                </div>
            )}
            {dateLabel && (
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
                    {dateLabel}
                </div>
            )}
            <h3 className="font-serif text-cream-dark text-base font-normal leading-[1.4] mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-[13px] leading-[1.6] text-cream">
                    {description}
                </p>
            )}
        </article>
    );

    if (!newsHref) {
        return card;
    }

    return (
        <Link href={newsHref} className="block">
            {card}
        </Link>
    );
}

function NewsListCard({news}: { news: NewsPublication }) {
    const imageUrl = getNewsImageUrl(news);
    const dateLabel = formatNewsDate(news.publishedDate);
    const title = news.title || news.name;
    const newsHref = getNewsHref(news);
    const article = (
        <article
            className="bg-stone p-6 md:p-7 flex flex-col md:flex-row gap-5 md:gap-6 hover:bg-[#3A3020] transition-colors duration-200"
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={title}
                    className="h-40 md:h-28 md:w-48 w-full object-cover bg-[#3A3020] shrink-0"
                    style={{filter: 'brightness(0.82)'}}
                />
            ) : (
                <div
                    className="h-40 md:h-28 md:w-48 w-full bg-[#3A3020] shrink-0 flex items-center justify-center text-gold">
                    ✦
                </div>
            )}
            <div>
                {dateLabel && (
                    <div
                        className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                        {dateLabel}
                    </div>
                )}
                <h3 className="font-serif text-cream text-lg font-normal leading-[1.35] mb-2">
                    {title}
                </h3>
                {news.description && (
                    <p className="text-[13px] leading-[1.65] text-[rgba(247,242,232,0.45)]">
                        {news.description}
                    </p>
                )}
            </div>
        </article>
    );

    if (!newsHref) {
        return article;
    }

    return (
        <Link href={newsHref} className="block">
            {article}
        </Link>
    );
}

const NewsModule: React.FC<Props> = ({module, className = ''}) => {
    const {
        publications,
        loading,
        error,
        pagination,
        fetchPublications,
        goToPage,
    } = useGetNewsPublications();

    const variant = (module.variant?.toUpperCase() as NewsVariant) || 'LAST3';
    const pageSize = useMemo(() => {
        switch (variant) {
            case 'LAST':
                return 1;
            case 'LAST5':
                return 5;
            case 'ALL':
                return ALL_NEWS_PAGE_SIZE;
            case 'LAST3':
            default:
                return 3;
        }
    }, [variant]);

    useEffect(() => {
        if (variant !== 'ALL' && pagination.currentPage !== 1) {
            goToPage(1);
        }
    }, [goToPage, pagination.currentPage, variant]);

    useEffect(() => {
        fetchPublications({
            page: variant === 'ALL' ? pagination.currentPage : 1,
            size: pageSize,
        }).catch(console.error);
    }, [fetchPublications, pageSize, pagination.currentPage, variant]);

    const displayedPublications = useMemo(() => publications.filter((item) => item.isVisible !== false), [publications]);

    if (!module.isVisible) {
        return null;
    }

    if (loading && displayedPublications.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500">
                <p>Erreur lors du chargement des actualités: {error}</p>
            </div>
        );
    }

    if (displayedPublications.length === 0) {
        return (
            <div className="text-center py-12 text-text-light">
                <p>Aucune actualité disponible pour le moment.</p>
            </div>
        );
    }

    const moduleTitle = module.title || module.name || 'Actualités';
    const latestNews = displayedPublications[0];
    const latestNewsImageUrl = latestNews ? getNewsImageUrl(latestNews) : null;
    const latestNewsDate = latestNews ? formatNewsDate(latestNews.publishedDate) : null;
    const latestNewsHref = latestNews ? getNewsHref(latestNews) : null;

    return (
        <div
            className={clsx(
                'w-full',
                className,
            )}
        >
            <div className="mb-8">
                <h3 className="font-serif text-[clamp(1.7rem,3vw,2.4rem)] text-cream font-normal leading-[1.25]">
                    {moduleTitle}
                </h3>
            </div>

            {(variant === 'LAST3' || variant === 'LAST5') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5px]">
                    {displayedPublications.map((news) => (
                        <NewsGridCard key={news.id} news={news}/>
                    ))}
                </div>
            )}

            {variant === 'ALL' && (
                <div className="space-y-8">
                    <div className="space-y-[1.5px] bg-[rgba(184,151,58,0.12)]">
                        {displayedPublications.map((news) => (
                            <NewsListCard key={news.id} news={news}/>
                        ))}
                    </div>

                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={goToPage}
                        variant="dark"
                        disabled={loading}
                        ariaLabel="Pagination des actualites"
                    />
                </div>
            )}

            {variant === 'LAST' && latestNews && (
                (latestNewsHref ? (
                    <Link href={latestNewsHref} className="block">
                        <article
                            className="bg-stone border border-[rgba(184,151,58,0.12)] p-6 md:p-8 hover:bg-[#3A3020] transition-colors duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-6">
                                {latestNewsImageUrl ? (
                                    <img
                                        src={latestNewsImageUrl}
                                        alt={latestNews.title || latestNews.name}
                                        className="h-52 md:h-full w-full object-cover bg-[#3A3020]"
                                        style={{filter: 'brightness(0.82)'}}
                                    />
                                ) : (
                                    <div
                                        className="h-52 md:h-full w-full bg-[#3A3020] flex items-center justify-center text-gold">
                                        ✦
                                    </div>
                                )}
                                <div className="flex flex-col justify-center">
                                    {latestNewsDate && (
                                        <div
                                            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                                            {latestNewsDate}
                                        </div>
                                    )}
                                    <h3 className="font-serif text-cream text-2xl font-normal leading-[1.3] mb-3">
                                        {latestNews.title || latestNews.name}
                                    </h3>
                                    {latestNews.description && (
                                        <p className="text-sm leading-[1.7] text-[rgba(247,242,232,0.55)]">
                                            {latestNews.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </article>
                    </Link>
                ) : (
                    <article
                        className="bg-stone border border-[rgba(184,151,58,0.12)] p-6 md:p-8 hover:bg-[#3A3020] transition-colors duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-6">
                            {latestNewsImageUrl ? (
                                <img
                                    src={latestNewsImageUrl}
                                    alt={latestNews.title || latestNews.name}
                                    className="h-52 md:h-full w-full object-cover bg-[#3A3020]"
                                    style={{filter: 'brightness(0.82)'}}
                                />
                            ) : (
                                <div
                                    className="h-52 md:h-full w-full bg-[#3A3020] flex items-center justify-center text-gold">
                                    ✦
                                </div>
                            )}
                            <div className="flex flex-col justify-center">
                                {latestNewsDate && (
                                    <div
                                        className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                                        {latestNewsDate}
                                    </div>
                                )}
                                <h3 className="font-serif text-cream text-2xl font-normal leading-[1.3] mb-3">
                                    {latestNews.title || latestNews.name}
                                </h3>
                                {latestNews.description && (
                                    <p className="text-sm leading-[1.7] text-[rgba(247,242,232,0.55)]">
                                        {latestNews.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </article>
                ))
            )}
        </div>
    );
};

export default NewsModule;
