// Performance optimization utilities and guidelines

export const PERFORMANCE_CONFIG = {
  // Image optimization settings
  images: {
    // Different quality settings for different use cases
    hero: { quality: 90, width: 800, height: 600 },
    product: { quality: 85, width: 400, height: 400 },
    thumbnail: { quality: 80, width: 200, height: 200 },
    category: { quality: 75, width: 300, height: 200 },
  },
  
  // Lazy loading settings
  lazyLoading: {
    rootMargin: '50px', // Start loading 50px before image comes into view
    threshold: 0.1, // Load when 10% of image is visible
  },
  
  // Preloading settings
  preloading: {
    criticalImages: 4, // Number of critical images to preload
    maxPreloadSize: 500, // Max file size to preload (KB)
  }
}

// Performance monitoring utilities
export class PerformanceTracker {
  private static metrics = {
    imageLoadTimes: new Map<string, number>(),
    apiResponseTimes: new Map<string, number>(),
    pageLoadTime: 0,
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0
  }

  static recordImageLoad(src: string, loadTime: number): void {
    this.metrics.imageLoadTimes.set(src, loadTime)
    this.metrics.loadedImages++
  }

  static recordImageError(src: string): void {
    this.metrics.failedImages++
    console.warn(`Image failed to load: ${src}`)
  }

  static recordApiCall(endpoint: string, responseTime: number): void {
    this.metrics.apiResponseTimes.set(endpoint, responseTime)
  }

  static recordPageLoad(): void {
    this.metrics.pageLoadTime = performance.now()
  }

  static getImageStats(): { avgLoadTime: number; slowImages: string[] } {
    const times = Array.from(this.metrics.imageLoadTimes.values())
    const avgLoadTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
    const slowImages = Array.from(this.metrics.imageLoadTimes.entries())
      .filter(([_, time]) => time > 1000)
      .map(([src, _]) => src)
    
    return { avgLoadTime, slowImages }
  }

  static getApiStats(): { avgResponseTime: number; slowEndpoints: string[] } {
    const times = Array.from(this.metrics.apiResponseTimes.values())
    const avgResponseTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
    const slowEndpoints = Array.from(this.metrics.apiResponseTimes.entries())
      .filter(([_, time]) => time > 1000)
      .map(([endpoint, _]) => endpoint)
    
    return { avgResponseTime, slowEndpoints }
  }

  static getOverallStats() {
    return {
      pageLoadTime: this.metrics.pageLoadTime,
      totalImages: this.metrics.totalImages,
      loadedImages: this.metrics.loadedImages,
      failedImages: this.metrics.failedImages,
      imageStats: this.getImageStats(),
      apiStats: this.getApiStats()
    }
  }

  static reset(): void {
    this.metrics.imageLoadTimes.clear()
    this.metrics.apiResponseTimes.clear()
    this.metrics.pageLoadTime = 0
    this.metrics.totalImages = 0
    this.metrics.loadedImages = 0
    this.metrics.failedImages = 0
  }
}

// Image optimization recommendations
export const OPTIMIZATION_TIPS = {
  images: [
    'Use appropriate image sizes (400x400 for product cards, 800x600 for hero images)',
    'Enable lazy loading for images below the fold',
    'Use WebP format when possible (add format=webp to Unsplash URLs)',
    'Preload critical images (first 4 products on homepage)',
    'Use quality settings: 90% for hero, 85% for products, 80% for thumbnails'
  ],
  api: [
    'Enable API response caching (5-10 minutes for products)',
    'Use request deduplication to prevent duplicate calls',
    'Implement optimistic UI updates for better perceived performance',
    'Use parallel API calls where possible'
  ],
  general: [
    'Monitor Core Web Vitals (LCP, FID, CLS)',
    'Use React.memo for expensive components',
    'Implement virtual scrolling for long lists',
    'Minimize bundle size with code splitting'
  ]
}

// Performance budget recommendations
export const PERFORMANCE_BUDGET = {
  // Target metrics
  targets: {
    firstContentfulPaint: 1500, // ms
    largestContentfulPaint: 2500, // ms
    firstInputDelay: 100, // ms
    cumulativeLayoutShift: 0.1,
    imageLoadTime: 1000, // ms
    apiResponseTime: 500 // ms
  },
  
  // Warning thresholds
  warnings: {
    imageLoadTime: 2000, // ms
    apiResponseTime: 1000, // ms
    pageLoadTime: 3000 // ms
  }
}

// Utility to check if performance is within budget
export function checkPerformanceBudget(): {
  withinBudget: boolean
  warnings: string[]
  recommendations: string[]
} {
  const stats = PerformanceTracker.getOverallStats()
  const warnings: string[] = []
  const recommendations: string[] = []

  // Check image performance
  if (stats.imageStats.avgLoadTime > PERFORMANCE_BUDGET.warnings.imageLoadTime) {
    warnings.push(`Average image load time is ${stats.imageStats.avgLoadTime.toFixed(0)}ms (target: ${PERFORMANCE_BUDGET.targets.imageLoadTime}ms)`)
    recommendations.push('Consider reducing image quality or implementing better lazy loading')
  }

  // Check API performance
  if (stats.apiStats.avgResponseTime > PERFORMANCE_BUDGET.warnings.apiResponseTime) {
    warnings.push(`Average API response time is ${stats.apiStats.avgResponseTime.toFixed(0)}ms (target: ${PERFORMANCE_BUDGET.targets.apiResponseTime}ms)`)
    recommendations.push('Consider implementing API caching or optimizing backend queries')
  }

  // Check failed images
  if (stats.failedImages > 0) {
    warnings.push(`${stats.failedImages} images failed to load`)
    recommendations.push('Check image URLs and implement better fallback handling')
  }

  return {
    withinBudget: warnings.length === 0,
    warnings,
    recommendations
  }
}
