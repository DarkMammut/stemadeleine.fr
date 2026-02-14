'use client';

import React from 'react';
import {HeartIcon} from '@heroicons/react/24/solid';
import Navigation from '@/components/Navigation';
import IconButton from '@/components/IconButton';
import useGetOrganization from '@/hooks/useGetOrganization';
import Link from 'next/link';
import MediaImage from '@/components/MediaImage';

type HeaderProps = {
    pagesTree?: unknown[];
    // keep prop types for future use, not required for current static CSS solution
    headerHeight?: number;
    headerMdHeight?: number;
    // Titre à afficher sur mobile (pour la page home)
    mobileTitle?: string;
    isHomePage?: boolean;
};

export default function Header({pagesTree, mobileTitle, isHomePage = false}: HeaderProps): React.ReactElement {
    // Minimal typing for settings to avoid `any` and satisfy ESLint
    type OrgSettings = { logoMedia?: string | number | null } | undefined | null;
    const {settings} = useGetOrganization() as { settings?: OrgSettings };

    // Use static Tailwind classes to keep server and client markup identical
    // h-16 -> 4rem on mobile, md:h-20 -> 5rem on >=md
    return (
        <header>
            {/* Header principal */}
            <div className={`fixed top-0 left-0 w-full h-16 md:h-20 bg-gradient-primary z-40 shadow-xl`}>
                {/* inner container centered with max width to align left/logo, center/nav, right/button */}
                <div className="max-w-7xl mx-auto w-full h-full px-6 flex items-center justify-between">
                    {/* Logo (left) */}
                    <div className="flex items-center h-full">
                        <Link href="/" className="h-full flex items-center">
                            <div className="h-full flex items-center max-w-[3rem] md:max-w-[5rem]">
                                <MediaImage
                                    mediaId={settings?.logoMedia}
                                    alt="Logo"
                                    // constrain to header height, width auto
                                    style={{height: '100%', width: 'auto', objectFit: 'contain'} as React.CSSProperties}
                                    sizes={`(max-width: 768px) 3rem, 5rem`}
                                    preload={true}
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Titre mobile pour page home (center sur mobile, caché sur desktop) */}
                    {isHomePage && mobileTitle && (
                        <div className="md:hidden flex-1 flex justify-center px-4">
                            <h1 className="text-white font-serif font-semibold text-lg text-center truncate">
                                {mobileTitle}
                            </h1>
                        </div>
                    )}

                    {/* Navigation (center - caché sur mobile si titre présent, sinon normal) */}
                    <div className={`flex-1 flex justify-center ${isHomePage && mobileTitle ? 'hidden md:flex' : ''}`}>
                        <Navigation pagesTree={pagesTree}/>
                    </div>

                    {/* Donate button (right) */}
                    <div className="flex items-center justify-end">
                        <IconButton
                            as="a"
                            href="https://www.helloasso.com/associations/les-amis-de-sainte-madeleine-de-la-jarrie/formulaires/2"
                            target="_blank"
                            rel="noopener noreferrer"
                            icon={HeartIcon}
                            label="Don"
                            variant="secondary"
                            className="hidden lg:flex uppercase"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
