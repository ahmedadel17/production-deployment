"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';

interface Country {
  id: number;
  title: string;  
  flag?: string;
  dial_code?: string;
}

interface CountrySearchSelectProps {
  value?: string;
  onChange: (countryCode: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  error?: string;
  touched?: boolean;
}

const CountrySearchSelect: React.FC<CountrySearchSelectProps> = ({
  value = '',
  onChange,
  placeholder = 'Select Country',
  className = '',
  disabled = false,
  required = false,
  label,
  error,
  touched = false
}) => {
  const t = useTranslations();
  const [countries, setCountries] = useState<Country[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchedQueries, setSearchedQueries] = useState<Set<string>>(new Set());
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch countries from API
  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/core/countries`);
      if (response.data.status && response.data.data) {
        setCountries(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      // Fallback to a basic list if API fails
      setCountries([]);
       
    } finally {
      setIsLoading(false);
    }
  };

  // Search countries via API with keyword
  const searchCountries = async (keyword: string) => {
    if (!keyword.trim()) return;
    
    const trimmedKeyword = keyword.trim().toLowerCase();
    
    // Don't search if we already searched for this query and got empty results
    if (searchedQueries.has(trimmedKeyword)) {
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/core/countries`, {
        params: { keyword: trimmedKeyword }
      });
      
      if (response.data.status && response.data.data) {
        const searchResults = response.data.data;
        
        // If search results are empty, mark this query as searched
        if (searchResults.length === 0) {
          setSearchedQueries(prev => new Set([...prev, trimmedKeyword]));
          return;
        }
        
        // Merge with existing countries, avoiding duplicates
        setCountries(prevCountries => {
          const existingIds = new Set(prevCountries.map(country => country.id));
          const newCountries = searchResults.filter((country: Country) => !existingIds.has(country.id));
          return [...prevCountries, ...newCountries];
        });
      } else {
        // Mark as searched if API response is invalid
        setSearchedQueries(prev => new Set([...prev, trimmedKeyword]));
      }
    } catch (error) {
      console.error('Failed to search countries:', error);
      // Mark as searched on error to prevent repeated failed requests
      setSearchedQueries(prev => new Set([...prev, trimmedKeyword]));
    } finally {
      setIsSearching(false);
    }
  };

  // Load countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter countries based on search query
  const filteredCountries = countries.filter(country =>
    country.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trigger API search when no local results found and user is typing
  useEffect(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (trimmedQuery && filteredCountries.length === 0 && !isSearching && !searchedQueries.has(trimmedQuery)) {
      const timeoutId = setTimeout(() => {
        searchCountries(searchQuery);
      }, 500); // Debounce search by 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, filteredCountries.length, isSearching, searchedQueries]);

  // Get selected country
  const selectedCountry = countries.find(country => country.id.toString() === value);

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    onChange(country.id.toString());
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        searchInputRef.current?.focus();
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredCountries.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : filteredCountries.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredCountries.length) {
        handleCountrySelect(filteredCountries[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  };

  // CSS Classes
  const containerClasses = `
    relative ${className}
  `;

  const buttonClasses = `
    w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 
    rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 
    hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 
    focus:ring-primary-500 focus:border-primary-500 transition-colors
    ${error && touched ? 'border-red-500 dark:border-red-500' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-600' : ''}
  `;

  const dropdownClasses = `
    absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
    rounded-md shadow-lg max-h-60 overflow-hidden
  `;

  return (
    <div className={containerClasses} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          {(label)}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={buttonClasses}
      >
        <div className="flex items-center space-x-2">
          {selectedCountry ? (
            <>
              {selectedCountry.flag && (
                <span className="text-lg">{selectedCountry.flag}</span>
              )}
              <span className="text-sm font-medium">{selectedCountry.title}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedCountry.dial_code}
              </span>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">
              {isLoading ? ('Loading...') : placeholder}
            </span>
          )}
        </div>
        
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={dropdownClasses}>
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t("Search countries")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:text-white"
              autoFocus
            />
          </div>

          {/* Countries List */}
          <div className="max-h-48 overflow-auto">
            {isLoading ? (
              <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                {("Loading countries...")}
              </div>
            ) : isSearching ? (
              <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                  <span>{("Searching...")}</span>
                </div>
              </div>
            ) : filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
                    index === highlightedIndex ? 'bg-primary-50 dark:bg-primary-900' : ''
                  }`}
                >
                  {country.flag && (
                    <span className="text-lg">{country.flag}</span>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{country.title}</div>
                  
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                {t("No countries found")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && touched && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default CountrySearchSelect;
