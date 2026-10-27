import React from "react";

export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/10 ${className}`}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-white/5">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className={`h-4 ${j === 0 ? "w-1/4" : "flex-1"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
