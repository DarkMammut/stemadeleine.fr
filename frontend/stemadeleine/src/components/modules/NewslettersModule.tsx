'use client';

import React, {useEffect, useMemo} from 'react';
import clsx from 'clsx';
import useGetNewsletterPublications from '@/hooks/useGetNewsletterPublications';
import useGetModules from '@/hooks/useGetModules';
import NewsletterCard from './NewsletterCard';

// Local types for the newsletter DTO returned by the backend
interface NewsletterDto {
    variant?: string;
    detailPageUrl?: string;
    // other fields omitted on purpose
}

export interface NewslettersModuleType {
    id: string;
    moduleId?: string;
    title?: string;
    name?: string;
    type: string;
    isVisible?: boolean;
    sortOrder?: number;
    mediaId?: string;
    description?: string;
    createdAt?: string;

    [key: string]: unknown;
}

interface Props {
    module: NewslettersModuleType;
    className?: string;
}

const NewslettersModule: React.FC<Props> = ({module, className = ''}) => {
    const {
        publications,
        loading: publicationsLoading,
        error: publicationsError,
        fetchPublications
    } = useGetNewsletterPublications();

    // Cast proprement le hook JS vers une interface connue localement
    const modulesHook = useGetModules() as unknown as {
        newsletter?: NewsletterDto | null;
        newsletterLoading?: boolean;
        fetchNewsletterByModuleId?: (moduleId: string) => Promise<NewsletterDto | null>;
    };

    const {newsletter, newsletterLoading, fetchNewsletterByModuleId} = modulesHook;

    useEffect(() => {
        // On récupère toujours les publications
        fetchPublications().catch(console.error);

        // On récupère les infos du module newsletter (variant, etc.)
        if (module.moduleId) {
            fetchNewsletterByModuleId?.(module.moduleId).catch(console.error);
        }
    }, [module.moduleId, fetchPublications, fetchNewsletterByModuleId]);

    // Utiliser l'URL du backend, sans fallback si non définie
    const basePath = newsletter?.detailPageUrl ?? null;

    // Filtrer les publications selon le variant
    const filteredPublications = useMemo(() => {
        if (!publications || publications.length === 0) {
            return [];
        }

        const variant = newsletter?.variant?.toUpperCase();

        // Trier par date de publication décroissante
        const sorted = [...publications].sort((a, b) => {
            const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
            const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
            return dateB - dateA;
        });

        // Filtrer selon le variant
        switch (variant) {
            case 'LAST':
                return sorted.slice(0, 1);
            case 'LAST3':
                return sorted.slice(0, 3);
            case 'LAST5':
                return sorted.slice(0, 5);
            case 'ALL':
            default:
                return sorted;
        }
    }, [publications, newsletter?.variant]);

    if (!module.isVisible) {
        return null;
    }

    const isLoading = publicationsLoading || Boolean(newsletterLoading);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (publicationsError) {
        return (
            <div className="text-center py-12 text-red-500">
                <p>Erreur lors du chargement des newsletters: {publicationsError}</p>
            </div>
        );
    }

    if (filteredPublications.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Aucune newsletter disponible pour le moment.</p>
            </div>
        );
    }

    return (
        <section
            className={clsx(
                'w-full my-6 md:my-12 py-6 md:py-12 px-4 md:px-8',
                className,
            )}
        >
            {/* Module Header */}
            <div className="mb-6 pb-6">
                {module.title && (
                    <h3 className="text-4xl text-gray-900 mb-4">{module.title}</h3>
                )}
                {module.description && (
                    <p className="mt-2 text-gray-600">{module.description}</p>
                )}
            </div>

            {/* Newsletters List */}
            <div className="space-y-8">
                {filteredPublications.map((newsletter) => (
                    <NewsletterCard
                        key={newsletter.id}
                        newsletter={newsletter}
                        basePath={basePath}
                    />
                ))}
            </div>
        </section>
    );
};

export default NewslettersModule;

