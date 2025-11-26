import React from 'react';
import MediaImage from '@/components/MediaImage';

type Media = {
  id: string | number;
  fileName?: string;
  fileUrl: string;
  title?: string;
  altText?: string;
};

type ContentItem = {
  id: string | number;
  title?: string;
  body?: string | { html?: string } | Record<string, unknown>;
  layout?: 'left' | 'right' | 'staggered';
  medias?: Media[];
};

type Props = {
  contents?: ContentItem[];
  loading?: boolean;
  loadingMessage?: string;
  layout?: 'left' | 'right' | 'staggered';
};

export default function Contents({
                                   contents = [],
                                   loading = false,
                                   loadingMessage = 'Chargement des contenus...',
                                   layout = 'staggered',
                                 }: Props): React.ReactElement | null {
  // Type guard pour détecter les objets contenant du HTML
  const isHtmlBody = (b: ContentItem['body']): b is { html: string } => {
    return (
      typeof b === 'object' &&
      b !== null &&
      'html' in b &&
      typeof (b as { html?: unknown }).html === 'string'
    );
  };

  const renderContentBody = (body: ContentItem['body']): React.ReactNode => {
    if (isHtmlBody(body)) {
      return <div dangerouslySetInnerHTML={{ __html: body.html }} />;
    }

    if (typeof body === 'object') {
      return (
        <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm">
          {JSON.stringify(body, null, 2)}
        </pre>
      );
    }

    return <p>{body}</p>;
  };

  const renderContent = (content: ContentItem, index: number) => {
    if (!content.body) return null;

    const contentLayout = content.layout || layout;
    let imageFirst: boolean;

    const medias = content.medias ?? [];

    switch (contentLayout) {
      case 'left':
        imageFirst = false;
        break;
      case 'right':
        imageFirst = true;
        break;
      case 'staggered':
      default:
        imageFirst = index % 2 !== 0;
        break;
    }

    return (
      <div
        key={String(content.id)}
        className="pb-16 pt-4 sm:pb-24 sm:pt-6 border-b border-gray-100 last:border-none"
      >
        <div
          className={`mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-start gap-8 ${
            content.medias && content.medias.length > 0 ? 'lg:flex-row' : ''
          }`}
        >
          {/* Texte */}
          <div
            className={`flex-1 ${
              content.medias && content.medias.length > 0
                ? `max-w-2xl ${imageFirst ? 'lg:order-2' : 'lg:order-1'}`
                : 'max-w-none'
            }`}
          >
            {content.title && (
              <h3 className="text-xl tracking-tight text-gray-900 sm:text-3xl mb-6">
                {content.title}
              </h3>
            )}

            <div className="text-xl text-gray-700 dark:text-gray-200 leading-relaxed text-justify">
              {renderContentBody(content.body)}
            </div>
          </div>

          {/* Images */}
          {medias.length > 0 && (
            <div
              className={`pt-8 lg:pt-0 flex flex-1 items-center ${imageFirst ? 'lg:order-1' : 'lg:order-2'}`}
            >
              <div
                className={`w-full flex flex-wrap gap-4 ${
                  medias.length === 1
                    ? 'justify-center'
                    : 'justify-center lg:justify-start'
                }`}
              >
                {medias.slice(0, 4).map((media, i) => (
                  <div
                    key={String(media.id)}
                    className={`
                       ${
                      medias.length === 1
                        ? 'w-64 h-64 lg:w-80 lg:h-80'
                        : 'w-40 h-40 lg:w-48 lg:h-48'
                    }
                       flex-shrink-0 overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 flex items-center justify-center
                      ${medias.length > 1 && i % 2 !== 0 ? '-mt-8 lg:-mt-16' : ''}
                     `}
                  >
                    {/* MediaImage peut être un composant JS non typé ; on assume ses props */}
                    {/* Correction: suppression du caractère superflu `S` */}
                    <MediaImage
                      mediaId={media.id}
                      style={{ objectFit: 'contain' }}
                      fill={true}
                      sizes={
                        medias.length === 1
                          ? 'w-64 h-64 lg:w-80 lg:h-80'
                          : 'w-40 h-40 lg:w-48 lg:h-48'
                      }
                      preload={medias.length === 1 && index === 0}
                      showTitle
                      caption={media.title}
                      alt={media.altText}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">{loadingMessage}</span>
      </div>
    );
  }

  if (!contents || contents.length === 0) {
    return null;
  }

  return <div>{contents.map(renderContent)}</div>;
}
