import { useEffect, useState } from "react";
import { useAxiosClient } from "../utils/axiosClient";

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
      // Appel du proxy backend
      const response = await axiosClient.get(`/api/public/media/${id}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      setMediaUrl(url);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Error loading media",
      );
      setMediaUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(mediaId);
    // Nettoyage de l'URL blob
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaId]);

  return {
    mediaUrl,
    loading,
    error,
    refetch: () => fetchMedia(mediaId),
  };
};

export default useGetMedia;
