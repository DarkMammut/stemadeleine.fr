'use client';

import React, {useEffect} from 'react';
import {useParams, useRouter} from 'next/navigation';
import useGetNewsletterPublicationByNewsletterId from '@/hooks/useGetNewsletterPublicationByNewsletterId';
import useGetOrganization from '@/hooks/useGetOrganization';
import useGetMedia from '@/hooks/useGetMedia';
import NewsletterMagazine from '@/components/NewsletterMagazine';

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
        settings,
        loading: orgLoading,
    } = useGetOrganization();

    // Récupérer l'URL du logo via useGetMedia
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settingsAny = settings as any;
    const logoMediaId = settingsAny?.logo_media_id ? String(settingsAny.logo_media_id) : undefined;
    const {mediaUrl: logoUrl, loading: logoLoading} = useGetMedia(logoMediaId) as {
        mediaUrl: string | null;
        loading: boolean;
    };

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

    const loading = newsletterLoading || orgLoading || logoLoading;

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
        <NewsletterMagazine
            newsletter={newsletter}
            organizationLogo={logoUrl || '/logo.png'}
        />
    );
}
