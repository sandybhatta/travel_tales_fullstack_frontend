import React, { useState, useEffect } from "react";
import { getFollowingPosts, getExplorePosts } from "../Apis/feedApi.js";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const PostFeed = ({ filter }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { _id } = useSelector((state) => state.user);

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (filter === "following") {
        response = await getFollowingPosts();
        setPosts(response.posts || []);
      } else if (filter === "explore") {
        response = await getExplorePosts();
        // Explore feed returns mixed posts and trips
        // Handle different response structures
        if (response.feed) {
          // Response has feed array with mixed items
          const feedItems = response.feed || [];
          // Filter only posts (posts have media or caption, trips have title)
          const postsOnly = feedItems.filter(
            (item) => {
              const data = item.data || item;
              return (data.media || data.caption) && !data.title;
            }
          );
          setPosts(postsOnly.map((item) => item.data || item));
        } else if (response.posts) {
          setPosts(response.posts);
        } else {
          setPosts([]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
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
        <p className="text-sm text-gray-500">
          {filter === "following"
            ? "Start following users to see their posts"
            : "No posts available to explore"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-10">
      {posts.map((post) => {
        const author = post.author || post.sharedFrom?.author;
        const isLiked = post.likes?.some((like) => like._id === _id || like === _id);
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
                <button className="flex items-center gap-2 hover:opacity-70 transition">
                  <i
                    className={`bx ${isLiked ? "bxs-heart" : "bx-heart"} text-2xl ${
                      isLiked ? "text-red-500" : "text-gray-700"
                    }`}
                  ></i>
                  <span className="text-sm text-gray-700">{likesCount}</span>
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
  );
};

export default PostFeed;
