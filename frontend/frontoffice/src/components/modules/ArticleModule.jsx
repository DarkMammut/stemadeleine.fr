import React, { useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import useGetContents from "../../hooks/useGetContents";
import Contents from "../Contents";

const ArticleModule = ({ module, className = "" }) => {
  const {
    contents,
    loading: contentsLoading,
    fetchContentsByOwnerId,
  } = useGetContents();

  useEffect(() => {
    if (module.moduleId) {
      fetchContentsByOwnerId(module.moduleId).catch(console.error);
    }
  }, [module.moduleId, fetchContentsByOwnerId]);

  if (!module.isVisible) {
    return null;
  }

  return (
    <article
      className={clsx(
        "w-full py-8 md:py-12 px-4 md:px-8 rounded-lg shadow-md bg-gradient-to-b from-primary-light to-white",
        className,
      )}
    >
      {/* Article Header */}
      <div className="mb-6 border-b border-secondary pb-6">
        {module.title && (
          <h3 className="text-4xl text-gray-900 mb-4">{module.title}</h3>
        )}
      </div>

      {/* Article Contents */}
      <div className="prose prose-lg max-w-none">
        <Contents
          contents={contents}
          lmayout="staggered"
          loading={contentsLoading}
          loadingMessage="Chargement de l'article..."
        />
      </div>

      {/* Article Metadata */}
      {(module.author || module.createdAt) && (
        <div className="mt-8 pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            {module.author && (
              <span>
                Par {module.author.firstName} {module.author.lastName}
              </span>
            )}
            {module.createdAt && (
              <time dateTime={module.createdAt}>
                {new Date(module.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

ArticleModule.propTypes = {
  module: PropTypes.shape({
    id: PropTypes.string.isRequired,
    moduleId: PropTypes.string,
    title: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string.isRequired,
    isVisible: PropTypes.bool,
    sortOrder: PropTypes.number,
    mediaId: PropTypes.string,
    description: PropTypes.string,
    author: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
    createdAt: PropTypes.string,
  }).isRequired,
  className: PropTypes.string,
};

export default ArticleModule;
