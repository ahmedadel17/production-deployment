"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useSelector } from "react-redux";
import { useAuth } from '@/app/hooks/useAuth';
import { useLocale } from 'next-intl';
import { useWishlist } from '@/app/hooks/useWishlist';
import { useRTL } from '@/app/hooks/useRTL';
import postRequest from '../../../helpers/post';
import toast from 'react-hot-toast';
import NavigationArrow from "./productGallery/NavigationArrows";
import SaleBadge from "./productGallery/saleBadge";
import Wishlist from "./productGallery/wishlist";
import GallerySlides from "./productGallery/GallerySlides";



interface ProductGalleryProps {
  images: string[];
  productId?: number | string;
  product?: {
    id: number;
    name: string;
    price?: string;
    price_after_discount?: string;
    min_price?: string;
    default_variation_id?: string | number;
    thumbnail?: string;
    slug?: string;
    category?: string;
    variations?: unknown[];
  };
}

export default function ProductGallery({images, productId, product}: ProductGalleryProps) {
  const { isRTL } = useRTL();
  const [mounted, setMounted] = useState(false);
  const [mainRef, mainApi] = useEmblaCarousel({ direction: isRTL ? 'rtl' : 'ltr' });
  const [thumbsRef, thumbsApi] = useEmblaCarousel({ 
    containScroll: "keepSnaps", 
    dragFree: true,
    direction: isRTL ? 'rtl' : 'ltr'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFavourite, setIsFavourite] = useState(false);
  
  // Ensure component is mounted before applying Embla styles to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { token, isAuthenticated } = useAuth();
  const locale = useLocale();
  const { toggleProduct, isInWishlist } = useWishlist();
  
  // Get variation data from Redux store
  interface VariationData {
    data?: {
      gallery?: (string | { url?: string; original_url?: string })[];
      discount?: string;
      is_favourite?: boolean;
    };
  }
  
  const variationData = useSelector((state: { product: { variationData: VariationData | null } }) => state.product.variationData);
  
  // Check if product is in wishlist
  useEffect(() => {
    if (productId) {
      const inWishlist = isInWishlist(Number(productId));
      setIsFavourite(inWishlist || variationData?.data?.is_favourite || false);
    } else if (variationData?.data?.is_favourite !== undefined) {
      setIsFavourite(variationData.data.is_favourite);
    }
  }, [productId, variationData?.data?.is_favourite, isInWishlist]);
  
  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!productId && !product?.id) {
      toast.error('Product ID is required');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login first to add items to wishlist');
      return;
    }

    const currentProductId = productId || product?.id;
    
    try {
      if (token) {
        const response = await postRequest(
          `/catalog/favorites/products/${currentProductId}/toggle`,
          {},
          {},
          token,
          locale
        );
        
        if (response.data.status) {
          const newFavoriteState = !isFavourite;
          setIsFavourite(newFavoriteState);
          
          // Update Redux wishlist store if product data is available
          if (product) {
            toggleProduct({
              id: product.id,
              name: product.name,
              min_price: parseFloat(product.min_price || product.price || '0') || 0,
              price_after_discount: parseFloat(product.price_after_discount || product.price || '0') || 0,
              default_variation_id: product.default_variation_id || null,
              discount: 0,
              is_favourite: newFavoriteState,
              out_of_stock: false,
              rate: "0.00",
              short_description: product.name,
              thumbnail: product.thumbnail || '',
              slug: product.slug || '',
              category: product.category || '',
              variations: product.variations || []
            });
          }
          
          toast.success(isFavourite ? 'Product removed from favorites!' : 'Product added to favorites successfully!');
        } else {
          toast.error('Failed to update favorites');
        }
      } else {
        toast.error('Authentication required. Please login again.');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };
  
  // Use variation gallery images if available, otherwise use passed images prop
  let galleryImages = variationData?.data?.gallery || images;
  
  // If gallery is empty, use just the thumbnail (first image)
  if (!galleryImages || galleryImages.length === 0) {
    galleryImages = images.length > 0 ? [images[0]] : [];
  }
  
 

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi || !thumbsApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbsApi]
  );

  useEffect(() => {
    if (!mainApi || !thumbsApi) return;

    const onSelect = () => {
      setSelectedIndex(mainApi.selectedScrollSnap());
      thumbsApi.scrollTo(mainApi.selectedScrollSnap());
    };

    mainApi.on("select", onSelect);
    onSelect();
  }, [mainApi, thumbsApi]);

  // Reinitialize Embla when direction changes
  useEffect(() => {
    if (!mainApi || !thumbsApi) return;
    mainApi.reInit({ direction: isRTL ? 'rtl' : 'ltr' });
    thumbsApi.reInit({ 
      containScroll: "keepSnaps", 
      dragFree: true,
      direction: isRTL ? 'rtl' : 'ltr'
    });
  }, [mainApi, thumbsApi, isRTL]);

  // If no images at all, show a placeholder
  if (galleryImages.length === 0) {
    return (
      <div className="space-y-4">
        <div className="product-gallery relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="aspect-square w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="text-sm">No image available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Carousel */}
      <div className="product-gallery relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <GallerySlides galleryImages={galleryImages} mainRef={mainRef} />

        {/* Navigation Arrows - only show if more than one image */}
        {galleryImages.length > 1 && (
          <>
            <NavigationArrow 
              onClick={() => mainApi?.scrollPrev()} 
              direction="prev" 
              isRTL={isRTL}
            />
            <NavigationArrow 
              onClick={() => mainApi?.scrollNext()} 
              direction="next" 
              isRTL={isRTL}
            />
          </>
        )}

        {/* Sale Badge */}
        <SaleBadge discount={variationData?.data?.discount || "20% OFF"} />

        {/* Wishlist Button */}
        <Wishlist 
          isFavourite={isFavourite} 
          onToggle={handleWishlistToggle}
        />
      </div>

      {/* Thumbnails - only show if more than one image */}
      {galleryImages.length > 1 && (
        <div className="product-thumbnail embla-thumbs overflow-hidden" ref={thumbsRef} data-react-managed="true" suppressHydrationWarning>
          <div className="embla-thumbs__container flex gap-3" suppressHydrationWarning>
             {galleryImages.map((image: string | { url?: string; original_url?: string }, i: number) => {
               const src = typeof image === 'string' ? image : image.original_url ? image.original_url :image.url;
               return (
                 <div 
                   key={i} 
                   className={`embla-thumbs__slide flex-none ${mounted && selectedIndex === i ? 'embla-thumbs__slide--selected' : ''}`}
                   suppressHydrationWarning
                 >
                   <button
                     type="button"
                     onClick={() => onThumbClick(i)}
                     className={`block rounded-md border-2 transition-all duration-200 ${
                       selectedIndex === i
                         ? "border-primary-400 opacity-100"
                         : "border-transparent opacity-60 hover:opacity-80"
                     }`}
                   >
                     <img
                       src={src}
                       alt={`Thumbnail ${i + 1}`}
                       className="w-20 aspect-square object-cover rounded-md"
                       style={{
                         imageRendering: '-webkit-optimize-contrast'
                       }}
                     />
                   </button>
                 </div>
               );
             })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Zoom Image ----------------------------- */


