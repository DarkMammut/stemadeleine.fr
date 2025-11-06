"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { buildTree, flattenTree, getProjection } from "@/utils/treeHelpers";
import SortableItem from "@/components/SortableItem";

export default function DraggableTree({
  initialData,
  onChange,
  onToggle,
  onEdit,
  onDelete,
  canHaveChildren,
  canDrop, // nouvelle prop pour la validation générique du drop
  onAddChild, // nouvelle prop optionnelle pour ajouter un enfant
}) {
  const [tree, setTree] = useState(initialData);
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  // Synchronise tree avec initialData à chaque changement
  useEffect(() => {
    setTree(initialData);
  }, [initialData]);

  const flattened = useMemo(() => flattenTree(tree), [tree]);
  const sensorContext = useRef({ items: flattened, offset: offsetLeft });
  const sensors = useSensors(useSensor(PointerSensor));
  const activeItem = activeId ? flattened.find((i) => i.id === activeId) : null;
  const projected =
    activeId && overId
      ? getProjection(flattened, activeId, overId, offsetLeft)
      : null;

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setOverId(event.active.id);
  };

  const handleDragMove = (event) => {
    setOffsetLeft(event.delta.x);
  };

  const handleDragOver = (event) => {
    setOverId(event.over?.id ?? null);
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    setOverId(null);
    setOffsetLeft(0);

    if (!projected || !event.over) return;

    const cloned = JSON.parse(JSON.stringify(flattened));
    const activeIndex = cloned.findIndex((i) => i.id === event.active.id);
    const overIndex = cloned.findIndex((i) => i.id === event.over.id);
    const activeItem = cloned[activeIndex];
    const parent = projected.parentId
      ? cloned.find((i) => i.id === projected.parentId)
      : null;

    // Validation générique via canDrop
    if (typeof canDrop === "function") {
      const isAllowed = canDrop({
        dragged: activeItem,
        targetParent: parent,
        projected,
      });
      if (!isAllowed) return;
    }

    if (projected.parentId) {
      if (parent && canHaveChildren && !canHaveChildren(parent)) {
        return;
      }
    }

    cloned[activeIndex] = {
      ...cloned[activeIndex],
      depth: projected.depth,
      parentId: projected.parentId,
    };

    const sorted = arrayMove(cloned, activeIndex, overIndex);
    const newTree = buildTree(sorted);

    setTree(newTree);
    onChange?.(newTree);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={flattened.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        {flattened.map((item, index) => (
          <SortableItem
            key={`${item.type}-${item.id}`}
            item={item}
            depth={item.depth}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild} // passe la prop au composant enfant
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
