// Aplatit un arbre en liste avec depth et parentId
export function flattenTree(items, depth = 0, parentId = null) {
  return items.flatMap((item) => [
    { ...item, depth, parentId },
    ...(item.children ? flattenTree(item.children, depth + 1, item.id) : []),
  ]);
}

// Reconstruit un arbre à partir d'une liste aplatie
export function buildTree(flatItems) {
  const rootItems = [];
  const lookup = {};

  flatItems.forEach((item) => {
    lookup[item.id] = { ...item, children: [] };
  });

  flatItems.forEach((item) => {
    if (item.parentId) {
      lookup[item.parentId].children.push(lookup[item.id]);
    } else {
      rootItems.push(lookup[item.id]);
    }
  });

  return rootItems;
}

// Nombre d'enfants (directs + descendants)
export function getChildCount(items, id) {
  const item = items.find((i) => i.id === id);
  if (!item) return 0;
  let count = (item.children || []).length;
  (item.children || []).forEach(
    (c) => (count += getChildCount(item.children || [], c.id)),
  );
  return count;
}

// Calcule la projection selon la souris pour le drag
export function getProjection(flattenedItems, activeId, overId, offsetLeft) {
  const overIndex = flattenedItems.findIndex((i) => i.id === overId);
  const activeItem = flattenedItems.find((i) => i.id === activeId);

  if (!activeItem) return null;

  const projected = { depth: activeItem.depth, parentId: activeItem.parentId };

  if (offsetLeft > 20) {
    projected.depth = Math.min(activeItem.depth + 1, 10);
    const previous = flattenedItems[overIndex - 1];
    projected.parentId = previous ? previous.id : null;
  } else if (offsetLeft < -20) {
    projected.depth = Math.max(activeItem.depth - 1, 0);
    const parent = flattenedItems.find((i) => i.id === activeItem.parentId);
    projected.parentId = parent ? parent.parentId : null;
  }

  return projected;
}

export function removeItem(items, id) {
  return items
    .map((item) => {
      if (item.id === id) return null;
      return { ...item, children: removeItem(item.children || [], id) };
    })
    .filter(Boolean);
}

export function insertItemAsChild(items, parentId, newItem) {
  return items.map((item) => {
    if (item.id === parentId) {
      return {
        ...item,
        children: [...(item.children || []), newItem],
      };
    }
    return {
      ...item,
      children: insertItemAsChild(item.children || [], parentId, newItem),
    };
  });
}
