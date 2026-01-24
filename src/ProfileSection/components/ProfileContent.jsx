import React, { useMemo } from "react";
import { Link } from "react-router-dom";

/**
 * Grid display of user content (posts, trips, etc.).
 * Optimized with React.memo to prevent unnecessary re-renders.
 */
const ProfileContent = ({
  activeTab,
  items,
  loading,
  error,
  ownProfile,
  onDeletePost,
  onArchiveTrip,
  onRestoreTrip,
  isArchivedTab
}) => {
  // Skeleton loader for content
  if (loading) {
    return (
      <div className="mt-4 grid grid-cols-3 gap-1 sm:gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="relative w-full overflow-hidden bg-gray-200 animate-pulse"
            style={{ paddingBottom: "100%" }}
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return <p className="text-sm text-center text-red-500">{error}</p>;
  }

  // Empty state
  if (items.length === 0) {
    const emptyMessages = {
      posts: "No posts to display yet.",
      trips: "No trips to display yet.",
      collaboratedTrips: "No collaborated trips to display yet.",
      sharedPosts: "No shared posts to display yet.",
      bookmarks: "No bookmarked posts to display yet.",
    };
    return (
      <p className="text-sm text-center text-gray-500">
        {emptyMessages[activeTab] || "No content found."}
      </p>
    );
  }

  // Render Trips (Different layout)
  if (activeTab === "trips" || activeTab === "collaboratedTrips" || activeTab === "archivedTrips") {
    return (
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((trip) => {
          const cover = trip.coverPhoto?.url || trip.coverPhoto || "";
          const hasCover = !!cover;
          return (
            <Link
              key={trip._id}
              to={`/trip/${trip._id}`}
              className="group relative block overflow-hidden rounded-xl bg-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-full aspect-[4/3]">
                {hasCover ? (
                  <img
                    src={cover}
                    alt={trip.title || ""}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <i className="bx bx-map-alt text-4xl text-gray-400" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                
                {ownProfile && (activeTab === "trips" || activeTab === "archivedTrips") && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isArchivedTab) {
                         onRestoreTrip(trip._id);
                      } else {
                         onArchiveTrip(trip._id);
                      }
                    }}
                    className="absolute top-2 right-2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
                    title={isArchivedTab ? "Restore Trip" : "Archive Trip"}
                  >
                    <i className={`bx ${isArchivedTab ? "bx-undo" : "bx-trash-x"} text-xl`} />
                  </button>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-bold text-white truncate drop-shadow-sm">
                    {trip.title || "Untitled Trip"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-white/90">
                    <i className="bx bx-calendar-week text-sm" />
                    <span className="text-xs font-medium">
                      {trip.startDate && trip.endDate
                        ? `${new Date(trip.startDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })} - ${new Date(trip.endDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}`
                        : "Date not set"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  // Render Posts/Media (Square grid)
  return (
    <div className="mt-4 grid grid-cols-3 gap-0.5 md:gap-4 md:grid-cols-3">
      {items.map((item) => {
        const isPostTab =
          activeTab === "posts" ||
          activeTab === "sharedPosts" ||
          activeTab === "bookmarks";
        const mediaSource = isPostTab
          ? item.media?.[0]?.url || item.media?.[0]
          : item.coverPhoto?.url || item.coverPhoto;

        return (
          <Link
            to={`/post/${item._id}`}
            key={item._id}
            className="group relative w-full aspect-square bg-gray-100 overflow-hidden cursor-pointer block"
          >
            {isPostTab ? (
              <>
                {mediaSource ? (
                  <>
                    <img
                      src={mediaSource}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 text-white">
                      <div className="flex items-center gap-1 font-bold">
                        <i className="bx bx-heart text-xl" />
                        <span>{item.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold">
                        <i className="bx bx-message-circle-reply text-xl" />
                        <span>{item.comments?.length || 0}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 px-4">
                    <p
                      className="text-xs sm:text-sm text-white text-center font-medium leading-relaxed line-clamp-4"
                    >
                      {item.caption || "No caption"}
                    </p>
                  </div>
                )}
                {ownProfile && (activeTab === "posts" || activeTab === "sharedPosts") && (
                   <button
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       onDeletePost(item._id);
                     }}
                     className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                     title="Delete Post"
                   >
                     <i className="bx bx-trash text-lg" />
                   </button>
                 )}
              </>
            ) : mediaSource ? (
              <img
                src={mediaSource}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <i className="bx bx-image text-3xl" />
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default React.memo(ProfileContent);
