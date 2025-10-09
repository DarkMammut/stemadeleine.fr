import React from 'react';
import {Link} from 'react-router-dom';
import useGetPages from '../hooks/useGetPages';

const HomePage = () => {
    const {tree, loading, error} = useGetPages();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500 text-center">
                    <h2 className="text-2xl font-bold mb-4">Erreur</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Pages mises en avant (vous pouvez adapter la logique selon vos besoins)
    const featuredPages = tree.filter(page => page.isVisible).slice(0, 6);

    return (
        <div className="pt-16 md:pt-20 lg:pt-24 min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Bienvenue sur Sainte-Madeleine
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Découvrez notre paroisse, nos activités et notre communauté
                    </p>
                    <Link
                        to="/association/don"
                        className="inline-flex items-center px-8 py-3 bg-primary hover:bg-primary-600 text-white rounded-lg text-lg font-semibold transition-colors"
                    >
                        Faire un don
                    </Link>
                </div>
            </section>

            {/* Pages en vedette */}
            {featuredPages.length > 0 && (
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            Découvrir nos pages
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredPages.map((page) => (
                                <Link
                                    key={page.id}
                                    to={page.slug}
                                    className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6"
                                >
                                    <h3 className="text-xl font-semibold mb-3 text-gray-900">
                                        {page.name}
                                    </h3>
                                    {page.description && (
                                        <p className="text-gray-600 line-clamp-3">
                                            {page.description}
                                        </p>
                                    )}
                                    <div className="mt-4 text-primary font-medium">
                                        En savoir plus →
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default HomePage;
