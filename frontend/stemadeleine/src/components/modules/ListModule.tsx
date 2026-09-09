'use client';

import React, {useEffect} from 'react';
import clsx from 'clsx';
import useGetModules from '@/hooks/useGetModules';
import ListNavCard from './ListNavCard';
import ListBulletList from './ListBulletList';
import ListColumnGrid from './ListColumnGrid';
import ListCardGrid from './ListCardGrid';
import type {ListContentItem} from './listContent.types';

type ModuleType = {
    id: string;
    moduleId?: string;
    type: string;
    title?: string;
    name?: string;
    isVisible?: boolean;
    [key: string]: unknown;
};

type ListDto = {
    id?: string;
    variant?: string;
    contents?: ListContentItem[];
    [key: string]: unknown;
};

interface Props {
    module: ModuleType;
    isDark?: boolean;
}

const ListModule: React.FC<Props> = ({module, isDark = true}) => {
    // on réutilise le hook existant qui expose fetchListByModuleId + list
    const modulesHook = useGetModules() as unknown as {
        list?: ListDto | null;
        listLoading?: boolean;
        fetchListByModuleId?: (moduleId: string) => Promise<ListDto | null>;
    };

    const {list, listLoading, fetchListByModuleId} = modulesHook;

    useEffect(() => {
        if (module?.moduleId) {
            fetchListByModuleId?.(module.moduleId).catch(console.error);
        }
    }, [module?.moduleId, fetchListByModuleId]);

    if (!module?.isVisible) {
        return null;
    }

    const variant = String(list?.variant ?? 'CARD').toUpperCase();
    const moduleTitle = module.title ?? module.name ?? 'Liste';
    const contents = list?.contents ?? [];

    return (
        <div className="w-full py-0 md:py-5">
            <h3
                className={clsx(
                    'font-serif text-[clamp(1.7rem,3vw,2.4rem)] font-normal leading-[1.25] mb-6',
                    isDark ? 'text-secondary' : 'text-primary',
                )}
            >
                {moduleTitle}
            </h3>

            {variant === 'BULLET' ? (
                <ListBulletList contents={contents} loading={Boolean(listLoading)} isDark={isDark}/>
            ) : variant === 'COLUMN' ? (
                <ListColumnGrid contents={contents} loading={Boolean(listLoading)} isDark={isDark}/>
            ) : variant === 'NAV_CARD' ? (
                <ListNavCard contents={contents} loading={Boolean(listLoading)} isDark={isDark}/>
            ) : (
                <ListCardGrid contents={contents} loading={Boolean(listLoading)} isDark={isDark}/>
            )}
        </div>
    );
};

export default ListModule;
