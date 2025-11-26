import React, { useEffect } from 'react';
import clsx from 'clsx';
import useGetContents from '@/hooks/useGetContents';
import Contents from '@/components/Contents';

interface Author {
  firstName?: string;
  lastName?: string;
}

export interface ArticleModuleType {
  id: string;
  moduleId?: string;
  title?: string;
  name?: string;
  type: string;
  isVisible?: boolean;
  sortOrder?: number;
  mediaId?: string;
  description?: string;
  author?: Author;
  createdAt?: string;

  [key: string]: unknown;
}

interface Props {
  module: ArticleModuleType;
  className?: string;
}

const ArticleModule: React.FC<Props> = ({ module, className = '' }) => {
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
        'w-full my-6 md:my-12 py-6 md:py-12 px-4 md:px-8 rounded-lg shadow-lg bg-primary-light',
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
          layout="staggered"
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
                {new Date(module.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default ArticleModule;
