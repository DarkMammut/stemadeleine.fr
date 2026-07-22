'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useGetNewsPublicationByNewsId from '@/hooks/useGetNewsPublicationByNewsId';
import useGetOrganization from '@/hooks/useGetOrganization';
import NewsArticle from '@/components/NewsArticle';

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

    const loading = newsLoading || orgLoading;

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
        <NewsArticle
            news={newsPublication}
            organizationLogo={logoUrl}
        />
    );
}

