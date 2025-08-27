"use client";

import { useMemo, useRef, useState } from "react";
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

import {
  buildTree,
  flattenTree,
  getChildCount,
  getProjection,
} from "@/utils/treeHelpers";
import SortableItem from "@/components/SortableItem";

export default function DraggableTree({
  initialData,
  onChange,
  onToggle,
  onEdit,
  onDelete,
  canHaveChildren,
}) {
  const [tree, setTree] = useState(initialData);
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

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

    if (projected.parentId) {
      const parent = cloned.find((i) => i.id === projected.parentId);
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
        {flattened.map((item) => (
          <SortableItem
            key={item.id}
            item={item}
            depth={item.depth}
            childCount={getChildCount(tree, item.id)}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
