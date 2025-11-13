import { useCallback, useEffect, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";

export default function useGetMedia(id) {
  const client = useAxiosClient();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMedia = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await client.get(`/api/media/${id}`);
      setMedia(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [client, id]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return { media, setMedia, fetchMedia, loading };
}
