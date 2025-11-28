export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="w-full aspect-square rounded-lg bg-card" />
      <div className="mt-2 space-y-2">
        <div className="h-4 w-3/4 rounded bg-card" />
        <div className="h-3 w-1/2 rounded bg-card" />
      </div>
    </div>
  )
}

export function SkeletonSongRow() {
  return (
    <div className="flex items-center gap-3 p-2 animate-pulse">
      <div className="w-12 h-12 rounded bg-card" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-card" />
        <div className="h-3 w-1/2 rounded bg-card" />
      </div>
      <div className="h-4 w-10 rounded bg-card" />
    </div>
  )
}

export function SkeletonCarousel() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-40 rounded bg-card animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} className="w-40 flex-shrink-0" />
        ))}
      </div>
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div className="px-4 md:px-8 pt-12 pb-16 animate-pulse">
      <div className="h-4 w-32 rounded bg-card mb-4" />
      <div className="h-12 w-3/4 rounded bg-card mb-4" />
      <div className="h-4 w-2/3 rounded bg-card mb-8" />
      <div className="h-14 w-48 rounded-full bg-card" />
    </div>
  )
}
