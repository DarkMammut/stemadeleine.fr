import {useState, useEffect} from 'react';
import {useAxiosClient} from '../utils/axiosClient';

const useGetMedia = (mediaId) => {
    const [mediaUrl, setMediaUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const axiosClient = useAxiosClient();

    const fetchMedia = async (id) => {
        if (!id) {
            setMediaUrl(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Construire l'URL du média via l'API backend
            const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";
            const url = `${backendUrl}/api/public/media/${id}`;
            setMediaUrl(url);
        } catch (err) {
            setError(err.message || 'Error loading media');
            setMediaUrl(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia(mediaId);
    }, [mediaId]);

    return {
        mediaUrl,
        loading,
        error,
        refetch: () => fetchMedia(mediaId)
    };
};

export default useGetMedia;
