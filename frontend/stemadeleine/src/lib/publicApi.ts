import axios from 'axios';
import { axiosClient } from '@/utils/axiosClient';
import { NewsPublication } from '@/types/news';
import { NewsletterPublication } from '@/types/newsletter';

export async function getNewsPublicationByNewsId(newsId: string): Promise<NewsPublication | null> {
  if (!newsId) return null;
  try {
    const response = await axiosClient.get<NewsPublication>(
      `/api/public/modules/news/publications/news/${newsId}`,
    );
    return response.data;
  } catch (unknownErr) {
    if (axios.isAxiosError(unknownErr)) {
      const status = unknownErr.response?.status ?? 'unknown';
      if (status === 404) return null;
      console.error('getNewsPublicationByNewsId axios error:', status, unknownErr.message);
    } else {
      console.error('getNewsPublicationByNewsId unknown error:', unknownErr);
    }
    return null;
  }
}

export async function getNewsletterPublicationByNewsletterId(newsletterId: string): Promise<NewsletterPublication | null> {
  if (!newsletterId) return null;
  try {
    const response = await axiosClient.get<NewsletterPublication>(
      `/api/public/modules/newsletter/publications/newsletter/${newsletterId}`,
    );
    return response.data;
  } catch (unknownErr) {
    if (axios.isAxiosError(unknownErr)) {
      const status = unknownErr.response?.status ?? 'unknown';
      if (status === 404) return null;
      console.error('getNewsletterPublicationByNewsletterId axios error:', status, unknownErr.message);
    } else {
      console.error('getNewsletterPublicationByNewsletterId unknown error:', unknownErr);
    }
    return null;
  }
}
