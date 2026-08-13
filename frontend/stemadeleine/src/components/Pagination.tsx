'use client';

import React, {useMemo} from 'react';
import clsx from 'clsx';

type PaginationVariant = 'light' | 'dark';
type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis';

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
    ariaLabel?: string;
    previousLabel?: string;
    nextLabel?: string;
    siblingCount?: number;
    showPageInfo?: boolean;
    disabled?: boolean;
    variant?: PaginationVariant;
}

function buildPaginationItems(currentPage: number, totalPages: number, siblingCount: number): PaginationItem[] {
    if (totalPages <= 0) {
        return [];
    }

    const visibleButtonCount = siblingCount * 2 + 5;

    if (totalPages <= visibleButtonCount) {
        return Array.from({length: totalPages}, (_, index) => index + 1);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 2);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);
    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;

    const items: PaginationItem[] = [1];

    if (showLeftEllipsis) {
        items.push('start-ellipsis');
    }

    for (let page = leftSibling; page <= rightSibling; page += 1) {
        items.push(page);
    }

    if (showRightEllipsis) {
        items.push('end-ellipsis');
    }

    items.push(totalPages);

    return items;
}

const Pagination: React.FC<Props> = ({
                                         currentPage,
                                         totalPages,
                                         onPageChange,
                                         className = '',
                                         ariaLabel = 'Pagination',
                                         previousLabel = 'Precedent',
                                         nextLabel = 'Suivant',
                                         siblingCount = 1,
                                         showPageInfo = true,
                                         disabled = false,
                                         variant = 'light',
                                     }) => {
    const paginationItems = useMemo(
        () => buildPaginationItems(currentPage, totalPages, siblingCount),
        [currentPage, totalPages, siblingCount],
    );

    if (totalPages <= 1) {
        return null;
    }

    const baseButtonClassName = clsx(
        'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-stone cursor-pointer',
        disabled && 'cursor-not-allowed opacity-60',
        variant === 'dark'
            ? 'text-accent focus-visible:ring-accent'
            : 'text-primary focus-visible:ring-primary',
    );

    const pageButtonClassName = clsx(
        'h-10 w-10 rounded-full p-0',
        'border border-secondary/40 bg-transparent text-secondary',
        'hover:border-secondary hover:bg-secondary/10 hover:text-secondary',
        'active:border-secondary active:bg-secondary/10 active:text-secondary',
        'focus-visible:border-secondary focus-visible:bg-secondary/10 focus-visible:text-secondary',
        disabled && 'border-secondary/20 bg-secondary/5 text-secondary/60 hover:border-secondary/20 hover:bg-secondary/5 hover:text-secondary/60 active:border-secondary/20 active:bg-secondary/5 active:text-secondary/60 cursor-not-allowed',
    );

    const navigationButtonClassName = clsx(
        'min-h-10 min-w-[7rem] rounded-full px-4 py-2',
        'border border-secondary/40 bg-transparent text-secondary',
        'hover:border-secondary hover:bg-secondary/10 hover:text-secondary',
        'active:border-secondary active:bg-secondary/10 active:text-secondary',
        'focus-visible:border-secondary focus-visible:bg-secondary/10 focus-visible:text-secondary',
        disabled && 'border-secondary/20 bg-secondary/5 text-secondary/60 hover:border-secondary/20 hover:bg-secondary/5 hover:text-secondary/60 active:border-secondary/20 active:bg-secondary/5 active:text-secondary/60 cursor-not-allowed',
    );

    const activeButtonClassName = clsx(
        'h-10 w-10 rounded-full border border-secondary bg-secondary/10 text-secondary cursor-not-allowed pointer-events-none p-0',
        'hover:border-secondary hover:bg-secondary/10 hover:text-secondary',
        'active:border-secondary active:bg-secondary/10 active:text-secondary',
    );

    const handlePageChange = (page: number) => {
        if (disabled || page === currentPage || page < 1 || page > totalPages) {
            return;
        }

        onPageChange(page);
    };

    return (
        <nav
            aria-label={ariaLabel}
            className={clsx('flex flex-col items-center gap-4 sm:flex-row sm:justify-between p-2', className)}
        >
            {showPageInfo && (
                <p className={clsx(
                    'text-sm',
                    variant === 'dark' ? 'text-[rgba(247,242,232,0.7)]' : 'text-gray-600',
                )}>
                    Page {currentPage} sur {totalPages}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={disabled || currentPage === 1}
                    className={clsx(baseButtonClassName, navigationButtonClassName)}
                >
                    {previousLabel}
                </button>

                {paginationItems.map((item) => {
                    if (typeof item !== 'number') {
                        return (
                            <span
                                key={item}
                                className={clsx(
                                    'inline-flex min-h-10 min-w-10 items-center justify-center px-2 text-sm',
                                    variant === 'dark' ? 'text-accent' : 'text-accent-dark',
                                )}
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                           key={item}
                           type="button"
                           onClick={() => handlePageChange(item)}
                           aria-current={item === currentPage ? 'page' : undefined}
                           disabled={item === currentPage || disabled}
                           className={clsx(
                               baseButtonClassName,
                               item === currentPage ? activeButtonClassName : pageButtonClassName,
                           )}
                        >
                            {item}
                        </button>
                    );
                })}

                <button
                   type="button"
                   onClick={() => handlePageChange(currentPage + 1)}
                   disabled={disabled || currentPage === totalPages}
                   className={clsx(baseButtonClassName, navigationButtonClassName)}
                >
                    {nextLabel}
                </button>
            </div>
        </nav>
    );
};

export default Pagination;
