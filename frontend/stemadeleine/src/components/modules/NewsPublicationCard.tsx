import { NewsPublication } from '@/types/news';
import Link from 'next/link';

interface NewsPublicationCardProps {
    news: NewsPublication;
    basePath?: string | null;
}

export default function NewsPublicationCard({
    news,
    basePath = '/actualites',
}: NewsPublicationCardProps) {
    const imageUrl = news.media?.fileUrl || null;
    const formattedDate = news.publishedDate
        ? new Date(news.publishedDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : null;

    const hasDetailPage = basePath != null;
    const normalizedBasePath = hasDetailPage ? basePath.replace(/\/+$/, '') : '';
    const detailHref = hasDetailPage ? `${normalizedBasePath}/${news.newsId}` : '#';

    return (
        <article className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Image */}
            {imageUrl && (
                <div
                    className="md:w-64 h-48 md:h-auto shrink-0 bg-gray-200"
                    style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            )}
            {!imageUrl && (
                <div className="md:w-64 h-48 md:h-auto shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-4xl">📰</span>
                </div>
            )}

            {/* Content */}
            <div className="flex flex-col justify-between p-6 flex-1">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        {formattedDate && (
                            <time className="text-sm text-gray-500">{formattedDate}</time>
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2 leading-snug">
                        {news.title || news.name}
                    </h2>

                    {news.description && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {news.description}
                        </p>
                    )}
                </div>

                {hasDetailPage && (
                    <div className="mt-4">
                        <Link
                            href={detailHref}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Lire la suite
                            <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                )}
            </div>
        </article>
    );
}

