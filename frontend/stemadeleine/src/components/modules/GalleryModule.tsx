import React, {useEffect} from 'react';
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
}

const GalleryModule: React.FC<Props> = ({module}) => {
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

    // Choisir le composant en fonction de la variante
    switch (variant) {
        case 'GRID':
            return (
                <GridGallery
                    images={galleryImages}
                    title={moduleTitle}
                    loading={Boolean(galleryLoading)}
                />
            );
        case 'CAROUSEL':
            return (
                <section className="w-full">
                    <h2 className="font-serif text-[clamp(1.7rem,3vw,2.4rem)] text-cream font-normal leading-[1.25] mb-6">
                        {moduleTitle}
                    </h2>
                    <CarouselGallery
                        module={carouselModule}
                        gallery={gallery}
                        loading={Boolean(galleryLoading)}
                    />
                </section>
            );
        case 'SLIDER':
            return (
                <section className="w-full">
                    <h2 className="font-serif text-[clamp(1.7rem,3vw,2.4rem)] text-cream font-normal leading-[1.25] mb-6">
                        {moduleTitle}
                    </h2>
                    <CarouselGallery
                        module={carouselModule}
                        gallery={gallery}
                        loading={Boolean(galleryLoading)}
                        autoPlay={true}
                        autoPlayInterval={5000}
                        showArrows={false}
                        showThumbnails={false}
                        showCounter={false}
                    />
                </section>
            );
        default:
            // fallback to grid
            return (
                <GridGallery
                    images={galleryImages}
                    title={moduleTitle}
                    loading={Boolean(galleryLoading)}
                />
            );
    }
};

export default GalleryModule;
