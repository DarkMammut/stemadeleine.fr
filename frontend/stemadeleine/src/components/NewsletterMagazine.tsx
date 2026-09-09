'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {ArrowDownTrayIcon, ArrowLeftIcon, ArrowRightIcon, DocumentIcon,} from '@heroicons/react/24/outline';
import {NewsletterPublication} from '@/types/newsletter';
import Pagination from '@/components/Pagination';
import Contents from '@/components/Contents';
import useGetContents from '@/hooks/useGetContents';
import clsx from "clsx";

const PDFViewer = dynamic(
    async () => {
        const {Document, Page, pdfjs} = await import('react-pdf');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        return function PDFViewerComponent({
                                               pdfUrl,
                                               currentPage,
                                               containerWidth,
                                               pdfError,
                                               onDocumentLoadSuccess,
                                               onDocumentLoadError,
                                           }: {
            pdfUrl: string;
            currentPage: number;
            containerWidth: number;
            pdfError: boolean;
            onDocumentLoadSuccess: (payload: { numPages: number }) => void;
            onDocumentLoadError: () => void;
        }) {
            return (
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                        <div className="flex h-96 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"/>
                        </div>
                    }
                >
                    {!pdfError && (
                        <Page
                            pageNumber={currentPage}
                            width={containerWidth}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                        />
                    )}
                </Document>
            );
        };
    },
    {ssr: false},
);

interface NewsletterMagazineProps {
    newsletter: NewsletterPublication;
}

export default function NewsletterMagazine({
                                               newsletter,
                                           }: NewsletterMagazineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(800);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pdfLoading, setPdfLoading] = useState<boolean>(true);
    const [pdfError, setPdfError] = useState<boolean>(false);

    const {contents, loading: contentsLoading, fetchContentsByOwnerId} = useGetContents() as unknown as {
        contents: import('@/components/Contents').SharedContentItem[];
        loading: boolean;
        fetchContentsByOwnerId: (ownerId: string) => Promise<unknown[]>;
    };

    useEffect(() => {
        if (newsletter.newsletterId) {
            fetchContentsByOwnerId(newsletter.newsletterId).catch(console.error);
        }
    }, [newsletter.newsletterId, fetchContentsByOwnerId]);

    const title = newsletter.title || newsletter.name;
    const description = newsletter.description || '';
    const hasPdf = Boolean(newsletter.pdfFile?.fileUrl);
    const pdfUrl = newsletter.pdfFile?.fileUrl || '';

    const publishedDate = newsletter.publishedDate
        ? new Date(newsletter.publishedDate).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : null;

    const publishedMonthYear = newsletter.publishedDate
        ? new Date(newsletter.publishedDate).toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'})
        : '';

    // Mesurer la largeur du conteneur pour adapter le rendu PDF
    const updateWidth = useCallback(() => {
        if (containerRef.current) {
            // On retire un peu de padding
            setContainerWidth(Math.min(containerRef.current.offsetWidth - 32, 900));
        }
    }, []);

    useEffect(() => {
        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [updateWidth]);

    // Navigation clavier
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!hasPdf || numPages === 0) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                setCurrentPage((p) => Math.min(p + 1, numPages));
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                setCurrentPage((p) => Math.max(p - 1, 1));
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [hasPdf, numPages]);

    const onDocumentLoadSuccess = ({numPages}: { numPages: number }) => {
        setNumPages(numPages);
        setCurrentPage(1);
        setPdfLoading(false);
        setPdfError(false);
    };

    const onDocumentLoadError = () => {
        setPdfLoading(false);
        setPdfError(true);
    };

    return (
        <div className="bg-cream min-h-screen pb-16">
            {/* En-tête de présentation */}
            <header className="bg-primary px-8 py-10 print:px-6 print:py-8">
                <div className="mx-auto max-w-5xl">
                    {/* Date en haut à gauche */}
                    {publishedMonthYear && (
                        <p className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-secondary-light">
                            {publishedMonthYear}
                        </p>
                    )}
                    {/* Titre pleine largeur */}
                    <h2 className="font-serif text-[clamp(1.6rem,4vw,3rem)] font-normal leading-tight tracking-wide text-secondary">
                        {title}
                    </h2>

                    {/* Titre et description */}
                    <div className="mt-8 border-t border-secondary pt-6">
                        {description && (
                            <p className="mt-3 max-w-2xl text-sm leading-[1.8] text-cream">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Méta-infos */}
                    <div className="mt-6 flex flex-wrap gap-8">
                        {publishedDate && (
                            <div>
                                <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-secondary">
                                    Date de publication
                                </p>
                                <p className="text-sm text-secondary-light">{publishedDate}</p>
                            </div>
                        )}
                        {newsletter.author && (
                            <div>
                                <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-secondary">
                                    Auteur
                                </p>
                                <p className="text-sm text-secondary-light">
                                    {newsletter.author.firstname} {newsletter.author.lastname}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Contenus éditoriaux */}
            {(contentsLoading || contents.length > 0) && (
                <section className={clsx('w-full max-w-[960px] mx-auto px-4 md:px-0')}>
                    <Contents
                        contents={contents}
                        loading={contentsLoading}
                        loadingMessage="Chargement du contenu..."
                        theme="light"
                    />
                </section>
            )}

            {/* Visionneuse PDF */}
            {hasPdf && (
                <section className="mx-auto max-w-5xl px-4 py-10">
                    <div className="mb-6 flex items-center gap-3">
                        {hasPdf && (
                            <a
                                href={pdfUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex cursor-pointer items-center gap-2 border border-gold/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold transition-colors duration-200 hover:border-gold hover:text-gold-light print:hidden"
                            >
                                <ArrowDownTrayIcon className="h-3.5 w-3.5"/>
                                Télécharger le PDF
                            </a>
                        )}
                        {!pdfLoading && numPages > 0 && (
                            <span className="ml-auto text-sm text-text-light">
                                {numPages} page{numPages > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    <div
                        ref={containerRef}
                        className="border border-secondary bg-white shadow-lg overflow-hidden"
                    >
                        {/* Page PDF */}
                        <div className="flex justify-center p-4">
                            <PDFViewer
                                pdfUrl={pdfUrl}
                                currentPage={currentPage}
                                containerWidth={containerWidth}
                                pdfError={pdfError}
                                onDocumentLoadSuccess={onDocumentLoadSuccess}
                                onDocumentLoadError={onDocumentLoadError}
                            />

                            {pdfError && (
                                <div className="flex h-64 flex-col items-center justify-center gap-4 text-text-light">
                                    <DocumentIcon className="h-12 w-12 opacity-40"/>
                                    <p className="text-sm">Impossible d&apos;afficher le PDF.</p>
                                    <a
                                        href={pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded border border-stone/30 px-4 py-2 text-sm text-stone hover:border-stone transition-colors"
                                    >
                                        <ArrowDownTrayIcon className="h-4 w-4"/>
                                        Télécharger le fichier
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Navigation entre pages */}
                        {!pdfError && numPages > 1 && (
                            <div className="bg-primary border-t border-secondary px-4 py-3">
                                {/* Boutons prev/next rapides */}
                                <div className="mb-3 flex items-center justify-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="inline-flex items-center gap-2 rounded-full border border-secondary bg-transparent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary transition-all duration-200 cursor-pointer hover:border-secondary-light hover:text-secondary-light disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ArrowLeftIcon className="h-3.5 w-3.5"/>
                                        Précédent
                                    </button>
                                    <span className="text-xs text-secondary">
                                        Page {currentPage} / {numPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((p) => Math.min(p + 1, numPages))}
                                        disabled={currentPage === numPages}
                                        className="inline-flex items-center gap-2 rounded-full border border-secondary bg-transparent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary transition-all duration-200 cursor-pointer hover:border-secondary-light hover:text-secondary-light disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Suivant
                                        <ArrowRightIcon className="h-3.5 w-3.5"/>
                                    </button>
                                </div>

                                {/* Pagination complète si beaucoup de pages */}
                                {numPages > 5 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={numPages}
                                        onPageChange={setCurrentPage}
                                        variant="light"
                                        showPageInfo={false}
                                        previousLabel="‹"
                                        nextLabel="›"
                                        siblingCount={2}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Message si aucun PDF */}
            {!hasPdf && (
                <div className="mx-auto max-w-5xl px-4 py-16 text-center">
                    <DocumentIcon className="mx-auto mb-4 h-12 w-12 text-stone/30"/>
                    <p className="text-sm italic text-text-light">
                        Le fichier PDF de cette newsletter n&apos;est pas encore disponible.
                    </p>
                </div>
            )}
        </div>
    );
}

