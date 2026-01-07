/*
NewsletterMagazine.tsx
React + TypeScript component styled with Tailwind CSS.
Features:
- Ultra-design magazine layout
- A4 aspect ratio for print (21cm x 29.7cm)
- Responsive (mobile -> stacked, desktop -> magazine columns)
- Auto-pagination for PDF export (uses html2canvas + jsPDF)
- Print-friendly CSS (@media print)
- Integration with NewsletterPublication type

Dependencies to install:
- html2canvas
- jspdf

npm install html2canvas jspdf

Usage:
import NewsletterMagazine from './NewsletterMagazine';

<NewsletterMagazine
  newsletter={newsletterPublicationData}
  organizationLogo="/logo.png"
/>

Notes:
- For perfect print dimensions, you can set the container width to 210mm (w-[210mm]) in CSS.
- Tailwind config should allow arbitrary values like aspect-[210/297] and w-[210mm].
- The component automatically extracts and displays data from NewsletterPublication including:
  * title, description
  * media (banner image)
  * author information
  * contents (sorted by sortOrder)
*/

import React, {useEffect, useRef} from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {NewsletterPublication} from '@/types/newsletter';
import useGetContents from '@/hooks/useGetContents';
import MediaImage from '@/components/MediaImage';

interface NewsletterMagazineProps {
    newsletter: NewsletterPublication;
    organizationLogo?: string;
}

export default function NewsletterMagazine({
                                               newsletter,
                                               organizationLogo = '/logo.png'
                                           }: NewsletterMagazineProps) {
    const pageRef = useRef<HTMLDivElement | null>(null);

    // Hook pour récupérer les contenus
    type MediaItem = {
        id: string;
        title?: string;
        altText?: string;
        fileUrl?: string;
        caption?: string;
    };

    type ContentItem = {
        id?: string;
        contentId?: string;
        type: string;
        data: string;
        body?: string | { html?: string }; // body peut être une string JSON ou un objet
        title?: string;
        mediaId?: string; // Legacy support
        medias?: MediaItem[]; // Nouveau format: tableau de médias
        sortOrder?: number;
    };

    const {
        contents: fetchedContents,
        loading: contentsLoading,
        fetchContentsByOwnerId,
    } = useGetContents() as unknown as {
        contents: ContentItem[];
        loading: boolean;
        fetchContentsByOwnerId: (ownerId: string) => Promise<ContentItem[]>;
    };

    // Helper pour extraire le HTML du champ body
    const getHtmlFromBody = (content: ContentItem): string => {
        if (!content.body) return content.data || '';

        // Si body est une string, essayer de la parser comme JSON
        if (typeof content.body === 'string') {
            try {
                const parsed = JSON.parse(content.body);
                return parsed.html || content.data || '';
            } catch {
                // Si le parsing échoue, retourner body tel quel (au cas où c'est déjà du HTML)
                return content.body;
            }
        }

        // Si body est déjà un objet, extraire le HTML
        return content.body.html || content.data || '';
    };

    // Charger les contenus au montage du composant
    useEffect(() => {
        if (newsletter.newsletterId) {
            fetchContentsByOwnerId(newsletter.newsletterId).catch(console.error);
        }
    }, [newsletter.newsletterId, fetchContentsByOwnerId]);

    // Extraire les données de la newsletter
    const title = newsletter.title || newsletter.name;
    const description = newsletter.description || '';
    const publishedDate = newsletter.publishedDate
        ? new Date(newsletter.publishedDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long'
        })
        : new Date().toLocaleDateString('fr-FR', {year: 'numeric', month: 'long'});


    // Utiliser les contenus récupérés via le hook, triés par sortOrder
    const contents = fetchedContents && fetchedContents.length > 0
        ? [...fetchedContents].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        : [];

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        if (!pageRef.current) return;

        const element = pageRef.current;

        // Optionally apply a scale for better resolution
        const scale = 2; // increase for better quality (costly)

        const canvas = await html2canvas(element, {
            scale,
            useCORS: true,
            allowTaint: true,
            logging: false,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');

        // A4 size in points (1pt = 1/72 in). jsPDF uses mm or pt — we'll use mm
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Convert canvas pixels to mm
        const pxFullWidth = canvas.width;
        const pxFullHeight = canvas.height;

        const mmPerPx = 210 / pxFullWidth; // because A4 width is 210mm
        const pdfWidthMm = 210; // a4 width
        const pdfHeightMm = pxFullHeight * mmPerPx;

        // If content fits in a single pdf page
        const pageHeightMm = 297; // a4 height

        if (pdfHeightMm <= pageHeightMm) {
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidthMm, pdfHeightMm);
        } else {
            // Split into multiple pages: slice canvas into vertical chunks equal to page height
            const pxPerPage = Math.floor(pageHeightMm / mmPerPx);
            let yPos = 0;
            while (yPos < canvas.height) {
                const sliceHeight = Math.min(pxPerPage, canvas.height - yPos);

                // create a temporary canvas to hold the slice
                const tmpCanvas = document.createElement('canvas');
                tmpCanvas.width = canvas.width;
                tmpCanvas.height = sliceHeight;
                const ctx = tmpCanvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(canvas, 0, yPos, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
                }
                const sliceData = tmpCanvas.toDataURL('image/png');

                const slicePdfHeightMm = sliceHeight * mmPerPx;

                if (yPos === 0) {
                    pdf.addImage(sliceData, 'PNG', 0, 0, pdfWidthMm, slicePdfHeightMm);
                } else {
                    pdf.addPage();
                    pdf.addImage(sliceData, 'PNG', 0, 0, pdfWidthMm, slicePdfHeightMm);
                }

                yPos += sliceHeight;
            }
        }

        const fileName = `newsletter-${newsletter.name.replace(/\s+/g, '-')}-${newsletter.newsletterId}.pdf`;
        pdf.save(fileName);
    };

    // Helper pour vérifier si le contenu HTML est significatif (pas juste le placeholder)
    const isSignificantContent = (html: string): boolean => {
        if (!html || !html.trim()) return false;

        // Liste des placeholders à ignorer
        const placeholders = [
            '<p>Start writing your newsletter content here...</p>',
            '<p></p>',
            '<p><br></p>',
            '<p><br/></p>',
            '<p>&nbsp;</p>'
        ];

        const cleanHtml = html.trim();
        return !placeholders.includes(cleanHtml);
    };

    // Helper to render content blocks based on type
    const renderContent = (content: typeof contents[0], idx: number) => {
        const key = content.id || idx;

        // Extraire le HTML
        const htmlContent = getHtmlFromBody(content);
        const hasSignificantHtml = isSignificantContent(htmlContent);

        // Vérifier si le contenu a des médias (images)
        const hasMedia = (content.medias && content.medias.length > 0) || content.mediaId;
        const mediaId = content.medias && content.medias.length > 0
            ? content.medias[0].id
            : content.mediaId;
        const mediaAltText = content.medias && content.medias.length > 0
            ? content.medias[0].altText || content.medias[0].title
            : undefined;
        const mediaCaption = content.medias && content.medias.length > 0
            ? content.medias[0].caption
            : undefined;

        // Si le contenu a un média, l'afficher en priorité
        if (hasMedia && mediaId) {
            return (
                <article key={key} className="mb-8 pb-8 border-b border-slate-200 last:border-0">
                    {content.title && (
                        <h3 className="text-2xl font-bold mb-4 text-slate-900">
                            {content.title}
                        </h3>
                    )}
                    <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg mb-4">
                        <MediaImage
                            mediaId={mediaId}
                            alt={mediaAltText || content.title || 'Image'}
                            fill={true}
                            style={{objectFit: 'cover'}}
                            className="rounded-lg"
                        />
                    </div>
                    {(mediaCaption || content.data) && (
                        <p className="text-sm text-slate-600 mb-4 italic">
                            {mediaCaption || content.data}
                        </p>
                    )}
                    {/* Afficher le contenu HTML s'il est significatif */}
                    {hasSignificantHtml && (
                        <div
                            className="prose prose-slate prose-lg max-w-none"
                            dangerouslySetInnerHTML={{__html: htmlContent}}
                        />
                    )}
                </article>
            );
        }

        // Pour tous les autres contenus avec du HTML significatif (mais sans média)
        if (hasSignificantHtml) {
            return (
                <article key={key} className="mb-8 pb-8 border-b border-slate-200 last:border-0">
                    {content.title && (
                        <h3 className="text-2xl font-bold mb-4 text-slate-900">
                            {content.title}
                        </h3>
                    )}
                    <div
                        className="prose prose-slate prose-lg max-w-none"
                        dangerouslySetInnerHTML={{__html: htmlContent}}
                    />
                </article>
            );
        }

        // Fallback : ne rien afficher si c'est juste un placeholder
        return null;
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 print:p-0">
            <div className="flex gap-2 print:hidden">
                <button onClick={handleExportPDF}
                        className="px-3 py-2 rounded bg-sky-600 text-white shadow hover:opacity-95">Export PDF
                </button>
                <button onClick={handlePrint} className="px-3 py-2 rounded border border-slate-300">Imprimer</button>
            </div>

            {/* Page wrapper: keep responsive but maintain A4 ratio for print */}
            <div
                ref={pageRef}
                id="newsletter-root"
                className="bg-white shadow-lg w-full max-w-[900px] print:max-w-full print:w-full print:shadow-none print:aspect-auto aspect-210/297 rounded-md print:rounded-none overflow-hidden text-slate-800"
                style={{
                    // on small screens we scale down visually to fit; for print the mm width will be used
                    transformOrigin: 'top center',
                }}
            >
                {/* Header (1/5 height) */}
                <header
                    className="h-[20%] print:h-auto bg-primary-light border-b border-slate-100 px-8 py-6 flex items-center justify-between print:relative">
                    {/* Logo et date à gauche (en colonne) */}
                    <div className="flex flex-col items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={organizationLogo} alt="logo" className="h-16 w-16 object-contain rounded"/>
                        <div className="text-sm text-slate-500 font-medium">{publishedDate}</div>
                    </div>

                    {/* Newsletter centré en gros */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight font-display text-slate-900">
                            Newsletter
                        </h1>
                    </div>

                    {/* Espace vide à droite pour équilibrer */}
                    <div className="w-32"></div>
                </header>

                {/* Body */}
                <div className="flex h-[80%] print:h-auto print:flex-row">
                    {/* Left column: aside / informations */}
                    <aside
                        className="w-1/4 hidden md:block print:block border-r border-slate-100 p-6 overflow-auto print:overflow-visible">
                        <h3 className="text-lg font-semibold mb-4">Informations</h3>

                        {newsletter.publishedDate && (
                            <div className="mb-4 text-sm">
                                <div className="font-medium text-slate-700">Date de publication</div>
                                <div className="text-slate-500">
                                    {new Date(newsletter.publishedDate).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                        )}


                        {description && (
                            <div className="mb-4 text-sm">
                                <div className="font-medium text-slate-700">À propos</div>
                                <div className="text-slate-500 text-xs">{description}</div>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-200 text-xs text-slate-400">
                            <div className="space-y-1">
                                <div>Contact</div>
                                <div>Mentions légales</div>
                                <div>Se désabonner</div>
                            </div>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 p-6 overflow-auto print:overflow-visible">
                        {/* Titre de la newsletter */}
                        <div className="mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                                {title}
                            </h2>
                        </div>

                        {/* Banner */}
                        {newsletter.media?.id && (
                            <div className="mb-6">
                                <div className="relative w-full h-44 md:h-56 rounded-lg overflow-hidden shadow-lg">
                                    <MediaImage
                                        mediaId={newsletter.media.id}
                                        alt={newsletter.media.altText || title}
                                        fill={true}
                                        style={{objectFit: 'cover'}}
                                        className="rounded-lg"
                                    />
                                </div>
                                {newsletter.media.caption && (
                                    <p className="text-xs text-slate-500 mt-2 italic">{newsletter.media.caption}</p>
                                )}
                            </div>
                        )}

                        {/* Contenus en pleine largeur */}
                        <section className="space-y-6 leading-relaxed">
                            {contents.length > 0 ? (
                                contents.map((content, idx) => renderContent(content, idx))
                            ) : (
                                <div className="text-slate-500 italic">
                                    {contentsLoading ? 'Chargement des contenus...' : 'Aucun contenu disponible pour cette newsletter.'}
                                </div>
                            )}
                        </section>
                    </main>
                </div>
            </div>

            <div className="text-xs text-slate-500 print:hidden">Aperçu responsive — cliquez sur Export PDF ou Imprimer
                pour générer
                le rendu d&apos;impression
            </div>
        </div>
    );
}
