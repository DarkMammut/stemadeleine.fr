import {useEffect, useState} from 'react';
import {useAxiosClient} from '../utils/axiosClient';

const useGetPages = () => {
    const [pages, setPages] = useState([]);
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const axiosClient = useAxiosClient();

    const fetchPages = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosClient.get('/api/public/pages');
            setPages(response.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des pages');
        } finally {
            setLoading(false);
        }
    };

    const fetchPagesTree = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosClient.get('/api/public/pages/tree');
            setTree(response.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erreur lors du chargement de l\'arbre des pages');
        } finally {
            setLoading(false);
        }
    };

    const fetchPageById = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosClient.get(`/api/public/pages/${id}`);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erreur lors du chargement de la page');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchPageBySlug = async (slug) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosClient.get(`/api/public/pages/slug/${slug}`);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erreur lors du chargement de la page');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const searchPages = async (query) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosClient.get(`/api/public/pages/search?query=${encodeURIComponent(query)}`);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erreur lors de la recherche');
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPagesTree();
    }, []);

    return {
        pages,
        tree,
        loading,
        error,
        fetchPages,
        fetchPagesTree,
        fetchPageById,
        fetchPageBySlug,
        searchPages,
    };
};

export default useGetPages;
