// src/components/Skeleton.tsx

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-800 rounded ${className}`}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-5 w-72 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

export function ResumeDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <Skeleton className="h-3 w-12 mx-auto mb-2" />
            <Skeleton className="h-7 w-10 mx-auto" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-5 w-72 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <Skeleton className="h-3 w-12 mb-2" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl mb-8" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}