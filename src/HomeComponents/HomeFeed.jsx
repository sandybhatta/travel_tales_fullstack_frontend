import React, { useState, useEffect, useRef, useCallback } from "react";
import CreatePost from "./CreatePost";
import { getUniversalFeed } from "../Apis/feedApi.js";
import { togglePostLike, toggleTripLike } from "../Apis/likeApi.js";
import { createRootComment } from "../Apis/commentApi.js";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import LikesModal from "./LikesModal.jsx";

const HomeFeed = ({ createModal, setCreateModal }) => {
  const navigate = useNavigate();
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [likingStates, setLikingStates] = useState({});
  const [selectedPostId, setSelectedPostId] = useState(null); // For Likes Modal
  const [selectedLikeType, setSelectedLikeType] = useState("post"); // "post" or "trip"
  
  // Tagged Users Modal State
  const [taggedModalData, setTaggedModalData] = useState([]);
  const [isTaggedModalOpen, setIsTaggedModalOpen] = useState(false);

  // Comment Input State
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const { _id } = useSelector((state) => state.user);
  
  const observerTarget = useRef(null);

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const fetchFeed = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    
    setError("");
    try {
      const response = await getUniversalFeed(pageNum, 20);
      const items = response.feed || [];
      
      setFeedItems((prev) => (pageNum === 1 ? items : [...prev, ...items]));
      setHasMore(response.hasMore);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load feed");
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
    }
  };

  // Intersection Observer for Infinite Scroll
  const lastItemElementRef = useCallback(
    (node) => {
      if (loading || loadingMore || !hasMore) return;
      if (observerTarget.current) observerTarget.current.disconnect();

      observerTarget.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      });

      if (node) observerTarget.current.observe(node);
    },
    [loading, loadingMore, hasMore, page]
  );

  const handleLike = async (itemId, currentLiked, type) => {
    if (likingStates[itemId]) return;
    
    setLikingStates((prev) => ({ ...prev, [itemId]: true }));
    const newLikedState = !currentLiked;
    let previousStateItems = null;

    // Optimistic update
    setFeedItems((prev) => {
        previousStateItems = prev; // Capture current state for rollback
        return prev.map((item) => {
            const data = item.data;
            if (data._id === itemId) {
            const currentLikes = data.likes || [];
            const newLikes = newLikedState
                ? [...currentLikes, { _id, username: "You", avatar: "" }] 
                : currentLikes.filter((l) => (l._id || l).toString() !== _id.toString());
            
            return {
                ...item,
                data: {
                ...data,
                likes: newLikes,
                isLikedByViewer: newLikedState,
                likeCount: newLikes.length
                },
            };
            }
            return item;
        })
    });

    try {
      if (type === "post") {
        await togglePostLike(itemId);
      } else {
        await toggleTripLike(itemId);
      }
    } catch (err) {
      // Rollback
      console.error("Error toggling like:", err);
      if(previousStateItems) setFeedItems(previousStateItems);
    } finally {
      setLikingStates((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleCommentSubmit = async (postId, mentions) => {
    if(!commentText.trim()) return;
    
    setCommentLoading(true);
    try {
        await createRootComment(postId, commentText, mentions);
        // Optimistically add comment count? Or just clear input.
        // For now, clear input and close.
        setCommentText("");
        setActiveCommentPostId(null);
        
        // Update comment count in feed (Optimistic)
        setFeedItems(prev => prev.map(item => {
            if(item.data._id === postId) {
                return {
                    ...item,
                    data: {
                        ...item.data,
                        commentCount: (item.data.commentCount || 0) + 1
                    }
                }
            }
            return item;
        }));

    } catch (error) {
        console.error("Failed to post comment", error);
    } finally {
        setCommentLoading(false);
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
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getTripStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < now) return { text: "Completed", color: "bg-emerald-500" };
    if (start > now) return { text: "Upcoming", color: "bg-amber-500" };
    return { text: "Ongoing", color: "bg-blue-500" };
  };

  // --- Render Helpers ---

  // Helper to parse caption and highlight mentions
  const renderCaption = (text, mentions = []) => {
    if (!text) return null;
    
    // Create a map for faster lookup: username -> _id
    const mentionMap = new Map();
    mentions.forEach(m => {
        if(m.username) mentionMap.set(m.username.toLowerCase(), m._id);
    });

    const words = text.split(/(\s+)/); // Split by space but keep delimiters

    return (
        <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
            {words.map((word, index) => {
                if (word.startsWith("@")) {
                    const username = word.slice(1).toLowerCase();
                    // Clean punctuation from end if needed (simple version)
                    const cleanUsername = username.replace(/[^a-z0-9_.]/g, ""); 
                    
                    if (mentionMap.has(cleanUsername)) {
                        const userId = mentionMap.get(cleanUsername);
                        return (
                            <Link 
                                key={index} 
                                to={`/profile/${userId}`} 
                                className="text-red-500 font-medium hover:underline"
                            >
                                {word}
                            </Link>
                        );
                    }
                }
                return word;
            })}
        </p>
    );
  };

  const renderHeader = (author, taggedUsers, date, trip) => (
    <div className="flex items-center gap-3">
        <Link to={`/profile/${author?._id}`}>
            <img
                src={author?.avatar?.url || author?.avatar || "/default-avatar.png"}
                alt={author?.username}
                className="w-11 h-11 rounded-full object-cover border border-gray-200"
            />
        </Link>
        <div>
            <div className="flex flex-col">
                <div className="flex items-center flex-wrap gap-1">
                    <Link to={`/profile/${author?._id}`} className="font-bold text-gray-900 hover:text-red-500 transition">
                        {author?.username}
                    </Link>
                    
                    {taggedUsers.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 ml-1">
                            <span>with</span>
                            <div className="flex items-center gap-1">
                                <Link to={`/profile/${taggedUsers[0]._id}`} title={taggedUsers[0].username}>
                                    <img 
                                        src={taggedUsers[0].avatar?.url || taggedUsers[0].avatar || "/default-avatar.png"} 
                                        className="w-5 h-5 rounded-full border border-gray-200 object-cover" 
                                        alt={taggedUsers[0].username}
                                    />
                                </Link>
                                {taggedUsers.length > 1 && (
                                    <span 
                                        className="cursor-pointer font-medium hover:text-red-500 hover:underline"
                                        onClick={() => {
                                            setTaggedModalData(taggedUsers);
                                            setIsTaggedModalOpen(true);
                                        }}
                                    >
                                        +{taggedUsers.length - 1} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                {trip && (
                    <span className="text-xs text-gray-500">
                        in <Link to={`/trip/${trip._id}`} className="font-medium text-red-500 hover:underline">{trip.title}</Link>
                    </span>
                )}
                
                {date && <p className="text-xs text-gray-400 font-medium mt-0.5">{formatDate(date)}</p>}
            </div>
        </div>
    </div>
  );

  const renderPost = (item, index) => {
    const data = item.data;
    const isShared = !!data.sharedFrom;
    
    // Shared Post Context (Outer)
    const sharedAuthor = isShared ? data.author : null;
    const sharedCaption = isShared ? data.caption : null;
    const sharedMentions = isShared ? data.mentions : [];
    const sharedTaggedUsers = isShared ? data.taggedUsers : [];

    // Original Post Context (Inner or Main)
    const originalPost = isShared ? data.sharedFrom : data;
    const originalAuthor = originalPost.author;
    const originalCaption = originalPost.caption;
    const originalMentions = originalPost.mentions || [];
    const originalTaggedUsers = originalPost.taggedUsers || [];
    const originalMedia = originalPost.media || [];
    const trip = originalPost.tripId;

    const isLiked = data.isLikedByViewer;
    const likesCount = data.likes?.length || 0;
    const commentsCount = data.comments?.length || 0;

    return (
      <div
        key={data._id}
        ref={index === feedItems.length - 1 ? lastItemElementRef : null}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
      >
        {/* Clickable Container for Shared Post Context */}
        <div 
            className="cursor-pointer"
            onClick={(e) => {
                // Navigate to post details unless clicking a link or button
                if (!e.target.closest('a') && !e.target.closest('button')) {
                    navigate(`/post/${data._id}`);
                }
            }}
        >
            {/* Header */}
            <div className="p-4">
                {isShared ? (
                    // Shared Post Header
                    renderHeader(sharedAuthor, sharedTaggedUsers, data.createdAt, null)
                ) : (
                    // Original Post Header
                    renderHeader(originalAuthor, originalTaggedUsers, data.createdAt, trip)
                )}
            </div>

            {/* Content Body */}
            <div className="px-4 pb-2">
                {/* Shared Caption */}
                {isShared && sharedCaption && (
                    <div className="mb-3">
                        {renderCaption(sharedCaption, sharedMentions)}
                    </div>
                )}

                {isShared ? (
                    // Shared Post Inner Box
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Link entire box to original post, except internal links */}
                        <div className="block">
                            {/* Original Post Header */}
                            <div className="p-3 bg-gray-50/50 border-b border-gray-100">
                                {renderHeader(originalAuthor, originalTaggedUsers, null, trip)}
                            </div>

                            <Link to={`/post/${originalPost._id}`} className="block hover:bg-gray-50 transition-colors">
                                {/* Original Caption */}
                                {originalCaption && (
                                    <div className={`px-4 py-3 ${originalMedia.length > 0 ? "pb-2" : ""}`}>
                                        {renderCaption(originalCaption, originalMentions)}
                                    </div>
                                )}

                                {/* Original Media */}
                                {originalMedia.length > 0 && (
                                    <div className="relative w-full bg-gray-50">
                                        {originalMedia[0].resource_type === "image" ? (
                                        <img
                                            src={originalMedia[0].url}
                                            alt="Post content"
                                            className="w-full h-auto max-h-[500px] object-cover"
                                            style={{ minHeight: "200px" }}
                                        />
                                        ) : (
                                        <video src={originalMedia[0].url} controls className="w-full h-auto max-h-[500px]" />
                                        )}
                                        
                                        {/* Media Count Badge */}
                                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                            <i className="bx bx-images"></i> {originalMedia.length}
                                        </div>
                                    </div>
                                )}
                            </Link>
                        </div>
                    </div>
                ) : (
                    // Standard Post Content
                    <>
                        {originalCaption && (
                            <div className={`mb-3 ${originalMedia.length > 0 ? "mb-3" : ""}`}>
                                {renderCaption(originalCaption, originalMentions)}
                            </div>
                        )}

                        {originalMedia.length > 0 && (
                            <div className="relative w-full bg-gray-50 rounded-xl overflow-hidden group cursor-pointer -mx-4 md:mx-0 w-[calc(100%+2rem)] md:w-full">
                                {/* Media is already inside the container which is clickable, 
                                    but we can keep the Link wrapper for explicit semantic meaning or remove it since the parent div handles navigation.
                                    However, keeping Link might cause nested interactive elements issues if not careful.
                                    The user asked to link the "post box", which we did with the parent div. 
                                    So we can remove the inner Link to avoid nested links/click handlers conflict,
                                    OR keep it but ensure the parent handler doesn't fire double. 
                                    The parent handler checks !e.target.closest('a').
                                    So if we keep Link here, clicking media will trigger Link (good).
                                    Clicking whitespace will trigger parent (good).
                                */}
                                <Link to={`/post/${data._id}`}>
                                    {originalMedia[0].resource_type === "image" ? (
                                    <img
                                        src={originalMedia[0].url}
                                        alt="Post content"
                                        className="w-full h-auto max-h-[600px] object-cover"
                                    />
                                    ) : (
                                    <video src={originalMedia[0].url} controls className="w-full h-auto max-h-[600px]" />
                                    )}
                                    
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                        <i className="bx bx-images"></i> {originalMedia.length}
                                    </div>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>

        {/* Action Bar */}
        <div className="px-4 py-3 mt-1 flex items-center justify-between border-t border-gray-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLike(data._id, isLiked, "post")}
                disabled={likingStates[data._id]}
                className={`transition-colors duration-200 group ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
              >
                <i className={`bx ${isLiked ? "bxs-heart" : "bx-heart"} text-2xl transform group-active:scale-90 transition-transform`}></i>
              </button>
              {likesCount > 0 && (
                <button
                  onClick={() => {
                      setSelectedPostId(data._id);
                      setSelectedLikeType("post");
                  }}
                  className="font-medium text-sm text-gray-600 hover:text-gray-900 hover:underline"
                >
                  {likesCount}
                </button>
              )}
            </div>
            
            <button 
                onClick={() => {
                    if (activeCommentPostId === data._id) {
                        setActiveCommentPostId(null);
                    } else {
                        setActiveCommentPostId(data._id);
                    }
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors duration-200"
            >
              <i className="bx bx-message-circle-reply text-2xl"></i>
              <span className="font-medium text-sm">{commentsCount > 0 && commentsCount}</span>
            </button>

            <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors duration-200">
               <i className="bx bx-share-alt text-2xl"></i>
            </button>
          </div>
          
          {data.isBookmarkedByViewer && (
             <div className="text-yellow-500">
                 <i className="bx bxs-bookmark text-xl"></i>
             </div>
          )}
        </div>
        
        {/* Comment Input */}
        {activeCommentPostId === data._id && (
            <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50 animate-fade-in">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleCommentSubmit(data._id, mentions);
                            }
                        }}
                    />
                    <button 
                        onClick={() => handleCommentSubmit(data._id, mentions)}
                        disabled={!commentText.trim() || commentLoading}
                        className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {commentLoading ? <i className="bx bx-loader-alt animate-spin"></i> : "Post"}
                    </button>
                </div>
            </div>
        )}

      </div>
    );
  };

  const renderTrip = (item, index) => {
    const data = item.data;
    const owner = data.user;
    const status = getTripStatus(data.startDate, data.endDate);
    const isLiked = data.isLikedByViewer;
    const likesCount = data.likes?.length || 0;

    return (
      <div
        key={data._id}
        ref={index === feedItems.length - 1 ? lastItemElementRef : null}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
      >
        {/* User Info Header */}
        <div className="p-4 flex items-center gap-3">
             <Link to={`/profile/${owner?._id}`}>
                <img src={owner?.avatar?.url || owner?.avatar || "/default-avatar.png"} className="w-10 h-10 rounded-full object-cover" alt="" />
             </Link>
             <div className="flex flex-col">
                 <span className="text-gray-900 font-bold text-sm">
                    <Link to={`/profile/${owner?._id}`}>{owner?.username}</Link> 
                    <span className="font-normal text-gray-500"> created a trip</span>
                 </span>
                 <span className="text-xs text-gray-400">{formatDate(data.createdAt)}</span>
             </div>
        </div>

        {/* Card Body */}
        <Link to={`/trip/${data._id}`} className="block relative group-hover:opacity-95 transition-opacity">
            <div className="relative h-64 w-full bg-gray-100">
                <img
                    src={data.coverPhoto?.url || data.coverPhoto}
                    alt={data.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
                
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 ${status.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm`}>
                    {status.text}
                </div>

                {/* Bottom Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="text-2xl font-bold mb-1 leading-tight shadow-black drop-shadow-md">{data.title}</h3>
                    <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                        <span className="flex items-center gap-1">
                            <i className="bx bx-calendar"></i>
                            {formatTripDate(data.startDate)} - {formatTripDate(data.endDate)}
                        </span>
                        {data.destinations?.length > 0 && (
                             <span className="flex items-center gap-1">
                                <i className="bx bx-map"></i>
                                {data.destinations[0].city || "Unknown"}
                                {data.destinations.length > 1 && ` +${data.destinations.length - 1}`}
                             </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>

        {/* Footer Actions */}
        <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                     <button
                        onClick={() => handleLike(data._id, isLiked, "trip")}
                        disabled={likingStates[data._id]}
                        className={`flex items-center gap-1.5 transition-colors ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
                     >
                        <i className={`bx ${isLiked ? "bxs-heart" : "bx-heart"} text-2xl`}></i>
                     </button>
                     {likesCount > 0 && (
                         <button 
                             onClick={() => {
                                 setSelectedPostId(data._id);
                                 setSelectedLikeType("trip");
                             }}
                             className="font-semibold text-sm text-gray-600 hover:text-gray-900 hover:underline"
                         >
                            {likesCount}
                         </button>
                     )}
                 </div>

                 <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-gray-600">
                    <i className="bx bx-group text-lg"></i>
                    <span className="font-semibold text-sm">{data.acceptedFriends?.length || 0}</span>
                 </div>
            </div>
            
            <Link to={`/trip/${data._id}`} className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1">
                View Details <i className="bx bx-chevron-right"></i>
            </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-50/50 overflow-x-hidden">
      <div className="w-full max-w-[640px] px-4 py-6 space-y-6">
        
        {/* Create Post Widget */}
        <CreatePost createModal={createModal} setCreateModal={setCreateModal} />

        {/* Loading Initial */}
        {loading && (
          <div className="flex flex-col gap-4">
             {[1, 2].map(i => (
                 <div key={i} className="bg-white rounded-2xl h-64 animate-pulse shadow-sm border border-gray-100"></div>
             ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
           <div className="text-center py-10">
              <div className="bg-red-50 text-red-500 px-4 py-3 rounded-xl inline-block">
                 <i className="bx bx-error-circle mr-2"></i> {error}
              </div>
              <button onClick={() => fetchFeed(1)} className="block mx-auto mt-4 text-sm font-medium text-gray-600 hover:text-gray-900 underline">Try Again</button>
           </div>
        )}

        {/* Feed List */}
        {!loading && !error && (
            <div className="space-y-6">
                {feedItems.map((item, index) => {
                    if (item.type === "post") return renderPost(item, index);
                    if (item.type === "trip") return renderTrip(item, index);
                    return null;
                })}
            </div>
        )}

        {/* Empty State */}
        {!loading && !error && feedItems.length === 0 && (
             <div className="text-center py-20">
                <div className="bg-white p-8 rounded-full inline-flex mb-4 shadow-sm">
                    <i className="bx bx-world text-5xl text-gray-300"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Your feed is empty</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Follow more people or create a trip to see updates here!</p>
             </div>
        )}

        {/* Load More Spinner */}
        {loadingMore && (
           <div className="py-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent"></div>
           </div>
        )}
        
        {/* End of Feed */}
        {!hasMore && feedItems.length > 0 && (
            <div className="text-center py-8 text-gray-400 text-sm font-medium">
                You're all caught up! ✨
            </div>
        )}

      </div>

      <LikesModal
        isOpen={selectedPostId !== null}
        onClose={() => setSelectedPostId(null)}
        postId={selectedPostId}
        type={selectedLikeType}
      />

      {/* Tagged Users Modal */}
      {isTaggedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setIsTaggedModalOpen(false)}>
            <div className="bg-white rounded-2xl w-[90%] max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-gray-800">Tagged Users</h3>
                    <button onClick={() => setIsTaggedModalOpen(false)} className="text-gray-500 hover:text-red-500">
                        <i className="bx bx-x text-2xl"></i>
                    </button>
                </div>
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                    {taggedModalData.map(user => (
                        <Link 
                            key={user._id} 
                            to={`/profile/${user._id}`} 
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition"
                            onClick={() => setIsTaggedModalOpen(false)}
                        >
                            <img src={user.avatar?.url || user.avatar || "/default-avatar.png"} className="w-10 h-10 rounded-full object-cover" alt="" />
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800 text-sm">{user.name || user.username}</span>
                                <span className="text-xs text-gray-500">@{user.username}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default HomeFeed;
