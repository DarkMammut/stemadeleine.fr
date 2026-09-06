'use client';

import React from 'react';
import type {FooterParent} from './Layout';
import IconButton from '@/components/IconButton';
import {HeartIcon} from '@heroicons/react/24/solid';
import useGetOrganization from '@/hooks/useGetOrganization';

type FooterProps = {
    pagesNav?: FooterParent[];
};

export default function Footer({pagesNav}: FooterProps) {
    const parents = Array.isArray(pagesNav) ? pagesNav : [];
    const [isDonHovered, setIsDonHovered] = React.useState(false);

    type OrgInfo = { name?: string } | undefined | null;
    const {info} = useGetOrganization() as { info?: OrgInfo };
    const orgName = info?.name || 'Les Amis de Sainte Madeleine';

    // Two navigation columns from CMS pages (first two parent entries)
    const col1 = parents[0] ?? null;
    const col2 = parents[1] ?? null;

    return (
        <footer
            className="border-t px-10 pb-8 pt-14 bg-primary-dark border-secondary"
        >
            <div className="mx-auto max-w-[960px]">

                {/* Top row */}
                <div
                    className="mb-[1.8rem] flex flex-wrap items-start justify-between gap-8 pb-10"
                    style={{borderBottom: '1px solid rgba(184,151,58,0.1)'}}
                >
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

                    {/* Nav column 1 */}
                    {col1 && (
                        <div>
                            <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em]">
                                <a
                                    href={col1.href}
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
                                    {col1.name}
                                </a>
                            </h3>
                            <ul className="space-y-[0.45rem]">
                                {col1.children.map((child) => (
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
                    )}

                    {/* Nav column 2 */}
                    {col2 && (
                        <div>
                            <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em]">
                                <a
                                    href={col2.href}
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
                                    {col2.name}
                                </a>
                            </h3>
                            <ul className="space-y-[0.45rem]">
                                {col2.children.map((child) => (
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
                    )}

                    {/* Donation button */}
                    <div className="flex items-start">
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