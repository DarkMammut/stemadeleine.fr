'use client';

import React from 'react';
import NewsArticle from '@/components/NewsArticle';
import Layout from '@/components/Layout';
import { NewsPublication } from '@/types/news';

type PageShape = {
  name?: string;
  title?: string;
  slug?: string;
};

type Props = {
  newsPublication: NewsPublication;
  page?: PageShape | null;
  organizationLogo?: string;
};

export default function NewsDetailClient({ newsPublication, page, organizationLogo }: Props) {
  return (
    <Layout
      page={
        page || {
          name: 'Actualites',
          title: 'Actualites',
          slug: '/actualites',
        }
      }
    >
      <main>
        <NewsArticle news={newsPublication} organizationLogo={organizationLogo} />
      </main>
    </Layout>
  );
}
