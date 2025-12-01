import React from 'react';

type ModuleType = {
  id?: string;
  moduleId?: string;
  title?: string;
  [key: string]: any;
};

type GalleryDto = {
  id?: string;
  variant?: string;
  medias?: any[];
};

interface Props {
  module: ModuleType;
  gallery?: GalleryDto | null;
  loading?: boolean;
}

const CarouselGallery: React.FC<Props> = ({ module, gallery, loading = false }) => {
  if (loading) return <div className="py-8 text-center">Chargement de la galerie...</div>;
  if (!gallery || !gallery.medias || gallery.medias.length === 0) {
    return (
      <div className="w-full py-6 border-b border-gray-200 last:border-b-0">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">{module.title ?? 'Galerie'}</h3>
          <p className="text-green-600 text-sm">Module Galerie (Carousel) - Implémentation à venir</p>
        </div>
      </div>
    );
  }

  // Placeholder: affiche les images comme avant (simple grille) en attendant l'implémentation
  return (
    <div className="w-full py-6">
      <h3 className="text-2xl font-semibold mb-4">{module.title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {gallery.medias.map((m: any) => (
          <div key={m.id} className="rounded-md overflow-hidden bg-gray-100">
            <img src={m.thumbnailUrl ?? m.url} alt={m.alt ?? ''} className="w-full h-48 object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselGallery;

