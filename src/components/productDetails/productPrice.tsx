'use client';
import React from 'react'
import VariationPrice from './productVariationData/variationPrice'
import { useAppSelector } from '@/app/store/hooks';
function ProductPrice({ price, old_price }: { price: number, old_price: number | null }) {
  const { variationData } = useAppSelector((state) => state.product);
  return (
    <>
    {!variationData && <div className="product-price flex items-baseline gap-2">
    <span className="text-3xl font-bold text-secondary-600">
        <span className="icon-riyal-symbol"></span>
        <span>{price}</span>
    </span>
    {old_price !==price && <span  className="text-lg text-gray-500 dark:text-gray-400 line-through">
        <span className="icon-riyal-symbol"></span>
        <span>{old_price}</span>
    </span>}

</div>}
{variationData && <VariationPrice />}
</>
  )
}

export default ProductPrice
