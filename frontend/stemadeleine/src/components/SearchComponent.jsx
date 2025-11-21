import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import useGetPages from '../hooks/useGetPages';

const SearchComponent = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const {searchPages} = useGetPages();

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const searchResults = await searchPages(query);
                    setResults(searchResults || []);
                    setShowResults(true);
                } catch (error) {
                    console.error('Erreur de recherche:', error);
                    setResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300); // Debounce de 300ms

        return () => clearTimeout(timeoutId);
    }, [query, searchPages]);

    const handleResultClick = () => {
        setQuery('');
        setShowResults(false);
    };

    return (
        <div className="relative">
            <div className="relative">
                <MagnifyingGlassIcon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                <input
                    type="text"
                    placeholder="Rechercher une page..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            {/* Résultats de recherche */}
            {showResults && (
                <div
                    className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
                    {isSearching ? (
                        <div className="p-4 text-center text-gray-500">
                            Recherche en cours...
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <div className="p-2 border-b border-gray-100 text-sm text-gray-500">
                                {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                            </div>
                            {results.map((page) => (
                                <Link
                                    key={page.id}
                                    to={page.slug}
                                    onClick={handleResultClick}
                                    className="block p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="font-medium text-gray-900">{page.name}</div>
                                    {page.description && (
                                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {page.description}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-400 mt-1">
                                        /{page.slug}
                                    </div>
                                </Link>
                            ))}
                        </>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            Aucun résultat trouvé pour "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchComponent;
