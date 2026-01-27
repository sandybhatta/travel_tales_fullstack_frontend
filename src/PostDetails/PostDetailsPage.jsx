import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPostDetails, getUserFollowings } from "../Apis/postApi";
import { togglePostLike } from "../Apis/likeApi";
import mainApi from "../Apis/axios";
import { useSelector } from "react-redux";
import CommentSection from "./CommentSection";
import PostHeader from "./components/PostHeader";
import PostMedia from "./components/PostMedia";
import TripInfoCard from "./components/TripInfoCard";

const PostDetailsPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { _id: currentUserId } = useSelector((state) => state.user);

  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liking, setLiking] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  // Privacy State
  const [canComment, setCanComment] = useState(true);
  const [commentPrivacyMessage, setCommentPrivacyMessage] = useState("");

  // Media Modal State
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  // Privacy Logic
  useEffect(() => {
    if (!postData || !postData.post) return;
    const { author } = postData.post;
    if (!author) return;
    const allow = author.privacy?.allowComments || "everyone";
    if (author._id === currentUserId) {
      setCanComment(true);
      setCommentPrivacyMessage("");
      return;
    }
    if (allow === "everyone") {
      setCanComment(true);
      setCommentPrivacyMessage("");
    } else if (allow === "no_one") {
      setCanComment(false);
      setCommentPrivacyMessage("Comments have been disabled by the author.");
    } else if (allow === "followers") {
      const isFollower = author.followers.some(
        (f) => f._id === currentUserId || f === currentUserId,
      );
      if (isFollower) {
        setCanComment(true);
        setCommentPrivacyMessage("");
      } else {
        setCanComment(false);
        setCommentPrivacyMessage("Comments have been disabled by the author.");
      }
    } else if (allow === "close_friends") {
      const isClose = author.closeFriends.some(
        (f) => f._id === currentUserId || f === currentUserId,
      );
      if (isClose) {
        setCanComment(true);
        setCommentPrivacyMessage("");
      } else {
        setCanComment(false);
        setCommentPrivacyMessage("Comments have been disabled by the author.");
      }
    }
  }, [postData, currentUserId]);

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      const data = await getPostDetails(postId);
      setPostData(data);
    } catch (err) {
      console.error("Error fetching details", err);
      if (!postData)
        setError(err.response?.data?.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liking || !postData) return;
    setLiking(true);
    const wasLiked = postData.hasLiked;
    setPostData((prev) => ({
      ...prev,
      hasLiked: !wasLiked,
      likesCount: wasLiked ? prev.likesCount - 1 : prev.likesCount + 1,
    }));
    try {
      await togglePostLike(postId);
    } catch (err) {
      setPostData((prev) => ({
        ...prev,
        hasLiked: wasLiked,
        likesCount: wasLiked ? prev.likesCount : prev.likesCount - 1,
      }));
      console.error("Error toggling like:", err);
    } finally {
      setLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (bookmarking || !postData) return;
    setBookmarking(true);
    const wasBookmarked = postData.isBookmarked;
    setPostData((prev) => ({
      ...prev,
      isBookmarked: !wasBookmarked,
      bookmarkCount: wasBookmarked
        ? prev.bookmarkCount - 1
        : prev.bookmarkCount + 1,
    }));
    try {
      await mainApi.patch(`/api/user/bookmark/${postId}`);
    } catch (err) {
      setPostData((prev) => ({
        ...prev,
        isBookmarked: wasBookmarked,
        bookmarkCount: wasBookmarked
          ? prev.bookmarkCount
          : prev.bookmarkCount - 1,
      }));
      console.error("Error toggling bookmark:", err);
    } finally {
      setBookmarking(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const renderCaption = (text) => {
    if (!text) return null;
    const { post } = postData || {};
    const mentions = post?.mentions || [];
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        // Handle punctuation after mention (e.g. "@user!")
        const match = part.match(/^@([a-zA-Z0-9_]+)(.*)$/);
        if (match) {
          const username = match[1];
          const suffix = match[2];
          const mention = mentions.find((u) => u.username === username);
          if (mention) {
            return (
              <React.Fragment key={index}>
                <Link
                  to={`/profile/${mention._id}`}
                  className="text-red-500 hover:underline"
                >
                  @{username}
                </Link>
                {suffix}
              </React.Fragment>
            );
          }
        }
      }
      return part;
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 animate-pulse">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200"></div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          <div className="w-full h-64 bg-gray-200"></div>
          <div className="p-6 space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen gap-3">
        <i className="bx bx-error-circle text-5xl text-red-500"></i>
        <p className="text-lg text-gray-600">{error}</p>
        <Link
          to="/home"
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Go Home
        </Link>
      </div>
    );
  }

  if (!postData) return null;

  const {
    post,
    likesCount,
    commentsCount,
    hasLiked,
    bookmarkCount,
    isBookmarked,
    shareCount,
    followedLikes,
  } = postData;
  const author = post.author || post.sharedFrom?.author;
  const media = post.media || [];
  const caption = post.caption || "";
  const taggedUsers = post.taggedUsers || [];

  return (
    <div className="max-w-2xl mx-auto pb-20 md:p-4">
      <div className="bg-white md:rounded-xl shadow-none md:shadow-lg overflow-hidden border-b md:border border-gray-200">
        {/* Header */}
        <PostHeader
          post={post}
          onPostUpdate={() => fetchPostDetails()}
        />

        {/* Caption */}
        <div className="p-6">
          <p className="text-gray-800 text-lg whitespace-pre-wrap leading-relaxed">
            {renderCaption(caption)}
          </p>
        </div>

        {/* Shared Post or Original Content */}
        {post.sharedFrom ? (
          <div
            onClick={() => navigate(`/post/${post.sharedFrom._id}`)}
            className="mx-4 mb-6 border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 transition bg-white"
          >
            {/* Inner Header */}
            <div className="p-4 flex items-center gap-3 border-b border-gray-100">
              <img
                src={
                  post.sharedFrom.author?.avatar?.url ||
                  post.sharedFrom.author?.avatar
                }
                alt={post.sharedFrom.author?.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">
                    {post.sharedFrom.author?.name}
                  </span>
                  {post.sharedFrom.taggedUsers && post.sharedFrom.taggedUsers.length > 0 && (
                      <div className="flex items-center gap-1 ml-1">
                          <span className="text-gray-500 text-xs">is with</span>
                          <img 
                              src={post.sharedFrom.taggedUsers[0].avatar?.url || post.sharedFrom.taggedUsers[0].avatar} 
                              alt={post.sharedFrom.taggedUsers[0].name}
                              className="w-4 h-4 rounded-full object-cover border border-gray-200"
                          />
                          <span className="text-sm font-medium text-gray-900">
                              {post.sharedFrom.taggedUsers[0].name}
                          </span>
                          {post.sharedFrom.taggedUsers.length > 1 && (
                              <span className="text-xs text-gray-500">
                                  +{post.sharedFrom.taggedUsers.length - 1} others
                              </span>
                          )}
                      </div>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(post.sharedFrom.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Inner Caption */}
            {post.sharedFrom.caption && (
              <div className="p-4 pb-2">
                <p className="text-gray-800 whitespace-pre-wrap line-clamp-3 text-sm">
                  {post.sharedFrom.caption}
                </p>
              </div>
            )}

            {/* Inner Media - Non-interactive */}
            <div className="pointer-events-none">
              <PostMedia media={post.sharedFrom.media} />
            </div>

            {/* Inner Trip - Stop Propagation for Link */}
            <div onClick={(e) => e.stopPropagation()}>
              <TripInfoCard trip={post.sharedFrom.tripId} />
            </div>
          </div>
        ) : (
          <>
            <PostMedia media={media} onMediaClick={setSelectedMediaIndex} />
            <TripInfoCard trip={post.tripId} />
          </>
        )}

        {/* Followed By Bubble */}
        {followedLikes && followedLikes.length > 0 && (
          <div className="px-4 py-2 md:px-6 flex items-center gap-3">
            <div className="flex -space-x-3">
              {followedLikes.map((u) => (
                <img
                  key={u._id}
                  src={u.avatar?.url || u.avatar}
                  alt={u.username}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white"
                  title={`Liked by ${u.name}`}
                />
              ))}
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              Liked by{" "}
              <span className="font-semibold">{followedLikes[0].name}</span>
              {followedLikes.length > 1 && <span> and others you follow</span>}
            </div>
          </div>
        )}

        {/* Interaction Bar */}
        <div className="px-6 py-4 border-t border-gray-100 grid grid-cols-4 gap-4">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex flex-col items-center gap-1 group transition ${hasLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={hasLiked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-7 h-7 group-active:scale-90 transition-transform"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm font-medium">{likesCount} Likes</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-500 group transition">
            <i className="bx bx-message-circle text-3xl group-active:scale-90 transition-transform"></i>
            <span className="text-sm font-medium">
              {commentsCount} Comments
            </span>
          </button>
          <button
            onClick={handleBookmark}
            disabled={bookmarking}
            className={`flex flex-col items-center gap-1 group transition ${isBookmarked ? "text-yellow-500" : "text-gray-500 hover:text-yellow-500"}`}
          >
            <i
              className={`bx ${isBookmarked ? "bxs-bookmark" : "bx-bookmark"} text-3xl group-active:scale-90 transition-transform`}
            ></i>
            <span className="text-sm font-medium">{bookmarkCount} Saved</span>
          </button>
          {((post.tripId && post.tripId.visibility === "public") ||
            (!post.tripId && post.visibility === "public")) && (
            <button
              onClick={() => navigate(`/post/share/${postId}`)}
              className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-500 group transition"
            >
              <i className="bx bx-share text-3xl group-active:scale-90 transition-transform"></i>
              <span className="text-sm font-medium">{shareCount} Shares</span>
            </button>
          )}
        </div>

        {/* New Comment Section */}
        <CommentSection
          postId={postId}
          canComment={canComment}
          privacyMessage={commentPrivacyMessage}
          onCommentAdded={() =>
            setPostData((prev) => ({
              ...prev,
              commentsCount: (prev.commentsCount || 0) + 1,
            }))
          }
        />
      </div>

      {/* Media Modal */}
      {selectedMediaIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setSelectedMediaIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
          >
            <i className="bx bx-x text-4xl"></i>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMediaIndex((prev) =>
                prev > 0 ? prev - 1 : media.length - 1,
              );
            }}
            className="absolute left-4 text-white hover:text-gray-300 z-50 p-2"
          >
            <i className="bx bx-arrow-left-stroke text-4xl"></i>
          </button>
          <div className="w-full h-full flex items-center justify-center p-4">
            {media[selectedMediaIndex].resource_type === "image" ? (
              <img
                src={media[selectedMediaIndex].url}
                alt="Full view"
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <video
                src={media[selectedMediaIndex].url}
                controls
                autoPlay
                className="max-w-full max-h-[90vh]"
              />
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMediaIndex((prev) =>
                prev < media.length - 1 ? prev + 1 : 0,
              );
            }}
            className="absolute right-4 text-white hover:text-gray-300 z-50 p-2"
          >
            <i className="bx bx-arrow-right-stroke text-4xl"></i>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {selectedMediaIndex + 1} / {media.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetailsPage;
