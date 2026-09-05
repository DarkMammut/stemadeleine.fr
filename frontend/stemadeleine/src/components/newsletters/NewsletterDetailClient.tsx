'use client';

import React from 'react';
import NewsletterMagazine from '@/components/NewsletterMagazine';
import Layout from '@/components/Layout';
import { NewsletterPublication } from '@/types/newsletter';

type PageShape = {
  name?: string;
  title?: string;
  slug?: string;
};

type Props = {
  newsletter: NewsletterPublication;
  page?: PageShape | null;
};

export default function NewsletterDetailClient({ newsletter, page }: Props) {
  return (
    <Layout
      page={
        page || {
          name: 'Newsletters',
          title: 'Newsletters',
          slug: '/newsletters',
        }
      }
    >
      <main className="bg-cream">
        <NewsletterMagazine newsletter={newsletter} />
      </main>
    </Layout>
  );
}
