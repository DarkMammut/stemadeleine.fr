'use client';

import React, {useEffect} from 'react';
import useGetNewsletterPublications from '@/hooks/useGetNewsletterPublications';
import NewsletterCard from '@/components/modules/NewsletterCard';
import Layout from '@/components/Layout';

export default function NewslettersPage() {
    const {publications, loading, error, fetchPublications} = useGetNewsletterPublications();

    useEffect(() => {
        fetchPublications();
    }, [fetchPublications]);

    const page = {
        title: 'Nos Newsletters',
        description: 'Consultez toutes nos newsletters',
        name: 'Newsletters',
    };

    if (loading && publications.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <Layout page={page}>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-red-500 text-center">
                        <h2 className="text-2xl font-bold mb-4">Erreur</h2>
                        <p>{error}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout page={page}>
            <main className="mt-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Nos Newsletters
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Découvrez toutes nos publications et restez informé de nos actualités
                        </p>
                    </div>

                    {publications.length === 0 ? (
                        <div className="mx-auto mt-16 max-w-2xl text-center">
                            <p className="text-gray-500">Aucune newsletter disponible pour le moment.</p>
                        </div>
                    ) : (
                        <div className="mt-16 space-y-8">
                            {publications.map((newsletter) => (
                                <NewsletterCard
                                    key={newsletter.id}
                                    newsletter={newsletter}
                                    basePath="/newsletters"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
}

