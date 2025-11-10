'use client';

import { useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script';

interface ScriptLoaderProps {
  scripts?: string[];
}

export default function ScriptLoader({ scripts = [] }: ScriptLoaderProps) {
  useEffect(() => {
    // Global axios interceptor for auth handling
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error?.response?.data?.message;
        const status = error?.response?.status;
        if (status === 401 || message === 'Unauthenticated') {
          try {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          } catch {}
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );

    // Initialize any global functionality that needs to run after scripts load
    const initializeGlobalFeatures = () => {
      // Initialize product card interactions
      const productCards = document.querySelectorAll('.product-item');
      
      productCards.forEach((card) => {
        // Size buttons in product cards
        const sizeButtons = card.querySelectorAll('.size-option');
        sizeButtons.forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            sizeButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
          });
        });

        // Color buttons in product cards
        const colorButtons = card.querySelectorAll('.color-option');
        colorButtons.forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            colorButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
          });
        });
      });

      // Initialize quantity controls
      const decreaseBtn = document.getElementById('decreaseQty');
      const increaseBtn = document.getElementById('increaseQty');
      const quantityInput = document.getElementById('quantity') as HTMLInputElement;

      if (decreaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', () => {
          const currentValue = parseInt(quantityInput.value) || 1;
          if (currentValue > 1) {
            quantityInput.value = (currentValue - 1).toString();
          }
        });
      }

      if (increaseBtn && quantityInput) {
        increaseBtn.addEventListener('click', () => {
          const currentValue = parseInt(quantityInput.value) || 1;
          const maxValue = parseInt(quantityInput.getAttribute('max') || '10') || 10;
          if (currentValue < maxValue) {
            quantityInput.value = (currentValue + 1).toString();
          }
        });
      }

      // Initialize WhatsApp button
      const whatsappBtn = document.getElementById('whatsappBtn');
      if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
          // Get product details from the page
          const productTitle = document.querySelector('.product-title')?.textContent || 'Product';
          const productPrice = document.querySelector('.product-price span')?.textContent || '';
          
          const message = `Hi! I'm interested in ${productTitle} (${productPrice}). Can you provide more information?`;
          const encodedMessage = encodeURIComponent(message);
          const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
          
          window.open(whatsappUrl, '_blank');
        });
      }
    };

    // Run initialization after a short delay to ensure DOM is ready
    const timer = setTimeout(initializeGlobalFeatures, 100);

    return () => {
      clearTimeout(timer);
      axios.interceptors.response.eject(interceptorId);
    };
  }, []);

  return (
    <>
    
      <Script
        src="/js/embla-carousel.min.js"
        strategy="afterInteractive"
        // onLoad={() => console.log('Embla carousel script loaded')}
      />
      <Script
        src="/js/embla-carousel-autoplay.min.js"
        strategy="afterInteractive"
        // onLoad={() => console.log('Embla autoplay script loaded')}
      />
      <Script
        src="/js/embla-init.min.js"
        strategy="afterInteractive"
        // onLoad={() => console.log('Embla init script loaded')}
      />
      <Script
        src="/js/slider.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          // console.log('Custom slider script loaded')
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof (window as any).initSiteSlider === 'function') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(window as any).initSiteSlider()
            }
          } catch {}
        }}
      />
      <Script
        src="/js/navigation.js"
        strategy="afterInteractive"
        // onLoad={() => console.log('Navigation script loaded')}
      />
      
      {/* Load additional scripts if provided */}
      {scripts
        .filter(script => !script.includes('share-modal'))
        .map((script, index) => (
          <Script
            key={index}
            src={script}
            strategy="afterInteractive"
          />
        ))}
    </>
  );
}
