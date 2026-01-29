'use client';

import React from 'react';
import useGetMedia from '@/hooks/useGetMedia';

type Variant = 'home' | 'default';

type Props = {
    mediaId?: string | number | null;
    title?: string;
    subtitle?: string;
    variant?: Variant;
};

export default function Hero({mediaId, title, subtitle, variant = 'default'}: Props) {
    const mediaIdStr = mediaId ? String(mediaId) : undefined;
    const {mediaUrl} = useGetMedia(mediaIdStr);

    // Background div rendered only when mediaUrl exists
    const bgDiv = mediaUrl ? (
        <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
                backgroundImage: `url(${mediaUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                // pour la variante home on veut un effet fixé, sinon on laisse normal
                backgroundAttachment: variant === 'home' ? 'fixed' : 'scroll',
                zIndex: 0,
            }}
        />
    ) : null;

    // Classes diffèrent selon la variante
    const sectionClassBase = 'relative overflow-hidden shadow-lg';
    const homeClasses = 'h-[80vh] bg-fixed bg-center bg-cover rounded-b-[50%]';
    const defaultClasses = 'h-60 bg-center bg-cover';

    return (
        <section className={`${sectionClassBase} ${variant === 'home' ? homeClasses : defaultClasses}`}>
            {bgDiv}

            {/* Overlay - semi-transparent pour laisser voir l'image de fond */}
            <div className="absolute inset-0 bg-primary-light opacity-40 z-5"/>

            {/* Content container */}
            <div className="absolute inset-0 flex items-center justify-center" style={{zIndex: 10}}>
                <div
                    className={variant === 'home' ? 'bg-primary-light backdrop-blur-md rounded-lg px-10 py-8 text-center text-gray-800 shadow-xl max-w-2xl' : 'p-4 md:p-6'}>
                    {title && (
                        <h1
                            className={variant === 'home' ? 'text-4xl md:text-5xl font-serif font-semibold mb-4' : 'text-3xl md:text-4xl lg:text-5xl font-serif text-white text-center uppercase drop-shadow-lg'}>
                            {title}
                        </h1>
                    )}

                    {variant === 'home' && <hr className="border-secondary mb-4"/>}

                    {subtitle && variant === 'home' && <h2 className="text-2xl font-light">{subtitle}</h2>}
                </div>
            </div>
        </section>
    );
}
