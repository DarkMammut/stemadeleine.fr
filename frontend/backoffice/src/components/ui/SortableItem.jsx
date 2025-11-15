"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";
import ModifyButton from "@/components/ui/ModifyButton";
import DeleteButton from "@/components/ui/DeleteButton";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function SortableItem({
  item,
  depth = 0,
  onToggle,
  onEdit,
  onDelete,
  onAddChild, // nouvelle prop optionnelle
  isPlaceholder = false, // nouvelle prop pour les placeholders
}) {
  // Si c'est un placeholder, on rend une version non-draggable avec animation "pulse"
  if (isPlaceholder) {
    return (
      <div className={`mb-2 relative ${depth > 0 ? "child-line" : ""}`}>
        <div className="flex items-center justify-between rounded-xl px-3 py-2 border border-gray-200 shadow bg-white">
          <div className="flex items-center gap-3 flex-1 animate-pulse">
            <div className="w-6 h-6 bg-gray-200 rounded" />
            <div className="w-12 h-6 bg-gray-200 rounded" />
            <div className="ml-4 w-48 h-6 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 bg-gray-200 rounded" />
            <div className="w-8 h-6 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const [visible, setVisible] = useState(item.isVisible);

  useEffect(() => {
    setVisible(item.isVisible);
  }, [item.isVisible]);

  const handleSwitch = (val) => {
    setVisible(val);
    onToggle?.(item, val);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginLeft: depth * 100,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 relative ${depth > 0 ? "child-line" : ""}`}
    >
      <div className="flex items-center justify-between rounded-xl px-3 py-2 border border-gray-200 shadow bg-white text-gray-900">
        {/* Draggable avec Switch */}
        <div className="flex items-center gap-3 flex-1">
          <div
            className="flex items-center gap-2 cursor-move text-gray-900"
            {...attributes}
            {...listeners}
          >
            <span className="text-gray-500">⋮⋮</span>
          </div>
          <Switch checked={visible} onChange={handleSwitch} />
          <span className="font-medium text-gray-900">{item.name}</span>
          {item.moduleType && (
            <span className="text-gray-500 text-sm ml-2">
              ({item.moduleType})
            </span>
          )}
        </div>

        {/* Bouton Ajouter un enfant si la prop existe ET si c'est une section */}
        {onAddChild && item.type === "section" && (
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              onAddChild(item);
            }}
            className="ml-2"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Ajouter un module
          </Button>
        )}

        {/* Non draggable (buttons) */}
        <div className="flex items-center gap-2">
          <ModifyButton
            onModify={() => onEdit?.(item)}
            modifyLabel="Modifier"
            size="sm"
          />
          <DeleteButton
            onDelete={() => onDelete?.(item)}
            deleteLabel="Supprimer"
            size="sm"
            hoverExpand={true}
          />
        </div>
      </div>
    </div>
  );
}
