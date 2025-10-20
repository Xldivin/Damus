import React, { useState, useEffect } from 'react'
import { PerformanceTracker, checkPerformanceBudget, OPTIMIZATION_TIPS } from '../utils/performanceOptimizations'
import { apiUtils } from '../services/api'

export function PerformanceDashboard() {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [budgetCheck, setBudgetCheck] = useState<any>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(PerformanceTracker.getOverallStats())
      setBudgetCheck(checkPerformanceBudget())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-purple-600 text-white p-3 rounded-full shadow-lg z-50"
        title="Performance Dashboard"
      >
        📊
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border rounded-lg shadow-lg p-4 z-50 max-w-md max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Performance Dashboard</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3 text-xs">
        {/* Performance Status */}
        <div>
          <div className={`font-medium ${budgetCheck?.withinBudget ? 'text-green-600' : 'text-red-600'}`}>
            {budgetCheck?.withinBudget ? '✅ Within Budget' : '⚠️ Performance Issues'}
          </div>
        </div>

        {/* Image Performance */}
        <div>
          <strong>Images:</strong>
          <div className="ml-2">
            Loaded: {stats?.loadedImages || 0}/{stats?.totalImages || 0}
          </div>
          <div className="ml-2">
            Failed: {stats?.failedImages || 0}
          </div>
          <div className="ml-2">
            Avg Load: {stats?.imageStats?.avgLoadTime?.toFixed(0) || 0}ms
          </div>
          {stats?.imageStats?.slowImages?.length > 0 && (
            <div className="ml-2 text-red-600">
              Slow: {stats.imageStats.slowImages.length} images
            </div>
          )}
        </div>

        {/* API Performance */}
        <div>
          <strong>API Calls:</strong>
          <div className="ml-2">
            Avg Response: {stats?.apiStats?.avgResponseTime?.toFixed(0) || 0}ms
          </div>
          {stats?.apiStats?.slowEndpoints?.length > 0 && (
            <div className="ml-2 text-red-600">
              Slow: {stats.apiStats.slowEndpoints.length} endpoints
            </div>
          )}
        </div>

        {/* Warnings */}
        {budgetCheck?.warnings?.length > 0 && (
          <div>
            <strong className="text-red-600">Warnings:</strong>
            {budgetCheck.warnings.map((warning: string, index: number) => (
              <div key={index} className="ml-2 text-red-600 text-xs">
                • {warning}
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {budgetCheck?.recommendations?.length > 0 && (
          <div>
            <strong className="text-blue-600">Recommendations:</strong>
            {budgetCheck.recommendations.map((rec: string, index: number) => (
              <div key={index} className="ml-2 text-blue-600 text-xs">
                • {rec}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <button
            onClick={() => {
              apiUtils.clearCache()
              PerformanceTracker.reset()
            }}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Clear Cache
          </button>
          <button
            onClick={() => {
              apiUtils.clearProductCache()
            }}
            className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
          >
            Clear Products
          </button>
          <button
            onClick={() => {
              console.log('Performance Stats:', stats)
              console.log('Budget Check:', budgetCheck)
            }}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            Log Stats
          </button>
        </div>

        {/* Quick Tips */}
        <div className="pt-2 border-t">
          <div className="text-gray-500 text-xs">
            💡 <strong>Quick Tips:</strong>
          </div>
          <div className="text-gray-500 text-xs ml-2">
            • Use optimized image sizes<br/>
            • Enable lazy loading<br/>
            • Check network tab for slow requests
          </div>
        </div>
      </div>
    </div>
  )
}

