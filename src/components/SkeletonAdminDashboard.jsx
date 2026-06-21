import React from 'react';

export default function SkeletonAdminDashboard() {
  return (
    <div className="animate-pulse flex flex-col gap-6 w-full mt-6">

      {/* 6 Stat Cards Grid (Questions & Requests) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="h-12 w-12 bg-gray-100 rounded-lg"></div> {/* Fake Icon Box */}
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout for Lists/Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Column 1: Recent Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-100 rounded-full w-20"></div> {/* Fake Status Pill */}
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Top Viewed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-10 text-right"></div> {/* Fake View Count */}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}