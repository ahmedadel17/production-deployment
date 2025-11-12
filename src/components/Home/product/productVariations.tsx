'use client';

import React, { useState, useEffect } from 'react';
import { Handbag } from 'lucide-react';
import { useCart } from '@/app/hooks/useCart';
import { useAuth } from '@/app/hooks/useAuth';
import { setCartData } from '@/app/store/slices/cartSlice';
import { useAppDispatch } from '@/app/store/hooks';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import postRequest from '../../../../helpers/post';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { useWishlist } from '@/app/hooks/useWishlist';

interface Product {
  id: number;
  name: string;
  price: string;
  old_price?: string | null | undefined;
  price_after_discount?: string | undefined;
  default_variation_id?: string | number;
  is_favourite?: boolean;
  image?: string;
  thumbnail?: string;
  slug?: string;
  category?: string;
  variations?: any[];
}

interface ProductVariationsProps {
  product: Product;
  variations: any[] | undefined;
  onVariationSelected?: (hasVariation: boolean) => void;
}

function ProductVariations({ 
  product,
  variations,
  onVariationSelected
}: ProductVariationsProps) {
  // Consolidated state for better performance
  const [state, setState] = useState({
    selectedColor: null as string | null,
    selectedSize: null as string | null,
    selectedColorId: null as number | null,
    selectedSizeId: null as number | null,
    variationId: null as number | null,
    isAddingToCart: false,
    isLoadingVariation: false,
    selectedVariation: null as any,
    isFavorite: product?.is_favourite,
    isFavoriteLoading: false
  });
  
  const { loadCartFromStorage } = useCart();
  const { token, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const locale = useLocale();   
  const t = useTranslations();
  const { toggleProduct } = useWishlist();
  // Notify parent when variation is selected
  useEffect(() => {
    onVariationSelected?.(state.selectedVariation !== null);
  }, [state.selectedVariation, onVariationSelected]);


  // Fetch variation ID when both color and size are selected
  const fetchVariationId = async (colorId: number, sizeId: number) => {
    setState(prev => ({ ...prev, isLoadingVariation: true }));
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/catalog/products/get-variation-by-attribute`,
        {
          product_id: product.id,
          attributes: {
            1: sizeId,
            2: colorId,
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status && response.data.data?.id) {
        setState(prev => ({
          ...prev,
          variationId: response.data.data.id,
          selectedVariation: response.data.data,
          isLoadingVariation: false,
        }));
      } else {
        console.error('Failed to get variation ID:', response.data);
        setState(prev => ({
          ...prev,
          variationId: null,
          selectedVariation: null,
          isLoadingVariation: false
        }));
      }
    } catch (error) {
      console.error('Error fetching variation ID:', error);
      setState(prev => ({
        ...prev,
        variationId: null,
        selectedVariation: null,
        isLoadingVariation: false
      }));
    }
  };

  // Handle color selection
  const handleColorSelect = (color: string, colorId: number) => {
    setState(prev => ({ ...prev, selectedColor: color, selectedColorId: colorId }));
    if (state.selectedSizeId) {
      fetchVariationId(colorId, state.selectedSizeId);
    }
  };

  // Handle size selection
  const handleSizeSelect = (size: string, sizeId: number) => {
    setState(prev => ({ ...prev, selectedSize: size, selectedSizeId: sizeId }));
    if (state.selectedColorId) {
      fetchVariationId(state.selectedColorId, sizeId);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    setState(prev => ({ ...prev, isFavoriteLoading: true }));
    
    try {
      const response = await postRequest(`/catalog/favorites/products/${product.id}/toggle`, {  }, {}, token, locale);
      // console.log('fav', response.data.data);
      
      if (response.data.status) {
        const newFavoriteState = !state.isFavorite;
        setState(prev => ({ ...prev, isFavorite: newFavoriteState }));
        
        // Update Redux wishlist store with complete product data
        toggleProduct({
          id: product.id,
          name: product.name,
          min_price: parseFloat(product.price) || 0,
          price_after_discount: parseFloat(product.price_after_discount || product.price) || 0,
          default_variation_id: product.default_variation_id || null,
          discount: 0, // You may need to calculate this based on your data
          is_favourite: newFavoriteState,
          out_of_stock: false, // You may need to get this from product data
          rate: "0.00", // You may need to get this from product data
          short_description: product.name, // You may need to get this from product data
          thumbnail: product.image || product.thumbnail || '',
          slug: product.slug || '',
          category: product.category || '',
          variations: product.variations || []
        });
        toast.success(state.isFavorite ? `${t('Product removed from favorites')}!` : `${t('Product added to favorites successfully')}!`);
      } else {
        toast.error(t('Failed to update favorites'));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(t('Failed to update favorites'));
    } finally {
      setState(prev => ({ ...prev, isFavoriteLoading: false }));
    }
  };

  const handleAddToCart = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      toast.error(t('Please login first to add items to cart'));
      return;
    }

    if (!token) {
      toast.error(`${t('Authentication required')}. ${t('Please login again')}`);
      return;
    }

    // If product has default_variation_id, skip color/size validation
    if (!product?.default_variation_id) {
      if (!state.selectedColor || !state.selectedSize) {
        toast.error(t('Please select all product variations'));
        return;
      }

      if (!state.selectedColorId || !state.selectedSizeId) {
        toast.error(t('Please wait while we process your selection'));
        return;
      }
    }

    setState(prev => ({ ...prev, isAddingToCart: true }));
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/cart/add-to-cart`,
        {
          item_id: product?.default_variation_id || state.variationId || product.id,
          qty: 1,
          customer_note: '',
          type: 'product',
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status) {
        // Update cart store directly with the response data
        // console.log('Add to cart response:', response.data);
        
        if (response.data.data) {
          // Update cart store with the new cart data from response
          dispatch(setCartData(response.data.data));
          // console.log('Cart store updated with:', response.data.data);
        } else {
          // Fallback: reload cart from storage if no data in response
          await loadCartFromStorage();
        }
        toast.success(`${t('Product added to cart successfully')}!`);
            
      } else {
        console.error('Add to cart failed:', response.data);
        toast.error(t('Failed to add product to cart'));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('An error occurred while adding to cart'));
    } finally {
      setState(prev => ({ ...prev, isAddingToCart: false }));
    }
  };
  return (
    <>
      {/* Selected Variation Title */}
      {state.selectedVariation && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {state.selectedVariation.name || `${state.selectedColor} - ${state.selectedSize}`}
          </h4>
        </div>
      )}

      {/* Selected Variation Price */}
      {state.selectedVariation && (state.selectedVariation.price_after_discount || state.selectedVariation.price_befor_discount) && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            {state.selectedVariation.price_after_discount && (
              <span className="text-lg font-semibold text-primary-600 dark:text-white">
                <span className="icon-riyal-symbol text-xs"></span>
                {state.selectedVariation.price_after_discount}
              </span>
            )}
            {state.selectedVariation.price_befor_discount && (
              <span className="text-sm text-gray-500 line-through">
                <span className="icon-riyal-symbol text-xs"></span>
                {state.selectedVariation.price_befor_discount}
              </span>
            )}
          </div>
        </div>
      )}

<div className="product-options space-y-4 !mt-4">
<div className="product-colors">
                            <div className="flex flex-wrap gap-1">
                            {variations?.[1]?.values && variations?.[1]?.values.length > 0 && (
        <div className="product-colors mt-3 flex flex-wrap gap-1">
          {variations?.[1]?.values.slice(0, 4).map((color: any, i: number) => (
                            <button onClick={() => handleColorSelect(color.color, color.id)} key={i} className="color-option" style={{ backgroundColor: color.color }} data-color={color.color} title={`Select ${color.color}`} aria-label={`Select ${color.color}`}>
                            <span className="sr-only">{color.color}</span>
                        </button>
           
          ))}
          {variations[1].values.length > 4 && (
            <span className="text-xs text-gray-500 ml-1">
              +{variations[1].values.length - 4}
            </span>
          )}
        </div>
      )}
      </div>
      </div>
      {/* Colors */}
      {variations?.[1]?.values && variations?.[1]?.values.length > 0 && (
        <div className="product-colors mt-3 flex flex-wrap gap-1">
          {variations?.[1]?.values.slice(0, 4).map((color: any, i: number) => (
            <button
              key={i}
              onClick={() => handleColorSelect(color.color, color.id)}
              style={{ backgroundColor: color.color }}
              className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-110 ${
                state.selectedColor === color.color 
                  ? 'border-gray-800 ring-2 ring-gray-400' 
                  : 'border-gray-300'
              }`}
              title={`${t('Select')} ${color.color}`}
            />
          ))}
          {variations[1].values.length > 4 && (
            <span className="text-xs text-gray-500 ml-1">
              +{variations[1].values.length - 4}
            </span>
          )}
        </div>
      )}

<div className="product-sizes">
                            <div className="flex flex-wrap gap-1 items-end">
                            {variations?.[0]?.values.slice(0, 4).map((size: any, i: number) => (
           <>
            <button onClick={() => handleSizeSelect(size.value, size.id)} className="size-option" data-size={size.value} aria-label="Select size XS">
            {size.value}

                    </button>
           </>
          ))}
                            
                                                                 
                                                                  
                                                  
                                                            </div>
                        </div>
      {/* Sizes */}
      {variations?.[0]?.values && variations?.[0]?.values.length > 0 && (
        <div className="product-sizes mt-3 flex flex-wrap gap-1">
          {variations?.[0]?.values.slice(0, 4).map((size: any, i: number) => (
            <button
              key={i}
              onClick={() => handleSizeSelect(size.value, size.id)}
              className={`px-2 py-1 border rounded text-xs transition-colors ${
                state.selectedSize === size.value
                  ? 'border-primary-600 bg-primary-50 text-primary-600 dark:bg-primary-50 dark:text-primary-400 '
                  : 'border-gray-300 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={`${t('Select')} ${size.value}`}
            >
              {size.value}
            </button>
          ))}
          {variations?.[0]?.values.length > 4 && (
            <span className="text-xs text-gray-500 ml-1">
              +{variations?.[0]?.values.length - 4}
            </span>
          )}
        </div>
      )}
</div>


      {/* Add to Cart Button */}
      <div className="product-footer mt-4 flex gap-2 items-stretch">
        <button 
          onClick={handleAddToCart}
          disabled={
            product?.default_variation_id 
              ? state.isAddingToCart || state.isLoadingVariation
              : !state.selectedColor || !state.selectedSize || state.isAddingToCart || state.isLoadingVariation
          }
          className={`flex-1 rounded-md py-2 transition flex items-center justify-center gap-2 ${
            product?.default_variation_id 
              ? (state.isAddingToCart || state.isLoadingVariation)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
              : (state.selectedColor && state.selectedSize && !state.isLoadingVariation)
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } ${(state.isAddingToCart || state.isLoadingVariation) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {state.isAddingToCart ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : state.isLoadingVariation ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
          ) : (
            <Handbag className="w-5 h-5" />
          )}
          <span className="text-sm font-medium lg:block hidden">
            {state.isAddingToCart ? t('Adding') : state.isLoadingVariation ? t('Loading') : t('Add to Cart')}
          </span>
        </button>
        <button 
          onClick={handleFavoriteToggle}
          disabled={state.isFavoriteLoading}
          className={`p-2 rounded-md border transition-colors ${
            state.isFavorite 
              ? 'border-pink-300 bg-pink-50 hover:bg-pink-100 text-pink-600 dark:border-pink-600 dark:bg-pink-900/20 dark:hover:bg-pink-900/30 dark:text-pink-400' 
              : 'border-gray-300 hover:bg-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700'
          } ${state.isFavoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={state.isFavoriteLoading ? "Loading..." : state.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          {state.isFavoriteLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          ) : (
            <svg
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill={state.isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
            </svg>
          )}
        </button>
      </div>
    </>
  )
}

export default ProductVariations
