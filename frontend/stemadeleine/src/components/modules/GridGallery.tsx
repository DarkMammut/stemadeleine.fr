'use client';

import React, {useMemo, useState} from 'react';
import clsx from 'clsx';
import MediaImage from '@/components/MediaImage';
import Lightbox from '@/components/Lightbox';

type Media = {
    id: string;
    url?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
    fileName?: string;
    title?: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
};

interface Props {
    images: Media[];
    title?: string;
    loading?: boolean;
}

function resolveImageSrc(media: Media): string | undefined {
    return media.thumbnailUrl ?? media.fileUrl ?? media.url;
}

function resolveImageTitle(media: Media): string {
    return media.title ?? media.caption ?? media.fileName ?? 'Image de la galerie';
}

const GridGallery: React.FC<Props> = ({images, title, loading = false}) => {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);

    const normalizedImages = useMemo(
        () =>
            images
                .filter((image) => Boolean(resolveImageSrc(image) || image.id))
                .map((image) => ({
                    ...image,
                    id: String(image.id),
                    title: resolveImageTitle(image),
                })),
        [images],
    );

    const openLightbox = (index: number) => {
        setCurrentLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => setIsLightboxOpen(false);
    const goToNextImage = () =>
        setCurrentLightboxIndex((prev) => Math.min(prev + 1, normalizedImages.length - 1));
    const goToPreviousImage = () =>
        setCurrentLightboxIndex((prev) => Math.max(prev - 1, 0));

    if (loading) {
        return <div className="text-center text-cream/80">Chargement de la galerie...</div>;
    }

    if (normalizedImages.length === 0) {
        return (
            <div className="w-full text-center text-cream/70">
                Aucune image dans cette galerie.
            </div>
        );
    }

    return (
        <div className="w-full">
            {title && (
                <h2 className="font-serif text-[clamp(1.7rem,3vw,2.4rem)] text-cream font-normal leading-[1.25] mb-6">
                    {title}
                </h2>
            )}

            <div
                className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:auto-rows-[240px] gap-[3px] mt-4">
                {normalizedImages.map((image, index) => {
                    const caption = image.caption ?? resolveImageTitle(image);
                    const imageSrc = resolveImageSrc(image);
                    const isFeatured = index === 0;

                    return (
                        <button
                            key={image.id}
                            type="button"
                            onClick={() => openLightbox(index)}
                            className={clsx(
                                'group relative overflow-hidden bg-[#3A3020] text-left cursor-pointer',
                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light',
                                isFeatured && 'sm:col-span-2 lg:col-span-1 lg:row-span-2',
                            )}
                        >
                            <div className="relative h-full min-h-[220px]">
                                <MediaImage
                                    mediaId={image.id}
                                    src={imageSrc}
                                    alt={image.alt ?? caption}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="relative h-full w-full brightness-[0.82] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:brightness-100"
                                    style={{objectFit: 'cover'}}
                                    loading="lazy"
                                />
                            </div>

                            <figcaption
                                className="absolute inset-x-0 bottom-0 px-4 py-3 bg-gradient-to-t from-[rgba(44,36,22,0.8)] to-transparent text-[11px] tracking-[0.06em] italic text-[rgba(247,242,232,0.85)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                {caption}
                            </figcaption>
                        </button>
                    );
                })}
            </div>

            <Lightbox
                isOpen={isLightboxOpen}
                images={normalizedImages}
                currentIndex={currentLightboxIndex}
                onClose={closeLightbox}
                onNext={goToNextImage}
                onPrevious={goToPreviousImage}
            />
        </div>
    );
};

export default GridGallery;
