"use client";
import { useCart } from "@/app/hooks/useCart";
import React, { useState, useEffect } from "react";
import DeleteButton from "@/components/DeleteButton";
import axios from "axios";
import { useAuth } from "@/app/hooks/useAuth";
import { setCartData } from "@/app/store/slices/cartSlice";
import { useAppDispatch } from "@/app/store/hooks"; 
import toast from "react-hot-toast";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { useRouter } from "next/navigation";
interface CartItem {
  title: string;
  qty: number;
  price: number;
  image?: string;
}

const CartDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { cartData, loadCartFromStorage } = useCart();
  const { token } = useAuth();
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const router = useRouter();
  useEffect(() => {
    setMounted(true);
  }, []);
  // Close dropdown when clicking outside (using React patterns)
  const handleBackdropClick = () => {
    setIsOpen(false);
  };

  const handleRemoveItem = async (id: number) => {
    // console.log('Removing item with ID:', id);
    if (!id) {
      // console.error('Item ID is missing:', id);
      toast.error(t('Unable to remove item'));
      return;
    }
    if (!cartData?.id) {
      // console.error('Cart ID is missing');
      toast.error(t('Unable to remove item'));
      return;
    }
    if (!token) {
      // console.error('Token is missing');
      toast.error(t('Please login to continue'));
      router.push('/auth/login');
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/cart/delete-item-from-cart`,
        {
          order_id: cartData.id,
          cart_item_id: id,
          type: 'product',
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data && response.data.data) {
        dispatch(setCartData(response.data.data));
        toast.success(response.data.message);
      } else {
        console.error('Invalid response:', response.data);
        toast.error(t('Failed to remove item'));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      let errorMessage = 'Error deleting item';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="te-navbar-dropdown relative">
      {/* Header Icon */}
      <div
        className="header-cart relative flex items-center gap-3 cursor-pointer"
        data-dropdown="cart"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="cart-icon">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 dark:text-white flex justify-center items-center rounded-full relative">
            {/* Cart SVG */}
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z" />
              <path d="M8 11V6a4 4 0 0 1 8 0v5" />
            </svg>

            {/* Badge - only show after mount to avoid hydration mismatch */}
            {mounted && (cartData?.cart_count || 0) > 0 && (
              <span className="header-cart-item absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {cartData?.cart_count || 0}
              </span>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="grid">
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {t("My Cart")}
          </span>
          <span className="text-gray-900 dark:text-gray-100 text-sm font-medium">
            {mounted ? (cartData?.amount_to_pay || 0) : 0}
          </span>
        </div>
      </div>

      {/* Backdrop for closing dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleBackdropClick}
        />
      )}

      {/* Dropdown Content */}
      {mounted && (
        <div className={`cart-drop-down te-navbar-dropdown-content px-4 py-4 bg-white dark:bg-gray-800 max-w-[250px] absolute top-full right-0 mt-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 ${isOpen ? 'te-dropdown-show' : ''}`}>
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {t("Shopping Cart")}
          </div>

          {/* Items */}
          {!cartData?.products || cartData.products.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              <p className="text-sm">{t("Your cart is empty")}</p>
            </div>
          ) : (
            cartData.products.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700"
          >
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full objectCover rounded-md"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white whitespace-normal break-words">
                <a href="#" className="hover:text-primary-400">
                  {item.name}
                </a>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {t('Qty')}: {item.qty} × <span>{item.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Remove Button */}
            <div >
              <DeleteButton
                onDelete={() => {
                  return handleRemoveItem(item.id);
                }}
                size="sm"
                variant="icon"
              />
            </div>
            </div>
            ))
          )}

          {/* Cart Total */}
          <div className="mt-6">
            <div className="flex justify-between items-center font-medium mb-3 text-gray-900 dark:text-white">
              <span>{t("Total")}:</span>
              <span>{cartData?.total_amount || 0}</span>
            </div>

            <div className="grid gap-2">
              <Link
                href="/cart"
                className="w-full te-btn te-btn-default text-center block"
                onClick={() => setIsOpen(false)}
              >
                {t("View Cart")}
              </Link>
              <Link
                href="/checkout"
                className="w-full te-btn te-btn-primary text-center block"
                onClick={() => setIsOpen(false)}
              >
               {t("Checkout")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDropdown;
