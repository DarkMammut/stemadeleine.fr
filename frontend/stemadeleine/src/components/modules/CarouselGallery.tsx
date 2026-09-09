'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import MediaImage from '@/components/MediaImage';
import Lightbox from '@/components/Lightbox';

type Media = {
    id: string;
    url?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
    title?: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
};

type ModuleType = {
    id?: string;
    moduleId?: string;
    title?: string;
    [key: string]: unknown;
};

type GalleryDto = {
    id?: string;
    variant?: string;
    medias?: Media[];
};

interface Props {
    module: ModuleType;
    gallery?: GalleryDto | null;
    loading?: boolean;
    autoPlay?: boolean;
    autoPlayInterval?: number;
    showThumbnails?: boolean;
    showArrows?: boolean;
    showCounter?: boolean;
    isDark?: boolean;
}

const CarouselGallery: React.FC<Props> = ({
                                              module,
                                              gallery,
                                              loading = false,
                                              autoPlay = false,
                                              autoPlayInterval = 5000,
                                              showThumbnails = true,
                                              showArrows = true,
                                              showCounter = true,
                                              isDark = true
                                          }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    const images = gallery?.medias ?? [];
    const totalImages = images.length;
    const hasNavigation = showArrows && totalImages > 1;

    // Gestion de l'autoplay
    useEffect(() => {
        if (!autoPlay || isPaused || totalImages === 0) return;

        autoPlayRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalImages);
        }, autoPlayInterval);

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [autoPlay, autoPlayInterval, totalImages, isPaused]);

    // Navigation
    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % totalImages);
    }, [totalImages]);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }, [totalImages]);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    // Support clavier
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                goToPrevious();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrevious]);

    // Support tactile
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            goToNext();
        } else if (isRightSwipe) {
            goToPrevious();
        }
    };

    // Lightbox
    const openLightbox = useCallback((index: number) => {
        setCurrentIndex(index);
        setIsLightboxOpen(true);
        setIsPaused(true);
    }, []);

    const closeLightbox = useCallback(() => {
        setIsLightboxOpen(false);
        setIsPaused(false);
    }, []);

    const goToNextInLightbox = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % totalImages);
    }, [totalImages]);

    const goToPreviousInLightbox = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }, [totalImages]);

    if (loading) {
        return <div className="text-center text-cream/80">Chargement de la galerie...</div>;
    }

    if (!gallery || !images || images.length === 0) {
        return (
            <div className="w-full text-center text-cream/70">
                <p>Aucune image à afficher</p>
            </div>
        );
    }

    return (
        <>
            <div className="w-full">
                {module.title && (
                    <h3
                        className={clsx(
                            'font-serif text-[clamp(1.7rem,3vw,2.4rem)] font-normal leading-[1.25] mb-6',
                            isDark ? 'text-secondary' : 'text-primary',
                        )}
                    >
                        {module.title}
                    </h3>
                )}

                <div
                    className="relative w-full pt-6"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div
                        className={hasNavigation ? 'md:px-2 lg:px-3 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-3' : ''}>
                        {/* Bouton précédent desktop */}
                        {hasNavigation && (
                            <button
                                onClick={goToPrevious}
                                className="hidden md:flex bg-stone/85 hover:bg-stone text-gold-light rounded-full p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-light cursor-pointer"
                                aria-label="Image précédente"
                            >
                                <svg
                                    className="w-6 h-6 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M15 19l-7-7 7-7"/>
                                </svg>
                            </button>
                        )}

                        {/* Container du carrousel */}
                        <div
                            className="relative overflow-hidden bg-[#3A3020] border border-[rgba(184,151,58,0.12)]"
                            style={{aspectRatio: '16/9'}}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {/* Images */}
                            <div
                                className="flex transition-transform duration-500 ease-in-out h-full"
                                style={{transform: `translateX(-${currentIndex * 100}%)`}}
                            >
                                {images.map((media, index) => {
                                    const resolvedSrc = media.thumbnailUrl ?? media.fileUrl ?? media.url;
                                    const caption = media.caption || media.title || 'Image de la galerie';

                                    // Ne pas afficher si ni resolvedSrc ni mediaId
                                    if (!resolvedSrc && !media.id) {
                                        return (
                                            <div
                                                key={`empty-${index}`}
                                                className="min-w-full h-full flex items-center justify-center bg-stone"
                                            >
                                                <div
                                                    className="w-full h-full flex items-center justify-center text-cream/60">
                                                    Aucune image disponible
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={media.id}
                                            className="group min-w-full h-full flex items-center justify-center relative cursor-zoom-in bg-stone"
                                            onClick={() => openLightbox(index)}
                                        >
                                            <div className="relative w-full h-full">
                                                <MediaImage
                                                    mediaId={media.id}
                                                    src={resolvedSrc}
                                                    alt={media.alt ?? caption}
                                                    fill
                                                    sizes="(max-width: 1280px) 100vw, 1280px"
                                                    className="relative h-full w-full"
                                                    imgClassName="brightness-[0.82] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:brightness-100"
                                                    style={{objectFit: 'cover'}}
                                                />
                                            </div>

                                            {/* Légende sur l'image */}
                                            {(media.caption || media.title) && (
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(44,36,22,0.8)] to-transparent p-4 pointer-events-none">
                                                    <p className="text-[11px] tracking-[0.06em] italic text-[rgba(247,242,232,0.85)]">
                                                        {caption}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Compteur */}
                            {showCounter && (
                                <div
                                    className="absolute top-4 right-4 bg-stone/80 text-cream px-3 py-1 rounded-full text-sm z-10 pointer-events-none border border-gold/30">
                                    {currentIndex + 1} / {totalImages}
                                </div>
                            )}
                        </div>

                        {/* Bouton suivant desktop */}
                        {hasNavigation && (
                            <button
                                onClick={goToNext}
                                className="hidden md:flex bg-stone/85 hover:bg-stone text-gold-light rounded-full p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-light cursor-pointer"
                                aria-label="Image suivante"
                            >
                                <svg
                                    className="w-6 h-6 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Boutons de navigation mobile (sous l'image) */}
                    {hasNavigation && (
                        <div className="md:hidden mt-3 flex items-center justify-center gap-3">
                            <button
                                onClick={goToPrevious}
                                className="bg-stone/85 hover:bg-stone text-gold-light rounded-full p-2.5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold-light cursor-pointer"
                                aria-label="Image précédente"
                            >
                                <svg
                                    className="w-5 h-5 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M15 19l-7-7 7-7"/>
                                </svg>
                            </button>

                            <button
                                onClick={goToNext}
                                className="bg-stone/85 hover:bg-stone text-gold-light rounded-full p-2.5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold-light cursor-pointer"
                                aria-label="Image suivante"
                            >
                                <svg
                                    className="w-5 h-5 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Indicateurs de points */}
                    {totalImages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gold-light cursor-pointer ${
                                        index === currentIndex
                                            ? 'w-8 h-2 bg-secondary'
                                            : 'w-2 h-2 bg-transparent border-secondary hover:bg-cream'
                                    }`}
                                    aria-label={`Aller à l'image ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Miniatures (optionnel pour desktop) */}
                    {showThumbnails && totalImages > 1 && totalImages <= 8 && (
                        <div className="hidden md:flex gap-2 mt-4 justify-center overflow-x-auto pb-2">
                            {images.map((media, index) => {
                                const resolvedSrc = media.thumbnailUrl ?? media.fileUrl ?? media.url;
                                return (
                                    <button
                                        key={media.id}
                                        onClick={() => goToSlide(index)}
                                        className={`flex-shrink-0 w-20 h-14 overflow-hidden border transition-all cursor-pointer ${
                                            index === currentIndex
                                                ? 'border-gold ring-2 ring-gold-light/60'
                                                : 'border-gold/30 hover:border-gold/60'
                                        }`}
                                    >
                                        <div
                                            className="relative w-full h-full bg-stone flex items-center justify-center">
                                            {(resolvedSrc || media.id) && (
                                                <MediaImage
                                                    mediaId={media.id}
                                                    src={resolvedSrc}
                                                    alt={`Miniature ${index + 1}`}
                                                    fill
                                                    sizes="80px"
                                                    style={{objectFit: 'cover', objectPosition: 'center'}}
                                                />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {isLightboxOpen && (
                <Lightbox
                    isOpen={isLightboxOpen}
                    images={images}
                    currentIndex={currentIndex}
                    onClose={closeLightbox}
                    onNext={goToNextInLightbox}
                    onPrevious={goToPreviousInLightbox}
                />
            )}
        </>
    );
};

export default CarouselGallery;
