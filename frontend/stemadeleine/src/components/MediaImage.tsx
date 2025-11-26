'use client';

import React from 'react';
import Image, { type ImageProps } from 'next/image';
import useGetMedia from '@/hooks/useGetMedia';

type MediaImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  mediaId?: string | number | null;
  src?: string; // fallback or direct URL
  alt?: string;
  loading?: 'eager' | 'lazy'; // defaults to 'lazy'
  fallbackSrc?: string; // optional fallback if no media found
  showTitle?: boolean;
  caption?: string; // optional caption/title override
};

export default function MediaImage(props: MediaImageProps) {
  const {
    mediaId,
    src: srcProp,
    alt = '',
    loading = 'lazy',
    fallbackSrc = undefined,
    showTitle = false,
    caption,
    ...rest
  } = props;

  const imageProps = rest as Omit<ImageProps, 'src' | 'alt'>;

  const mediaIdStr = mediaId != null ? String(mediaId) : undefined;
  // Appel au hook. Sa forme varie selon le dossier (backoffice / frontend) —
  // on caste via `unknown` avant de lire les champs optionnels pour rester sûr.
  const _useGetMediaRes = useGetMedia(mediaIdStr) as unknown as
    | { mediaUrl?: string | null; media?: { title?: string } }
    | null
    | undefined;

  const mediaUrl = _useGetMediaRes?.mediaUrl ?? null;
  const media = _useGetMediaRes?.media;

  // Resolve final src: priority mediaUrl (from mediaId) -> src prop -> fallback
  const resolvedSrc = mediaUrl ?? srcProp ?? fallbackSrc ?? '';

  // If no src resolved, don't render image
  if (!resolvedSrc) return null;

  const mediaTitle = showTitle ? (caption ?? media?.title ?? undefined) : undefined;

  const isBlob = typeof resolvedSrc === 'string' && resolvedSrc.startsWith('blob:');

  // Helper to safely read style values
  const getStyle = (): React.CSSProperties | undefined => imageProps.style as React.CSSProperties | undefined;

  // If blob URL, Next/Image cannot optimize it. Render a native <img> and try to mimic Image props.
  if (isBlob) {
    const fill = imageProps.fill === true;
    const style = {
      ...(getStyle() ?? {}),
      objectFit: (getStyle()?.objectFit as React.CSSProperties['objectFit']) ?? 'cover',
    } as React.CSSProperties;

    if (fill) {
      // compute a safe figure height: prefer explicit style.height or numeric height prop, otherwise fallback
      const explicitHeight = getStyle()?.height as string | undefined;
      const numericHeight = typeof imageProps.height === 'number' ? `${imageProps.height}px` : undefined;
      const figureStyle: React.CSSProperties = {
        width: '100%',
        minHeight: explicitHeight ?? numericHeight ?? '12rem',
        display: 'block',
        overflow: 'hidden',
      };

      const objectFitValue = (getStyle()?.objectFit as React.CSSProperties['objectFit']) ?? 'cover';
      const objectPositionValue = (getStyle()?.objectPosition as React.CSSProperties['objectPosition']) ?? 'center';
      // Use background-image to avoid object-fit inconsistencies and cropping
      const bgSize = objectFitValue === 'contain' ? 'contain' : 'cover';
      const figureBgStyle: React.CSSProperties = {
        ...figureStyle,
        backgroundImage: `url(${resolvedSrc})`,
        backgroundSize: bgSize,
        backgroundPosition: objectPositionValue as string,
        backgroundRepeat: 'no-repeat',
      };

      return (
        <figure className={`${imageProps.className ?? ''} relative w-full h-full`} style={figureBgStyle}>
          {/* Keep an accessible image for screen readers */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolvedSrc} alt={alt || mediaTitle || ''} className="sr-only" loading={loading} />
          {mediaTitle && (
            <figcaption
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-sm px-2 py-1 rounded z-10">
              {mediaTitle}
            </figcaption>
          )}
        </figure>
      );
    }

    // If width/height provided in props, pass them as attributes
    const width = typeof imageProps.width === 'number' ? (imageProps.width as number) : undefined;
    const height = typeof imageProps.height === 'number' ? (imageProps.height as number) : undefined;

    return (
      <figure className={imageProps.className ?? undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvedSrc}
          alt={alt || mediaTitle || ''}
          width={width}
          height={height}
          style={style}
          loading={loading}
        />
        {mediaTitle && (
          <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-300 text-center">
            {mediaTitle}
          </figcaption>
        )}
      </figure>
    );
  }

  // For non-blob sources, use Next/Image and pass remaining props
  const { alt: _altFromProps, src: _srcFromProps, fill: _fillFromProps, ...imagePropsRest } = imageProps as ImageProps;
  // avoid unused variable warnings
  void _altFromProps;
  void _srcFromProps;
  void _fillFromProps;

  const figureClassName = (imageProps as { className?: string }).className ?? undefined;

  const nextImageProps: Omit<ImageProps, 'alt'> = {
    ...(imagePropsRest as Omit<ImageProps, 'alt'>),
    src: resolvedSrc as string,
  };

  return (
    <figure className={figureClassName}>
      <Image alt={alt || mediaTitle || ''} {...nextImageProps} />
      {mediaTitle && (
        <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-300 text-center z-10 relative">
          {mediaTitle}
        </figcaption>
      )}
    </figure>
  );
}
