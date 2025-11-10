'use client'
import React, { useState } from 'react'
import DropDownSubMenu from './MobileMenuSubmenu/DropDownSubMenu';
import Link from 'next/link';
import SkeletonShimmer from '../skeleton/SkeletonShimmer';

function HeaderMobileMenu({ menuData }: { menuData: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(prev => {
      const newState = !prev;
      return newState;
    });
  };



  // Check if menu data is loading (show loading only if menuData is null/undefined)
  const isLoading = !menuData || menuData?.items === undefined;

  return (
    <>
      <button 
        className="te-navbar-toggle te-navbar-icon-button lg:hidden relative z-[10001]" 
        aria-label="Toggle mobile menu" 
        aria-expanded={isMenuOpen} 
        aria-controls="mobile-navigation"
        onClick={toggleMenu}
        type="button"
      >
       {!isMenuOpen && (
         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
       )}
       {isMenuOpen && (
         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
         </svg>
       )}
      </button>


      {/* <!-- Mobile Navigation Menu --> */}
      {isMenuOpen && <div 
        className="te-navbar-nav-mobile te-navbar-nav-mobile-show z-[10000]" 
        id="mobile-navigation" 
        aria-label="Mobile Navigation"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          {isLoading ? (
            // Loading skeleton state
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, index) => (
                <SkeletonShimmer key={index} className="rounded">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </SkeletonShimmer>
              ))}
            </div>
          ) : (
            // Actual menu items
            menuData.items.map((item: any, index: number) => (
              item?.is_mega_menu ? (
                <DropDownSubMenu key={index} label={item.label} items={item?.mega_menu_children_columns} onNavigate={() => setIsMenuOpen(false)} />
              ) : (
                <Link key={index} href={item?.url} prefetch={false} className="te-navbar-link-mobile" onClick={() => setIsMenuOpen(false)}>{item?.label}</Link>
              )
            ))
          )}
        </div>
      </div>}
    </>
  )
}

export default HeaderMobileMenu
