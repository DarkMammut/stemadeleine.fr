'use client';

import React, { useEffect } from 'react';
import useGetNewsPublications from '@/hooks/useGetNewsPublications';
import NewsPublicationCard from '@/components/modules/NewsPublicationCard';
import Layout from '@/components/Layout';

export default function ActualitesPage() {
    const { publications, loading, error, fetchPublications } = useGetNewsPublications();

    useEffect(() => {
        fetchPublications();
    }, [fetchPublications]);

    const page = {
        title: 'Nos Actualités',
        description: 'Consultez toutes nos actualités',
        name: 'Actualités',
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
                            Nos Actualités
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Retrouvez toutes nos dernières actualités et restez informés de la vie de la paroisse
                        </p>
                    </div>

                    {publications.length === 0 ? (
                        <div className="mx-auto mt-16 max-w-2xl text-center">
                            <p className="text-gray-500">Aucune actualité disponible pour le moment.</p>
                        </div>
                    ) : (
                        <div className="mt-16 space-y-8">
                            {publications.map((news) => (
                                <NewsPublicationCard
                                    key={news.id}
                                    news={news}
                                    basePath="/actualites"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
}

