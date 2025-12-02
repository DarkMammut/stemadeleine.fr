'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import MediaImage from '@/components/MediaImage';
import Lightbox from '@/components/Lightbox';

type Media = {
  id: string;
  url?: string;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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
}

const CarouselGallery: React.FC<Props> = ({
  module,
  gallery,
  loading = false,
  autoPlay = false,
  autoPlayInterval = 5000,
  showThumbnails = true,
  showArrows = true,
  showCounter = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const images = gallery?.medias ?? [];
  const totalImages = images.length;

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
    return <div className="py-8 text-center">Chargement de la galerie...</div>;
  }

  if (!gallery || !images || images.length === 0) {
    return (
      <div className="w-full py-6 border-b border-gray-200 last:border-b-0">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">{module.title ?? 'Galerie'}</h3>
          <p className="text-green-600 text-sm">Aucune image à afficher</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full py-6">
        {module.title && (
          <h3 className="text-2xl font-semibold mb-6 text-center">{module.title}</h3>
        )}

        <div
          className="relative w-full max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Container du carrousel */}
          <div
            className="relative overflow-hidden rounded-lg bg-gray-900 shadow-lg"
            style={{ aspectRatio: '16/9' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Images */}
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {images.map((media, index) => {
                const resolvedSrc = media.thumbnailUrl ?? media.url;

                // Ne pas afficher si ni resolvedSrc ni mediaId
                if (!resolvedSrc && !media.id) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-w-full h-full flex items-center justify-center bg-gray-100"
                    >
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Aucune image disponible
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={media.id}
                    className="min-w-full h-full flex items-center justify-center relative cursor-zoom-in bg-primary-light"
                    onClick={() => openLightbox(index)}
                  >
                    <div className="relative w-full h-full">
                      <MediaImage
                        mediaId={media.id}
                        src={resolvedSrc}
                        alt={media.alt ?? media.caption ?? media.title ?? ''}
                        fill
                        sizes="(max-width: 1280px) 100vw, 1280px"
                        style={{ objectFit: 'contain' }}
                        className="transition-opacity duration-300"
                      />
                    </div>

                    {/* Légende sur l'image */}
                    {(media.caption || media.title) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pointer-events-none">
                        <p className="text-white text-sm md:text-base">
                          {media.caption || media.title}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Boutons de navigation */}
            {showArrows && totalImages > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-secondary-light cursor-pointer z-10"
                  aria-label="Image précédente"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-gray-800 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-secondary-light cursor-pointer z-10"
                  aria-label="Image suivante"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-gray-800 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Compteur */}
            {showCounter && (
              <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-10 pointer-events-none">
                {currentIndex + 1} / {totalImages}
              </div>
            )}
          </div>

          {/* Indicateurs de points */}
          {totalImages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-light cursor-pointer ${
                    index === currentIndex
                      ? 'w-8 h-2 bg-secondary'
                      : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
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
                const resolvedSrc = media.thumbnailUrl ?? media.url;
                return (
                  <button
                    key={media.id}
                    onClick={() => goToSlide(index)}
                    className={`flex-shrink-0 w-20 h-14 rounded overflow-hidden border-2 transition-all cursor-pointer ${
                      index === currentIndex
                        ? 'border-secondary ring-2 ring-secondary-light'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="relative w-full h-full bg-primary flex items-center justify-center">
                      {(resolvedSrc || media.id) && (
                        <MediaImage
                          mediaId={media.id}
                          src={resolvedSrc}
                          alt={`Miniature ${index + 1}`}
                          fill
                          sizes="80px"
                          style={{ objectFit: 'contain', objectPosition: 'center' }}
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

