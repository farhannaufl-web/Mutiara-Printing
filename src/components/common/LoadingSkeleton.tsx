import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#131D31] animate-pulse">
      {/* Aspect ratio image container */}
      <div className="aspect-[4/3] w-full bg-slate-800" />
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="h-3 w-20 rounded bg-slate-700/60" />
        <div className="h-5 w-4/5 rounded bg-slate-700" />
        <div className="h-3.5 w-full rounded bg-slate-800" />
        <div className="pt-2 mt-auto flex items-center justify-between">
          <div className="h-3 w-16 rounded bg-slate-800" />
          <div className="h-8 w-28 rounded-lg bg-slate-700" />
        </div>
      </div>
    </div>
  );
};

export const CatalogSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
