import React from 'react';
import Image from 'next/image';

type Props = {
  mediaId?: string | number;
  title?: string;
  subtitle?: string;
};

export default function Hero(props: Props) {
  const { mediaId, title, subtitle } = props;

  return (
    <section className="bg-primary-light">
      <div className="container mx-auto px-4 py-12 text-center">
        {mediaId ? (
          // Affiche une image de bannière basique quand mediaId est fourni
          <div className="mb-6">
            <div className="mx-auto max-h-48 rounded-md overflow-hidden relative"
                 style={{ width: '100%', maxWidth: '900px', height: '12rem' }}>
              <Image
                src={`/api/media/${mediaId}`}
                alt={String(title || 'bannière')}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 1024px) 100vw, 900px"
              />
            </div>
          </div>
        ) : null}

        <h1 className="text-4xl font-bold mb-4">{title || 'Sainte-Madeleine'}</h1>
        {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
      </div>
    </section>
  );
}
