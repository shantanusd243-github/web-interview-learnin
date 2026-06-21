import React from 'react';

export default function SkeletonTextPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full animate-pulse flex flex-col gap-6">
      
      {/* Header Section (Badge, Title, Metadata) */}
      <div className="space-y-4 border-b border-gray-100 pb-6">
        <div className="h-6 bg-indigo-50 rounded-md w-24"></div> {/* Fake Category Badge */}
        <div className="h-8 bg-gray-200 rounded-md w-3/4"></div> {/* Fake Main Title */}
        <div className="flex gap-4 pt-2">
            <div className="h-4 bg-gray-100 rounded-md w-32"></div> {/* Fake Date/Author */}
            <div className="h-4 bg-gray-100 rounded-md w-24"></div>
        </div>
      </div>

      {/* Content Section - Paragraph 1 */}
      <div className="space-y-3 pt-2">
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-11/12"></div>
        <div className="h-4 bg-gray-200 rounded-md w-4/5"></div>
      </div>

      {/* Content Section - Paragraph 2 with Subheading */}
      <div className="space-y-3 pt-6">
        <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div> {/* Fake Subheading */}
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-10/12"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
      </div>

      {/* Fake Code Block / Info Box */}
      <div className="mt-4 h-40 bg-gray-50 rounded-lg border border-gray-100 w-full p-4 flex flex-col gap-2">
         <div className="h-3 bg-gray-200 rounded w-1/2"></div>
         <div className="h-3 bg-gray-200 rounded w-1/3"></div>
         <div className="h-3 bg-gray-200 rounded w-2/3 mt-2"></div>
      </div>
      
    </div>
  );
}