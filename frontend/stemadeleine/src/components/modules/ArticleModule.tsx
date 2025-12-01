import React, { useEffect } from 'react';
import clsx from 'clsx';
import useGetContents from '@/hooks/useGetContents';
import useGetModules from '@/hooks/useGetModules';
import Contents from '@/components/Contents';

interface Author {
  firstName?: string;
  lastName?: string;
}

// Local types for the article DTO returned by the backend
interface WriterObject {
  name?: string;
  firstName?: string;
  lastName?: string;
}

type Writer = string | WriterObject;

interface ArticleDto {
  writer?: Writer;
  writingDate?: string;
  variant?: string;
  // other fields omitted on purpose
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

  // Cast proprement le hook JS vers une interface connue localement
  const modulesHook = useGetModules() as unknown as {
    article?: ArticleDto | null;
    articleLoading?: boolean;
    fetchArticleByModuleId?: (moduleId: string) => Promise<ArticleDto | null>;
  };

  const { article, articleLoading, fetchArticleByModuleId } = modulesHook;

  useEffect(() => {
    if (module.moduleId) {
      // On récupère à la fois les contenus et le DTO article
      fetchArticleByModuleId?.(module.moduleId).catch(console.error);
      fetchContentsByOwnerId(module.moduleId).catch(console.error);
    }
  }, [module.moduleId, fetchContentsByOwnerId, fetchArticleByModuleId]);

  if (!module.isVisible) {
    return null;
  }

  // Détermine le nom de l'auteur (writer) à partir de l'article puis du module (fallback)
  const getWriterName = (): string | null => {
    const src = article?.writer ?? module.author;
    if (!src) return null;

    if (typeof src === 'string') return src;

    // src est un objet WriterObject
    const obj = src as WriterObject;
    if (obj.name) return obj.name;
    const first = obj.firstName ?? '';
    const last = obj.lastName ?? '';
    const full = `${first} ${last}`.trim();
    return full || null;
  };

  const writerName = getWriterName();

  // Détermine la date d'écriture (writingDate) à partir de l'article puis du module
  const writingDateRaw = article?.writingDate ?? module.createdAt ?? null;

  const writingDate = writingDateRaw
    ? new Date(writingDateRaw).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : null;

  // Variant / layout pour Contents (provenant du backend via article.variant)
  type ContentsLayout = 'staggered' | 'left' | 'right';
  const mapVariantToLayout = (variant?: string): ContentsLayout => {
    if (!variant) return 'staggered';
    const v = variant.toLowerCase();
    if (v === 'left' || v === 'right') return v as ContentsLayout;
    // default to staggered for unknown variants
    return 'staggered';
  };

  const contentsLayout: ContentsLayout = mapVariantToLayout(article?.variant);

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
          layout={contentsLayout}
          loading={contentsLoading || Boolean(articleLoading)}
          loadingMessage={articleLoading ? 'Chargement de l\'article...' : 'Chargement du contenu...'}
        />
      </div>

      {/* Article Metadata */}
      {(writerName || writingDate) && (
        <div className="mt-8 pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            {writerName && (
              <span>
                Par {writerName}
              </span>
            )}
            {writingDate && (
              <time dateTime={String(writingDateRaw)}>
                {writingDate}
              </time>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default ArticleModule;
