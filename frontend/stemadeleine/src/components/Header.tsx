'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import useGetOrganization from '@/hooks/useGetOrganization';
import Link from 'next/link';
import MediaImage from '@/components/MediaImage';

type HeaderProps = {
    pagesTree?: unknown[];
    // keep prop types for future use, not required for current static CSS solution
    headerHeight?: number;
    headerMdHeight?: number;
};

export default function Header({pagesTree}: HeaderProps): React.ReactElement {
    // Minimal typing for settings to avoid `any` and satisfy ESLint
    type OrgSettings = { logoMedia?: string | number | null } | undefined | null;
    type OrgInfo = { name?: string } | undefined | null;
    const {settings, info} = useGetOrganization() as { settings?: OrgSettings; info?: OrgInfo };

    // Use static Tailwind classes to keep server and client markup identical
    return (
        <header>
            {/* Header principal */}
            <div
                className="fixed top-0 left-0 z-40 h-[60px] w-full border-b border-secondary-500 bg-primary-dark shadow-xl">
                {/* inner container centered with max width to align left brand and right navigation */}
                <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 md:px-10">
                    {/* Logo + titre (left, cliquable) */}
                    <Link href="/" className="flex min-w-0 h-full items-center gap-3 text-secondary">
                        <div className="flex h-full max-w-[2.8rem] shrink-0 items-center md:max-w-[3.2rem]">
                            <MediaImage
                                mediaId={settings?.logoMedia}
                                alt="Logo"
                                // constrain to header height, width auto
                                style={{height: '100%', width: 'auto', objectFit: 'contain'} as React.CSSProperties}
                                sizes="(max-width: 768px) 2.8rem, 3.2rem"
                                preload={true}
                            />
                        </div>
                        <h1 className="line-clamp-2 font-serif text-lg font-normal leading-tight tracking-[0.06em] md:text-sm">
                            {info?.name || "Les Amis de Sainte Madeleine de la Jarrie"}
                        </h1>
                    </Link>

                    {/* Navigation desktop (right) */}
                    <div className="hidden lg:flex items-center justify-end flex-1">
                        <Navigation pagesTree={pagesTree}/>
                    </div>

                    {/* Navigation mobile/tablette (burger à droite) */}
                    <div className="lg:hidden ml-2">
                        <Navigation pagesTree={pagesTree}/>
                    </div>
                </div>
            </div>
        </header>
    );
}
