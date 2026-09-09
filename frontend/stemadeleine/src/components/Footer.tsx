'use client';

import React from 'react';
import type {FooterParent} from './Layout';
import IconButton from '@/components/IconButton';
import {HeartIcon} from '@heroicons/react/24/solid';
import useGetOrganization from '@/hooks/useGetOrganization';

type FooterProps = {
    pagesNav?: FooterParent[];
};

function FooterNavColumn({parent}: { parent: FooterParent }) {
    return (
        <div className="text-center">
            <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em]">
                <a
                    href={parent.href}
                    className="transition-colors duration-200"
                    style={{color: 'var(--color-secondary)'}}
                    onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color =
                            'var(--color-secondary-light)')
                    }
                    onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color =
                            'var(--color-secondary)')
                    }
                >
                    {parent.name}
                </a>
            </h3>
            <ul className="space-y-[0.45rem]">
                {parent.children.map((child) => (
                    <li key={child.name}>
                        <a
                            href={child.href}
                            className="text-[12px] transition-colors duration-200"
                            style={{color: 'rgba(247,242,232,0.38)'}}
                            onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLAnchorElement).style.color =
                                    'var(--color-secondary-light)')
                            }
                            onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLAnchorElement).style.color =
                                    'rgba(247,242,232,0.38)')
                            }
                        >
                            {child.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Footer({pagesNav}: FooterProps) {
    const parents = Array.isArray(pagesNav) ? pagesNav : [];
    const [isDonHovered, setIsDonHovered] = React.useState(false);

    type OrgInfo = { name?: string } | undefined | null;
    const {info} = useGetOrganization() as { info?: OrgInfo };
    const orgName = info?.name || 'Les Amis de Sainte Madeleine';

    return (
        <footer
            className="border-t px-10 pb-8 pt-14 bg-primary-dark border-secondary"
        >
            <div className="mx-auto max-w-[960px]">

                <div
                    className="mb-[1.8rem] pb-10"
                    style={{borderBottom: '1px solid rgba(184,151,58,0.1)'}}
                >
                    {/* Brand + Donation */}
                    <div className="mb-10 flex flex-wrap items-start justify-between gap-8">
                        {/* Brand */}
                        <div>
                            <p
                                className="mb-[0.4rem] font-serif text-[1.1rem]"
                                style={{color: 'var(--color-secondary-light)'}}
                            >
                                {orgName}
                            </p>
                            <p className="text-[11px]" style={{color: 'rgba(247,242,232,0.3)'}}>
                                de la Jarrie · Charente-Maritime
                            </p>
                        </div>

                        {/* Donation button */}
                        <IconButton
                            as="a"
                            href="https://www.helloasso.com/associations/les-amis-de-sainte-madeleine-de-la-jarrie/formulaires/2"
                            icon={HeartIcon}
                            label="Faire un don"
                            variant="outline"
                            unstyled={true}
                            forceWhiteOnHover={false}
                            onMouseEnter={() => setIsDonHovered(true)}
                            onMouseLeave={() => setIsDonHovered(false)}
                            style={{
                                backgroundColor: 'transparent',
                                color: isDonHovered
                                    ? 'var(--color-secondary-light)'
                                    : 'var(--color-secondary)',
                                borderColor: isDonHovered
                                    ? 'var(--color-secondary)'
                                    : 'rgba(184,151,58,0.3)',
                            }}
                            className="rounded-none border px-[1.1rem] py-[0.6rem] text-[11px] font-semibold uppercase tracking-[0.1em]"
                        />
                    </div>

                    {/* Nav columns: toutes les pages principales, 3 par ligne */}
                    {parents.length > 0 && (
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-3">
                            {parents.map((parent) => (
                                <FooterNavColumn key={parent.name} parent={parent}/>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom row */}
                <div className="flex flex-wrap justify-between gap-2">
          <span className="text-[11px]" style={{color: 'rgba(247,242,232,0.22)'}}>
            © 2025 Les Amis de Sainte Madeleine de la Jarrie · Tous droits réservés
          </span>
                    <span className="text-[11px]" style={{color: 'rgba(247,242,232,0.22)'}}>
            Mentions légales · Politique de confidentialité
          </span>
                </div>

            </div>
        </footer>
    );
}