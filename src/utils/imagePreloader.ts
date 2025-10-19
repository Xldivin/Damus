// Image preloading utility for critical images
export class ImagePreloader {
  private static preloadedImages = new Set<string>()
  
  static async preload(src: string, width?: number, height?: number, quality: number = 80): Promise<void> {
    if (this.preloadedImages.has(src)) return
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      // Optimize URL for preloading
      const optimizedSrc = this.optimizeImageUrl(src, width, height, quality)
      
      img.onload = () => {
        this.preloadedImages.add(src)
        resolve()
      }
      
      img.onerror = () => {
        console.warn(`Failed to preload image: ${src}`)
        reject(new Error(`Failed to preload image: ${src}`))
      }
      
      img.src = optimizedSrc
    })
  }
  
  static async preloadBatch(images: Array<{ src: string; width?: number; height?: number; quality?: number }>): Promise<void> {
    const promises = images.map(({ src, width, height, quality = 80 }) => 
      this.preload(src, width, height, quality).catch(() => {
        // Ignore individual failures, continue with others
        console.warn(`Failed to preload: ${src}`)
      })
    )
    
    await Promise.allSettled(promises)
  }
  
  static isPreloaded(src: string): boolean {
    return this.preloadedImages.has(src)
  }
  
  static clearCache(): void {
    this.preloadedImages.clear()
  }
  
  private static optimizeImageUrl(src: string, width?: number, height?: number, quality: number = 80): string {
    if (!src) return src
    
    // If it's already a data URL or optimized URL, return as is
    if (src.startsWith('data:') || src.includes('w=') || src.includes('h=')) {
      return src
    }
    
    // For Unsplash images, add optimization parameters
    if (src.includes('unsplash.com')) {
      const url = new URL(src)
      url.searchParams.set('w', width?.toString() || '400')
      url.searchParams.set('h', height?.toString() || '400')
      url.searchParams.set('q', quality.toString())
      url.searchParams.set('auto', 'format')
      url.searchParams.set('fit', 'crop')
      return url.toString()
    }
    
    return src
  }
}

// Preload critical images on app start
export function preloadCriticalImages(products: any[]): void {
  if (typeof window === 'undefined') return
  
  // Preload first 4 product images (above the fold)
  const criticalImages = products.slice(0, 4).map(product => ({
    src: product.primary_image || product.image,
    width: 400,
    height: 400,
    quality: 85
  }))
  
  ImagePreloader.preloadBatch(criticalImages).then(() => {
    console.log('Critical images preloaded')
  }).catch(() => {
    console.warn('Some critical images failed to preload')
  })
}
