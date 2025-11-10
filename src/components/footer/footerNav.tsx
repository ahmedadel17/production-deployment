'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BoxIcon } from 'lucide-react'
import { useAppSelector } from '@/app/store/hooks'
import { useAuth } from '@/app/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { useWishlist } from '@/app/hooks/useWishlist'
function FooterNav() {
  const pathname = usePathname()
  const { cartData } = useAppSelector((state) => state.cart)
  const { isAuthenticated } = useAuth()
  const t = useTranslations()
  // Get total items in cart from cart_count or calculate from products
  const totalItems = cartData?.cart_count || cartData?.products?.reduce((total, item) => total + (item.qty || 0), 0) || 0
  const { products } = useWishlist();
  const wishlistCount = products.length;
  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: (
        <svg className="w-5 h-5 mb-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
          <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        </svg>
      )
    },
    ...(isAuthenticated ? [{
      href: '/cart',
      label: 'Cart',
      icon: (
        <div className="relative">
          <svg className="w-5 h-5 mb-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z"></path>
            <path d="M8 11V6a4 4 0 0 1 8 0v5"></path>
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary-200 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </div>
      )
    }] : []),
    // ...(isAuthenticated ? [{
    //   href: '/wishlist',
    //   label: 'Wishlist',
    //   icon: (
    //     <div className="relative">
    //           <svg className="w-5 h-5 mb-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    //             <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"></path>
    //         </svg>
    //       {wishlistCount > 0 && (
    //         <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
    //           {wishlistCount > 99 ? '99+' : wishlistCount}
    //         </span>
    //       )}
    //     </div>
    //   )
    // }] : []),
    {
      href: '/products',
      label: 'products',
      icon: (
         <BoxIcon className="w-5 h-5 mb-2" />
      )
    },
    ...(isAuthenticated ? [{
      href: '/dashboard',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5 mb-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5"></circle>
          <path d="M20 21a8 8 0 0 0-16 0"></path>
        </svg>
      )
    }] : [{
      href: '/auth/login',
      label: 'Login',
      icon: (
        <svg className="w-5 h-5 mb-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10,17 15,12 10,7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
      )
    }])
  ]

  return (
    <div 
      className="fixed block lg:hidden bottom-0 start-0 z-50 w-full h-16 bg-white/70 backdrop-blur-md border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600"
    >
      {(() => {
        const count = navItems.length;
        const gridColsClass = count === 1
          ? 'grid-cols-1'
          : count === 2
          ? 'grid-cols-2'
          : count === 3
          ? 'grid-cols-3'
          : 'grid-cols-4';
        // Center the grid when fewer than 4 items
        const justifyClass = count < 4 ? 'justify-center' : '';
        const maxWidth = count === 1 ? '8rem' : count === 2 ? '16rem' : count === 3 ? '24rem' : '32rem';
        return (
          <div
            className={`grid h-full mx-auto font-medium ${gridColsClass} ${justifyClass}`}
            style={{ maxWidth }}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group`}
                >
                  <div className="relative">
                    {/* Icon */}
                    <div className={`${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'} group-hover:text-blue-600 dark:group-hover:text-blue-500`}>
                      {item.icon}
                    </div>
                  </div>
                  <span className={`text-sm ${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'} group-hover:text-blue-600 dark:group-hover:text-blue-500`}>
                    {t(item.label)}
                  </span>
                </Link>
              )
            })}
          </div>
        );
      })()}
      
    </div>
  )
}

export default FooterNav
