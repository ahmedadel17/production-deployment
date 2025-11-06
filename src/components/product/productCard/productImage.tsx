'use client'

import React from 'react'
import ProductHoverButtons from './productHoverButtons'
import ProductThumbnailImages from './productThumbnailImages'
import ProductBadges from './productBadges'

interface Badge {
  type: string
  text: string
}

interface ProductImageProps {
  thumbnail?: string
  hover?: string
  slug: string
  name: string
  title?: string
  badges?: Badge[]
  productId?: number | string
  productPrice?: string
  productImage?: string
  product?: any // Full product object
}

function ProductImage({ thumbnail, hover, slug, name, title, badges, productId, productPrice, productImage, product }: ProductImageProps) {
  if (thumbnail) {
    return (
      <a
        href={`#`}
        className="product-thumbnail relative block overflow-hidden rounded-lg lg:rounded-t-lg lg:rounded-b-none group"
      >
        {/* Product Badges */}
        <ProductBadges badges={badges} />

        {/* Hover Buttons */}
        <ProductHoverButtons 
          product={product}
          productId={productId || slug}
          productTitle={name || title}
          productPrice={productPrice}
          productImage={productImage || thumbnail}
        />

        {/* Thumbnail Images */}
        <ProductThumbnailImages
          thumbnail={thumbnail}
          hover={hover}
          name={name}
          title={title}
        />
      </a>
    )
  }

  return (
    <div className="product-thumbnail-placeholder bg-gray-200 dark:bg-gray-700 h-full object-cover rounded-lg lg:rounded-t-lg lg:rounded-b-none flex items-center justify-center text-gray-400 text-xs text-center">
      <div>
        <svg
          className="w-8 h-8 m-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M16 5h6" />
          <path d="M19 2v6" />
          <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          <circle cx="9" cy="9" r="2" />
        </svg>
        <div className="mt-2">Image Not Set</div>
      </div>
    </div>
  )
}

export default ProductImage
