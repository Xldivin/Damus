// Test for ProductDetailPage API integration
// This file can be removed after testing

import { apiService } from './api'

export async function testProductDetailIntegration() {
  try {
    console.log('Testing ProductDetailPage API integration...')
    
    // Test getting a product by ID
    const productId = '44' // Example product ID
    console.log(`Fetching product with ID: ${productId}`)
    
    const product = await apiService.products.getProductById(productId)
    console.log('Product loaded:', product)
    
    // Test getting related products
    const relatedProducts = await apiService.products.getRelatedProducts(productId)
    console.log('Related products loaded:', relatedProducts.length)
    
    console.log('✅ ProductDetailPage API integration test completed successfully!')
    return true
  } catch (error) {
    console.error('❌ ProductDetailPage API integration test failed:', error)
    return false
  }
}

// Uncomment the line below to run the test
// testProductDetailIntegration()








