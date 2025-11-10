import { useState } from "react";
import ZoomImage from "./ZoomImage";

// Gallery Slides Component
interface ImageData {
  url?: string;
  original_url?: string;
}

interface GallerySlidesProps {
  galleryImages: (string | ImageData)[];
  mainRef: any; // EmblaViewportRefType
}

function GallerySlides({ galleryImages, mainRef }: GallerySlidesProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  const handleImageError = (index: number, src: string) => {
    console.warn(`Failed to load image at index ${index}:`, src);
  };

  return (
    <div className="embla overflow-hidden" ref={mainRef} data-react-managed="true" suppressHydrationWarning>
      <div className="embla__container flex" suppressHydrationWarning>
        {galleryImages.map((image: string | ImageData, i: number) => {
          const src = typeof image === 'string' ? image : image.original_url || image.url || '';
          const isLoaded = loadedImages.has(i);
          
          return (
            <div key={i} className="embla__slide flex-none w-full min-w-0">
              <div className="aspect-square w-full relative">
                {!isLoaded && src && (
                  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                )}
                {src ? (
                  <ZoomImage 
                    src={src} 
                    alt={`Product ${i + 1}`}
                    onLoad={() => handleImageLoad(i)}
                    onError={() => handleImageError(i, src)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default GallerySlides;
