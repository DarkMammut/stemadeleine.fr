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
    const router = useRouter();

    // Fermer le menu mobile lors de la navigation
    useEffect(() => {

        // Fermer le menu si on clique ailleurs
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (toggle && !target.closest('.navigation')) {
                setToggle(false);
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

    // Fonction pour gérer la navigation
    const handleNavigation = (href: string) => {
        setToggle(false);
        setHoveredMenu(null);
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
                onClick={() => setToggle(!toggle)}
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
                        ? 'bg-primary'
                        : ''
                }`}
            >
                <ul
                    className={`flex m-0 p-0 text-center list-none w-full h-full ${
                        toggle ? 'flex-col justify-center items-center' : 'justify-center'
                    } lg:flex-row lg:justify-end lg:h-auto`}
                >
                    {visiblePages.map((page) => (
                        <li
                            key={page.id}
                            className={`
                relative flex items-center justify-center group
                ${toggle ? 'py-6 w-full' : 'px-6 lg:px-4'}
                lg:px-4 lg:py-0
              `}
                            onMouseEnter={() => handleMenuEnter(page.id)}
                            onMouseLeave={handleMenuLeave}
                        >
                            <button
                                onClick={() => handleNavigation(page.slug)}
                                className={`relative inline-flex text-decoration-none z-10 bg-transparent border-none cursor-pointer
                  after:absolute after:content-[''] after:top-full after:left-0
                  after:w-full after:h-0.5 after:bg-secondary after:scale-x-0
                  after:origin-right after:transition-transform after:duration-500
                  hover:after:scale-x-100 hover:after:origin-left
                  ${toggle ? 'text-secondary-light text-xl py-2' : 'text-secondary-light'}
                  lg:text-secondary-light lg:py-0
                `}
                            >
                <span className="overflow-hidden">
                  <div
                      className="hover:text-secondary transition-colors duration-300 text-xl md:text-lg lg:text-[11px] lg:tracking-[0.12em] lg:font-medium uppercase no-word-break">
                    {page.name}
                  </div>
                </span>
                            </button>

                            {/* Zone invisible pour maintenir le hover */}
                            {page.children && page.children.length > 0 && (
                                <div className="absolute top-full left-0 w-full h-6 bg-transparent hidden lg:block"/>
                            )}

                            {/* Sous-menu */}
                            {page.children && page.children.length > 0 && (
                                <ul
                                    className={`
                    ${toggle ?
                                        'relative opacity-100 visible pointer-events-auto mt-4 bg-transparent flex flex-col w-full'
                                        :
                                        `absolute left-1/2 top-full transform -translate-x-1/2 min-w-[200px] z-50 bg-primary-light rounded-b-lg shadow-lg flex flex-col transition-all duration-300 lg:mt-6 ${hoveredMenu === page.id ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`
                                    }
                  `}
                                >
                                    {page.children.map((child) => (
                                        <li key={child.id} className={`relative group/child ${toggle ? 'py-2' : ''}`}>
                                            <button
                                                onClick={() => handleNavigation(child.slug)}
                                                className={`
                                  ${toggle ?
                                                    'block w-full text-center py-2 bg-transparent border-none cursor-pointer text-secondary-light text-lg font-serif uppercase transition-colors duration-300 hover:text-secondary'
                                                    :
                                                    'block px-4 py-3 transition-colors duration-200 relative bg-transparent border-none cursor-pointer text-left w-full text-secondary-light after:absolute after:content-[\'\'] after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:bg-secondary after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left hover:text-secondary'
                                                }
                                `}
                                            >
                        <span className="overflow-hidden">
                          <div
                              className={`transition-colors duration-300 no-word-break ${toggle ? 'text-base font-serif uppercase' : 'text-xs md:text-sm uppercase font-serif'}`}>
                            {child.name}
                          </div>
                        </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Navigation;
