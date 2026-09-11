import clsx from 'clsx';
import Link from 'next/link';
import {NewsletterPublication} from '@/types/newsletter';

export type NewsletterCardVariant = 'feature' | 'grid' | 'list';

interface NewsletterCardProps {
    newsletter: NewsletterPublication;
    basePath?: string | null;
    variant?: NewsletterCardVariant;
}

function formatNewsletterDate(publishedDate?: string): string | null {
    if (!publishedDate) {
        return null;
    }

    const date = new Date(publishedDate);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const monthYear = date.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
    });

    return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
}

function getNewsletterImageUrl(newsletter: NewsletterPublication): string | null {
    if (!newsletter.media?.fileUrl) {
        return null;
    }

    if (newsletter.media.fileType?.startsWith('image/')) {
        return newsletter.media.fileUrl;
    }

    return null;
}

function getNewsletterDownloadUrl(newsletter: NewsletterPublication): string | null {
    const fileUrl = newsletter.media?.fileUrl;
    if (!fileUrl) {
        return null;
    }

    if (newsletter.media?.fileType === 'application/pdf' || fileUrl.toLowerCase().endsWith('.pdf')) {
        return fileUrl;
    }

    return null;
}

function getNewsletterHref(newsletter: NewsletterPublication, basePath?: string | null): string | null {
    const newsletterId = newsletter.newsletterId?.trim();
    if (!newsletterId || basePath == null) {
        return null;
    }

    const normalizedBasePath = basePath.replace(/\/+$/, '');
    return `${normalizedBasePath}/${encodeURIComponent(newsletterId)}`;
}

function NewsletterActions({
                               detailHref,
                               downloadUrl,
                           }: {
    detailHref: string | null;
    downloadUrl: string | null;
}) {
    if (!detailHref && !downloadUrl) {
        return null;
    }

    return (
        <div className="mt-5 flex flex-wrap items-center gap-5">
            {detailHref && (
                <Link
                    href={detailHref}
                    className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary transition-colors duration-200 hover:text-secondary-light"
                >
                    Lire la newsletter
                </Link>
            )}

            {downloadUrl && (
                <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent/80 transition-colors duration-200 hover:text-accent"
                >
                    Télécharger le PDF
                </a>
            )}
        </div>
    );
}

export default function NewsletterCard({
                                           newsletter,
                                           basePath = '/newsletters',
                                           variant = 'list',
                                       }: NewsletterCardProps) {
    const imageUrl = getNewsletterImageUrl(newsletter);
    const dateLabel = formatNewsletterDate(newsletter.publishedDate);
    const title = newsletter.title || newsletter.name;
    const description = newsletter.description || '';
    const detailHref = getNewsletterHref(newsletter, basePath);
    const downloadUrl = getNewsletterDownloadUrl(newsletter);

    if (variant === 'grid') {
        return (
            <article className="bg-primary p-7 transition-colors duration-200 hover:bg-primary-dark">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="mb-5 h-40 w-full object-cover bg-primary transition duration-300"
                        style={{filter: 'brightness(0.82)'}}
                    />
                ) : (
                    <div className="mb-5 flex h-40 w-full items-center justify-center bg-primary text-secondary">
                        ✦
                    </div>
                )}

                {dateLabel && (
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
                        {dateLabel}
                    </div>
                )}

                <h4 className="mb-2 font-serif text-base font-normal leading-[1.4] text-accent">
                    {title}
                </h4>

                {description && (
                    <p className="text-[13px] leading-[1.6] text-accent-light">
                        {description}
                    </p>
                )}

                <NewsletterActions detailHref={detailHref} downloadUrl={downloadUrl}/>
            </article>
        );
    }

    if (variant === 'feature') {
        return (
            <article
                className="border border-[rgba(184,151,58,0.12)] bg-primary p-6 transition-colors duration-200 hover:bg-[#3A3020] md:p-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[320px_minmax(0,1fr)]">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            className="h-52 w-full object-cover bg-[#3A3020] md:h-full"
                            style={{filter: 'brightness(0.82)'}}
                        />
                    ) : (
                        <div
                            className="flex h-52 w-full items-center justify-center bg-[#3A3020] text-secondary md:h-full">
                            ✦
                        </div>
                    )}

                    <div className="flex flex-col justify-center">
                        {dateLabel && (
                            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
                                {dateLabel}
                            </div>
                        )}

                        <h4 className="mb-3 font-serif text-2xl font-normal leading-[1.3] text-accent">
                            {title}
                        </h4>

                        {description && (
                            <p className="text-sm leading-[1.7] text-accent-light">
                                {description}
                            </p>
                        )}

                        <NewsletterActions detailHref={detailHref} downloadUrl={downloadUrl}/>
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article
            className={clsx(
                'flex flex-col gap-5 bg-primary p-6 transition-colors duration-200 hover:bg-[#3A3020] md:flex-row md:gap-6 md:p-7',
            )}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={title}
                    className="h-40 w-full shrink-0 object-cover bg-[#3A3020] md:h-28 md:w-48"
                    style={{filter: 'brightness(0.82)'}}
                />
            ) : (
                <div
                    className="flex h-40 w-full shrink-0 items-center justify-center bg-[#3A3020] text-secondary md:h-28 md:w-48">
                    ✦
                </div>
            )}

            <div className="flex-1">
                {dateLabel && (
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
                        {dateLabel}
                    </div>
                )}

                <h4 className="mb-2 font-serif text-lg font-normal leading-[1.35] text-accent">
                    {title}
                </h4>

                {description && (
                    <p className="text-[13px] leading-[1.65] text-[rgba(247,242,232,0.45)]">
                        {description}
                    </p>
                )}

                <NewsletterActions detailHref={detailHref} downloadUrl={downloadUrl}/>
            </div>
        </article>
    );
}
