'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../ThemeProvider';

function HeaderDarkMode() {
  const { darkMode, toggleDarkMode, mounted } = useTheme();
  const [displayDarkMode, setDisplayDarkMode] = useState(false);

  // Sync with theme context and DOM on mount
  useEffect(() => {
    if (mounted) {
      // Once mounted, use the actual darkMode value from context
      setDisplayDarkMode(darkMode);
    } else {
      // Before mount, read from DOM (set by inline script) to prevent flash
      const isDark = document.documentElement.classList.contains('dark');
      setDisplayDarkMode(isDark);
    }
  }, [darkMode, mounted]);

  const handleToggle = () => {
    // Disable transitions temporarily to prevent flash
    document.documentElement.classList.add('no-transition');
    setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
    }, 50);
    toggleDarkMode();
  };

  return (
    <div className="flex items-center">
      <button 
        id="darkModeToggle" 
        className="te-navbar-icon-button relative" 
        aria-label={`Switch to ${displayDarkMode ? 'light' : 'dark'} mode`}
        onClick={handleToggle}
      >
        {/* Sun Icon - shown in light mode */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${displayDarkMode ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'}`}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-amber-500">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"></path>
          </svg>
        </div>

        {/* Moon Icon - shown in dark mode */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${displayDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'}`}>
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-slate-300">
            <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"></path>
          </svg>
        </div>
      </button>

      <span id="dark-mode-description" className="sr-only">
        Toggle between light and dark themes
      </span>
    </div>
  )
}

export default HeaderDarkMode
