"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";
import { useEffect, useState } from "react";

export default function SortableItem({
  item,
  depth = 0,
  childCount = 0,
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
      <div className="flex items-center justify-between rounded-xl px-3 py-2 border shadow bg-white">
        {/* Draggable */}
        <div
          className="flex items-center gap-2 flex-1 cursor-move"
          {...attributes}
          {...listeners}
        >
          <span>⋮⋮</span>
          <span className="font-medium">{item.name}</span>
        </div>
        {/* Bouton Ajouter un enfant si la prop existe */}
        {onAddChild && (
          <button
            className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            onClick={() => onAddChild(item)}
            type="button"
          >
            + Ajouter un module
          </button>
        )}

        {/* Non draggable (buttons & switch) */}
        <div className="flex items-center gap-2">
          <Switch checked={visible} onChange={handleSwitch} />
          <Button variant="secondary" size="sm" onClick={() => onEdit?.(item)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete?.(item)}>
            Suppr
          </Button>
        </div>
      </div>
    </div>
  );
}
