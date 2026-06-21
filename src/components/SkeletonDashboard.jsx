import React from 'react';

export default function SkeletonDashboard() {
  return (
    <div className="animate-pulse flex flex-col gap-6 w-full mt-6">

      {/* 4 Stat Cards Row (Total, Confident, Revising, Weak) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>

      {/* Topic Progress Bar Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="h-5 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-32 hidden sm:block"></div>
              {/* Fake Progress Bar */}
              <div className="h-3 bg-gray-100 rounded-full flex-1 overflow-hidden">
                <div className="h-full bg-gray-200 w-1/2 rounded-full"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}