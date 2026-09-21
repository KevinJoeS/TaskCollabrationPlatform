export default function Skeleton({ width = '100%', height = 12, radius, style, className = '' }) {
  return <span className={`skeleton ${className}`} style={{ width, height, borderRadius: radius, ...style }} aria-hidden="true" />;
}

export function SkeletonRows({ rows = 4, avatar = false }) {
  return (
    <div className="skeleton-rows" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton-row" key={i}>
          {avatar && <Skeleton width={28} height={28} radius="50%" />}
          <div className="skeleton-row-text">
            <Skeleton width={`${62 - ((i * 13) % 30)}%`} height={12} />
            <Skeleton width={`${34 + ((i * 7) % 20)}%`} height={10} />
          </div>
          <Skeleton width={64} height={18} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 3, className = 'project-grid' }) {
  return (
    <div className={className} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div className="panel skeleton-card" key={i}>
          <Skeleton width="55%" height={16} />
          <Skeleton width="90%" height={10} />
          <Skeleton width="70%" height={10} />
          <Skeleton height={6} style={{ marginTop: 18 }} />
          <div className="skeleton-card-foot">
            <Skeleton width={72} height={24} radius={12} />
            <Skeleton width={48} height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6 }) {
  return (
    <div className="panel skeleton-table" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton-table-row" key={i}>
          <Skeleton width={`${48 - ((i * 11) % 22)}%`} height={12} />
          <Skeleton width={84} height={18} />
          <Skeleton width={56} height={12} />
          <Skeleton width={24} height={24} radius="50%" />
          <Skeleton width={64} height={12} />
        </div>
      ))}
    </div>
  );
}
