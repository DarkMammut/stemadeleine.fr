"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { PencilIcon, PlusIcon } from "@heroicons/react/16/solid";

import Button from "@/components/Button";
import Utilities from "@/components/Utilities";
import useGetPages from "@/hooks/useGetPages";
import useAddPage from "@/hooks/useAddPage";

// ----------------------
// Sortable Item
// ----------------------
function SortableItem({ id, page, level, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${level * 20}px`,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="my-2 flex justify-between items-center rounded-xl p-3 bg-gray-100"
    >
      <span className="font-medium">{page.name}</span>
      <Button
        className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600"
        onClick={() => onEdit(page.id)}
      >
        <PencilIcon className="w-4 h-4" />
      </Button>
    </li>
  );
}

// ----------------------
// Helpers
// ----------------------

// Aplatir un arbre [{id, name, children}] en [{id, name, level, parent}]
function flattenTree(nodes, level = 0, parent = null) {
  return nodes.flatMap((node) => [
    { ...node, level, parent },
    ...(node.children ? flattenTree(node.children, level + 1, node.id) : []),
  ]);
}

function buildTree(flat) {
  const lookup = {};
  const root = [];

  flat.forEach((node) => {
    lookup[node.id] = { ...node, children: [] };
  });

  flat.forEach((node) => {
    if (node.parent && lookup[node.parent]) {
      lookup[node.parent].children.push(lookup[node.id]);
    } else {
      root.push(lookup[node.id]);
    }
  });

  return root;
}

// ----------------------
// Main component
// ----------------------
export default function Pages() {
  const { pages, loading, error } = useGetPages({ route: "tree" });
  const { createPage } = useAddPage();

  const [treeData, setTreeData] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (pages && pages.length > 0) {
      setTreeData(pages);
    }
  }, [pages]);

  const handleEdit = (id) => {
    console.log("Éditer page:", id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTreeData((items) => {
      const flat = flattenTree(items);
      const oldIndex = flat.findIndex((item) => item.id === active.id);
      const newIndex = flat.findIndex((item) => item.id === over.id);

      const reordered = arrayMove(flat, oldIndex, newIndex);

      return buildTree(reordered);
    });
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p>Erreur: {error.message}</p>;

  const flat = flattenTree(treeData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-6"
    >
      <h2 className="text-2xl font-semibold mb-4">Pages</h2>

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouvelle Page",
            callback: async () => {
              await createPage({ name: "Nouvelle page" });
            },
          },
        ]}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={flat.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul>
            {flat.map((page) => (
              <SortableItem
                key={page.id}
                id={page.id}
                page={page}
                onEdit={handleEdit}
                level={page.level}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </motion.div>
  );
}
