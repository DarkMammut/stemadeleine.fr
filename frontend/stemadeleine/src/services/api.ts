const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

async function fetcher(path: string) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchPageBySlug(slug: string) {
  try {
    return await fetcher(`/api/public/pages/slug?slug=${encodeURIComponent(slug)}`);
  } catch (e) {
    console.error('fetchPageBySlug', e);
    return null;
  }
}

export async function fetchSectionsByPageId(pageId: string) {
  try {
    return await fetcher(`/api/public/pages/${pageId}/sections`);
  } catch (e) {
    console.error('fetchSectionsByPageId', e);
    return [];
  }
}
