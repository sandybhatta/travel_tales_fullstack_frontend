import React from "react";

/**
 * Loading skeleton for the Profile Page.
 * Displayed while user data is being fetched.
 */
const ProfileSkeleton = () => {
  return (
    <div className="w-full min-h-screen p-4 max-w-4xl mx-auto bg-[#edf2f4] animate-pulse">
      <div className="mt-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gray-300" />
          <div className="space-y-2">
            <div className="h-6 w-40 rounded bg-gray-300" />
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-4 w-52 rounded bg-gray-200" />
            <div className="h-3 w-64 rounded bg-gray-200" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-9 w-24 rounded-lg bg-gray-300" />
          <div className="h-7 w-28 rounded-lg bg-gray-200" />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center min-w-[90px] space-y-1"
          >
            <div className="h-5 w-8 rounded bg-gray-300" />
            <div className="h-3 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="mt-8 border-t border-gray-200">
        <div className="flex justify-around text-xs sm:text-sm font-semibold text-gray-500">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex-1 flex items-center justify-center gap-1 py-3"
            >
              <div className="h-5 w-5 rounded-full bg-gray-300" />
              <div className="hidden sm:block h-3 w-12 rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-1 sm:gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="relative w-full overflow-hidden bg-gray-200"
              style={{ paddingBottom: "100%" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
