import React, { useEffect } from 'react';
import useGetModules from '@/hooks/useGetModules';
import GridGallery from './GridGallery';
import CarouselGallery from './CarouselGallery';
import SliderGallery from './SliderGallery';

type ModuleType = {
  id?: string;
  moduleId?: string;
  type?: string;
  title?: string;
  name?: string;
  isVisible?: boolean;
  [key: string]: any;
};

type Media = {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  [key: string]: any;
};

type GalleryDto = {
  id?: string;
  variant?: string;
  medias?: Media[];
  [key: string]: any;
};

interface Props {
  module: ModuleType;
}

const GalleryModule: React.FC<Props> = ({ module }) => {
  if (!module?.isVisible) {
    return null;
  }

  // on réutilise le hook existant qui expose fetchGalleryByModuleId + gallery
  const modulesHook = useGetModules() as unknown as {
    gallery?: GalleryDto | null;
    galleryLoading?: boolean;
    fetchGalleryByModuleId?: (moduleId: string) => Promise<GalleryDto | null>;
  };

  const { gallery, galleryLoading, fetchGalleryByModuleId } = modulesHook;

  useEffect(() => {
    if (module?.moduleId) {
      fetchGalleryByModuleId?.(module.moduleId).catch(console.error);
    }
  }, [module?.moduleId, fetchGalleryByModuleId]);

  const variant = (gallery?.variant ?? 'Grid') as string;

  // Choisir le composant en fonction de la variante
  switch (variant) {
    case 'Grid':
      return (
        <GridGallery
          images={gallery?.medias ?? []}
          title={module.title}
          loading={Boolean(galleryLoading)}
        />
      );
    case 'Carousel':
      return <CarouselGallery module={module} gallery={gallery} loading={Boolean(galleryLoading)} />;
    case 'Slider':
      return <SliderGallery module={module} gallery={gallery} loading={Boolean(galleryLoading)} />;
    default:
      // fallback to grid
      return (
        <GridGallery
          images={gallery?.medias ?? []}
          title={module.title}
          loading={Boolean(galleryLoading)}
        />
      );
  }
};

export default GalleryModule;

