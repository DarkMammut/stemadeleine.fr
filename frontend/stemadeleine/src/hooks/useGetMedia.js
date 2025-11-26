'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAxiosClient } from '@/utils/axiosClient';

const useGetMedia = (mediaId) => {
  const [mediaUrl, setMediaUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const axiosClient = useAxiosClient();
  const currentBlobRef = useRef(null);

  const fetchMedia = useCallback(
    async (id) => {
      if (!id) {
        if (currentBlobRef.current) {
          URL.revokeObjectURL(currentBlobRef.current);
          currentBlobRef.current = null;
        }
        setMediaUrl(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Appel du proxy backend
        const response = await axiosClient.get(`/api/public/media/${id}`, {
          responseType: 'blob',
        });
        // Revoke previous blob if any
        if (currentBlobRef.current) {
          URL.revokeObjectURL(currentBlobRef.current);
          currentBlobRef.current = null;
        }
        const url = URL.createObjectURL(response.data);
        currentBlobRef.current = url;
        setMediaUrl(url);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || 'Error loading media',
        );
        setMediaUrl(null);
      } finally {
        setLoading(false);
      }
    },
    [axiosClient],
  );

  useEffect(() => {
    fetchMedia(mediaId);
    // Nettoyage de l'URL blob au démontage
    return () => {
      if (currentBlobRef.current) {
        URL.revokeObjectURL(currentBlobRef.current);
        currentBlobRef.current = null;
      }
    };
  }, [mediaId, fetchMedia]);

  return {
    mediaUrl,
    loading,
    error,
    refetch: () => fetchMedia(mediaId),
  };
};

export default useGetMedia;
