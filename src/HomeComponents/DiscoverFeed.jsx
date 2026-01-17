import React, { useState, useEffect } from "react";
import { getDiscoverFeed } from "../Apis/feedApi.js";
import { togglePostLike, toggleTripLike } from "../Apis/likeApi.js";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import LikesModal from "./LikesModal.jsx";

const DiscoverFeed = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likingStates, setLikingStates] = useState({});
  const [selectedPostId, setSelectedPostId] = useState(null);
  const { _id } = useSelector((state) => state.user);

  useEffect(() => {
    setPage(1);
    setFeedItems([]);
    fetchFeed(1);
  }, []);

  const fetchFeed = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await getDiscoverFeed(pageNum, 20);
      setFeedItems((prev) => (pageNum === 1 ? response.feed : [...prev, ...response.feed]));
      setHasMore(response.hasMore || false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load discover feed");
      console.error("Error fetching discover feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
    }
  };

  const handleLike = async (itemId, currentLiked, type) => {
    if (likingStates[itemId]) return;
    
    setLikingStates((prev) => ({ ...prev, [itemId]: true }));
    const newLikedState = !currentLiked;

    // Optimistic update
    setFeedItems((prev) =>
      prev.map((item) => {
        const data = item.data || item;
        if (data._id === itemId) {
          const currentLikes = data.likes || [];
          const newLikes = newLikedState
            ? [...currentLikes, _id]
            : currentLikes.filter((id) => (id._id || id).toString() !== _id.toString());
          
          return {
            ...item,
            data: {
              ...data,
              likes: newLikes,
              isLikedByViewer: newLikedState,
            },
          };
        }
        return item;
      })
    );

    try {
      if (type === "post") {
        await togglePostLike(itemId);
      } else {
        await toggleTripLike(itemId);
      }
    } catch (err) {
      // Rollback on error
      setFeedItems((prev) =>
        prev.map((item) => {
          const data = item.data || item;
          if (data._id === itemId) {
            return {
              ...item,
              data: {
                ...data,
                isLikedByViewer: currentLiked,
              },
            };
          }
          return item;
        })
      );
      console.error("Error toggling like:", err);
    } finally {
      setLikingStates((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const itemDate = new Date(date);
    const diffInSeconds = Math.floor((now - itemDate) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return itemDate.toLocaleDateString();
  };

  const formatTripDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTripStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < now) return { text: "Completed", color: "bg-green-500" };
    if (start > now) return { text: "Upcoming", color: "bg-red-500" };
    return { text: "Ongoing", color: "bg-blue-500" };
  };

  if (loading && feedItems.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error && feedItems.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 gap-3">
        <i className="bx bx-error-circle text-5xl text-red-500"></i>
        <p className="text-lg text-gray-600">{error}</p>
        <button
          onClick={() => fetchFeed(1)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (feedItems.length === 0 && !loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 gap-3">
        <i className="bx bx-compass text-6xl text-gray-400"></i>
        <p className="text-xl font-semibold text-gray-600">No content to discover</p>
        <p className="text-sm text-gray-500">Start exploring to see personalized content</p>
      </div>
    );
  }

  return (
    <>
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-10">
      {feedItems.map((item) => {
        const data = item.data;
        const isPost = item.type === "post";
        const author = isPost ? data.author : data.user;
        const isLiked = data.isLikedByViewer || false;
        const likedByFollowings = data.likedByFollowings || [];
        const likesCount = data.likeCount || data.likes?.length || 0;
        const commentsCount = data.commentCount || data.comments?.length || 0;

        // Render Post
        if (isPost) {
          const media = data.media || [];
          const caption = data.caption || "";
          const trip = data.tripId;
          const taggedUsers = data.taggedUsers || [];

          return (
            <div
              key={data._id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Link to={`/profile/${author?._id || author}`}>
                    <img
                      src={author?.avatar?.url || author?.avatar || "/default-avatar.png"}
                      alt={author?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-col">
                    <Link
                      to={`/profile/${author?._id || author}`}
                      className="font-semibold text-gray-800 hover:text-red-500 transition"
                    >
                      {author?.name || "Unknown"}
                    </Link>
                    <p className="text-xs text-gray-500">
                      @{author?.username || "unknown"} · {formatDate(data.createdAt)}
                    </p>
                    {taggedUsers.length > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">With</span>
                        <img
                          src={taggedUsers[0].avatar?.url || taggedUsers[0].avatar || "/default-avatar.png"}
                          alt={taggedUsers[0].name || taggedUsers[0].username || "Tagged user"}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        {taggedUsers.length > 1 && (
                          <span className="text-xs text-gray-500">
                            & {taggedUsers.length - 1} others
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {trip && (
                  <Link
                    to={`/trip/${trip._id}`}
                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    {trip.title}
                  </Link>
                )}
              </div>

              {/* Liked by followings */}
              {likedByFollowings.length > 0 && (
                <div className="px-4 pt-2 pb-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex -space-x-2">
                      {likedByFollowings.slice(0, 3).map((user, idx) => (
                        <img
                          key={user._id || idx}
                          src={user.avatar?.url || user.avatar || "/default-avatar.png"}
                          alt={user.name || user.username}
                          className="w-6 h-6 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                    </div>
                    <span>
                      {likedByFollowings.length === 1
                        ? `${likedByFollowings[0].name || likedByFollowings[0].username} liked this`
                        : `${likedByFollowings[0].name || likedByFollowings[0].username} and ${
                            likedByFollowings.length - 1
                          } others you follow liked this`}
                    </span>
                  </div>
                </div>
              )}

              {/* Media */}
              {media.length > 0 && (
                <div className="relative w-full bg-black">
                  {media[0].resource_type === "image" ? (
                    <img
                      src={media[0].url}
                      alt={caption || "Post"}
                      className="w-full h-auto max-h-[600px] object-contain"
                    />
                  ) : (
                    <video src={media[0].url} controls className="w-full h-auto max-h-[600px]">
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {media.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {media.length} photos
                    </div>
                  )}
                </div>
              )}

              {/* Caption (if no media) */}
              {media.length === 0 && caption && (
                <div className="p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{caption}</p>
                </div>
              )}

              {/* Actions */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLike(data._id, isLiked, "post")}
                    disabled={likingStates[data._id]}
                    className="flex items-center gap-2 hover:opacity-70 transition disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={isLiked ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className={`w-7 h-7 ${isLiked ? "text-red-500" : "text-gray-700"}`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedPostId(data._id)}
                    className="text-sm text-gray-700 hover:text-red-500 transition font-medium cursor-pointer"
                  >
                    {likesCount} {likesCount === 1 ? "like" : "likes"}
                  </button>
                  <button className="flex items-center gap-2 hover:opacity-70 transition">
                    <i className="bx bx-message text-2xl text-gray-700"></i>
                    <span className="text-sm text-gray-700">{commentsCount}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:opacity-70 transition">
                    <i className="bx bx-share text-2xl text-gray-700"></i>
                  </button>
                </div>

                {/* Caption (if media exists) */}
                {media.length > 0 && caption && (
                  <div className="pt-2">
                    <p className="text-gray-800">
                      <span className="font-semibold">{author?.username || "unknown"}</span>{" "}
                      {caption}
                    </p>
                  </div>
                )}

                {/* View comments */}
                {commentsCount > 0 && (
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    View all {commentsCount} comments
                  </button>
                )}
              </div>
            </div>
          );
        }

        // Render Trip
        const status = getTripStatus(data.startDate, data.endDate);
        const coverPhoto = data.coverPhoto?.url || data.coverPhoto;
        const owner = data.user;
        const isTripLiked = data.isLikedByViewer || data.likes?.some((like) => (like._id || like).toString() === _id.toString());
        const tripLikesCount = data.likes?.length || 0;
        const collaboratorsCount = data.acceptedFriends?.length || 0;

        return (
          <Link
            key={data._id}
            to={`/trip/${data._id}`}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 block"
          >
            {/* Cover Photo */}
            <div className="relative h-64 w-full bg-gray-200 overflow-hidden">
              {coverPhoto ? (
                <img
                  src={coverPhoto}
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200">
                  <i className="bx bx-trip text-5xl text-red-400"></i>
                </div>
              )}
              {/* Status Badge */}
              <div
                className={`absolute top-2 right-2 ${status.color} text-white px-2 py-1 rounded-full text-xs font-semibold`}
              >
                {status.text}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Liked by followings */}
              {likedByFollowings.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 pb-2 border-b border-gray-100">
                  <div className="flex -space-x-2">
                    {likedByFollowings.slice(0, 3).map((user, idx) => (
                      <img
                        key={user._id || idx}
                        src={user.avatar?.url || user.avatar || "/default-avatar.png"}
                        alt={user.name || user.username}
                        className="w-6 h-6 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                  </div>
                  <span>
                    {likedByFollowings.length === 1
                      ? `${likedByFollowings[0].name || likedByFollowings[0].username} liked this trip`
                      : `${likedByFollowings[0].name || likedByFollowings[0].username} and ${
                          likedByFollowings.length - 1
                        } others you follow liked this trip`}
                  </span>
                </div>
              )}

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 hover:text-red-500 transition">
                {data.title}
              </h3>

              {/* Owner */}
              {owner && (
                <div className="flex items-center gap-2">
                  <img
                    src={owner.avatar?.url || owner.avatar || "/default-avatar.png"}
                    alt={owner.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <p className="text-sm text-gray-600">{owner.name || owner.username}</p>
                </div>
              )}

              {/* Dates */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <i className="bx bx-calendar"></i>
                <span>
                  {formatTripDate(data.startDate)} - {formatTripDate(data.endDate)}
                </span>
              </div>

              {/* Destinations */}
              {data.destinations && data.destinations.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <i className="bx bx-map"></i>
                  <span className="line-clamp-1">
                    {data.destinations[0]?.city || data.destinations[0]},
                    {data.destinations[0]?.state || ""},
                    {data.destinations[0]?.country || ""}
                  </span>
                  {data.destinations.length > 1 && (
                    <span>& {data.destinations.length - 1} more</span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleLike(data._id, isTripLiked, "trip");
                  }}
                  disabled={likingStates[data._id]}
                  className="flex items-center gap-1 hover:opacity-70 transition disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={isTripLiked ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className={`w-6 h-6 ${isTripLiked ? "text-red-500" : "text-gray-500"}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="text-xs text-gray-600">{tripLikesCount}</span>
                </button>
                {collaboratorsCount > 0 && (
                  <div className="flex items-center gap-1">
                    <i className="bx bx-group text-gray-500"></i>
                    <span className="text-xs text-gray-600">{collaboratorsCount}</span>
                  </div>
                )}
                {data.posts && data.posts.length > 0 && (
                  <div className="flex items-center gap-1">
                    <i className="bx bx-image text-gray-500"></i>
                    <span className="text-xs text-gray-600">{data.posts.length}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}

      {/* Load More */}
      {hasMore && (
        <div className="w-full flex items-center justify-center py-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </div>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>

    <LikesModal
      isOpen={selectedPostId !== null}
      onClose={() => setSelectedPostId(null)}
      postId={selectedPostId}
      type="post"
    />
    </>
  );
};

export default DiscoverFeed;
