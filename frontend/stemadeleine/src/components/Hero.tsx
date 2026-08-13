'use client';

import React from 'react';
import useGetMedia from '@/hooks/useGetMedia';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import {HeartIcon} from '@heroicons/react/24/solid';

type Variant = 'home' | 'default';

type Props = {
    mediaId?: string | number | null;
    title?: string;
    subtitle?: string;
    description?: string;
    variant?: Variant;
    className?: string;
};

export default function Hero({mediaId, title, subtitle, description, variant = 'default', className = ''}: Props) {
    const mediaIdStr = mediaId ? String(mediaId) : undefined;
    const {mediaUrl} = useGetMedia(mediaIdStr);
    const [isDonateHovered, setIsDonateHovered] = React.useState(false);
    const [isDiscoverHovered, setIsDiscoverHovered] = React.useState(false);

    const homeTitle = title?.trim() || 'Les Amis de Sainte Madeleine';
    const homeSubline =
        subtitle?.trim() || 'Association de sauvegarde du patrimoine · fondée en 2015';
    const homeBody =
        description?.trim() ||
        "Protéger, restaurer et faire vivre l'église Sainte-Madeleine de La Jarrie, joyau roman du Saintonge, pour les générations futures.";

    const renderHomeTitle = (value: string) => {
        const marker = 'Sainte Madeleine';
        const index = value.indexOf(marker);

        if (index < 0) {
            return value;
        }

        const before = value.slice(0, index).trim();
        const highlighted = value.slice(index, index + marker.length);
        const after = value.slice(index + marker.length).trim();

        return (
            <>
                {before ? (
                    <>
                        {before}
                        <br/>
                    </>
                ) : null}
                <em className="text-secondary-light italic">{highlighted}</em>
                {after ? ` ${after}` : ''}
            </>
        );
    };

    // Background div rendered only when mediaUrl exists
    const bgDiv = mediaUrl ? (
        <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
                backgroundImage: `url(${mediaUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: variant === 'home' ? 'top' : 'center',
                backgroundRepeat: 'no-repeat',
                // pour la variante home on veut un effet fixé, sinon on laisse normal
                backgroundAttachment: variant === 'home' ? 'fixed' : 'scroll',
                zIndex: 0,
            }}
        />
    ) : null;

    // Classes diffèrent selon la variante
    const sectionClassBase = 'relative shadow-lg';
    // Pour home : même hauteur que default sur mobile (h-60), hauteur normale sur desktop (md:h-[80vh])
    const homeClasses = 'group h-[92vh] min-h-[560px] bg-fixed bg-center bg-cover';
    const defaultClasses = 'h-60 bg-center bg-cover';

    return (
        <section className={`${sectionClassBase} ${variant === 'home' ? homeClasses : defaultClasses} ${className}`}>
            {bgDiv}

            {variant === 'home' ? (
                <div
                    className="absolute inset-0 z-[1] bg-black/35 transition-all duration-[400ms] group-hover:bg-black/15"/>
            ) : (
                <div className="absolute inset-0 z-[1] bg-primary-light opacity-40"/>
            )}

            {/* Content container */}
            <div className="absolute inset-0 z-[2] flex items-center justify-center">
                <div className={variant === 'home' ? 'w-full max-w-[700px] px-8 text-center' : 'p-4 md:p-6'}>
                    {variant === 'home' ? (
                        <>
                            <div
                                className="mb-7 inline-flex items-center gap-4 uppercase tracking-[0.22em] text-[11px] font-medium text-secondary"
                                style={{textShadow: '0 1px 8px rgba(0,0,0,0.7), 0 2px 20px rgba(0,0,0,0.5)'}}
                            >
                                <span className="h-px w-7 bg-current opacity-80"/>
                                <span>La Jarrie · Charente-Maritime</span>
                                <span className="h-px w-7 bg-current opacity-80"/>
                            </div>

                            <h1
                                className="mb-4 text-[clamp(2.2rem,5vw,3.6rem)] font-normal leading-[1.2] text-secondary"
                                style={{textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 4px 32px rgba(0,0,0,0.6)'}}
                            >
                                {renderHomeTitle(homeTitle)}
                            </h1>

                            <p
                                className="mb-8 text-xs uppercase tracking-[0.1em] text-secondary-light"
                                style={{textShadow: '0 1px 8px rgba(0,0,0,0.8), 0 2px 20px rgba(0,0,0,0.6)'}}
                            >
                                {homeSubline}
                            </p>

                            <p
                                className="mx-auto mb-11 max-w-[640px] text-base leading-[1.8] text-secondary-light"
                                style={{textShadow: '0 1px 6px rgba(0,0,0,0.75), 0 2px 16px rgba(0,0,0,0.5)'}}
                            >
                                {homeBody}
                            </p>

                            <div className="flex flex-wrap justify-center gap-4">
                                <IconButton
                                    as="a"
                                    href="https://www.helloasso.com/associations/les-amis-de-sainte-madeleine-de-la-jarrie/formulaires/2"
                                    icon={HeartIcon}
                                    label="Faire un don"
                                    variant="secondary"
                                    size="lg"
                                    unstyled={true}
                                    forceWhiteOnHover={false}
                                    onMouseEnter={() => setIsDonateHovered(true)}
                                    onMouseLeave={() => setIsDonateHovered(false)}
                                    style={{
                                        backgroundColor: isDonateHovered ? 'var(--color-secondary-light)' : 'var(--color-secondary)',
                                        color: 'var(--color-primary-dark)',
                                    }}
                                    className="rounded-none border-0 px-9 py-3 text-[11px] font-semibold uppercase tracking-[0.14em]"
                                />
                                <Button
                                    as="a"
                                    href="/about"
                                    variant="outline"
                                    size="lg"
                                    unstyled={true}
                                    onMouseEnter={() => setIsDiscoverHovered(true)}
                                    onMouseLeave={() => setIsDiscoverHovered(false)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        borderColor: isDiscoverHovered
                                            ? 'var(--color-secondary-light)'
                                            : 'rgba(var(--color-secondary-500),0.5)',
                                        color: isDiscoverHovered
                                            ? 'rgb(var(--color-secondary-50))'
                                            : 'var(--color-secondary-light)',
                                    }}
                                    className="rounded-none border px-9 py-3 text-[11px] font-medium uppercase tracking-[0.14em]"
                                >
                                    Découvrir l&apos;association
                                </Button>
                            </div>
                        </>
                    ) : (
                        title && (
                            <h1 className="text-3xl font-serif text-center text-white uppercase drop-shadow-lg md:text-4xl lg:text-5xl">
                                {title}
                            </h1>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}
