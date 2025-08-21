import { useEffect, useState } from "react";
import axios from "axios";

export default function useGetPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/pages");
        setPages(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  return { pages, loading, error };
}
