'use client';

export function MarketCardSkeleton() {
  return (
    <div className="market-card-container skeleton-loading">
      <div className="market-entry">
        <div className="market-content">
          <div className="flex-1">
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
          </div>
          <div className="skeleton-liquidity"></div>
        </div>
        <div className="market-actions-grid">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="market-list-container">
      {Array.from({ length: count }).map((_, i) => (
        <MarketCardSkeleton key={i} />
      ))}
    </div>
  );
}

