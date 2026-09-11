'use client';

import React, {useEffect} from 'react';
import clsx from 'clsx';
import Button from '@/components/Button';
import useGetModules from '@/hooks/useGetModules';

type CtaVariant = 'BUTTON' | 'LINK';

interface CTADto {
    label?: string;
    url?: string;
    variant?: string;
}

export interface CTAModuleType {
    id: string;
    moduleId?: string;
    title?: string;
    name?: string;
    type: string;
    isVisible?: boolean;
    sortOrder?: number;
    label?: string;
    url?: string;
    variant?: string;

    [key: string]: unknown;
}

interface Props {
    module: CTAModuleType;
    className?: string;
    /** true = section sombre → bouton/lien clairs ; false = section claire → bouton/lien foncés */
    isDark?: boolean;
}

function isExternalUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
}

const CTAModule: React.FC<Props> = ({module, className = '', isDark = true}) => {
    const modulesHook = useGetModules() as unknown as {
        cta?: CTADto | null;
        ctaLoading?: boolean;
        fetchCTAByModuleId?: (moduleId: string) => Promise<CTADto | null>;
    };

    const {cta, ctaLoading, fetchCTAByModuleId} = modulesHook;

    useEffect(() => {
        if (module?.moduleId) {
            fetchCTAByModuleId?.(module.moduleId).catch(console.error);
        }
    }, [module?.moduleId, fetchCTAByModuleId]);

    const variantValue = String(cta?.variant ?? module.variant ?? 'BUTTON').toUpperCase();
    const variant: CtaVariant = variantValue === 'LINK' ? 'LINK' : 'BUTTON';

    const label = cta?.label ?? module.label ?? module.title ?? module.name ?? '';
    const url = cta?.url ?? module.url ?? '';
    const hasValidAction = Boolean(label && url);
    const externalUrl = hasValidAction ? isExternalUrl(url) : false;
    const [isHovered, setIsHovered] = React.useState(false);

    if (!module?.isVisible) {
        return null;
    }

    const buttonStyle = isDark
        ? {
            // dark section : border secondary, texte cream → hover inversé
            backgroundColor: isHovered ? 'var(--color-secondary)' : 'transparent',
            borderColor: 'var(--color-secondary)',
            color: isHovered ? 'var(--color-primary-dark)' : 'var(--color-cream)',
        }
        : {
            // light section : border primary, texte primary → hover bg primary, texte secondary, border secondary
            backgroundColor: isHovered ? 'var(--color-primary)' : 'transparent',
            borderColor: isHovered ? 'var(--color-secondary)' : 'var(--color-primary)',
            color: isHovered ? 'var(--color-secondary)' : 'var(--color-primary)',
        };

    return (
        <div className={clsx('w-full mb-6 md:mb-12', className)}>
            {Boolean(ctaLoading) && !hasValidAction && (
                <div className="flex items-center py-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gold"/>
                </div>
            )}

            {!ctaLoading && !hasValidAction && (
                <p className="text-sm text-accent-dark">Aucun appel a l&apos;action disponible.</p>
            )}

            {hasValidAction && (
                <div className={clsx('flex w-full', variant === 'BUTTON' ? 'justify-end' : 'justify-start')}>
                    {variant === 'BUTTON' ? (
                        <Button
                            as="a"
                            href={url}
                            target={externalUrl ? '_blank' : undefined}
                            rel={externalUrl ? 'noopener noreferrer' : undefined}
                            variant="outline"
                            size="lg"
                            unstyled={true}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={buttonStyle}
                            className="rounded-none border px-9 py-3 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200"
                        >
                            {label}
                        </Button>
                    ) : (
                        <a
                            href={url}
                            target={externalUrl ? '_blank' : undefined}
                            rel={externalUrl ? 'noopener noreferrer' : undefined}
                            className={clsx(
                                'relative inline-block text-[11px] uppercase tracking-[0.16em] transition-colors duration-200',
                                "after:absolute after:content-[''] after:bottom-0 after:left-0 after:h-px after:w-full",
                                'after:scale-x-0 after:origin-right after:transition-transform after:duration-300',
                                'hover:after:scale-x-100 hover:after:origin-left',
                                isDark
                                    ? 'text-accent hover:text-secondary after:bg-secondary'
                                    : 'text-text-mid hover:text-secondary after:bg-primary',
                            )}
                        >
                            {label}
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

export default CTAModule;
