import {NewsletterPublication} from '@/types/newsletter';
import Link from 'next/link';

interface NewsletterCardProps {
    newsletter: NewsletterPublication;
    basePath?: string | null; // Chemin de base pour les liens vers les détails (ex: '/newsletters' ou '/mon-espace/newsletters')
}

export default function NewsletterCard({
                                           newsletter,
                                           basePath = '/newsletters'
                                       }: NewsletterCardProps) {
    const imageUrl = newsletter.media?.fileUrl || '/no-image.jpeg';
    const formattedDate = newsletter.publishedDate
        ? new Date(newsletter.publishedDate).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : null;

    // Normaliser le basePath pour éviter les doubles slashes
    // Si basePath est null, ne pas créer de lien
    const hasDetailPage = basePath != null;
    const normalizedBasePath = hasDetailPage ? basePath.replace(/\/+$/, '') : '';
    const detailHref = hasDetailPage ? `${normalizedBasePath}/${newsletter.newsletterId}` : '#';

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
                <div
                    className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16"
                    style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    {/* Overlay sombre pour améliorer la lisibilité */}
                    <div className="absolute inset-0 bg-gray-900/70 -z-10"></div>

                    <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
                        {newsletter.title}
                    </h2>

                    {formattedDate && (
                        <p className="mt-2 text-sm text-gray-300">
                            Publié le {formattedDate}
                        </p>
                    )}

                    {newsletter.description && (
                        <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-300">
                            {newsletter.description}
                        </p>
                    )}

                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        {newsletter.media?.fileUrl && (
                            <a
                                href={newsletter.media.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-xs hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Télécharger le PDF
                            </a>
                        )}
                        {hasDetailPage && (
                            <Link
                                href={detailHref}
                                className="text-sm/6 font-semibold text-white hover:text-gray-200"
                            >
                                En savoir plus
                                <span aria-hidden="true">→</span>
                            </Link>
                        )}
                    </div>

                    <svg
                        viewBox="0 0 1024 1024"
                        aria-hidden="true"
                        className="absolute top-1/2 left-1/2 -z-10 size-256 -translate-x-1/2 mask-[radial-gradient(closest-side,white,transparent)]"
                    >
                        <circle r={512} cx={512} cy={512} fill="url(#newsletter-gradient)" fillOpacity="0.3"/>
                        <defs>
                            <radialGradient id="newsletter-gradient">
                                <stop stopColor="#7775D6"/>
                                <stop offset={1} stopColor="#E935C1"/>
                            </radialGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        </div>
    );
}
