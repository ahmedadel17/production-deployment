'use client';
import React, { useState } from 'react'
import { useAppDispatch } from '@/app/store/hooks'
import { useAuth } from '@/app/hooks/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { setCartData, setCartLoading, setCartError } from '@/app/store/slices/cartSlice'
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface AddToCartButtonProps {
  productId?: string;
  productTitle?: string;
  productPrice?: number;
  productImage?: string;
  hasVariations?: boolean;
  quantity: number;
  customerNote: string;
  defaultVariationId?: number;
  variationId?: number | null;
  variationData?: any;
  isLoadingVariation?: boolean;
}

function AddToCartButton({ 
  productId, 
  hasVariations = false,
  defaultVariationId,
  variationId,
  variationData,
  isLoadingVariation = false,
  quantity,
  customerNote
}: AddToCartButtonProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!token) {
      setError('Authentication required. Please login again.');
      router.push('/auth/login');
      return;
    }

    // If product has default_variation_id, skip variation validation
    if (!defaultVariationId) {
      if (hasVariations && !variationId && !variationData) {
        setError(t('Please select all product variations'));
        return;
      }

      if (isLoadingVariation) {
        setError(t('Please wait while we process your selection'));
        return;
      }
    }

    setIsAddingToCart(true);
    setError(null);
    dispatch(setCartLoading(true));
    dispatch(setCartError(null));

    try {
      const requestData = {
        item_id: defaultVariationId || variationId || productId,
        qty: quantity,
        customer_note: customerNote,
        type: 'product',
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/cart/add-to-cart`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status) {
        // Update cart store with the new cart data from response
        if (response.data.data) {
          dispatch(setCartData(response.data.data));
        }
        toast.success(response.data.message || t('Product added to cart successfully')+'!');
      } else {
        toast.error(response.data.message || t('Failed to add to cart'));
      }
      
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        router.push('/auth/login');
        return;
      }
      const errorMessage = 'An error occurred while adding to cart';
      toast.error(errorMessage);
      dispatch(setCartError(errorMessage));
    } finally {
      setIsAddingToCart(false);
      dispatch(setCartLoading(false));
    }
  };

  // Determine if button should be disabled
  const isDisabled = isAddingToCart || isLoadingVariation || 
    (hasVariations && !defaultVariationId && (!variationId && !variationData));

  return (
    <>
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className="w-full py-3 bg-primary-700 text-white rounded-md hover:bg-primary-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isAddingToCart ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {t('Adding to Cart')}...
          </>
        ) : isLoadingVariation ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {t('Loading')}...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z" />
              <path d="M8 11V6a4 4 0 0 1 8 0v5" />
            </svg>
            {t('Add to Cart')}
          </>
        )}
      </button>
    </>
  )
}

export default AddToCartButton
