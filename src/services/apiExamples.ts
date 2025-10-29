// Examples of how to use the updated API service
// This file can be removed after implementation

import { apiService } from './api'

// Example: Get all products
export async function getAllProductsExample() {
  try {
    const products = await apiService.products.getAllProducts()
    console.log('All products:', products)
    return products
  } catch (error) {
    console.error('Failed to get products:', error)
    throw error
  }
}

// Example: Get a specific product by slug
export async function getProductBySlugExample(slug: string) {
  try {
    const productData = await apiService.products.getProductBySlug(slug)
    console.log('Product data:', productData)
    return productData
  } catch (error) {
    console.error('Failed to get product:', error)
    throw error
  }
}

// Example: Get related products
export async function getRelatedProductsExample(slug: string) {
  try {
    const relatedProducts = await apiService.products.getRelatedProducts(slug)
    console.log('Related products:', relatedProducts)
    return relatedProducts
  } catch (error) {
    console.error('Failed to get related products:', error)
    throw error
  }
}

// Example: Search products
export async function searchProductsExample(query: string) {
  try {
    const searchResults = await apiService.products.searchProducts(query)
    console.log('Search results:', searchResults)
    return searchResults
  } catch (error) {
    console.error('Failed to search products:', error)
    throw error
  }
}

// Example: Get products by category
export async function getProductsByCategoryExample(category: string) {
  try {
    const categoryProducts = await apiService.products.getProductsByCategory(category)
    console.log('Category products:', categoryProducts)
    return categoryProducts
  } catch (error) {
    console.error('Failed to get category products:', error)
    throw error
  }
}








