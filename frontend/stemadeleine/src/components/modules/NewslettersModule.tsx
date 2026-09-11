'use client';

import React, {useEffect, useMemo, useState} from 'react';
import clsx from 'clsx';
import Pagination from '@/components/Pagination';
import useGetNewsletterPublications from '@/hooks/useGetNewsletterPublications';
import useGetModules from '@/hooks/useGetModules';
import NewsletterCard from './NewsletterCard';

type NewsletterVariant = 'LAST' | 'LAST3' | 'LAST5' | 'ALL';

const ALL_NEWSLETTERS_PAGE_SIZE = 6;

interface NewsletterDto {
    variant?: string;
    detailPageUrl?: string;
}

export interface NewslettersModuleType {
    id: string;
    moduleId?: string;
    title?: string;
    name?: string;
    type: string;
    isVisible?: boolean;
    sortOrder?: number;
    description?: string;
    variant?: string;
    detailPageUrl?: string;

    [key: string]: unknown;
}

interface Props {
    module: NewslettersModuleType;
    className?: string;
    isDark?: boolean;
}

const NewslettersModule: React.FC<Props> = ({module, className = '', isDark = true}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const {
        publications,
        loading: publicationsLoading,
        error: publicationsError,
        fetchPublications,
    } = useGetNewsletterPublications();

    const modulesHook = useGetModules() as {
        newsletter?: NewsletterDto | null;
        newsletterLoading?: boolean;
        fetchNewsletterByModuleId?: (moduleId: string) => Promise<NewsletterDto | null>;
    };

    const {newsletter, newsletterLoading, fetchNewsletterByModuleId} = modulesHook;

    useEffect(() => {
        fetchPublications().catch(console.error);

        if (module.moduleId) {
            fetchNewsletterByModuleId?.(module.moduleId).catch(console.error);
        }
    }, [module.moduleId, fetchPublications, fetchNewsletterByModuleId]);

    const variant = ((newsletter?.variant || module.variant || 'LAST3').toUpperCase() as NewsletterVariant);
    const basePath = newsletter?.detailPageUrl ?? module.detailPageUrl ?? '/newsletters';

    const sortedPublications = useMemo(() => (
        [...publications]
            .filter((item) => item.isVisible !== false)
            .sort((a, b) => {
                const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
                const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
                return dateB - dateA;
            })
    ), [publications]);

    const totalPages = Math.ceil(sortedPublications.length / ALL_NEWSLETTERS_PAGE_SIZE);
    const effectiveCurrentPage = variant === 'ALL'
        ? Math.min(currentPage, Math.max(totalPages, 1))
        : 1;

    const paginatedAllPublications = useMemo(() => {
        const startIndex = (effectiveCurrentPage - 1) * ALL_NEWSLETTERS_PAGE_SIZE;
        return sortedPublications.slice(startIndex, startIndex + ALL_NEWSLETTERS_PAGE_SIZE);
    }, [effectiveCurrentPage, sortedPublications]);

    const displayedPublications = useMemo(() => {
        switch (variant) {
            case 'LAST':
                return sortedPublications.slice(0, 1);
            case 'LAST5':
                return sortedPublications.slice(0, 5);
            case 'ALL':
                return paginatedAllPublications;
            case 'LAST3':
            default:
                return sortedPublications.slice(0, 3);
        }
    }, [paginatedAllPublications, sortedPublications, variant]);

    if (!module.isVisible) {
        return null;
    }

    if ((publicationsLoading || newsletterLoading) && sortedPublications.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-secondary"></div>
            </div>
        );
    }

    if (publicationsError) {
        return (
            <div className="py-12 text-center text-red-500">
                <p>Erreur lors du chargement des newsletters: {publicationsError}</p>
            </div>
        );
    }

    if (sortedPublications.length === 0) {
        return (
            <div className="py-12 text-center text-accent/70">
                <p>Aucune newsletter disponible pour le moment.</p>
            </div>
        );
    }

    const moduleTitle = module.title || module.name || 'Newsletters';

    return (
        <div className={clsx('w-full mb-6 md:mb-12', className)}>
            <div className="mb-8">
                <h3
                    className={clsx(
                        'font-serif text-[clamp(1.7rem,3vw,2.4rem)] font-normal leading-[1.25] mb-6',
                        isDark ? 'text-accent' : 'text-text-mid',
                    )}
                >
                    {moduleTitle}
                </h3>
            </div>

            {(variant === 'LAST3' || variant === 'LAST5') && (
                <div className="grid grid-cols-1 gap-[1.5px] md:grid-cols-3">
                    {displayedPublications.map((newsletterItem) => (
                        <NewsletterCard
                            key={newsletterItem.id}
                            newsletter={newsletterItem}
                            basePath={basePath}
                            variant="grid"
                        />
                    ))}
                </div>
            )}

            {variant === 'ALL' && (
                <div className="space-y-8">
                    <div className="space-y-[1.5px] bg-[rgba(184,151,58,0.12)]">
                        {displayedPublications.map((newsletterItem) => (
                            <NewsletterCard
                                key={newsletterItem.id}
                                newsletter={newsletterItem}
                                basePath={basePath}
                                variant="list"
                            />
                        ))}
                    </div>

                    <Pagination
                        currentPage={effectiveCurrentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        variant="dark"
                        disabled={publicationsLoading}
                        ariaLabel="Pagination des newsletters"
                    />
                </div>
            )}

            {variant === 'LAST' && displayedPublications[0] && (
                <NewsletterCard
                    newsletter={displayedPublications[0]}
                    basePath={basePath}
                    variant="feature"
                />
            )}
        </div>
    );
};

export default NewslettersModule;
