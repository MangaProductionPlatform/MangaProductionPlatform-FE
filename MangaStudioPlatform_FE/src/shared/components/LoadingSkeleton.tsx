type LoadingSkeletonProps = {
  cards?: number;
  rows?: number;
  className?: string;
};

export function LoadingSkeleton({ cards = 0, rows = 0, className = "" }: LoadingSkeletonProps) {
  const count = cards || rows || 3;
  return (
    <div className={`grid gap-4 ${className}`} aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton h-5 w-2/5" />
          <div className="skeleton mt-3 h-4 w-4/5" />
          <div className="skeleton mt-5 h-9 w-28" />
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
