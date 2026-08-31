'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

export type PageItem = {
    id: string | number;
    name: string;
    slug: string;
    isVisible?: boolean;
    children?: PageItem[];
};

type NavigationProps = {
    pagesTree?: PageItem[];
};

const Navigation: React.FC<NavigationProps> = ({pagesTree = []}) => {
    const [toggle, setToggle] = useState(false);
    const [hoveredMenu, setHoveredMenu] = useState<string | number | null>(null);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
    const router = useRouter();

    // Fermer le menu mobile lors de la navigation
    useEffect(() => {

        // Fermer le menu si on clique ailleurs
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (toggle && !target.closest('.navigation')) {
                setToggle(false);
                setHoveredMenu(null);
                setExpandedMenus({});
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [toggle]);

    const tree = Array.isArray(pagesTree) ? pagesTree : [];

    // Filtrer uniquement les pages visibles
    const visiblePages = tree.filter((page) => {
        if (!page?.isVisible) return false;
        if (page.slug === '/') return false;
        if (page.name?.trim().toLowerCase() === 'accueil') return false;
        return true;
    });

    const handleMenuEnter = (pageId: string | number) => {
        setHoveredMenu(pageId);
    };

    const handleMenuLeave = () => {
        setHoveredMenu(null);
    };

    const handleToggleMenu = () => {
        setToggle((previous) => {
            const next = !previous;
            if (!next) {
                setHoveredMenu(null);
                setExpandedMenus({});
            }
            return next;
        });
    };

    const toggleSubMenu = (pageId: string | number) => {
        const key = String(pageId);
        setExpandedMenus((current) => ({
            ...current,
            [key]: !current[key],
        }));
    };

    // Fonction pour gérer la navigation
    const handleNavigation = (href: string) => {
        setToggle(false);
        setHoveredMenu(null);
        setExpandedMenus({});
        router.push(href);
    };

    if (!tree || tree.length === 0) {
        // show nothing if pages not loaded yet (Layout handles fetch)
        return null;
    }

    return (
        <div className="navigation">
            {/* Burger Menu Button */}
            <button
                className={`relative z-40 flex items-center justify-center p-2 bg-transparent border-none cursor-pointer lg:hidden`}
                type="button"
                onClick={handleToggleMenu}
                aria-label="button for navigation in menu"
            >
                <ul className="outline-none cursor-pointer relative w-8 h-8 flex items-center justify-center">
                    <li
                        className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-secondary-100 transition-all duration-300 ${
                            toggle ? '-translate-y-1/2 rotate-45' : '-translate-y-[9px]'
                        }`}
                    />
                    <li
                        className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary-100 transition-all duration-300 ${
                            toggle ? 'opacity-0' : 'opacity-100'
                        }`}
                    />
                    <li
                        className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-secondary-100 transition-all duration-300 ${
                            toggle ? '-translate-y-1/2 -rotate-45' : 'translate-y-[8px]'
                        }`}
                    />
                </ul>
            </button>

            {/* Navigation Menu */}
            <nav
                className={`fixed top-[60px] left-0 w-full h-[calc(100vh-60px)] transition-all duration-300 z-30 ${
                    !toggle ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'
                } lg:opacity-100 lg:visible lg:top-0 lg:left-0 lg:right-0 lg:bg-transparent lg:relative lg:h-auto lg:w-auto lg:pointer-events-auto ${
                    toggle
                        ? 'bg-primary/95 backdrop-blur-sm'
                        : ''
                }`}
            >
                <ul
                    className={`flex m-0 p-0 text-center list-none w-full h-full ${
                        toggle ? 'flex-col items-stretch justify-start px-5 py-6 gap-3 overflow-y-auto' : 'justify-center'
                    } lg:flex-row lg:justify-end lg:h-auto`}
                >
                    {visiblePages.map((page) => {
                        const visibleChildren = Array.isArray(page.children)
                            ? page.children.filter((child) => child?.isVisible)
                            : [];
                        const hasChildren = visibleChildren.length > 0;
                        const isExpanded = Boolean(expandedMenus[String(page.id)]);

                        return (
                            <li
                                key={page.id}
                                className={`
                  relative flex items-center justify-center group
                  ${toggle ? 'w-full' : 'px-6 lg:px-4'}
                  lg:px-4 lg:py-0
                `}
                                onMouseEnter={() => handleMenuEnter(page.id)}
                                onMouseLeave={handleMenuLeave}
                            >
                                <div
                                    className={`${toggle ? 'w-full rounded-xl border border-secondary bg-primary-dark px-4 py-3' : ''}`}>
                                    <div className={`${toggle ? 'flex items-center justify-between gap-3' : ''}`}>
                                        <button
                                            onClick={() => handleNavigation(page.slug)}
                                            className={`relative inline-flex text-decoration-none z-10 bg-transparent border-none cursor-pointer
                        after:absolute after:content-[''] after:top-full after:left-0
                        after:w-full after:h-0.5 after:bg-secondary after:scale-x-0
                        after:origin-right after:transition-transform after:duration-500
                        hover:after:scale-x-100 hover:after:origin-left
                        ${toggle ? 'text-secondary-light py-1 text-left' : 'text-secondary-light'}
                        lg:text-secondary-light lg:py-0
                      `}
                                        >
                      <span className="overflow-hidden">
                        <div
                            className={`hover:text-secondary transition-colors duration-300 uppercase no-word-break ${toggle ? 'text-[0.92rem] tracking-[0.12em] font-medium' : 'text-xl md:text-lg lg:text-[11px] lg:tracking-[0.12em] lg:font-medium'}`}>
                          {page.name}
                        </div>
                      </span>
                                        </button>

                                        {toggle && hasChildren && (
                                            <button
                                                type="button"
                                                onClick={() => toggleSubMenu(page.id)}
                                                aria-expanded={isExpanded}
                                                aria-label={`Afficher le sous-menu ${page.name}`}
                                                className="inline-flex h-9 w-9 items-center justify-center text-secondary-light transition-colors duration-300 hover:border-secondary hover:text-secondary"
                                            >
                                                <svg
                                                    className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                    viewBox="0 0 20 20"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor"
                                                          strokeWidth="1.8" strokeLinecap="round"
                                                          strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Zone invisible pour maintenir le hover */}
                                    {hasChildren && (
                                        <div
                                            className="absolute top-full left-0 w-full h-[18px] bg-transparent hidden lg:block"/>
                                    )}

                                    {/* Sous-menu */}
                                    {hasChildren && (
                                        <ul
                                            className={`
                      ${toggle
                                                ? `overflow-hidden rounded-lg bg-primary transition-all duration-300 ${isExpanded ? 'mt-2 max-h-[500px] opacity-100' : 'mt-0 max-h-0 opacity-0'}`
                                                : `absolute left-1/2 top-full transform -translate-x-1/2 min-w-[200px] z-50 bg-primary-dark rounded-b-lg shadow-lg flex flex-col transition-all duration-300 lg:mt-[18px] ${hoveredMenu === page.id ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`
                                            }
                    `}
                                        >
                                            {visibleChildren.map((child) => (
                                                <li key={child.id}
                                                    className={`relative group/child ${toggle ? 'border-b border-secondary-500/20 last:border-b-0' : ''}`}>
                                                    <button
                                                        onClick={() => handleNavigation(child.slug)}
                                                        className={`
                                    ${toggle
                                                           ? 'block w-full px-4 py-3 bg-transparent border-none cursor-pointer text-center text-secondary-light transition-colors duration-300 hover:text-secondary'
                                                           : 'block px-4 py-3 transition-colors duration-200 relative bg-transparent border-none cursor-pointer text-center w-full text-secondary-light after:absolute after:content-[\'\'] after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:bg-secondary after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left hover:text-secondary'
                                                        }
                                  `}
                                                    >
                          <span className="overflow-hidden">
                            <div
                                className={`transition-colors duration-300 no-word-break ${toggle ? 'text-sm tracking-[0.08em] uppercase' : 'text-xs md:text-sm uppercase font-serif'}`}>
                              {child.name}
                            </div>
                          </span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

export default Navigation;
