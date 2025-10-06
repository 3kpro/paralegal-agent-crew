interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

export function Skeleton({ className = '', width = 'w-full', height = 'h-4' }: SkeletonProps) {
  return (
    <div 
      className={`${width} ${height} bg-gray-200 rounded-md animate-pulse ${className}`}
    />
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`}>
      <div className="space-y-4">
        <Skeleton height="h-6" width="w-3/4" />
        <Skeleton height="h-4" width="w-1/2" />
        <div className="space-y-2">
          <Skeleton height="h-4" width="w-full" />
          <Skeleton height="h-4" width="w-5/6" />
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="p-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton height="h-8" width="w-80" className="mb-2" />
        <Skeleton height="h-5" width="w-60" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
            <Skeleton height="h-8" width="w-16" className="mb-2" />
            <Skeleton height="h-4" width="w-20" />
          </div>
        ))}
      </div>

      {/* Recent campaigns section skeleton */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <Skeleton height="h-6" width="w-48" />
          <Skeleton height="h-10" width="w-36" className="rounded-lg" />
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <Skeleton height="h-5" width="w-48" className="mb-2" />
                <Skeleton height="h-4" width="w-36" />
              </div>
              <Skeleton height="h-4" width="w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="p-8">
      {/* Header */}
      <Skeleton height="h-8" width="w-32" className="mb-8" />
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex space-x-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height="h-6" width="w-24" className="mb-4" />
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-4xl">
        <Skeleton height="h-6" width="w-48" className="mb-6" />
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton height="h-4" width="w-24" className="mb-2" />
                <Skeleton height="h-10" width="w-full" className="rounded-md" />
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <Skeleton height="h-4" width="w-32" className="mb-2" />
                <Skeleton height="h-24" width="w-full" className="rounded-md" />
              </div>
            ))}
          </div>

          <Skeleton height="h-10" width="w-32" className="rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function ButtonSkeleton() {
  return (
    <div className="inline-flex items-center px-4 py-2 bg-gray-200 rounded-lg animate-pulse">
      <Skeleton height="h-5" width="w-16" />
    </div>
  )
}