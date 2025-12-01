'use client';

import React, { useCallback, useEffect } from 'react';
import MediaImage from '@/components/MediaImage';
import clsx from 'clsx';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

type LightboxMedia = {
  id: string;
  url?: string;
  thumbnailUrl?: string;
  title?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
};

interface LightboxProps {
  isOpen: boolean;
  images: LightboxMedia[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Lightbox({
                                   isOpen,
                                   images,
                                   currentIndex,
                                   onClose,
                                   onNext,
                                   onPrevious,
                                 }: LightboxProps) {
  // Gestion des touches clavier
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrevious();
          break;
        case 'ArrowRight':
          onNext();
          break;
      }
    },
    [isOpen, onClose, onNext, onPrevious],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Bloquer le scroll du body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Bouton fermer */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        aria-label="Fermer la lightbox"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* Compteur */}
      <div
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Bouton précédent */}
      {hasPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          aria-label="Image précédente"
        >
          <ChevronLeftIcon className="w-8 h-8" />
        </button>
      )}

      {/* Bouton suivant */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          aria-label="Image suivante"
        >
          <ChevronRightIcon className="w-8 h-8" />
        </button>
      )}

      {/* Conteneur de l'image */}
      <div
        className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8 lg:p-16 pb-32"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image - conteneur avec contraintes strictes */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            maxWidth: '90vw',
            maxHeight: currentImage.title ? 'calc(100vh - 280px)' : 'calc(100vh - 180px)',
          }}
        >
          <MediaImage
            mediaId={currentImage.id}
            src={currentImage.url || currentImage.thumbnailUrl}
            alt={currentImage.alt || currentImage.title || ''}
            width={currentImage.width || 1920}
            height={currentImage.height || 1080}
            style={{
              maxWidth: '90vw',
              maxHeight: currentImage.title ? 'calc(100vh - 280px)' : 'calc(100vh - 180px)',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
            }}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 70vw"
            loading="eager"
          />
        </div>

        {/* Titre/Caption */}
        {currentImage.title && (
          <div className="mt-4 mb-4 px-6 py-4 bg-white/10 backdrop-blur-sm rounded-lg max-w-2xl">
            <p className="text-white text-center text-lg font-medium">
              {currentImage.title}
            </p>
            {currentImage.caption && currentImage.caption !== currentImage.title && (
              <p className="text-white/80 text-center text-sm mt-2">
                {currentImage.caption}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Thumbnails en bas (optionnel pour navigation rapide) */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 max-w-full overflow-x-auto px-4 py-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={(e) => {
                e.stopPropagation();
                const diff = idx - currentIndex;
                if (diff > 0) {
                  for (let i = 0; i < diff; i++) onNext();
                } else if (diff < 0) {
                  for (let i = 0; i < Math.abs(diff); i++) onPrevious();
                }
              }}
              className={clsx(
                'relative w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden transition-all flex-shrink-0 cursor-pointer',
                idx === currentIndex
                  ? 'ring-2 ring-white opacity-100 scale-110'
                  : 'opacity-50 hover:opacity-100',
              )}
            >
              <div className="w-full h-full">
                <MediaImage
                  mediaId={img.id}
                  src={img.thumbnailUrl || img.url}
                  alt={img.alt || img.title || ''}
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  sizes="80px"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

