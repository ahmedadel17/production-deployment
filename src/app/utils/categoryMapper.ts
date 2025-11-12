// Utility function to transform flat category list into hierarchical structure

export interface ApiCategory {
  id: number
  name: string
  image: string
  parent_id?: number | null
  slug?: string
  product_count?: number
}

export interface SubCategory {
  id: number
  name: string
  slug: string
  count: number
  image: string
}

export interface Category {
  id: number
  name: string
  slug: string
  count: number
  image: string
  sub?: SubCategory[]
}

/**
 * Transforms flat category list from API into hierarchical structure
 * @param apiCategories - Flat array of categories from API
 * @returns Hierarchical category structure for the widget
 */
export function transformCategories(apiCategories: ApiCategory[]): Category[] {
  // Create a map for quick lookup
  const categoryMap = new Map<number, ApiCategory>()
  const childrenMap = new Map<number, ApiCategory[]>()
  
  // First pass: build maps
  apiCategories.forEach(category => {
    categoryMap.set(category.id, category)
    
    const parentId = category.parent_id || 0 // Use 0 for root categories
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, [])
    }
    childrenMap.get(parentId)!.push(category)
  })
  
  // Second pass: build hierarchical structure
  const result: Category[] = []
  
  // Get root categories (those with parent_id = null or 0)
  const rootCategories = childrenMap.get(0) || []
  
  rootCategories.forEach(rootCategory => {
    const category: Category = {
      id: rootCategory.id,
      name: rootCategory.name,
      slug: rootCategory.slug || generateSlug(rootCategory.name),
      count: rootCategory.product_count || 0,
      image: rootCategory.image,
      sub: []
    }
    
    // Get subcategories
    const subcategories = childrenMap.get(rootCategory.id) || []
    if (subcategories.length > 0) {
      category.sub = subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug || generateSlug(sub.name),
        count: sub.product_count || 0,
        image: sub.image
      }))
    }
    
    result.push(category)
  })
  
  return result
}

/**
 * Generates a URL-friendly slug from category name
 * @param name - Category name
 * @returns URL-friendly slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim()
}

/**
 * Creates a default category structure for the provided categories
 * This groups all categories under a "All Categories" parent
 * @param apiCategories - Flat array of categories from API
 * @returns Default hierarchical structure
 */
export function createDefaultCategoryStructure(apiCategories: ApiCategory[]): Category[] {
  if (apiCategories.length === 0) return []
  
  // Create a single parent category "All Categories"
  const parentCategory: Category = {
    id: 0,
    name: 'All Categories',
    slug: 'all-categories',
    count: apiCategories.reduce((sum, cat) => sum + (cat.product_count || 0), 0),
    image: apiCategories[0]?.image || '',
    sub: apiCategories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug || generateSlug(category.name),
      count: category.product_count || 0,
      image: category.image
    }))
  }
  
  return [parentCategory]
}

/**
 * Example usage and test data
 */
export const EXAMPLE_CATEGORIES: ApiCategory[] = [
  {
    id: 1,
    name: "فاكهة",
    image: "https://ecommerce.demo.asol-tec.com/storage/1/fruits.jpg",
    product_count: 25
  },
  {
    id: 14,
    name: "خضروات", 
    image: "https://ecommerce.demo.asol-tec.com/storage/14/vegetables.jpg",
    product_count: 18
  },
  {
    id: 45,
    name: "ورقيات",
    image: "https://ecommerce.demo.asol-tec.com/storage/589/d6e449bfb599c5641f54fc25e14617450774a45f.jpg",
    product_count: 12
  },
  {
    id: 46,
    name: "تجريبي",
    image: "https://ecommerce.demo.asol-tec.com/storage/590/e11d2cd868f0bcde9b8570a6c137cda75d2d180c.jpg",
    product_count: 8
  },
  {
    id: 47,
    name: "تجريبي ٢",
    image: "https://ecommerce.demo.asol-tec.com/storage/591/WhatsApp-Image-2025-08-30-at-19.32.31.jpeg",
    product_count: 15
  }
]






















