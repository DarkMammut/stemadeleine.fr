"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import IconButton from "@/components/ui/IconButton";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function SortableItem({
  item,
  depth = 0,
  onToggle,
  onEdit,
  onDelete,
  onAddChild, // nouvelle prop optionnelle
}) {
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
        </div>

        {/* Bouton Ajouter un enfant si la prop existe ET si c'est une section */}
        {onAddChild && item.type === "section" && (
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              console.log("🟢 Add module button clicked for section:", item);
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
          <IconButton
            icon={PencilIcon}
            label="Modifier"
            variant="secondary"
            hoverExpand={true}
            size="sm"
            onClick={() => onEdit?.(item)}
          />
          <IconButton
            icon={TrashIcon}
            label="Supprimer"
            variant="danger"
            hoverExpand={true}
            size="sm"
            onClick={() => onDelete?.(item)}
          />
        </div>
      </div>
    </div>
  );
}
