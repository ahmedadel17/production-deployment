"use client";
import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation"; // Remove if not using Next.js
import { useAuth } from "../../app/hooks/useAuth";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { useRouter } from "next/navigation";
interface MenuItem {
  title: string;
  //@ts-ignore
  icon: any;
  url: string;
}

const AccountDropdown: React.FC = () => {
  const { user, logout: logoutUser } = useAuth();
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Sync user data from localStorage if Redux doesn't have first_name
  useEffect(() => {
    if (user && !user.first_name) {
      try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const parsedUser = JSON.parse(storedUserData);
          // If localStorage has first_name but Redux doesn't, we can log it for debugging
          // The useAuth hook should handle this, but this is a fallback
          if (parsedUser.first_name && !user.first_name) {
            console.log('User data mismatch - localStorage has first_name but Redux does not');
          }
        }
      } catch (error) {
        console.error('Error reading user data from localStorage:', error);
      }
    }
  }, [user]);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    // Explicitly remove auth token from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('cartData');
      localStorage.removeItem('wishlistProducts');
      localStorage.removeItem('addressData');
      localStorage.removeItem('orderData');
      localStorage.removeItem('trackOrderData');
      localStorage.removeItem('returnOrderData');
      localStorage.removeItem('returnOrderData');
      // Also clear cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Call logout function from useAuth hook (this also handles Redux store cleanup)
    logoutUser();
    // Close dropdown
    setIsOpen(false);
    // Redirect to home page or login page
    router.push('/auth/login');
  };

  const menuItems: MenuItem[] = [
    {
      title: t("Dashboard"),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
      ),
      url: "/dashboard",
    },
    {
      title: t("My Rewards"),
      icon: (
        <>
          <path d="M11.051 7.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.867l-1.156-1.152a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z"></path>
          <circle cx="12" cy="12" r="10"></circle>
        </>
      ),
      url: "/dashboard/rewards",
    },
    {
      title: t("My Orders"),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      ),
      url: "/dashboard/orders",
    },
    {
      title: t("Track Order"),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      ),
      url: "/dashboard/track",
    },
    {
      title: t("Return Items"),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      ),
      url: "/dashboard/returns",
    },
    {
      title: t("Wishlist"),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      ),
      url: "/dashboard/wishlist",
    },
    {
      title: t("Addresses"),
      icon: (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </>
      ),
      url: "/dashboard/addresses",
    },
    {
      title: t("Account Settings"),
      icon: (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </>
      ),
      url: "/dashboard/settings",
    },
    {
      title: t("Logout"),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      ),
      url: "logout", // Special identifier for logout
    },
  ];

  return (
    <div className="te-navbar-dropdown relative" ref={dropdownRef}>
      <div
        className="header-account flex items-center gap-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="account-icon">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900  dark:text-white flex justify-center items-center rounded-full relative">
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
          </div>
        </div>

        <div className="grid">
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {t("My Account")} 
          </span>
          <span className="text-gray-900 dark:text-gray-100 text-sm font-medium">
           {t("Hi")}, {user?.first_name || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="account-drop-down absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 mb-2">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.first_name || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'} 
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {user?.email}
            </div>
          </div>

          <div className="grid gap-1 pb-2">
            {menuItems.map((item) => {
              const isActive = pathname?.includes(item.url);
              const activeClass = isActive
                ? "bg-primary-50/20 dark:bg-primary-900/20 text-primary-600 dark:text-primary-100"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";

              // Handle logout button specially
              if (item.url === "logout") {
                return (
                  <button
                    key={item.title}
                    onClick={handleLogout}
                    className={`flex gap-2 items-center px-4 py-2 text-sm rounded-md transition w-full text-left ${activeClass}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {item.icon}
                    </svg>
                    {item.title}
                  </button>
                );
              }

              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={`flex gap-2 items-center px-4 py-2 text-sm rounded-md transition ${activeClass}`}
                  onClick={() => setIsOpen(false)}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {item.icon}
                  </svg>
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;
