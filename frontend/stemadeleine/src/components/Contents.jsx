import React from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';

const Contents = ({
                    contents = [],
                    loading = false,
                    loadingMessage = 'Chargement des contenus...',
                    layout = 'staggered',
                  }) => {
  const renderContent = (content, index) => {
    if (!content.body) return null;

    // Déterminer la disposition selon le layout
    const contentLayout = content.layout || layout;
    let imageFirst;

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
        key={content.id}
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
          {content.medias && content.medias.length > 0 && (
            <div
              className={`pt-8 lg:pt-0 flex flex-1 items-center ${imageFirst ? 'lg:order-1' : 'lg:order-2'}`}
            >
              <div
                className={`w-full flex flex-wrap gap-4 ${
                  content.medias.length === 1
                    ? 'justify-center'
                    : 'justify-center lg:justify-start'
                }`}
              >
                {content.medias.slice(0, 4).map((media, i) => (
                  <div
                    key={media.id}
                    className={`
                      ${
                      content.medias.length === 1
                        ? 'w-64 h-64 lg:w-80 lg:h-80'
                        : 'w-40 h-40 lg:w-48 lg:h-48'
                    }
                      flex-shrink-0 overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 flex items-center justify-center
                      ${content.medias.length > 1 && i % 2 !== 0 ? '-mt-8 lg:-mt-16' : ''}
                    `}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={media.fileUrl}
                        alt={media.fileName || 'Image de contenu'}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes={content.medias.length === 1 ? '20rem' : '12rem'}
                        priority={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContentBody = (body) => {
    if (typeof body === 'object' && body.html) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          {loadingMessage}
        </span>
      </div>
    );
  }

  if (!contents || contents.length === 0) {
    return null;
  }

  return <div>{contents.map(renderContent)}</div>;
};

Contents.propTypes = {
  contents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      body: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      layout: PropTypes.oneOf(['left', 'right', 'staggered']),
      medias: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
          fileName: PropTypes.string,
          fileUrl: PropTypes.string.isRequired,
        }),
      ),
    }),
  ),
  loading: PropTypes.bool,
  loadingMessage: PropTypes.string,
  layout: PropTypes.oneOf(['left', 'right', 'staggered']),
};

export default Contents;
