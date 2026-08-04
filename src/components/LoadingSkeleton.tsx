'use client';

type LoadingSkeletonProps = {
  className?: string;
};

export function ProductSkeleton() {
  return (
    <div className="linen-card rounded-xl p-4 flex flex-col gap-4">
      <div className="skeleton w-full aspect-[4/3] rounded-lg" />
      <div className="skeleton w-3/4 h-5" />
      <div className="skeleton w-1/2 h-4" />
    </div>
  );
}

export function TextSkeleton({ className }: LoadingSkeletonProps) {
  return <div className={`skeleton h-4 ${className || ''}`} />;
}

export function ButtonSkeleton() {
  return <div className="skeleton w-full h-12 rounded-lg" />;
}

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="skeleton w-full h-48 rounded-xl" />
      <div className="skeleton w-3/4 h-5" />
      <div className="skeleton w-1/2 h-4" />
    </div>
  );
}
