import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getPostDetails, createComment, getUserFollowings } from "../Apis/postApi";
import { userSearch } from "../Apis/searchApi";
import { togglePostLike } from "../Apis/likeApi";
import mainApi from "../Apis/axios"; // For bookmark
import { useSelector } from "react-redux";

const PostDetailsPage = () => {
  const { postId } = useParams();
  const { _id: currentUserId } = useSelector((state) => state.user);
  
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liking, setLiking] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  // Media Modal State
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);

  // Comment & Mention State
  const [commentText, setCommentText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentInputRef = useRef(null);

  // Fetch followings once
  useEffect(() => {
    if (currentUserId) {
      getUserFollowings(currentUserId).then(data => {
         setFollowingList(data.followingList || []);
      }).catch(err => console.error("Failed to load followings", err));
    }
  }, [currentUserId]);

  // Debounce user search for mentions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (showMentions) {
        // First filter from following list
        const lowerQuery = mentionQuery.toLowerCase();
        const localMatches = followingList.filter(u => 
            u.username.toLowerCase().includes(lowerQuery) || 
            u.name.toLowerCase().includes(lowerQuery)
        );

        if (localMatches.length > 0) {
            setMentionResults(localMatches);
        } else {
            // If no local match, search globally if query is not empty
            if (mentionQuery) {
                try {
                    const res = await userSearch(mentionQuery, 1, 5); 
                    setMentionResults(res.data.users || []);
                } catch (err) {
                    console.error("User search failed", err);
                }
            } else {
                setMentionResults([]);
            }
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [mentionQuery, showMentions, followingList]);

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setCommentText(value);
    
    // Check for @
    const cursor = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursor);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtPos !== -1) {
        const textAfterAt = textBeforeCursor.slice(lastAtPos + 1);
        // Ensure no spaces (simple mention logic)
        if (!textAfterAt.includes(" ")) {
            setShowMentions(true);
            setMentionQuery(textAfterAt);
            return;
        }
    }
    setShowMentions(false);
  };

  const selectMention = (user) => {
    const cursor = commentInputRef.current.selectionStart;
    const textBeforeCursor = commentText.slice(0, cursor);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");
    
    const prefix = commentText.slice(0, lastAtPos);
    const suffix = commentText.slice(cursor);
    
    const newText = `${prefix}@${user.username} ${suffix}`;
    setCommentText(newText);
    setShowMentions(false);
    commentInputRef.current.focus();
  };

  const handlePostComment = async () => {
      if (!commentText.trim()) return;
      setIsSubmittingComment(true);
      try {
          const res = await createComment(postId, commentText);
          setPostData(prev => ({
              ...prev,
              commentsCount: prev.commentsCount + 1,
              rootComments: [res.comment, ...(prev.rootComments || [])] 
          }));
          setCommentText("");
      } catch (err) {
          console.error("Failed to post comment", err);
      } finally {
          setIsSubmittingComment(false);
      }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      const data = await getPostDetails(postId);
      setPostData(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liking || !postData) return;
    setLiking(true);

    // Optimistic update
    const wasLiked = postData.hasLiked;
    setPostData((prev) => ({
      ...prev,
      hasLiked: !wasLiked,
      likesCount: wasLiked ? prev.likesCount - 1 : prev.likesCount + 1,
    }));

    try {
      await togglePostLike(postId);
    } catch (err) {
      // Revert
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

    // Optimistic update
    const wasBookmarked = postData.isBookmarked;
    setPostData((prev) => ({
      ...prev,
      isBookmarked: !wasBookmarked,
      bookmarkCount: wasBookmarked ? prev.bookmarkCount - 1 : prev.bookmarkCount + 1,
    }));

    try {
      await mainApi.patch(`/api/user/bookmark/${postId}`);
    } catch (err) {
      // Revert
      setPostData((prev) => ({
        ...prev,
        isBookmarked: wasBookmarked,
        bookmarkCount: wasBookmarked ? prev.bookmarkCount : prev.bookmarkCount - 1,
      }));
      console.error("Error toggling bookmark:", err);
    } finally {
      setBookmarking(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderCaption = (text) => {
    if (!text) return null;
    const { post } = postData || {};
    const mentions = post?.mentions || [];
    
    // Split by whitespace but keep delimiters
    const parts = text.split(/(\s+)/);
    
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const username = part.slice(1);
        const mention = mentions.find(u => u.username === username);
        if (mention) {
          return (
            <Link 
              key={index} 
              to={`/profile/${mention._id}`} 
              className="text-red-500 hover:underline"
            >
              {part}
            </Link>
          );
        }
      }
      return part;
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 animate-pulse">
          {/* Header Shimmer */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200"></div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          {/* Media Shimmer */}
          <div className="w-full h-64 bg-gray-200"></div>
          {/* Content Shimmer */}
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
        <Link to="/home" className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
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
    rootComments,
    followedLikes,
    canShare
  } = postData;

  const author = post.author || post.sharedFrom?.author;
  const media = post.media || [];
  const caption = post.caption || "";
  const taggedUsers = post.taggedUsers || [];

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link to={`/profile/${author?._id}`}>
                <img
                    src={author?.avatar?.url || author?.avatar}
                    alt={author?.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
                </Link>
                <div>
                <Link to={`/profile/${author?._id}`} className="font-bold text-gray-800 hover:text-red-500 text-lg">
                    {author?.name || "Unknown"}
                </Link>
                <div className="text-sm text-gray-500 flex flex-wrap items-center gap-1">
                    @{author?.username} · {formatDate(post.createdAt)}
                    {taggedUsers.length > 0 && (
                    <div className="flex items-center gap-1 ml-2 relative">
                        <span>with</span>
                        {!showAllTags ? (
                            <div className="flex items-center gap-1">
                                <Link to={`/profile/${taggedUsers[0]._id}`}>
                                    <img
                                        src={taggedUsers[0].avatar?.url || taggedUsers[0].avatar}
                                        alt={taggedUsers[0].name}
                                        className="w-6 h-6 rounded-full object-cover border border-gray-200"
                                    />
                                </Link>
                                {taggedUsers.length > 1 && (
                                    <span 
                                        onClick={() => setShowAllTags(true)}
                                        className="cursor-pointer font-medium hover:underline text-gray-600 text-sm"
                                    >
                                        and {taggedUsers.length - 1} other
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="absolute top-6 left-0 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-50 min-w-[200px]">
                                <div className="flex flex-col gap-3">
                                    {taggedUsers.map((u) => (
                                        <Link key={u._id} to={`/profile/${u._id}`} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded transition">
                                            <img
                                                src={u.avatar?.url || u.avatar}
                                                alt={u.username}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm text-gray-800">{u.name}</span>
                                                <span className="text-xs text-gray-500">@{u.username}</span>
                                            </div>
                                        </Link>
                                    ))}
                                    <button 
                                        onClick={() => setShowAllTags(false)}
                                        className="text-xs text-red-500 hover:underline mt-1 text-center w-full"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    )}
                </div>
                </div>
            </div>
            {/* Options or Menu could go here */}
        </div>

        {/* Media Grid */}
        {media.length > 0 && (
          <div className="w-full overflow-hidden">
            {media.length === 1 && (
                <div 
                    onClick={() => setSelectedMediaIndex(0)}
                    className="cursor-pointer"
                >
                    {media[0].resource_type === "image" ? (
                        <img src={media[0].url} alt="content" className="w-full h-auto object-contain" />
                    ) : (
                        <video src={media[0].url} controls className="w-full h-auto" />
                    )}
                </div>
            )}

            {media.length === 2 && (
                <div className="grid grid-cols-2 gap-1 h-64 md:h-96">
                    {media.map((file, idx) => (
                        <div key={idx} onClick={() => setSelectedMediaIndex(idx)} className="h-full relative cursor-pointer overflow-hidden">
                            {file.resource_type === "image" ? (
                                <img src={file.url} alt="content" className="w-full h-full object-cover" />
                            ) : (
                                <video src={file.url} className="w-full h-full object-cover" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {media.length >= 3 && (
                <div className="grid grid-cols-2 gap-1 min-h-64 h-auto md:h-96">
                    {/* Left Side: 1st Item */}
                    <div onClick={() => setSelectedMediaIndex(0)} className="h-full relative cursor-pointer ">
                        {media[0].resource_type === "image" ? (
                            <img src={media[0].url} alt="content" className="w-full h-full object-cover" />
                        ) : (
                            <video src={media[0].url} className="w-full h-full object-cover" />
                        )}
                    </div>
                    {/* Right Side: Grid Rows - Changed to Flex col to ensure equal height */}
                    <div className="flex flex-col gap-1 h-full justify-start">
                         <div onClick={() => setSelectedMediaIndex(1)} className=" relative cursor-pointer  w-full h-1/2 overflow-hidden">
                            {media[1].resource_type === "image" ? (
                                <img src={media[1].url} alt="content" className=" h-full w-full object-cover" />
                            ) : (
                                <video src={media[1].url} className="w-full h-full object-cover" />
                            )}
                         </div>
                         <div onClick={() => setSelectedMediaIndex(2)} className="flex-1 relative cursor-pointer  w-full">
                            {media[2].resource_type === "image" ? (
                                <img src={media[2].url} alt="content" className=" h-1/2 object-cover" />
                            ) : (
                                <video src={media[2].url} className="w-full h-full object-cover" />
                            )}
                            {media.length > 3 && (
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">{media.length - 3} more images</span>
                                </div> 
                            )}
                         </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* Shared Post Info */}
        {post.sharedFrom && (
            <div className="p-4 bg-gray-50 rounded-lg mx-4 mt-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <i className="bx bx-share text-gray-500"></i>
                    <span className="text-sm text-gray-600">Shared from <strong>{post.sharedFrom.author?.name}</strong></span>
                </div>
                {/* You could render a mini version of the shared post here if needed */}
            </div>
        )}

        {/* Caption */}
        <div className="p-6">
            <p className="text-gray-800 text-lg whitespace-pre-wrap leading-relaxed">
                {renderCaption(caption)}
            </p>
        </div>

        {/* Followed By Bubble */}
        {followedLikes && followedLikes.length > 0 && (
            <div className="px-6 py-2 flex items-center gap-3">
                <div className="flex -space-x-3">
                    {followedLikes.map((u) => (
                        <img 
                            key={u._id}
                            src={u.avatar?.url || u.avatar} 
                            alt={u.username}
                            className="w-8 h-8 rounded-full border-2 border-white"
                            title={`Liked by ${u.name}`}
                        />
                    ))}
                </div>
                <div className="text-sm text-gray-600">
                    Liked by <span className="font-semibold">{followedLikes[0].name}</span>
                    {followedLikes.length > 1 && <span> and others you follow</span>}
                </div>
            </div>
        )}

        {/* Interaction Bar */}
        <div className="px-6 py-4 border-t border-gray-100 grid grid-cols-4 gap-4">
            {/* Like */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm font-medium">{likesCount} Likes</span>
            </button>

            {/* Comment */}
            <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-500 group transition">
                <i className="bx bx-message-circle text-3xl group-active:scale-90 transition-transform"></i>
                <span className="text-sm font-medium">{commentsCount} Comments</span>
            </button>

            {/* Bookmark */}
            <button 
                onClick={handleBookmark}
                disabled={bookmarking}
                className={`flex flex-col items-center gap-1 group transition ${isBookmarked ? "text-yellow-500" : "text-gray-500 hover:text-yellow-500"}`}
            >
                <i className={`bx ${isBookmarked ? 'bxs-bookmark' : 'bx-bookmark'} text-3xl group-active:scale-90 transition-transform`}></i>
                <span className="text-sm font-medium">{bookmarkCount} Saved</span>
            </button>

            {/* Share */}
            <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-500 group transition">
                <i className="bx bx-share text-3xl group-active:scale-90 transition-transform"></i>
                <span className="text-sm font-medium">{shareCount} Shares</span>
            </button>
        </div>

        {/* Comments Section */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Comments</h3>
            
            {/* Comment Input */}
            <div className="mb-6 relative">
                <textarea
                    ref={commentInputRef}
                    value={commentText}
                    onChange={handleCommentChange}
                    placeholder="Write a comment... (use @ to mention)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows="2"
                />
                {isSubmittingComment && (
                    <div className="absolute right-3 bottom-3">
                         <div className="animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
                    </div>
                )}
                {!isSubmittingComment && commentText.trim() && (
                    <button 
                        onClick={handlePostComment}
                        className="absolute right-3 bottom-3 text-red-500 font-semibold hover:text-red-600 text-sm"
                    >
                        Post
                    </button>
                )}

                {/* Mention Suggestions */}
                {showMentions && mentionResults.length > 0 && (
                    <ul className="absolute bottom-full left-0 w-64 bg-white border border-gray-200 shadow-xl rounded-lg mb-1 max-h-48 overflow-y-auto z-10">
                        {mentionResults.map(u => (
                            <li 
                                key={u._id} 
                                onClick={() => selectMention(u)}
                                className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                            >
                                <img 
                                    src={u.avatar?.url || u.avatar || "/default-avatar.png"} 
                                    alt={u.username}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-800">{u.name}</span>
                                    <span className="text-xs text-gray-500">@{u.username}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            {/* Root Comments */}
            {rootComments && rootComments.length > 0 ? (
                <div className="space-y-4">
                    {rootComments.map(comment => (
                        <div key={comment._id} className="flex gap-3">
                             <Link to={`/profile/${comment.author._id}`}>
                                <img 
                                    src={comment.author.avatar?.url || "/default-avatar.png"} 
                                    alt={comment.author.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                             </Link>
                             <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <Link to={`/profile/${comment.author._id}`} className="font-semibold text-sm hover:underline">
                                        {comment.author.name}
                                    </Link>
                                    <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className="text-gray-700 text-sm">{comment.content}</p>
                             </div>
                        </div>
                    ))}
                    {commentsCount > rootComments.length && (
                        <button className="text-blue-500 text-sm font-medium hover:underline mt-2">
                            View all comments
                        </button>
                    )}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
            )}
        </div>
      </div>

      {/* Media Modal */}
      {selectedMediaIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
            <button 
                onClick={() => setSelectedMediaIndex(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            >
                <i className='bx bx-x text-4xl'></i>
            </button>
            
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMediaIndex((prev) => prev > 0 ? prev - 1 : media.length - 1);
                }}
                className="absolute left-4 text-white hover:text-gray-300 z-50 p-2"
            >
                <i className='bx bx-arrow-left-stroke text-4xl'></i>
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
                    setSelectedMediaIndex((prev) => prev < media.length - 1 ? prev + 1 : 0);
                }}
                className="absolute right-4 text-white hover:text-gray-300 z-50 p-2"
            >
                <i className='bx bx-arrow-right-stroke text-4xl'></i>
            </button>
            
            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                {selectedMediaIndex + 1} / {media.length}
            </div>
        </div>
      )}
    </div>
  );
};

export default PostDetailsPage;
