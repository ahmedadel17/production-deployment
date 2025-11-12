
import React from 'react'
import { Product } from '../dummyData/products'
import Breadcrumb from '@/components/header/headerBreadcrumb'
import getRequest from '../../../helpers/get';
import { unstable_cache } from 'next/cache';
import ProductSortControls from '@/components/product/widgets/filterform';
import ProductPagination from '@/components/product/productPagination';
import { getLocale, getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import ProductCard2 from '@/components/product/productCard2';
import FilterSidebar from '@/components/product/widgets/FilterSidebar';

// Enable caching for this page (revalidate every 30 seconds)
export const revalidate = 30;
interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sort?: string;
    order?: string;
    per_page?: string;
    category?: string;
    categories?: string | string[];
    'categories[]'?: string | string[];
    min_price?: string;
    max_price?: string;
    keyword?: string;
    sizes?: string;
    colors?: string;
    attributes?: string;
  }>;
}

async function Products({ searchParams }: ProductsPageProps) {
  const locale = await getLocale();
  const t = await getTranslations();
  
  // Get token from cookies (preferred method)
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || null;
  
  // Await searchParams before using it
  const params = await searchParams;

  const currentPage = parseInt(params.page || '1');
  const itemsPerPage = parseInt(params.limit || params.per_page || '12');
  const sortBy = params.sort || params.order || 'newest';
  
  // Get grid columns based on per_page value
  const perPage = parseInt(params.per_page || '9');
  const getGridCols = (perPageValue: number) => {
    switch (perPageValue) {
      case 6:
        return 'grid-cols-2 md:grid-cols-2 lg:grid-cols-2';
      case 9:
        return 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3';
      case 12:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default:
        return 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3';
    }
  };
  const gridColsClass = getGridCols(perPage);
  const category = params.category;
  // Handle categories[] array format from URL
  const categoriesParam = params['categories[]'];
  const categoriesArray = Array.isArray(categoriesParam)
    ? categoriesParam
    : categoriesParam
      ? [categoriesParam]
      : Array.isArray(params.categories)
        ? params.categories
        : params.categories
          ? [params.categories]
          : [];
  const priceMin = params.min_price;
  const priceMax = params.max_price;
  const searchQuery = params.keyword;
  const sizes = params.sizes;
  const colors = params.colors;
  const attributes = params.attributes;

  // console.log('Search params received:', {
  //   searchQuery,
  //   category,
  //   categoriesArray,
  //   priceMin,
  //   priceMax,
  //   sizes,
  //   colors,
  //   attributes,
  //   allSearchParams: searchParams
  // });

  // Build query parameters for API
  const queryParams = new URLSearchParams({
    page: currentPage.toString(),
    limit: itemsPerPage.toString(),
    sort: sortBy,
  });

  // Handle categories[] array format for API
  if (categoriesArray.length > 0) {
    categoriesArray.forEach((cat: string) => {
      queryParams.append('categories[]', cat);
    });
  } else if (category) {
    queryParams.append('category', category);
  }
  
  if (priceMin) queryParams.append('min_price', priceMin);
  if (priceMax) queryParams.append('max_price', priceMax);
  if (searchQuery && searchQuery.trim()) queryParams.append('keyword', searchQuery.trim());
  if (sizes) queryParams.append('sizes', sizes);
  if (colors) queryParams.append('colors', colors);
  if (attributes) queryParams.append('attributes', attributes);

  // console.log('API Query Parameters:', queryParams.toString());
  // console.log('Category parameters being sent to API:', { category, categoriesArray });
  // console.log('Price parameters being sent to API:', { priceMin, priceMax });
  // console.log('Size and color parameters being sent to API:', { sizes, colors });
  // console.log('Attributes parameter being sent to API:', { attributes });

  try {
    // Create cache key from query parameters
    const cacheKey = `products-${queryParams.toString()}-${locale}-${token ? 'auth' : 'guest'}`;
    
    // Fetch products with caching
    const getCachedProducts = unstable_cache(
      async () => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await getRequest(`/catalog/products?${queryParams.toString()}`, headers, token, locale);
        return response;
      },
      [cacheKey],
      {
        revalidate: 30, // Cache for 30 seconds
        tags: ['products', `products-${locale}`]
      }
    );

    const response = await getCachedProducts();
    const productsData = response?.data;
    const products = (productsData.items || []).map((product: Product & { is_favourite?: boolean }) => ({
      ...product,
      is_favourite: product.is_favourite || false // Ensure is_favourite property exists
    }));
    // console.log('products', products);
    
    // Extract pagination data from the API response
    const paginationData = productsData.paginate || {};
    const totalItems = paginationData.total || 0;
    const totalPages = paginationData.total_pages || 0;
    const currentPageFromAPI = paginationData.current_page || currentPage;
    const itemsPerPageFromAPI = paginationData.per_page || itemsPerPage;

   

    return (
      <div className="container my-12">
        <Breadcrumb name={t("Products")} />
        <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Sidebar */}
         <FilterSidebar/>

          {/* Main Content */}
          <div className="xl:col-span-3">
            <div className="space-y-6">
              <div className="flex items-end justify-between mb-6 space-x-4 rtl:space-x-reverse">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {searchQuery ? t('Search Results') : t('Our Products')}
                  </h2>
               
                </div>
                <ProductSortControls />
             
              </div>

              {/* Products Grid */}
              <div className="te-products">

                {products.length > 0 ? (
                  <div
                    id="products-grid"
                    className={`grid gap-3 ${gridColsClass} lg:gap-6`}
                  >
                    {products?.map((product: Product) => (
                      <ProductCard2 key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchQuery ? t('No products found for your search') : t('No products found')}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery 
                          ? `${t('No products found for keyword')} "${searchQuery}". ${t('Try different keywords or browse all products')}.` 
                          : t('Try adjusting your search or filter criteria')
                        }
                      </p>
                      {searchQuery && (
                        <a 
                          href="/products"
                          className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                        >
                          {t('Browse All Products')}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <ProductPagination
                currentPage={currentPageFromAPI}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPageFromAPI}
              />
            </div>
          </div>
        </div>
      </div>
    );

  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Check if it's a 429 rate limit error
    const axiosError = error as { response?: { status?: number } };
    const isRateLimited = axiosError?.response?.status === 429;
    const errorMessage = isRateLimited 
      ? 'Too many requests. Please wait a moment and try again.'
      : 'Error loading products. Please try again later.';
    
    return (
      <div className="container my-12">
        <Breadcrumb name="Products" />
        <div className="text-center py-12">
          <div className="text-red-500">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isRateLimited ? 'Rate Limit Exceeded' : 'Error loading products'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">{errorMessage}</p>
            {isRateLimited && (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                The server is receiving too many requests. Please wait a few seconds before refreshing.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Products
