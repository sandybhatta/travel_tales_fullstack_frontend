import React, { useState, useEffect, useRef, useCallback } from "react";
import { getExploreFeed } from "../Apis/feedApi.js";
import { togglePostLike, toggleTripLike } from "../Apis/likeApi.js";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import LikesModal from "./LikesModal.jsx";

const ExploreFeed = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [likingStates, setLikingStates] = useState({});
  const [selectedPostId, setSelectedPostId] = useState(null);
  const { _id } = useSelector((state) => state.user);
  const observerTarget = useRef(null);

  useEffect(() => {
    setPage(1);
    setFeedItems([]);
    fetchFeed(1);
  }, []);

  const fetchFeed = async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError("");
    try {
      const response = await getExploreFeed(pageNum, 20);
      const items = response.feed || [];
      setFeedItems((prev) => (pageNum === 1 ? items : [...prev, ...items]));
      setHasMore(response.hasMore || items.length === 20);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load explore feed");
      console.error("Error fetching explore feed:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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

  const lastItemElementRef = useCallback(
    (node) => {
      if (loadingMore || !hasMore) return;
      if (observerTarget.current) observerTarget.current.disconnect();

      observerTarget.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchFeed(nextPage);
        }
      });

      if (node) observerTarget.current.observe(node);
    },
    [loadingMore, hasMore, page]
  );

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
        <p className="text-xl font-semibold text-gray-600">No content to explore</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-2xl mx-auto space-y-6 pb-10">
        {feedItems.map((item, index) => {
          const data = item.data || item;
          const isPost = data.media || data.caption;
          const isTrip = data.title && data.destinations;
          
          if (isPost) {
            const author = data.author;
            const taggedUsers = data.taggedUsers || [];
            const isLiked = data.isLikedByViewer || data.likes?.some((like) => (like._id || like).toString() === _id.toString());
            const likesCount = data.likes?.length || 0;
            const commentsCount = data.comments?.length || 0;
            const media = data.media || [];
            const caption = data.caption || "";

            return (
              <div
                key={data._id}
                ref={index === feedItems.length - 1 ? lastItemElementRef : null}
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
                </div>

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
                  </div>

                  {caption && (
                    <div className="pt-2">
                      <p className="text-gray-800">
                        <span className="font-semibold">{author?.username || "unknown"}</span> {caption}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Trip card (simplified for explore feed)
          if (isTrip) {
            const owner = data.user;
            const isLiked = data.isLikedByViewer || data.likes?.some((like) => (like._id || like).toString() === _id.toString());
            const likesCount = data.likes?.length || 0;
            const coverPhoto = data.coverPhoto?.url || data.coverPhoto;
            const collaboratorsCount = data.acceptedFriends?.length || 0;

            return (
              <Link
                key={data._id}
                ref={index === feedItems.length - 1 ? lastItemElementRef : null}
                to={`/trip/${data._id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition block"
              >
                <div className="relative h-64 w-full bg-gray-200 overflow-hidden">
                  {coverPhoto ? (
                    <img src={coverPhoto} alt={data.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200">
                      <i className="bx bx-trip text-5xl text-red-400"></i>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{data.title}</h3>
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
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleLike(data._id, isLiked, "trip");
                      }}
                      disabled={likingStates[data._id]}
                      className="flex items-center gap-1 disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill={isLiked ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className={`w-5 h-5 ${isLiked ? "text-red-500" : "text-gray-500"}`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span className="text-xs text-gray-600">{likesCount}</span>
                    </button>
                    {collaboratorsCount > 0 && (
                      <div className="flex items-center gap-1">
                        <i className="bx bx-group text-gray-500"></i>
                        <span className="text-xs text-gray-600">{collaboratorsCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          }

          return null;
        })}

        {loadingMore && (
          <div className="w-full flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
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

export default ExploreFeed;
