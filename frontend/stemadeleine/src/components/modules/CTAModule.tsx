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
}

function isExternalUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
}

const CTAModule: React.FC<Props> = ({module, className = ''}) => {
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
    const title = module.title ?? module.name;
    const externalUrl = hasValidAction ? isExternalUrl(url) : false;
    const [isDiscoverHovered, setIsDiscoverHovered] = React.useState(false);

    if (!module?.isVisible) {
        return null;
    }

    return (
        <div className={clsx('w-full p-2', className)}>
            {Boolean(ctaLoading) && !hasValidAction && (
                <div className="flex items-center py-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gold"/>
                </div>
            )}

            {!ctaLoading && !hasValidAction && (
                <p className="text-sm text-cream/70">Aucun appel a l&apos;action disponible.</p>
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
                            {label}
                        </Button>
                    ) : (
                        <a
                            href={url}
                            target={externalUrl ? '_blank' : undefined}
                            rel={externalUrl ? 'noopener noreferrer' : undefined}
                            className="text-[11px] uppercase tracking-[0.16em] text-secondary transition-colors duration-200 hover:text-secondary-light"
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
