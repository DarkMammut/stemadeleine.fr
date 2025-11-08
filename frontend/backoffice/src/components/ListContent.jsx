"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusTag from "@/components/ui/StatusTag";
import Switch from "@/components/ui/Switch";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/ui/DeleteButton";

export default function ListContent({
  label,
  getAll,
  updateVisibility,
  remove,
  routePrefix,
}) {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingStates, setSavingStates] = useState({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getAll();
      setItems(data);
    } catch (error) {
      console.error("Error loading items:", error);
      alert(`Erreur lors du chargement des ${label.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityToggle = async (id, isVisible) => {
    try {
      setSavingStates((prev) => ({ ...prev, [id]: true }));
      await updateVisibility(id, isVisible);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isVisible } : item)),
      );
    } catch (error) {
      console.error("Error updating visibility:", error);
      alert("Erreur lors de la mise à jour de la visibilité");
    } finally {
      setSavingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    try {
      await remove(id);
      await loadItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="bg-surface border border-border rounded-lg">
      {items.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <p>Aucune {label.toLowerCase()} trouvée.</p>
          <p className="text-sm mt-2">
            Cliquez sur "Nouvelle {label}" pour commencer.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-text">{item.title}</h3>
                  </div>

                  <p className="text-sm text-text-muted mb-3">
                    {item.description || "Aucune description"}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <StatusTag status={item.status} />
                      <span>
                        Créée le:{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      {item.author && (
                        <span>
                          Par: {item.author.firstname} {item.author.lastname}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={item.isVisible}
                    onChange={(checked) =>
                      handleVisibilityToggle(item.id, checked)
                    }
                    disabled={savingStates[item.id]}
                  />

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      router.push(`/${routePrefix}/${item.id}`);
                    }}
                  >
                    Edit
                  </Button>

                  <DeleteButton
                    onDelete={() => handleDelete(item.id)}
                    size="sm"
                    deleteLabel="Supprimer"
                    confirmTitle="Confirmer la suppression"
                    confirmMessage={`Êtes-vous sûr de vouloir supprimer "${item.title}" ? Cette action est irréversible.`}
                    hoverExpand={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
