import React from "react";
import PropTypes from "prop-types";

const Contents = ({
  contents = [],
  loading = false,
  loadingMessage = "Chargement des contenus...",
}) => {
  const renderContent = (content, index) => {
    if (!content.body) return null;

    // Pour alterner le placement texte / image si tu veux
    const isEven = index % 2 === 0;

    return (
      <section
        key={content.id}
        className="pb-16 pt-4 sm:pb-24 sm:pt-6 border-b border-gray-100 last:border-none"
      >
        <div
          className={`mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 items-start gap-16 ${
            isEven ? "" : "lg:flex-row-reverse"
          }`}
        >
          {/* Texte */}
          <div className="max-w-2xl">
            {content.title && (
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl mb-6">
                {content.title}
              </h3>
            )}

            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-200 leading-relaxed">
              {renderContentBody(content.body)}
            </div>
          </div>

          {/* Images */}
          {content.medias && content.medias.length > 0 && (
            <div className="pt-8 lg:pt-0">
              <div className="-mx-4 grid grid-cols-2 gap-4 sm:mx-0 sm:grid-cols-2 lg:grid-cols-2 xl:gap-8">
                {content.medias.slice(0, 4).map((media, i) => (
                  <div
                    key={media.id}
                    className={`aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 ${
                      i % 2 !== 0 ? "-mt-8 lg:-mt-32" : ""
                    }`}
                  >
                    <img
                      src={media.fileUrl}
                      alt={media.fileName || "Image de contenu"}
                      className="block size-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderContentBody = (body) => {
    if (typeof body === "object" && body.html) {
      return <div dangerouslySetInnerHTML={{ __html: body.html }} />;
    }

    if (typeof body === "object") {
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
};

export default Contents;
