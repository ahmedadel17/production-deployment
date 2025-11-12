'use client';
import { useCart } from "@/app/hooks/useCart";
import { useAuth } from "@/app/hooks/useAuth";
import React, { useEffect, useCallback } from "react";
import CartItem from "./cartItem";
import CartSummary from "./cartSummary";
import { useLocale, useTranslations } from 'next-intl';
import getRequest from "../../../helpers/get";
import { useAppDispatch } from "@/app/store/hooks";
import { setCartData, setCartLoading, setCartError } from "@/app/store/slices/cartSlice";
import toast from "react-hot-toast";
function Cart() {
  const { 
    cartData, 
    products: cartItems, 
    totalItems, 
    totalPrice, 
    clearCart,
    isLoading,
    error: cartError,
    
  } = useCart();
  const { token } = useAuth();
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useAppDispatch();

  const fetchCartData = useCallback(async () => {
    if (!token) return;
    dispatch(setCartLoading(true));
    dispatch(setCartError(null));
    try {
      const response = await getRequest('/marketplace/cart/my-cart', {}, token, locale);
      
      // Check if cart is empty
      if (response.status === false || (response.message && response.message.includes('Cart Is Empty'))) {
        // Set empty cart structure
        dispatch(setCartData({
          id: 0,
          type: '',
          status: '',
          status_value: '',
          sub_total: '0',
          vat_amount: '0',
          total_amount: '0',
          amount_to_pay: '0',
          products: [],
          offers: [],
          voucher: null,
          customer_note: null,
          address: null,
          use_wallet: false,
          user_balance: '0',
          allow_voucher: false,
          allowed_payment_methods: [],
          shipping_methods: [],
          created_at: '',
          cart_count: 0,
          order_attributes: [],
          can_cancel: false,
          can_rate: false,
          can_pay: false,
        }));
        return;
      }
      
      if (response.data) {
        dispatch(setCartData(response.data));
      } else {
        toast.error('Invalid cart data received from API');
        throw new Error('Invalid cart data received from API');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cart data';
      toast.error(errorMessage);
      dispatch(setCartError(errorMessage));
    } finally {
      dispatch(setCartLoading(false));
    }
  }, [token, locale, dispatch]);
  // Fetch cart data when component mounts
  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);





  const handleClearCart = () => {
    clearCart();
  };

  // Cart totals are managed by Redux

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">{t('Loading cart')}</span>
      </div>
    );
  }

  // Show error state
  if (cartError) {
    return (
      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
        <p className="text-sm text-red-600 dark:text-red-400">{cartError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-red-500 hover:text-red-700"
        >
          {t('Retry')}
        </button>
      </div>
    );
  }

  return (
    <>
  

     <div className="flex justify-between items-center mb-8 my-2">
    <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("Shopping Cart")}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{totalItems} {t("items in your cart")}</p>
    </div>
    <button 
      onClick={handleClearCart}
      className="text-gray-500 hover:text-red-500 transition-colors text-sm"
    >
        {t("Clear Cart")}
    </button>
</div> 
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("Your cart is empty")}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t("Add some items to get started")}!</p>
            <a
              href="/products"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t("Start Shopping")}
            </a>
          </div>
        ) : (
          cartItems.map((item) => (
            <CartItem 
              key={item.id} 
              item={{
                id: item.id.toString(),
                title: item.name,
                image: item.image,
                color: item.variation.split(' / ')[1] || 'Default', // Extract color from variation string
                size: item.variation.split(' / ')[0] || 'Default', // Extract size from variation string
                qty: item.qty,
                price: item.price,
              }} 
            />
          ))
        )}

        {/* Continue Shopping */}
        <div className="pt-4 ">
          <a
            href="#"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t("Continue Shopping")}
          </a>
        </div>
      </div>

      {/* Cart Summary */}
     {
      cartItems.length > 0 && (
        <CartSummary />
      )
     }
    </div>
    </>
  )
}

export default Cart
