import React, { useState, useEffect } from "react";
import { getFollowingPosts } from "../Apis/feedApi.js";
import { togglePostLike } from "../Apis/likeApi.js";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import LikesModal from "./LikesModal.jsx";

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likingStates, setLikingStates] = useState({});
  const [selectedPostId, setSelectedPostId] = useState(null);
  const { _id } = useSelector((state) => state.user);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getFollowingPosts();
      setPosts(response.posts || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId, currentLiked) => {
    if (likingStates[postId]) return;
    
    setLikingStates((prev) => ({ ...prev, [postId]: true }));
    const newLikedState = !currentLiked;

    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          const currentLikes = post.likes || [];
          const newLikes = newLikedState
            ? [...currentLikes, _id]
            : currentLikes.filter((id) => (id._id || id).toString() !== _id.toString());
          
          return {
            ...post,
            likes: newLikes,
            isLikedByViewer: newLikedState,
          };
        }
        return post;
      })
    );

    try {
      await togglePostLike(postId);
    } catch (err) {
      // Rollback on error
      setPosts((prev) =>
        prev.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              isLikedByViewer: currentLiked,
            };
          }
          return post;
        })
      );
      console.error("Error toggling like:", err);
    } finally {
      setLikingStates((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return postDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 gap-3">
        <i className="bx bx-error-circle text-5xl text-red-500"></i>
        <p className="text-lg text-gray-600">{error}</p>
        <button
          onClick={fetchPosts}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 gap-3">
        <i className="bx bx-image-alt text-6xl text-gray-400"></i>
        <p className="text-xl font-semibold text-gray-600">No posts found</p>
        <p className="text-sm text-gray-500">Start following users to see their posts</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-2xl mx-auto space-y-6 pb-10">
        {posts.map((post) => {
          const author = post.author || post.sharedFrom?.author;
          const taggedUsers = post.taggedUsers || post.sharedFrom?.taggedUsers || [];
          const isLiked = post.isLikedByViewer || post.likes?.some((like) => (like._id || like).toString() === _id.toString());
          const likesCount = post.likes?.length || 0;
          const commentsCount = post.comments?.length || 0;
          const media = post.media || [];
          const caption = post.caption || "";
          const trip = post.tripId;

          return (
            <div
              key={post._id}
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
                      @{author?.username || "unknown"} · {formatDate(post.createdAt)}
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
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/trip/${trip._id}`}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      {trip.title}
                    </Link>
                    {trip.acceptedFriends && trip.acceptedFriends.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <i className="bx bx-group" />
                        <span>{trip.acceptedFriends.length}</span>
                      </div>
                    )}
                  </div>
                )}
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
                    <video
                      src={media[0].url}
                      controls
                      className="w-full h-auto max-h-[600px]"
                    >
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
                    onClick={() => handleLike(post._id, isLiked)}
                    disabled={likingStates[post._id]}
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
                    onClick={() => setSelectedPostId(post._id)}
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
        })}
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

export default PostFeed;
