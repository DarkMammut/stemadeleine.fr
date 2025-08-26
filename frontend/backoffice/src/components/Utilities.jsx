import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useAxiosClient } from "@/utils/axiosClient";

export default function Utilities({ actions = [], apiUrl, data }) {
  const axios = useAxiosClient();
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!data) return;
    setIsDirty(JSON.stringify(data.current) !== JSON.stringify(data.initial));
  }, [data]);

  const handleSave = async () => {
    if (!apiUrl || !data) return;
    try {
      setSaving(true);
      await axios.put(apiUrl, data.current);
    } catch (err) {
      console.error("Erreur sauvegarde :", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full justify-between my-4">
      <div className="flex gap-2">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Button
              key={idx}
              onClick={action.callback}
              variant="primary"
              size="sm"
            >
              {Icon && <Icon className="w-4 h-4 mr-1" />}
              {action.label}
            </Button>
          );
        })}
      </div>

      <div>
        {isDirty && (
          <Button
            onClick={handleSave}
            variant="secondary"
            size="sm"
            loading={saving}
          >
            Sauvegarder
          </Button>
        )}
      </div>
    </div>
  );
}
