import { useState } from "react";
import Flag from "@/components/ui/Flag";
import Button from "@/components/ui/Button";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";
import { useAxiosClient } from "@/utils/axiosClient";

export default function Title({ label = "Title", apiUrl, data }) {
  const axios = useAxiosClient();
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = async () => {
    if (!data || !apiUrl) return;
    try {
      setLoading(true);
      const updatedData = data.map((p) => ({ ...p, status: "PUBLISHED" }));
      await axios.put(apiUrl, updatedData);
      setPublished(true);
    } catch (err) {
      console.error("Erreur publication :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-between items-center mb-10">
      <h2 className="text-2xl font-semibold mb-4">{label}</h2>
      {published ? (
        <Flag variant="primary" size="md">
          A jour
        </Flag>
      ) : (
        <Button
          onClick={handlePublish}
          variant="primary"
          size="md"
          loading={loading}
        >
          <CloudArrowUpIcon className="w-4 h-4 mr-1" />
          Publier
        </Button>
      )}
    </div>
  );
}
