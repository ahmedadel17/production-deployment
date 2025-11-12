'use client';
import { useCart } from '@/app/hooks/useCart';
import Image from 'next/image'
import React, { useState } from 'react'
import { useAuth } from '@/app/hooks/useAuth';
import axios from 'axios';
import { setCartData } from '@/app/store/slices/cartSlice';
import { useAppDispatch } from '@/app/store/hooks';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
interface CartItemProps {
  item: {
    id: string;
    title: string;
    image: string;
    color: string;
    size: string;
    qty: number;
    price: number;
    priceOld?: number;
    priceEach?: number;
  };
}

function CartItem({item}: CartItemProps) {
  const dispatch = useAppDispatch();
  const [localQuantity, setLocalQuantity] = useState(item.qty);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { cartData } = useCart();
  const { token } = useAuth();
  const t = useTranslations();
  const handleIncrement = () => {
    const newQuantity =  localQuantity + 1;
    setLocalQuantity(newQuantity);
  };

  const handleDecrement = () => {
    const newQuantity = Math.max(1, localQuantity - 1);
    setLocalQuantity(newQuantity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    const newQuantity = Math.max(1, Math.min(10, value));
    setLocalQuantity(newQuantity);
  };

  const handleUpdateQuantity = async () => {
    setIsUpdating(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/cart/update-quantity-cart`,
        {
          order_id: cartData?.id,
          cart_item_id: parseInt(item.id),
          qty: localQuantity,
          type: 'product'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      dispatch(setCartData(response.data.data));

        toast.success(response.data.message);
      // You can add success feedback here if needed
    } catch (error) {
      toast.error(t('Error updating quantity'));
    } finally {
      setIsUpdating(false);
    }
  };
  const handleRemoveItem = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace/cart/delete-item-from-cart`,
        {
          order_id: cartData?.id,
          cart_item_id: parseInt(item.id),
          type: 'product',
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      dispatch(setCartData(response.data.data));

      toast.success('Item removed from cart successfully!');
    } catch (error) {
      toast.error('Error deleting item');
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <>
       <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Product Image */}
              <div className="md:w-32 md:h-32 w-full h-48">
                <Image
                  width={600}
                  height={600}
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full objectCover rounded-md"
                  />
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <button
                    onClick={handleRemoveItem}
                    disabled={isDeleting}
                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Color & Size */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>{t("Color")}: {item.color}</span>
                  <span>{t("Size")}: {item.size}</span>
                  
                  {/* Mobile Price Display */}
                  <div className="md:hidden flex items-center space-x-2">
                    {item.priceOld && (
                      <span className="text-gray-500 dark:text-gray-400 line-through text-sm">
                        SAR {item.priceOld.toFixed(2)}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      SAR {item.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Quantity + Price */}
                <div className="flex items-center justify-between">
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("Qty")}:
                    </span>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                          <button
                            onClick={handleDecrement}
                            disabled={isUpdating || localQuantity <= 1}
                            className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={localQuantity}
                            onChange={handleInputChange}
                          
                            disabled={isUpdating}
                            className="w-16 text-center bg-transparent border-0 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <button
                            onClick={handleIncrement}
                            className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={handleUpdateQuantity}
                          disabled={isUpdating }
                          className="px-3 py-2  md:block bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isUpdating ? (
                            <>
                              {t("Updating")} ...
                            </>
                          ) : (
                            t("Update")
                          )}
                        </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right hidden lg:block">
                    <div className="flex items-center space-x-2">
                      {item.priceOld && (
                        <span className="text-gray-500 dark:text-gray-400 line-through text-sm">
                          SAR {item.priceOld.toFixed(2)}
                        </span>
                      )}
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        SAR {item.price.toFixed(2)}
                      </span>
                    </div>
                    {item.priceEach && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.priceEach.toFixed(2)} {t("each")}
                      </p>
                    )}
                  </div>
                  
                </div>
              </div>

            </div>
          </div>
    </>
  )
}

export default CartItem
