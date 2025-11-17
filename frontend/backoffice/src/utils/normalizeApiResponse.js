export function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.content && Array.isArray(data.content)) return data.content;
  if (data.items && Array.isArray(data.items)) return data.items;
  // fallback: try common fields
  if (Array.isArray(data.data)) return data.data;
  return [];
}
