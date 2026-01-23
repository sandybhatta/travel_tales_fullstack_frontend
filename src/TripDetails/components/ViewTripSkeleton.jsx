import React from 'react';

const ViewTripSkeleton = () => {
  return (
    <div className="w-full min-h-screen h-fit pb-8 grid grid-cols-[1fr_5fr_1fr] gap-4 bg-[#EDF2F4]">
      <div className="col-start-2 col-end-3 flex flex-col items-center justify-start gap-10 pt-10">
        
        {/* Cover Skeleton */}
        <div className="w-full h-[60vh] bg-gray-300 rounded-lg animate-pulse relative shadow-xl">
            <div className="absolute bottom-5 left-5 w-full flex flex-col gap-4 px-5">
                <div className="h-10 w-2/3 bg-gray-400 rounded-md"></div>
                <div className="flex gap-4 mt-2">
                    <div className="h-6 w-32 bg-gray-400 rounded-md"></div>
                    <div className="h-6 w-20 bg-gray-400 rounded-md"></div>
                    <div className="h-6 w-24 bg-gray-400 rounded-md"></div>
                </div>
            </div>
        </div>

        {/* Collaborators/Nav Skeleton */}
        <div className="w-full h-16 bg-gray-300 rounded-lg animate-pulse"></div>

        {/* Description Skeleton */}
        <div className="w-full h-24 bg-gray-300 rounded-lg animate-pulse"></div>

        {/* Grid Stats Skeleton */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="h-64 bg-gray-300 rounded-lg animate-pulse"></div>
            <div className="h-64 bg-gray-300 rounded-lg animate-pulse"></div>
            <div className="h-64 bg-gray-300 rounded-lg animate-pulse"></div>
        </div>
        
        {/* Notes/Todos Skeleton */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="h-64 bg-gray-300 rounded-lg animate-pulse"></div>
            <div className="h-64 bg-gray-300 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ViewTripSkeleton;
