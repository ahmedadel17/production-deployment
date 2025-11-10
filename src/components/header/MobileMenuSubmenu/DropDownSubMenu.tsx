import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link';

function DropDownSubMenu({ label, items, onNavigate }: { label: string, items: any, onNavigate?: () => void }) {
  const [openSubmenus, setOpenSubmenus] = useState(false);
  const t = useTranslations()
 const toggleSubMenu = () => {
  setOpenSubmenus(prev => !prev);
 }
//  console.log('items 📱',items);
  
  // Check if an item has nested submenus (has items array with sub-items)
  const hasNestedSubmenu = (item: any) => {
    return item?.items && item.items.length > 0 ;
  };

  return (
   <>
    <a
    href="#" 
    className={`te-navbar-link-mobile te-navbar-link-mobile-has-submenu  dark:text-white${openSubmenus ? 'te-mobile-submenu-open dark:text-white' : ''}`}
    onClick={(e) => {
     toggleSubMenu();
    }}
  >
    {label}
  </a>
    <div className={`te-navbar-submenu-mobile  ${openSubmenus ? 'te-submenu-mobile-open ' : ' '}`}>
    {items?.map((item: any,index: number) => {
      // If item has nested submenus, render DropDownSubMenu recursively
      if (hasNestedSubmenu(item)) {
        return (
          <DropDownSubMenu key={index} label={item?.label} items={item?.items} onNavigate={onNavigate} />
        );
      }
      
      // Otherwise, render as a direct link
      return (
        <Link key={index} href={item?.url || '#'} prefetch={false} className="te-navbar-submenu-mobile-link" onClick={() => { if (onNavigate) onNavigate(); }}>
          {item?.label}
        </Link>
      );
    })}
</div>
   </>
  )
}

export default DropDownSubMenu
