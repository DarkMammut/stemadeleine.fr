// Server-side helper utilities to fetch data using the project's axiosClient
import axios from 'axios';
import { axiosClient } from '@/utils/axiosClient';

const SERVER_API_TOKEN = process.env.API_TOKEN || undefined;

export async function getPageBySlug(slug = '/') {
  const normalized = slug === '/' ? '/' : slug.startsWith('/') ? slug : `/${slug}`;
  try {
    const encoded = encodeURIComponent(normalized);
    const res = await axiosClient.get(`/api/public/pages/slug?slug=${encoded}`, {
      headers: SERVER_API_TOKEN ? { Authorization: `Bearer ${SERVER_API_TOKEN}` } : undefined,
    });
    return res.data;
  } catch (unknownErr) {
    if (axios.isAxiosError(unknownErr)) {
      const status = unknownErr.response?.status ?? 'unknown';
      if (status === 404) {
        // Not found is expected for some slugs during dev; return null silently
        return null;
      }
      console.error('getPageBySlug axios error:', status, unknownErr.message);
    } else {
      console.error('getPageBySlug unknown error:', unknownErr);
    }
    return null;
  }
}

export async function getSectionsByPageId(pageId: string | number) {
  if (!pageId) return [];
  try {
    const res = await axiosClient.get(`/api/public/pages/${pageId}/sections`, {
      headers: SERVER_API_TOKEN ? { Authorization: `Bearer ${SERVER_API_TOKEN}` } : undefined,
    });
    return res.data;
  } catch (unknownErr) {
    if (axios.isAxiosError(unknownErr)) {
      const status = unknownErr.response?.status ?? 'unknown';
      console.error('getSectionsByPageId axios error:', status, unknownErr.message);
    } else {
      console.error('getSectionsByPageId unknown error:', unknownErr);
    }
    return [];
  }
}
