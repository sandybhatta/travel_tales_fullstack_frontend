import React from "react";

/**
 * Displays user profile information and action buttons.
 */
const ProfileHeader = ({
  user,
  ownProfile,
  actionLoading,
  viewerRelationship = {},
  onFollowToggle,
  onCloseFriendToggle,
  onEditProfile,
  onOpenSettings,
  onAvatarClick,
}) => {
  const followLabel = ownProfile
    ? ""
    : viewerRelationship.isFollowing
    ? "Following"
    : viewerRelationship.isFollower
    ? "Follow back"
    : "Follow";

  const closeFriendLabel = ownProfile
    ? ""
    : viewerRelationship.isCloseFriend
    ? "Close Friends"
    : "Add Close Friend";

  return (
    <div className="mt-4 flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6 md:gap-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 w-full md:w-auto">
        <img
          src={user.avatar?.url || user.avatar || "/default-avatar.png"}
          className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-white shadow-md cursor-pointer hover:scale-105 transition-transform duration-200"
          alt="Profile"
          onClick={onAvatarClick}
        />
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500 font-medium">@{user.username}</p>
          
          {user.email && ownProfile && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1 break-all">
              <i className="bx bx-envelope text-lg" />
              <p>{user.email}</p>
            </div>
          )}
          
          {user.location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
              <i className="bx bx-location text-lg" />
              <p>
                {user.location.city},{user.location.state}, {user.location.country}
              </p>
            </div>
          )}

          {user.bio && (
            <div className="mt-4 w-full max-w-md md:max-w-xl bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm md:text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                {user.bio}
              </p>
            </div>
          )}

          {Array.isArray(user.interests) && user.interests.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2 max-w-md md:max-w-xl">
              {user.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200 shadow-sm"
                >
                  #{interest.replace("_", " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-auto flex flex-row md:flex-col justify-center md:justify-start gap-2 sm:gap-3 mt-2 md:mt-0">
        {ownProfile ? (
          <>
            <button
              onClick={onEditProfile}
              className="flex-1 md:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-black transition shadow-sm active:scale-95 whitespace-nowrap"
            >
              Edit profile
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm transition active:scale-95 flex-shrink-0"
              title="Settings"
            >
              <i className="bx bx-cog text-xl" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onFollowToggle}
              disabled={actionLoading}
              className={`flex-1 md:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm active:scale-95 whitespace-nowrap ${
                viewerRelationship.isFollowing
                  ? "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
                  : "bg-red-500 text-white hover:bg-red-600"
              } disabled:opacity-50`}
            >
              {actionLoading ? "Wait..." : followLabel}
            </button>
            <button
              onClick={onCloseFriendToggle}
              disabled={actionLoading}
              className="flex-1 md:flex-none px-3 sm:px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm transition active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {closeFriendLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
