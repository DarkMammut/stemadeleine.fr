'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useGetNewsPublicationByNewsId from '@/hooks/useGetNewsPublicationByNewsId';
import useGetOrganization from '@/hooks/useGetOrganization';
import NewsArticle from '@/components/NewsArticle';
import useGetPages from '@/hooks/useGetPages';
import Layout from '@/components/Layout';

const ACTUALITES_SLUG = '/actualites';

type PageShape = {
    name?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    keywords?: string;
    heroMedia?: { id?: string | number } | null;
    pageId?: string | number;
    slug?: string;
};

export default function ActualitePage() {
    const params = useParams();
    const router = useRouter();
    const newsId = params?.newsId as string | undefined;

    const {
        newsPublication,
        loading: newsLoading,
        error: newsError,
        fetchNewsByNewsId,
    } = useGetNewsPublicationByNewsId();

    const {
        settings,
        loading: orgLoading,
    } = useGetOrganization();

    const {
        fetchPageBySlug,
        loading: pageLoading,
    } = useGetPages();

    const [page, setPage] = React.useState<PageShape | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadPage = async () => {
            const pageData = await fetchPageBySlug(ACTUALITES_SLUG);

            if (!mounted) return;
            if (pageData) {
                setPage(pageData as PageShape);
            }
        };

        loadPage();

        return () => {
            mounted = false;
        };
    }, [fetchPageBySlug]);

    useEffect(() => {
        if (newsId) {
            fetchNewsByNewsId(newsId);
        }
    }, [newsId, fetchNewsByNewsId]);

    // Rediriger vers 404 si l'actualité n'est pas trouvée
    useEffect(() => {
        if (!newsLoading && newsError) {
            router.replace('/404');
        }
    }, [newsLoading, newsError, router]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settingsAny = settings as any;
    const logoUrl = settingsAny?.logoUrl || '/logo.png';

    const loading = newsLoading || orgLoading || pageLoading;

    if (loading && !newsPublication) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (newsError && !newsPublication) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500 text-center">
                    <h2 className="text-2xl font-bold mb-4">Erreur</h2>
                    <p>{newsError}</p>
                </div>
            </div>
        );
    }

    if (!newsPublication) {
        return null;
    }

    return (
        <Layout
            page={
                page || {
                    name: 'Actualités',
                    title: 'Actualités',
                    slug: ACTUALITES_SLUG,
                }
            }
        >
            <main>
                <NewsArticle
                    news={newsPublication}
                    organizationLogo={logoUrl}
                />
            </main>
        </Layout>
    );
}
