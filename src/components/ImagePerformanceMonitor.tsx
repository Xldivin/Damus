import React, { useState, useEffect } from 'react'

interface ImageMetrics {
  totalImages: number
  loadedImages: number
  failedImages: number
  averageLoadTime: number
  slowImages: string[]
}

export function ImagePerformanceMonitor() {
  const [metrics, setMetrics] = useState<ImageMetrics>({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    slowImages: []
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const loadTimes: number[] = []
    const slowImages: string[] = []
    let totalImages = 0
    let loadedImages = 0
    let failedImages = 0

    // Monitor all images on the page
    const images = document.querySelectorAll('img')
    totalImages = images.length

    images.forEach((img, index) => {
      const startTime = performance.now()
      
      const handleLoad = () => {
        const loadTime = performance.now() - startTime
        loadTimes.push(loadTime)
        loadedImages++
        
        if (loadTime > 1000) {
          slowImages.push(img.src || `Image ${index}`)
        }
        
        updateMetrics()
      }
      
      const handleError = () => {
        failedImages++
        updateMetrics()
      }
      
      img.addEventListener('load', handleLoad, { once: true })
      img.addEventListener('error', handleError, { once: true })
    })

    function updateMetrics() {
      setMetrics({
        totalImages,
        loadedImages,
        failedImages,
        averageLoadTime: loadTimes.length > 0 ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0,
        slowImages
      })
    }

    // Initial update
    updateMetrics()
  }, [])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-16 right-4 bg-green-600 text-white p-2 rounded-full shadow-lg z-50"
        title="Show Image Performance"
      >
        🖼️
      </button>
    )
  }

  return (
    <div className="fixed bottom-16 right-4 bg-white border rounded-lg shadow-lg p-4 z-50 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Image Performance</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Loading Status:</strong>
          <div className="ml-2">
            ✅ Loaded: {metrics.loadedImages}/{metrics.totalImages}
          </div>
          <div className="ml-2">
            ❌ Failed: {metrics.failedImages}
          </div>
        </div>
        
        <div>
          <strong>Performance:</strong>
          <div className="ml-2">
            Avg Load Time: {metrics.averageLoadTime.toFixed(0)}ms
          </div>
        </div>
        
        {metrics.slowImages.length > 0 && (
          <div>
            <strong>Slow Images ({metrics.slowImages.length}):</strong>
            <div className="ml-2 max-h-20 overflow-y-auto">
              {metrics.slowImages.map((src, index) => (
                <div key={index} className="truncate text-red-600">
                  {src.split('/').pop()}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t">
          <div className="text-gray-500">
            💡 Tip: Use optimized image sizes and lazy loading for better performance
          </div>
        </div>
      </div>
    </div>
  )
}
