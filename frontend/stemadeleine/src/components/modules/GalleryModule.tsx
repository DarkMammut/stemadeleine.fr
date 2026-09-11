import React, {useEffect} from 'react';
import clsx from 'clsx';
import useGetModules from '@/hooks/useGetModules';
import GridGallery from './GridGallery';
import CarouselGallery from './CarouselGallery';

type ModuleType = {
    id: string;
    moduleId?: string;
    type: string;
    title?: string;
    name?: string;
    isVisible?: boolean;
    [key: string]: unknown;
};

type Media = {
    id: string;
    url?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
    alt?: string;
    caption?: string;
    title?: string;
    [key: string]: unknown;
};

type GalleryDto = {
    id?: string;
    variant?: string;
    medias?: Media[];
    [key: string]: unknown;
};

interface Props {
    module: ModuleType;
    isDark?: boolean;
}

const GalleryModule: React.FC<Props> = ({module, isDark = true}) => {
    // on réutilise le hook existant qui expose fetchGalleryByModuleId + gallery
    const modulesHook = useGetModules() as unknown as {
        gallery?: GalleryDto | null;
        galleryLoading?: boolean;
        fetchGalleryByModuleId?: (moduleId: string) => Promise<GalleryDto | null>;
    };

    const {gallery, galleryLoading, fetchGalleryByModuleId} = modulesHook;

    useEffect(() => {
        if (module?.moduleId) {
            fetchGalleryByModuleId?.(module.moduleId).catch(console.error);
        }
    }, [module?.moduleId, fetchGalleryByModuleId]);

    if (!module?.isVisible) {
        return null;
    }

    const variant = String(gallery?.variant ?? 'GRID').toUpperCase();
    const moduleTitle = module.title ?? module.name ?? 'Galerie';
    const galleryImages = gallery?.medias ?? [];
    const carouselModule = {...module, title: undefined};
    const titleClassName = clsx(
        'font-serif text-[clamp(1.7rem,3vw,2.4rem)] font-normal leading-[1.25] mb-6',
        isDark ? 'text-accent' : 'text-text-mid',
    );

    // Choisir le composant en fonction de la variante
    switch (variant) {
        case 'GRID':
            return (
                <div className="w-full mb-6 md:mb-12">
                    <h3 className={titleClassName}>
                        {moduleTitle}
                    </h3>
                    <GridGallery
                        images={galleryImages}
                        title={moduleTitle}
                        loading={Boolean(galleryLoading)}
                    />
                </div>
            );
        case 'CAROUSEL':
            return (
                <div className="w-full mb-6 md:mb-12">
                    <h3 className={titleClassName}>
                        {moduleTitle}
                    </h3>
                    <CarouselGallery
                        module={carouselModule}
                        gallery={gallery}
                        loading={Boolean(galleryLoading)}
                        isDark={isDark}
                    />
                </div>
            );
        case 'SLIDER':
            return (
                <div className="w-full mb-6 md:mb-12">
                    <h3 className={titleClassName}>
                        {moduleTitle}
                    </h3>
                    <CarouselGallery
                        module={carouselModule}
                        gallery={gallery}
                        loading={Boolean(galleryLoading)}
                        autoPlay={true}
                        autoPlayInterval={5000}
                        showArrows={false}
                        showThumbnails={false}
                        showCounter={false}
                        isDark={isDark}
                    />
                </div>
            );
        default:
            // fallback to grid
            return (
                <div className="w-full mb-6 md:mb-12">
                    <h3 className={titleClassName}>
                        {moduleTitle}
                    </h3>
                    <GridGallery
                        images={galleryImages}
                        title={moduleTitle}
                        loading={Boolean(galleryLoading)}
                    />
                </div>
            );
    }
};

export default GalleryModule;
