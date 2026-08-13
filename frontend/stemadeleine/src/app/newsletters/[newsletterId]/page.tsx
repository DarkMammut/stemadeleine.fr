'use client';

import React, {useEffect} from 'react';
import {useParams, useRouter} from 'next/navigation';
import useGetNewsletterPublicationByNewsletterId from '@/hooks/useGetNewsletterPublicationByNewsletterId';
import useGetOrganization from '@/hooks/useGetOrganization';
import useGetPages from '@/hooks/useGetPages';
import NewsletterMagazine from '@/components/NewsletterMagazine';
import Layout from '@/components/Layout';

const NEWSLETTERS_SLUG = '/newsletters';

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

export default function NewsletterPage() {
    const params = useParams();
    const router = useRouter();
    const newsletterId = params?.newsletterId as string | undefined;

    const {
        newsletter,
        loading: newsletterLoading,
        error: newsletterError,
        fetchNewsletterByNewsletterId,
    } = useGetNewsletterPublicationByNewsletterId();

    const {
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
            const pageData = await fetchPageBySlug(NEWSLETTERS_SLUG);
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
        if (newsletterId) {
            fetchNewsletterByNewsletterId(newsletterId);
        }
    }, [newsletterId, fetchNewsletterByNewsletterId]);

    // Rediriger vers la page 404 si la newsletter n'est pas trouvée
    useEffect(() => {
        if (!newsletterLoading && newsletterError) {
            router.replace('/404');
        }
    }, [newsletterLoading, newsletterError, router]);

    const loading = newsletterLoading || orgLoading || pageLoading;

    if (loading && !newsletter) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (newsletterError && !newsletter) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500 text-center">
                    <h2 className="text-2xl font-bold mb-4">Erreur</h2>
                    <p>{newsletterError}</p>
                </div>
            </div>
        );
    }

    if (!newsletter) {
        return null;
    }

    return (
        <Layout
            page={
                page || {
                    name: 'Newsletters',
                    title: 'Newsletters',
                    slug: NEWSLETTERS_SLUG,
                }
            }
        >
            <main className="bg-cream">
                <NewsletterMagazine
                    newsletter={newsletter}
                />
            </main>
        </Layout>
    );
}
