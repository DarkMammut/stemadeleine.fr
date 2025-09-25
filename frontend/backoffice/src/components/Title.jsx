import { useState } from "react";
import Flag from "@/components/ui/Flag";
import Button from "@/components/ui/Button";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";

export default function Title({ label = "Title", onPublish }) {
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = async () => {
    if (!onPublish) return;
    try {
      setLoading(true);
      await onPublish();
      setPublished(true);
    } catch (err) {
      console.error("Erreur publication :", err);
    } finally {
      setLoading(false);
    }
  };

  function PublishButton() {
    if (published) {
      return (
        <Flag variant="primary" size="md">
          A jour
        </Flag>
      );
    }
    return (
      <Button
        onClick={handlePublish}
        variant="primary"
        size="md"
        loading={loading}
      >
        <CloudArrowUpIcon className="w-4 h-4 mr-1" />
        Publier
      </Button>
    );
  }

  return (
    <div className="w-full flex justify-between items-center mb-10">
      <h2 className="text-2xl font-semibold mb-4">{label}</h2>
      {onPublish && <PublishButton />}
    </div>
  );
}
