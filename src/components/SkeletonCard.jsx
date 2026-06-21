import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 w-full animate-pulse flex flex-col gap-4">
      {/* Top row: Topic badge and Title */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded-md w-24"></div>
          <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
        </div>
        {/* Bookmark Icon skeleton */}
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>

      {/* Bottom row: Tags */}
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-gray-100 rounded-full w-16"></div>
        <div className="h-6 bg-gray-100 rounded-full w-20"></div>
        <div className="h-6 bg-gray-100 rounded-full w-14"></div>
      </div>
    </div>
  );
}