import React, { useState, useEffect } from 'react'
import { apiUtils } from '../services/api'

export function PerformanceMonitor() {
  const [stats, setStats] = useState<Record<string, { avg: number; count: number }>>({})
  const [cacheInfo, setCacheInfo] = useState<Record<string, any>>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(apiUtils.getPerformanceStats())
      setCacheInfo(apiUtils.getCacheInfo())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50"
        title="Show Performance Monitor"
      >
        📊
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 z-50 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">API Performance</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Response Times:</strong>
          {Object.entries(stats).map(([endpoint, data]) => (
            <div key={endpoint} className="ml-2">
              {endpoint}: {data.avg.toFixed(0)}ms ({data.count} calls)
            </div>
          ))}
        </div>
        
        <div>
          <strong>Cache Status:</strong>
          {Object.entries(cacheInfo).map(([key, info]) => (
            <div key={key} className="ml-2">
              {key.split('/').pop()}: {info.expired ? '❌' : '✅'} 
              ({Math.round(info.age / 1000)}s old)
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => apiUtils.clearCache()}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Clear Cache
          </button>
          <button
            onClick={() => apiUtils.clearProductCache()}
            className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
          >
            Clear Products
          </button>
        </div>
      </div>
    </div>
  )
}
