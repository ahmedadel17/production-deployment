'use client'

import React from 'react'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { clearCompare } from '../../app/store/slices/compareSlice'
import { useRouter } from 'next/navigation'

function CompareBar() {
  const dispatch = useAppDispatch()
  const compareProducts = useAppSelector(state => state.compare.products)
  const router = useRouter()

  const handleCompareNow = () => {
    if (compareProducts.length > 0) {
      router.push('/compare')
    }
  }

  const handleClearAll = () => {
    dispatch(clearCompare())
  }

  if (compareProducts.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-white border-t shadow-lg px-3 py-3 sm:px-4 sm:py-4 transform translate-y-0 transition-transform duration-300 z-50 dark:bg-gray-800 dark:border-gray-700 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-screen-sm sm:max-w-screen-md md:max-w-screen-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 w-full">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <span className="font-semibold text-sm sm:text-base">Compare Products:</span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
              {compareProducts.length} {compareProducts.length === 1 ? 'product' : 'products'} selected
            </span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleCompareNow}
              className="w-full sm:w-auto bg-primary-500 text-white font-semibold px-4 py-2 rounded hover:bg-primary-600 dark:bg-primary-200 transition-colors"
            >
              Compare Now
            </button>
            <button
              onClick={handleClearAll}
              className="w-full sm:w-auto border border-gray-300 dark:border-gray-200 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-600 dark:hover:border-gray-500 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompareBar
