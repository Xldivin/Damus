// Simple API test utility to verify the deployed API is working
import { apiService } from '../services/api'

export async function testApiConnection() {
  console.log('🧪 Testing API connection to deployed server...')
  
  try {
    // Test products endpoint
    const startTime = performance.now()
    const products = await apiService.products.getAllProducts()
    const endTime = performance.now()
    
    console.log(`✅ Products API: ${(endTime - startTime).toFixed(2)}ms`)
    console.log(`📦 Found ${products.length} products`)
    
    // Test categories endpoint
    const categoriesStart = performance.now()
    const categories = await apiService.categories.getAllCategories()
    const categoriesEnd = performance.now()
    
    console.log(`✅ Categories API: ${(categoriesEnd - categoriesStart).toFixed(2)}ms`)
    console.log(`📂 Found ${categories.length} categories`)
    
    return {
      success: true,
      products: products.length,
      categories: categories.length,
      totalTime: endTime - startTime
    }
  } catch (error) {
    console.error('❌ API Test Failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Auto-run test when imported (for development)
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    testApiConnection()
  }, 1000)
}
