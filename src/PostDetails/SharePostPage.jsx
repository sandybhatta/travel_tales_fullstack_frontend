import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getPostDetails,
  sharePost,
  searchMentions,
} from "../Apis/postApi";
import PostMedia from "./components/PostMedia";
import TripInfoCard from "./components/TripInfoCard";

const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case "public": return "bx-globe";
      case "followers": return "bx-group";
      case "close_friends": return "bx-user-check";
      case "private": return "bx-lock";
      default: return "bx-globe";
    }
};

const SharePostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  // Using useSelector to access user data including following list directly
  const { _id: currentUserId, avatar, name, following: userFollowings } = useSelector((state) => state.user);

  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");

  // Share Form State
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState({ city: "", state: "", country: "" });
  const [taggedUsers, setTaggedUsers] = useState([]); // Array of IDs
  const [taggedUserObjects, setTaggedUserObjects] = useState([]); // Array of User Objects for display
  
  // Tagging State
  // Use followings from Redux state as initial value if available, or empty array
  const [followings, setFollowings] = useState(userFollowings || []);
  const [tagSearch, setTagSearch] = useState("");
  const [showAllFollowings, setShowAllFollowings] = useState(false);

  // Mention Logic State
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentions, setMentions] = useState([]); // Array of user objects
  const [mentionLoading, setMentionLoading] = useState(false);
  
  const captionRef = useRef(null);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);
  
  // Sync followings from Redux when it changes
  useEffect(() => {
    if (userFollowings) {
        setFollowings(userFollowings);
    }
  }, [userFollowings]);

  const fetchPostDetails = async () => {
    try {
      const data = await getPostDetails(postId);
      setPostData(data);
    } catch (err) {
      setError("Failed to load post details");
    } finally {
      setLoading(false);
    }
  };

  // Handle Mention Search
  useEffect(() => {
    if (mentionQuery) {
      const fetchMentionUsers = async () => {
        setMentionLoading(true);
        try {
          const data = await searchMentions(mentionQuery);
          setMentionResults(data.users || []);
        } catch (err) {
          console.error("Search mentions failed", err);
        } finally {
          setMentionLoading(false);
        }
      };

      const timer = setTimeout(fetchMentionUsers, 300);
      return () => clearTimeout(timer);
    } else {
      setMentionResults([]);
    }
  }, [mentionQuery]);

  const handleCaption = (e) => {
    const value = e.target.value;
    if (value.length > 1000) return;

    setCaption(value);

    // Auto-resize textarea
    if (captionRef.current) {
        captionRef.current.style.height = "auto";
        captionRef.current.style.height = captionRef.current.scrollHeight + "px";
    }

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    
    // Detect @username pattern
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);

    if (match) {
      setMentionQuery(match[1]);
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
      setMentionQuery("");
    }
  };

  const handleMentionSelect = (user) => {
    const textarea = captionRef.current;
    const cursorPosition = textarea.selectionStart;

    const before = caption.slice(0, cursorPosition);
    const after = caption.slice(cursorPosition);

    // replace "@query" with "@username "
    const newBefore = before.replace(/@([a-zA-Z0-9_]*)$/, `@${user.username} `);

    setCaption(newBefore + after);

    // store mentioned users
    setMentions((prev) => {
      if (prev.some((u) => u._id === user._id)) return prev;
      return [...prev, user];
    });

    setShowMentionList(false);
    setMentionQuery("");
    
    setTimeout(() => {
        if(captionRef.current) {
            captionRef.current.focus();
        }
    }, 0);
  };

  const renderStyledCaption = (text) => {
    if (!text) return null;

    const words = text.split(/(\s+)/); // keep spaces

    return words.map((word, index) => {
      if (word.startsWith("@")) {
        const username = word.slice(1);
        const isMentioned = mentions.some((m) => m.username === username);

        if (isMentioned) {
          return (
            <span key={index} className="text-red-500 text-sm font-normal">
              {word}
            </span>
          );
        }
      }
      return (
        <span key={index} className="text-sm font-normal">
          {word}
        </span>
      );
    });
  };

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const mentionIds = mentions.map(m => m._id);
      
      const payload = {
        caption: caption,
        mentions: mentionIds,
        taggedUsers: taggedUsers,
        location: location
      };

      await sharePost(postId, payload);
      navigate("/home"); 
    } catch (err) {
      console.error(err);
      setError("Failed to share post");
    } finally {
      setSharing(false);
    }
  };

  const toggleTag = (user) => {
    const userId = user._id;
    if (taggedUsers.includes(userId)) {
      setTaggedUsers(prev => prev.filter(id => id !== userId));
      setTaggedUserObjects(prev => prev.filter(u => u._id !== userId));
    } else {
      setTaggedUsers(prev => [...prev, userId]);
      setTaggedUserObjects(prev => [...prev, user]);
    }
  };

  const filteredFollowings = followings.filter(user => 
    user.name.toLowerCase().includes(tagSearch.toLowerCase()) ||
    user.username.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const visibleFollowings = showAllFollowings ? filteredFollowings : filteredFollowings.slice(0, 2);

  if (loading) {
    return (
        <div className="max-w-2xl mx-auto bg-white min-h-screen shadow-xl pb-20 p-4">
            {/* Header Shimmer */}
            <div className="flex justify-between items-center mb-6 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-32 h-6 bg-gray-200 rounded"></div>
                <div className="w-16 h-8 bg-gray-200 rounded-lg"></div>
            </div>

            {/* User Info Shimmer */}
            <div className="flex items-center gap-3 mb-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex flex-col gap-2">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
            </div>

            {/* Textarea Shimmer */}
            <div className="w-full h-32 bg-gray-200 rounded-2xl mb-6 animate-pulse"></div>

            {/* Location Shimmer */}
            <div className="mb-6 animate-pulse">
                <div className="w-24 h-5 bg-gray-200 rounded mb-3"></div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
            </div>

             {/* Tag People Shimmer */}
             <div className="mb-6 animate-pulse">
                <div className="w-24 h-5 bg-gray-200 rounded mb-3"></div>
                <div className="h-10 bg-gray-200 rounded-lg mb-2"></div>
                <div className="space-y-2">
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
            </div>

            {/* Original Post Box Shimmer */}
            <div className="border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex flex-col gap-2">
                        <div className="w-32 h-4 bg-gray-200 rounded"></div>
                        <div className="w-20 h-3 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="w-full h-16 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
    );
  }
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!postData) return null;

  const { post } = postData;
  const displayPost = post.sharedFrom ? post.sharedFrom : post;

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen shadow-none md:shadow-xl pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 sticky top-0 bg-white z-50">
        <button onClick={() => navigate(-1)} className="text-gray-600">
            <i className="bx bx-arrow-back text-2xl"></i>
        </button>
        <h1 className="text-base md:text-lg font-bold text-gray-800">Share Post</h1>
        <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              disabled={sharing}
              className="px-3 py-1.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 text-xs md:text-base"
            >
              {sharing ? "Sharing..." : "Share"}
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 text-xs md:text-base"
            >
              Cancel
            </button>
        </div>
      </div>

      <div className="p-3 md:p-4">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={avatar?.url || avatar} 
            alt={name} 
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-gray-200"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 text-sm md:text-base">{name}</span>
            <span className="text-xs md:text-sm text-gray-500">Shared a post</span>
          </div>
        </div>

        {/* Caption Input with Overlay */}
        <div className="mb-4 relative">
            <div className="relative w-full shadow-sm rounded-2xl border border-gray-100">
                {/* Styled preview (Overlay) */}
                <div
                  className="absolute inset-0 px-4 py-3 bg-white rounded-2xl
             pointer-events-none text-gray-700
             whitespace-pre-wrap break-words overflow-hidden text-sm font-normal leading-[22px]"
                >
                  {renderStyledCaption(caption)}
                </div>

                {/* Actual textarea */}
                <textarea
                  value={caption}
                  onChange={handleCaption}
                  ref={captionRef}
                  className="relative w-full min-h-[120px] px-4 py-3 bg-transparent
               text-transparent caret-black resize-none outline-none rounded-2xl text-sm font-normal leading-[22px] box-border"
                  placeholder="Say something about this..."
                />
            </div>
          
          {/* Mention Dropdown */}
          {showMentionList && (
            <div 
              className="absolute z-50 bg-white border border-gray-200 shadow-xl rounded-lg w-64 max-h-48 overflow-y-auto"
              style={{ top: "100%" }}
            >
              {mentionLoading && (
                  <p className="p-3 text-sm text-gray-500">Searching...</p>
              )}
              
              {!mentionLoading && mentionResults.length === 0 && (
                  <p className="p-3 text-sm text-gray-400">No users found</p>
              )}

              {!mentionLoading && mentionResults.map(user => (
                <div 
                  key={user._id}
                  onClick={() => handleMentionSelect(user)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                >
                  <img 
                    src={user.avatar?.url || user.avatar} 
                    alt={user.username} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">@{user.username}</span>
                    <span className="text-xs text-gray-500">{user.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location Section */}
        <div className="flex flex-col gap-2 border-b border-gray-100 py-4">
            <div className="flex items-center gap-2 mb-2">
                <i className="bx bx-location-plus text-xl text-red-500"></i>
                <span className="text-gray-700 font-semibold text-sm md:text-base">Add Location</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input 
                    type="text" 
                    placeholder="City" 
                    value={location.city}
                    onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
                    className="outline-none text-gray-700 bg-gray-50 px-3 py-2 rounded-lg text-sm border border-gray-200 focus:border-red-400 transition-colors"
                />
                <input 
                    type="text" 
                    placeholder="State" 
                    value={location.state}
                    onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
                    className="outline-none text-gray-700 bg-gray-50 px-3 py-2 rounded-lg text-sm border border-gray-200 focus:border-red-400 transition-colors"
                />
                <input 
                    type="text" 
                    placeholder="Country" 
                    value={location.country}
                    onChange={(e) => setLocation(prev => ({ ...prev, country: e.target.value }))}
                    className="outline-none text-gray-700 bg-gray-50 px-3 py-2 rounded-lg text-sm border border-gray-200 focus:border-red-400 transition-colors"
                />
            </div>
        </div>

        {/* Tag People Section */}
        <div className="flex flex-col gap-3 py-4 mb-6">
            <div className="flex items-center gap-2">
                <i className="bx bx-user-plus text-xl text-red-500"></i>
                <span className="text-gray-700 font-semibold text-sm md:text-base">Tag People</span>
            </div>

            {/* Selected Tags (Chips) */}
            {taggedUserObjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {taggedUserObjects.map(user => (
                        <div key={user._id} className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full text-sm border border-red-100">
                            <span>@{user.username}</span>
                            <button onClick={() => toggleTag(user)} className="hover:text-red-800 flex items-center justify-center w-4 h-4 rounded-full hover:bg-red-100 transition-colors">
                                <i className="bx bx-x text-lg"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                <input 
                    type="text"
                    placeholder="Search followers..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 transition-colors"
                />
            </div>

            {/* Followings List */}
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mt-2 custom-scrollbar">
                {visibleFollowings.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-2">No users found</p>
                ) : (
                    visibleFollowings.map(user => (
                        <div 
                            key={user._id} 
                            onClick={() => toggleTag(user)}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-100 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <img 
                                    src={user.avatar?.url || user.avatar} 
                                    alt={user.name} 
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                />
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm text-gray-800">{user.name}</span>
                                    <span className="text-xs text-gray-500">@{user.username}</span>
                                </div>
                            </div>
                            {taggedUsers.includes(user._id) ? (
                                <i className="bx bxs-check-circle text-red-500 text-xl"></i>
                            ) : (
                                <i className="bx bx-plus-circle text-gray-300 text-xl"></i>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Show More Button */}
            {filteredFollowings.length > 2 && (
                <button 
                    onClick={() => setShowAllFollowings(!showAllFollowings)}
                    className="text-red-500 text-sm font-medium hover:underline self-start mt-1"
                >
                    {showAllFollowings ? "Show Less" : `Show More (${filteredFollowings.length - 2} others)`}
                </button>
            )}
        </div>

        {/* Original Post Preview (The Box) - Moved to Bottom */}
        <div className="border border-gray-200 rounded-xl overflow-hidden pointer-events-none select-none bg-gray-50 mb-6">
            {/* Inner Header */}
            <div className="p-4 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                    <img
                        src={displayPost.author?.avatar?.url || displayPost.author?.avatar}
                        alt={displayPost.author?.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm">
                        {displayPost.author?.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{new Date(displayPost.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <i className={`bx ${getVisibilityIcon(displayPost.visibility)} text-xl text-red-500`}></i>
                        </div>
                    </div>
                </div>
                {/* Tagged Users in Original Post - Updated Display */}
                {displayPost.taggedUsers && displayPost.taggedUsers.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">With:</span>
                        <div className="flex items-center -space-x-2">
                            {displayPost.taggedUsers.slice(0, 2).map((u, i) => (
                                <img 
                                    key={u._id || i}
                                    src={u.avatar?.url || u.avatar}
                                    alt={u.name}
                                    className="w-6 h-6 rounded-full object-cover border border-white ring-1 ring-gray-100"
                                    title={u.name}
                                />
                            ))}
                        </div>
                        {displayPost.taggedUsers.length > 2 && (
                            <span className="text-xs text-gray-500 ml-1">
                                +{displayPost.taggedUsers.length - 2} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Inner Caption */}
            {displayPost.caption && (
              <div className="p-4 pb-2 bg-white">
                <p className="text-gray-800 whitespace-pre-wrap line-clamp-3 text-sm">
                  {displayPost.caption}
                </p>
              </div>
            )}

            {/* Inner Media */}
            <PostMedia media={displayPost.media} />

            {/* Inner Trip */}
            <TripInfoCard trip={displayPost.tripId} />
        </div>

      </div>
    </div>
  );
};

export default SharePostPage;
