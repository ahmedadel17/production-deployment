"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';

interface City {
  id: number;
  title: string;  
  country_id?: number;
  flag?: string;
}

interface CitySearchSelectProps {
  value?: string | number;
  onChange: (cityId: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  error?: string;
  touched?: boolean;
  countryId?: string | number; // Required to enable city search
}

  const CitySearchSelect: React.FC<CitySearchSelectProps> = ({
  value = '',
  onChange,
  placeholder = 'Select City',
  className = '',
  disabled = false,
  required = false,
  label,
  error,
  touched = false,
  countryId
}) => {
  const t = useTranslations();
  const [cities, setCities] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchedQueries, setSearchedQueries] = useState<Set<string>>(new Set());
  
  // City search is disabled if no country is selected
  const isDisabled = disabled || !countryId;
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch cities from API for a specific country
  const fetchCities = async (countryId?: string | number) => {
    if (!countryId) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/core/countries/cities`, {
        params: { country_id: countryId }
      });
      // console.log('Cities API response:', response.data.data.items);
      
      if (response.data.status && response.data.data) {
        // Ensure the data is an array
        const citiesData = Array.isArray(response.data.data.items) ? response.data.data.items : [];
        setCities(citiesData);
      } else {
        console.warn('Invalid API response structure:', response.data);
        setCities([]);
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Search cities via API with country_id and keyword
  const searchCities = async (keyword: string, countryId: string | number) => {
    if (!keyword.trim() || !countryId) return;
    
    const trimmedKeyword = keyword.trim().toLowerCase();
    const queryKey = `${countryId}-${trimmedKeyword}`;
    
    // Don't search if we already searched for this query and got empty results
    if (searchedQueries.has(queryKey)) {
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/core/countries/cities`, {
        params: { 
          country_id: countryId,
          keyword: trimmedKeyword 
        }
      });
      
      if (response.data.status && response.data.data) {
        const searchResults = Array.isArray(response.data.data.items) ? response.data.data.items : [];
        
        // If search results are empty, mark this query as searched
        if (searchResults.length === 0) {
          setSearchedQueries(prev => new Set([...prev, queryKey]));
          return;
        }
        
        // Merge with existing cities, avoiding duplicates
        setCities(prevCities => {
          const existingIds = new Set(prevCities.map(city => city.id));
          const newCities = searchResults.filter((city: City) => !existingIds.has(city.id));
          return [...prevCities, ...newCities];
        });
      } else {
        // Mark as searched if API response is invalid
        setSearchedQueries(prev => new Set([...prev, queryKey]));
      }
    } catch (error) {
      console.error('Failed to search cities:', error);
      // Mark as searched on error to prevent repeated failed requests
      setSearchedQueries(prev => new Set([...prev, queryKey]));
    } finally {
      setIsSearching(false);
    }
  };

  // Load cities when countryId changes
  useEffect(() => {
    if (countryId) {
      fetchCities(countryId);
      // Clear searched queries when country changes since search context is different
      setSearchedQueries(new Set());
    } else {
      setCities([]);
      setSearchedQueries(new Set());
    }
  }, [countryId]);

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

  // Filter cities based on search query
  const filteredCities = Array.isArray(cities) ? cities.filter(city =>
    city.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

  // Trigger API search when no local results found and user is typing
  useEffect(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    const queryKey = `${countryId}-${trimmedQuery}`;
    
    if (trimmedQuery && filteredCities.length === 0 && !isSearching && countryId && !searchedQueries.has(queryKey)) {
      const timeoutId = setTimeout(() => {
        searchCities(searchQuery, countryId);
      }, 500); // Debounce search by 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, filteredCities.length, isSearching, countryId, searchedQueries]);

  // Get selected city
  const selectedCity = Array.isArray(cities) ? cities.find(city => city.id.toString() === value?.toString()) : undefined;

  // Handle country selection
  const handleCitySelect = (city: City) => {
    onChange(city.id);
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
        prev < filteredCities.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : filteredCities.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
        handleCitySelect(filteredCities[highlightedIndex]);
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
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        className={buttonClasses}
      >
        <div className="flex items-center space-x-2">
          {selectedCity ? (
            <>
              {selectedCity.flag && (
                <span className="text-lg">{selectedCity.flag}</span>
              )}
              <span className="text-sm font-medium">{selectedCity.title}</span>
             
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">
              {!countryId ? (t('Select country first')) : isLoading ? (t('Loading')) : placeholder}
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
      {isOpen && countryId && (
        <div className={dropdownClasses}>
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t("Search cities")}
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

          {/* Cities List */}
          <div className="max-h-48 overflow-auto">
            {isLoading ? (
              <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                {t("Loading cities")}
              </div>
            ) : isSearching ? (
              <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                  <span>{t("Searching")}</span>
                </div>
              </div>
            ) : filteredCities.length > 0 ? (
              filteredCities  .map((city, index) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
                    index === highlightedIndex ? 'bg-primary-50 dark:bg-primary-900' : ''
                  }`}
                >
                  {city.flag && (
                    <span className="text-lg">{city.flag}</span>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{city.title}</div>
                  
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                {t("No cities found")}
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

export default CitySearchSelect;
