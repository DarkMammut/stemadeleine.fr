'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import MediaImage from '@/components/MediaImage';
import Lightbox from '@/components/Lightbox';

type Media = {
  id: string;
  url?: string;
  thumbnailUrl?: string;
  title?: string;
  alt?: string;
  caption?: string;
  // optional metadata from backend
  width?: number;
  height?: number;
};

interface Props {
  images: Media[];
  title?: string;
  loading?: boolean;
  // facultatif : comportement tactile (clic = basculer légende)
  toggleOnClick?: boolean;
}

// Wrapper pour MediaImage qui gère le callback onDimensions
function MediaItemWithDimensions({
                                   media,
                                   onDimensions,
                                   useFill = true,
                                 }: {
  media: Media;
  onDimensions?: (w: number, h: number) => void;
  useFill?: boolean;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Observer pour détecter quand l'image est chargée
    if (!imgRef.current) return;

    const checkDimensions = () => {
      const img = imgRef.current?.querySelector('img');
      if (img && img.naturalWidth && img.naturalHeight && onDimensions) {
        onDimensions(img.naturalWidth, img.naturalHeight);
      }
    };

    // Vérifier immédiatement si l'image est déjà chargée
    checkDimensions();

    // Observer pour les images blob qui se chargent de manière asynchrone
    const observer = new MutationObserver(checkDimensions);
    observer.observe(imgRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src'],
    });

    return () => observer.disconnect();
  }, [onDimensions]);

  const resolvedSrc = media.thumbnailUrl ?? media.url;

  if (!resolvedSrc && !media.id) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
        Aucune image disponible
      </div>
    );
  }

  return (
    <div ref={imgRef} className="w-full h-full">
      <MediaImage
        mediaId={media.id}
        src={resolvedSrc}
        alt={media.alt ?? media.caption ?? media.title ?? ''}
        fill={useFill}
        width={!useFill ? (media.width || 800) : undefined}
        height={!useFill ? (media.height || 600) : undefined}
        className={!useFill ? 'w-full h-auto' : undefined}
        sizes={useFill ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' : '100vw'}
        style={{ objectFit: 'cover' }}
        loading="lazy"
        onLoad={(e) => {
          if (onDimensions) {
            const img = e.target as HTMLImageElement;
            if (img.naturalWidth && img.naturalHeight) {
              onDimensions(img.naturalWidth, img.naturalHeight);
            }
          }
        }}
      />
    </div>
  );
}

// mapping des classes h-* en pixels (1rem = 16px)
const FRAME_HEIGHT_PX: Record<string, { sm: number; md: number; lg: number }> = {
  small: { sm: 160, md: 192, lg: 224 }, // h-40, md:h-48, lg:h-56
  medium: { sm: 192, md: 224, lg: 256 }, // h-48, md:h-56, lg:h-64
  large: { sm: 288, md: 320, lg: 384 }, // h-72, md:h-80, lg:h-96
};

// Fonction helper pour decideFrame (utilisée dans l'initialisation)
function decideFrameFromDimensions(w: number, h: number): 'small' | 'medium' | 'large' {
  if (h > w) return 'large';
  const ratio = w / h;
  if (ratio > 1.6) return 'small';
  return 'medium';
}

const GridGallery: React.FC<Props> = ({ images, title, loading = false }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLg, setIsLg] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // États pour la lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);

  // aspect ratios map (width / height)
  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>(() => {
    // Initialiser avec les dimensions du backend si disponibles
    const initialRatios: Record<string, number> = {};
    images.forEach((img) => {
      if (img.width && img.height) {
        initialRatios[img.id] = img.width / img.height;
      }
    });
    return initialRatios;
  });

  // computed columns for masonry manual layout
  const [computedCols, setComputedCols] = useState<Media[][]>([]);

  // map image id -> frame key: 'small' | 'medium' | 'large' (heuristique)
  const [frameMap, setFrameMap] = useState<Record<string, 'small' | 'medium' | 'large'>>(() => {
    // Initialiser avec les dimensions du backend si disponibles
    const initialFrames: Record<string, 'small' | 'medium' | 'large'> = {};
    images.forEach((img) => {
      if (img.width && img.height) {
        initialFrames[img.id] = decideFrameFromDimensions(img.width, img.height);
      }
    });
    return initialFrames;
  });

  // map image id -> computed grid-row span
  const [rowSpans, setRowSpans] = useState<Record<string, number>>({});

  // refs pour chaque item (button) afin de mesurer la taille réelle
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // ResizeObserver pour recalculer quand la taille d'une cellule change
  const roRef = useRef<ResizeObserver | null>(null);

  // réglages de layout (en px)
  // plus petite unité pour réduire l'effet de quantification des spans
  const ROW_HEIGHT_PX = 4; // base pour grid-auto-rows (petite unité pour meilleure granularité)
  const GAP_PX = 16; // correspond à tailwind gap-4 = 1rem = 16px

  const getBreakpointKey = () => {
    if (typeof window === 'undefined') return 'lg';
    const w = window.innerWidth;
    if (w >= 1024) return 'lg';
    if (w >= 768) return 'md';
    return 'sm';
  };


  // decideFrame : heuristique pour définir small/medium/large
  const decideFrame = useCallback((w: number, h: number) => {
    return decideFrameFromDimensions(w, h);
  }, []);

  // utilitaire : mesurer et calculer le span pour un élément (par id)
  const measureSpanForId = useCallback((id: string) => {
    const el = itemRefs.current[id];
    if (!el) return;

    // si on connait déjà le frame, utiliser la hauteur prédéfinie pour éviter les sauts
    const frame = frameMap[id];
    let height: number;
    if (frame && FRAME_HEIGHT_PX[frame]) {
      const bp = getBreakpointKey();
      height = FRAME_HEIGHT_PX[frame as string][bp as keyof typeof FRAME_HEIGHT_PX['small']];
    } else {
      // fallback: mesurer le media container
      const mediaEl = el.querySelector('[data-gallery-media]') as HTMLElement | null;
      const measured = mediaEl ? mediaEl.getBoundingClientRect().height : el.getBoundingClientRect().height;
      height = Math.max(0, measured);
    }

    // calculer nombre de tracks à occuper
    // Chaque 'track' comprend rowHeight + gap, donc utiliser cette unité
    setRowSpans((prev) => {
      const spanValue = Math.max(1, Math.ceil((height + GAP_PX) / (ROW_HEIGHT_PX + GAP_PX)));
      if (prev[id] === spanValue) return prev;
      return { ...prev, [id]: spanValue };
    });
  }, [frameMap]);

  // mesurer toutes les cellules conservées
  const measureAll = useCallback(() => {
    Object.keys(itemRefs.current).forEach((id) => measureSpanForId(id));
  }, [measureSpanForId]);

  // Setup ResizeObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;
    roRef.current = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('data-gallery-id');
        if (id) {
          measureSpanForId(id);
        }
      });
    });

    // mesure initiale après un tick pour laisser le layout se stabiliser
    requestAnimationFrame(() => measureAll());

    return () => {
      roRef.current?.disconnect();
    };
  }, [measureAll, measureSpanForId]);

  // Listener centralisé pour window resize (gère isLg et tous les recalculs)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let rafId: number | null = null;

    const handleResize = () => {
      // Debounce avec requestAnimationFrame
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const newIsLg = window.innerWidth >= 1024;
        const newIsMobile = window.innerWidth < 768;
        if (newIsLg !== isLg) {
          setIsLg(newIsLg);
        }
        if (newIsMobile !== isMobile) {
          setIsMobile(newIsMobile);
        }
        measureAll();
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isLg, isMobile, measureAll]);

  const handleDimensions = useCallback((id: string, w: number, h: number) => {
    // Mise à jour du ratio d'aspect
    setAspectRatios((prev) => {
      if (prev[id]) return prev; // keep first value
      return { ...prev, [id]: w / h };
    });

    // Mise à jour du frame
    setFrameMap((prev) => {
      if (prev[id]) return prev; // keep first decision
      const frame = decideFrame(w, h);
      return { ...prev, [id]: frame };
    });

    // after deciding frame the DOM will update - schedule a measure
    requestAnimationFrame(() => measureSpanForId(id));
  }, [decideFrame, measureSpanForId]);

  // Gestion de la lightbox
  const openLightbox = useCallback((imageId: string) => {
    const index = images.findIndex(img => img.id === imageId);
    if (index !== -1) {
      setCurrentLightboxIndex(index);
      setIsLightboxOpen(true);
    }
  }, [images]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const goToNextImage = useCallback(() => {
    setCurrentLightboxIndex((prev) => Math.min(prev + 1, images.length - 1));
  }, [images.length]);

  const goToPreviousImage = useCallback(() => {
    setCurrentLightboxIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const getFrameClass = (id: string) => {
    const frame = frameMap[id] ?? 'medium';
    switch (frame) {
      case 'small':
        return 'h-auto md:h-48 lg:h-56';
      case 'large':
        return 'h-auto md:h-80 lg:h-96';
      default:
        return 'h-auto md:h-56 lg:h-64';
    }
  };

  useEffect(() => {
    // recalculer les spans si frameMap change (nouvelles heights appliquées)
    let rafId: number | null = null;
    rafId = requestAnimationFrame(() => measureAll());
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [frameMap, measureAll]);

  // compute columns when images/aspectRatios/container width changes (hook must be top-level)
  useEffect(() => {
    const compute = () => {
      if (!isLg) {
        setComputedCols([]);
        return;
      }

      const colCount = 4;
      const gapPx = 16; // 1rem
      const containerWidth = containerRef.current ? Math.max(0, containerRef.current.clientWidth) : window.innerWidth;
      const columnWidth = Math.floor((containerWidth - gapPx * (colCount - 1)) / colCount);

      // initialize columns and heights
      const cols: Media[][] = Array.from({ length: colCount }, () => []);
      const heights = new Array(colCount).fill(0);

      const defaultRatio = 1.6;

      images.forEach((img) => {
        const ratio = aspectRatios[img.id] ?? defaultRatio; // width/height
        const estimatedHeight = columnWidth / ratio;
        // find shortest column
        let minIndex = 0;
        let minH = heights[0];
        for (let i = 1; i < colCount; i++) {
          if (heights[i] < minH) {
            minH = heights[i];
            minIndex = i;
          }
        }
        cols[minIndex].push(img);
        heights[minIndex] += estimatedHeight + gapPx; // include gap
      });

      setComputedCols(cols);
    };

    // Calcul initial immédiat
    compute();
  }, [isLg, images, aspectRatios]);

  if (loading) {
    return <div className="py-8 text-center">Chargement de la galerie...</div>;
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full py-6 border-b border-gray-200 last:border-b-0">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">{title ?? 'Galerie'}</h3>
          <p className="text-green-600 text-sm">Aucune image dans cette galerie.</p>
        </div>
      </div>
    );
  }


  // If large screen, show manual column masonry using computedCols
  if (isLg) {
    return (
      <div className="w-full py-6 px-4 md:px-8 lg:px-12" ref={containerRef}>
        {title && <h3 className="text-2xl font-semibold mb-4">{title}</h3>}
        <div className="flex gap-4">
          {computedCols.map((col, idx) => (
            <div key={idx} className="flex-1 flex flex-col gap-4">
              {col.map((img) => {
                const isActive = hoveredId === img.id;
                const isDimmed = hoveredId !== null && hoveredId !== img.id;

                return (
                  <button
                    key={img.id}
                    type="button"
                    onMouseEnter={() => setHoveredId(img.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(img.id)}
                    onBlur={() => setHoveredId(null)}
                    onClick={() => openLightbox(img.id)}
                    className={clsx(
                      'relative w-full overflow-hidden rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-transform cursor-pointer',
                      isDimmed && 'opacity-20 grayscale',
                    )}
                  >
                    <div
                      className={clsx('relative w-full bg-gray-100 overflow-hidden rounded-md', getFrameClass(img.id), isDimmed ? 'filter brightness-50' : 'filter brightness-100')}>
                      <ColumnImage src={img} onDimensions={(w, h) => handleDimensions(img.id, w, h)} />
                      {/* figcaption overlay - bandeau gris transparent en bas */}
                      <figcaption
                        className={clsx(
                          'absolute bottom-0 left-0 right-0 bg-gray-900/70 backdrop-blur-sm text-white transition-all duration-300',
                          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
                        )}
                      >
                        <div className="px-4 py-3">
                          <p className="text-sm font-medium leading-tight">{img.title}</p>
                        </div>
                      </figcaption>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Lightbox */}
        <Lightbox
          isOpen={isLightboxOpen}
          images={images}
          currentIndex={currentLightboxIndex}
          onClose={closeLightbox}
          onNext={goToNextImage}
          onPrevious={goToPreviousImage}
        />
      </div>
    );
  }

  // fallback: grid responsive (1 colonne small, 3 md, 4 lg) pour sm/md
  return (
    <div className="w-full py-6 px-4 md:px-8 lg:px-12">
      {title && <h3 className="text-2xl font-semibold mb-4">{title}</h3>}

      <div
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start"
        style={!isMobile ? { gridAutoRows: `${ROW_HEIGHT_PX}px` } : undefined}
      >
        {images.map((img) => {
          const isActive = hoveredId === img.id;
          const isDimmed = hoveredId !== null && hoveredId !== img.id;

          const span = rowSpans[img.id] ?? 1;

          return (
            <button
              key={img.id}
              type="button"
              data-gallery-id={img.id}
              ref={(el) => {
                const prev = itemRefs.current[img.id];
                if (prev && roRef.current) {
                  try {
                    roRef.current.unobserve(prev);
                  } catch { /* ignore */
                  }
                }
                itemRefs.current[img.id] = el;
                if (el && roRef.current) roRef.current.observe(el);
              }}
              onMouseEnter={() => setHoveredId(img.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(img.id)}
              onBlur={() => setHoveredId(null)}
              onClick={() => openLightbox(img.id)}
              className={clsx(
                'relative w-full overflow-hidden rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-transform self-start cursor-pointer',
                isDimmed && 'opacity-20 grayscale',
              )}
              style={!isMobile ? { gridRowEnd: `span ${span}` } : undefined}
            >
              <div className={clsx('relative w-full bg-gray-100 overflow-hidden', getFrameClass(img.id), 'z-0')}
                   data-gallery-media="true">
                <MediaItemWithDimensions media={img} onDimensions={(w, h) => handleDimensions(img.id, w, h)}
                                         useFill={!isMobile} />
              </div>

              {/* figcaption overlay - bandeau gris transparent en bas */}
              <figcaption
                className={clsx(
                  'absolute bottom-0 left-0 right-0 bg-gray-900/70 backdrop-blur-sm text-white transition-all duration-300',
                  isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
                )}
              >
                <div className="px-4 py-3">
                  <p className="text-sm font-medium leading-tight">{img.title}</p>
                </div>
              </figcaption>
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      <Lightbox
        isOpen={isLightboxOpen}
        images={images}
        currentIndex={currentLightboxIndex}
        onClose={closeLightbox}
        onNext={goToNextImage}
        onPrevious={goToPreviousImage}
      />
    </div>
  );
};

// ColumnImage: used in manual columns to collect natural dimensions via onLoad
function ColumnImage({ src, onDimensions }: { src: Media; onDimensions?: (w: number, h: number) => void; }) {
  // Le parent doit fournir la hauteur (via getFrameClass). Ici on remplit simplement le parent.
  const containerClass = 'relative w-full h-full bg-gray-100 overflow-hidden rounded-md';

  return (
    <div data-gallery-media="true" className={containerClass}>
      <MediaItemWithDimensions media={src} onDimensions={(w, h) => {
        if (onDimensions) onDimensions(w, h);
      }} />
    </div>
  );
}

export default GridGallery;

