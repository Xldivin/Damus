import React, { useState, useRef, useEffect } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

// Optimize image URL for better performance
function optimizeImageUrl(src: string, width?: number, height?: number, quality: number = 80): string {
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

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  lazy?: boolean
  width?: number
  height?: number
  quality?: number
  placeholder?: string
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(!props.lazy)
  const imgRef = useRef<HTMLImageElement>(null)

  const { 
    src, 
    alt, 
    style, 
    className, 
    lazy = true, 
    width, 
    height, 
    quality = 80,
    placeholder,
    ...rest 
  } = props

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { 
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1 
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [lazy])

  const handleError = () => {
    setDidError(true)
  }

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const optimizedSrc = isInView ? optimizeImageUrl(src || '', width, height, quality) : ''
  const placeholderSrc = placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+'

  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-[10rem]">
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={imgRef}>
      {/* Placeholder while loading */}
      {!isLoaded && isInView && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          style={style}
        >
          <img 
            src={placeholderSrc} 
            alt="" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img 
          src={optimizedSrc} 
          alt={alt} 
          className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={style} 
          onError={handleError}
          onLoad={handleLoad}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          {...rest} 
        />
      )}
    </div>
  )
}
