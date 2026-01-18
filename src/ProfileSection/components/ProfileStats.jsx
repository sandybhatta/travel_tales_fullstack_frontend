import React from "react";

/**
 * Displays user statistics (Followers, Following, etc.)
 */
const ProfileStats = ({
  userData,
  ownProfile,
  viewerRelationship,
  onOpenUserList,
}) => {
  return (
    <div className="mt-8 flex items-center justify-around md:justify-start gap-4 md:gap-12 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-gray-100 md:border-none">
      <button
        className="flex flex-col items-center text-center min-w-[70px] group"
        onClick={() => onOpenUserList("followers")}
      >
        <span className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-red-500 transition-colors">
          {userData.followerCount ?? 0}
        </span>
        <span className="text-xs md:text-sm text-gray-500 font-medium">Followers</span>
      </button>

      <div className="w-px h-8 bg-gray-200 md:hidden"></div>

      <button
        className="flex flex-col items-center text-center min-w-[70px] group"
        onClick={() => onOpenUserList("following")}
      >
        <span className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-red-500 transition-colors">
          {userData.followingCount ?? 0}
        </span>
        <span className="text-xs md:text-sm text-gray-500 font-medium">Following</span>
      </button>

      {ownProfile && (
        <>
          <div className="w-px h-8 bg-gray-200 md:hidden flex-shrink-0"></div>
          <button
            className="flex flex-col items-center text-center min-w-[60px] md:min-w-[70px] group flex-shrink-0"
            onClick={() => onOpenUserList("closeFriends")}
          >
            <span className="text-lg md:text-2xl font-bold text-gray-900 group-hover:text-red-500 transition-colors">
              {userData.closeFriendCount ?? 0}
            </span>
            <span className="text-xs md:text-sm text-gray-500 font-medium">Close Friends</span>
          </button>
        </>
      )}

      {!ownProfile &&
        typeof viewerRelationship?.mutualFollowersCount === "number" &&
        viewerRelationship.mutualFollowersCount > 0 && (
          <>
            <div className="w-px h-8 bg-gray-200 md:hidden flex-shrink-0"></div>
            <button
              className="flex flex-col items-center text-center min-w-[60px] md:min-w-[70px] group flex-shrink-0"
              onClick={() => onOpenUserList("mutual")}
            >
              <span className="text-lg md:text-2xl font-bold text-gray-900 group-hover:text-red-500 transition-colors">
                {viewerRelationship.mutualFollowersCount}
              </span>
              <span className="text-xs md:text-sm text-gray-500 font-medium">Mutual</span>
            </button>
          </>
        )}
    </div>
  );
};

export default ProfileStats;
