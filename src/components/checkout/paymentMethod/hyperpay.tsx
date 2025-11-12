// app/payment/page.tsx or pages/payment.tsx
'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import postRequest from '../../../../helpers/post';
import { useOrder } from '@/app/hooks/useOrder';
import { useCart } from '@/app/hooks/useCart';
import { useAuth } from '@/app/hooks/useAuth';
import { useTranslations } from 'next-intl';
interface HyperPayPaymentProps {
  selectedBrand?: string;
  onPaymentReady?: () => void;
}

export default function HyperPayPayment({ selectedBrand, onPaymentReady }: HyperPayPaymentProps) {
  const t = useTranslations();
  const url= window.location.origin;
  const [checkoutId, setCheckoutId] = useState<string>('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { cartData } = useCart();
  const { token } = useAuth();
      const { order } = useOrder();
  // Fetch checkout ID from YOUR Laravel API
  useEffect(() => {
    const fetchCheckoutId = async () => {
      try {
        setIsLoading(true);
        // console.log('Fetching checkout ID for cart:', cartData?.id, 'with brand:', selectedBrand);
        const response = await postRequest('/payment/hyper-pay/prepare-checkout', {
          order_id: cartData?.id,
          brand: selectedBrand || order.payment_method_id,
        }, {}, token, 'en');

        // Check if the response status is false
        if (response?.data?.status === false) {
          setIsLoading(false);
          return;
        }
        
        // Check different possible response structures
        const checkoutId = response?.data?.data?.checkoutId || 
                          response?.data?.checkoutId || 
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (response as any)?.checkoutId;
        
        if (checkoutId) {
          setCheckoutId(checkoutId);
          // console.log('Checkout ID updated:', checkoutId);
          setIsLoading(false);
          // Notify parent that payment is ready
          if (onPaymentReady) {
            onPaymentReady();
          }
        } else {
          console.error('No checkout ID found in response:', response);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching checkout ID:', error);
        setIsLoading(false);
      }
    };

    if (cartData?.id && selectedBrand) {
      fetchCheckoutId();
    } else {
      // console.log('No cart items or brand found, skipping checkout ID fetch');
    }
    }, [cartData?.id, selectedBrand, order.payment_method_id, token, onPaymentReady]);

  // Initialize HyperPay widget options
  useEffect(() => {
      // @ts-expect-error - HyperPay global object
      window.wpwlOptions = {
        applePay: {
          version: 3,
          displayName: "MyStore",
          checkAvailability: "canMakePayments",
          style: "white",
          countryCode: "US",
          merchantCapabilities: ["supports3DS"],
          supportedNetworks: ["amex", "discover", "masterCard", "visa"],
        },
      };
  }, [scriptLoaded, checkoutId, selectedBrand]);

  return (
    <section className="cart-page">
      <div className="container">
        <div className="cart-content shipping-information-section">
          <div className="w-full">
            <div className="w-full">

              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 animate-spin text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-gray-600">{t("Preparing payment")}...</span>
                  </div>
                </div>
              ) : checkoutId ? (
                  <>
                    {
                    !scriptLoaded && (
                      <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">{t('Loading')}</span>
                    </div>
                    )
                    
                    } 
                  
                  <form
                      action={`${url}/checkoutConfirmation/pending?orderId=${cartData?.id}`}
                   
                    className="paymentWidgets"
                    data-brands={selectedBrand ? selectedBrand.toUpperCase() : "VISA MASTER MADA"}
                  ></form>
                    <Script
                        src={`https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`}
                        onLoad={() => {
                          // console.log('HyperPay script loaded successfully');
                          setScriptLoaded(true);
                        }}
                        onError={(e) => {
                          console.error('HyperPay script failed to load:', e);
                        }}
                        strategy="afterInteractive"
                    />
                </>
              ) : (
                <div className="flex items-center justify-center p-2">
                  <div className="text-center">
                    <div className="text-gray-500 mb-2">{t("Payment form not available")}</div>
                    <div className="text-sm text-gray-400">{t("Please try again or contact support")}</div>
                  </div>
                </div>
              )}
            </div>
       
          </div>
        </div>
      </div>
    </section>
  );
}