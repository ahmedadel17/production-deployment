import Link from 'next/link'
import React from 'react'

function ProductTitle({ name, slug }: { name: string, slug: string }) {
  return (
    <h3 className="font-semibold text-sm line-clamp-2 dark:text-white">
            <Link href={`/productDetails/${slug}`} prefetch={false} className="hover:text-primary-600 transition-colors">
              {name}
            </Link>
          </h3>
  )
}

export default ProductTitle
