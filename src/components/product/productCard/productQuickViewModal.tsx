'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CompareProduct } from '../../../app/store/slices/compareSlice';
import ProductVariations from '../../productDetails/productVariations';
import { useAuth } from '../../../app/hooks/useAuth';
import { useAppDispatch } from '../../../app/store/hooks';
import { setCartData, setCartLoading, setCartError } from '../../../app/store/slices/cartSlice';
import { useCart } from '../../../app/hooks/useCart';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
type QuickViewProps = {
  product: CompareProduct;
  isOpen: boolean;
  onClose: () => void;
};

const QuickView: React.FC<QuickViewProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { token, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const { loadCartFromStorage } = useCart();
  const t = useTranslations();
  const [variationId, setVariationId] = useState<number | null>(null);
  const [variationData, setVariationData] = useState<{ id?: number; name?: string; price_after_discount?: string; price_before_discount?: string; stock?: number } | null>(null);
  const [isLoadingVariation, setIsLoadingVariation] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerNote, setCustomerNote] = useState('');
  const router = useRouter();
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setVariationId(null);
      setVariationData(null);
      setIsLoadingVariation(false);
      setIsAddingToCart(false);
      setQuantity(1);
      setCustomerNote('');
    }
  }, [isOpen]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Fetch variation ID when all attributes are selected
  const fetchVariationId = async (attributes: Record<number, number>) => {
    setIsLoadingVariation(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/catalog/products/get-variation-by-attribute`,
        {
          product_id: product.id,
          attributes: attributes
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status && response.data.data?.id) {
        setVariationId(response.data.data.id);
        setVariationData(response.data.data);
        setIsLoadingVariation(false);
      } else {
        console.error('Failed to get variation ID:', response.data);
        setVariationId(null);
        setVariationData(null);
        setIsLoadingVariation(false);
      }
    } catch (error) {
      console.error('Error fetching variation ID:', error);
      setVariationId(null);
      setVariationData(null);
      setIsLoadingVariation(false);
    }
  };

  // Handle selection changes (optional, for tracking)
  const handleSelectionChange = (_selections: Record<number, number>) => {
    // Can be used for tracking if needed
  };

  // Handle data change (quantity and customer note)
  const handleDataChange = (qty: number, note: string) => {
    setQuantity(qty);
    setCustomerNote(note);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!token) {
      router.push('/auth/login');
      toast.error('Authentication required. Please login again.');
      return;
    }

    // If product has default_variation_id, skip variation validation
    if (!product?.default_variation_id) {
      if (!variationId && !variationData) {
        toast.error('Please select all product variations');
        return;
      }

      if (isLoadingVariation) {
        toast.error('Please wait while we process your selection');
        return;
      }
    }

    setIsAddingToCart(true);
    dispatch(setCartLoading(true));
    dispatch(setCartError(null));

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/cart/add-to-cart`,
        {
          item_id: product?.default_variation_id || variationId || product.id,
          qty: quantity,
          customer_note: customerNote,
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
        if (response.data.data) {
          dispatch(setCartData(response.data.data));
        } else {
          await loadCartFromStorage();
        }
        toast.success(response.data.message || t('Product added to cart successfully')+'!');
        onClose(); // Close modal after successful add to cart
      } else {
        console.error('Add to cart failed:', response.data);
        toast.error(response.data.message || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('An error occurred while adding to cart');
    } finally {
      setIsAddingToCart(false);
      dispatch(setCartLoading(false));
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="quickViewModal animate-fade-in fixed inset-0 bg-black bg-opacity-50 z-[10002] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="quickViewTitle text-xl font-semibold">{product?.title || product?.name || 'Product Title'}</h2>
          <button
            className="closeQuickView text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8 flex items-center justify-center"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="quickViewContent p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="product-image">
              <img
                src={product?.image || product?.thumbnail || '/images/product-1.jpg'}
                alt={product?.title || product?.name || 'product'}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="product-details">
              <h3 className="text-lg font-semibold mb-2">
                {variationData?.name || product?.title || product?.name || 'Product Title'}
              </h3>
              <div className="product-price flex items-center gap-2 mb-4">
                {/* Old Price */}
                {(variationData?.price_before_discount || product?.price_before_discount || product?.min_price || product?.old_price) && (
                  <p className="text-lg text-gray-500 dark:text-gray-400 line-through flex items-center gap-1">
                    <span className="icon-riyal-symbol text-xs"></span>
                    <span>{variationData?.price_before_discount || product?.price_before_discount || product?.min_price || product?.old_price}</span>
                  </p>
                )}
                {/* New Price */}
                <p className="text-2xl font-bold text-blue-600 dark:text-primary-400 flex items-center gap-1">
                  <span className="icon-riyal-symbol text-sm"></span>
                  <span>{variationData?.price_after_discount || product?.price_after_discount || product?.price || '100'}</span>
                </p>
              </div>

              {/* Product Variations */}
              {product.variations && product.variations.length > 0 && (
                <div className="mb-4">
                  <ProductVariations
                    variations={product.variations}
                    onSelectionChange={handleSelectionChange}
                    onVariationFetch={fetchVariationId}
                    onDataChange={handleDataChange}
                    variationData={variationData}
                  />
                </div>
              )}

              <div className="space-y-4">
                <button
                  className={`w-full te-btn te-btn-primary ${
                    (isAddingToCart || isLoadingVariation || 
                    (product.variations && product.variations.length > 0 && !product.default_variation_id && !variationId && !variationData))
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || isLoadingVariation || 
                    (product.variations && product.variations.length > 0 && !product.default_variation_id && !variationId && !variationData)}
                >
                  {isAddingToCart ? t('Adding') : isLoadingVariation ? t('Loading') : t('Add to Cart')}
                </button>
                <a
                  href={product?.slug ? `/productDetails/${product.slug}` : '/productDetails'}
                  className="w-full te-btn te-btn-default block text-center"
                >
                 {t("View Full Details")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal using portal to document body to avoid hover state issues
  if (!isOpen) return null;
  
  return createPortal(modalContent, document.body);
};

export default QuickView;
