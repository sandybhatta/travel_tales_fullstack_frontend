import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPostComments, getReplies, createComment, replyToComment } from "../Apis/postApi";
import { searchMentionableUsers } from "../Apis/userApi";
import mainApi from "../Apis/axios";

// Crown Icons
const GoldenCrown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFD700" className="w-5 h-5 inline-block mr-1">
        <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
    </svg>
);

const SilverCrown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#C0C0C0" className="w-5 h-5 inline-block mr-1">
        <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
    </svg>
);

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const renderCommentContent = (text, mentions = []) => {
  if (!text) return null;
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
            className="text-red-500 hover:underline font-medium"
          >
            {part}
          </Link>
        );
      }
    }
    return part;
  });
};

const CommentItem = ({ 
    comment, 
    onReplyClick, 
    onLike, 
    processingLikes, 
    currentUserId, 
    isHeader = false, 
    levelIndex = -1,
    onClick 
}) => {
    const isLiked = comment.hasLiked;
    
    // Determine crown/icon based on header level
    let HeaderIcon = null;
    let HeaderTitle = null;

    if (isHeader) {
        if (levelIndex === 0) {
            HeaderIcon = <GoldenCrown />;
            HeaderTitle = <span className="text-xs font-bold text-yellow-600 uppercase tracking-wide">Root Comment</span>;
        } else {
            HeaderIcon = <SilverCrown />;
            HeaderTitle = <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Parent {levelIndex}</span>;
        }
    }

    return (
        <div 
            onClick={onClick}
            className={`flex flex-col ${isHeader ? "mb-4 border-b border-gray-100 pb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition" : "cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"}`}
        >
             {isHeader && (
                <div className="flex items-center gap-1 mb-2">
                    {HeaderIcon}
                    {HeaderTitle}
                </div>
            )}
            
            <div className="flex gap-3">
                <div onClick={(e) => e.stopPropagation()}>
                    <Link to={`/profile/${comment.author._id}`}>
                        <img 
                            src={comment.author.avatar?.url || comment.author.avatar || "/default-avatar.png"} 
                            alt={comment.author.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    </Link>
                </div>
                <div className="flex-1">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                            <Link 
                                to={`/profile/${comment.author._id}`} 
                                className="font-semibold text-sm hover:underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {comment.author.name}
                            </Link>
                            <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{renderCommentContent(comment.content, comment.mentions)}</p>
                    </div>
                    {/* Comment Actions - ONLY SHOW IF NOT HEADER */}
                    {!isHeader && (
                        <div className="flex items-center gap-4 mt-1 ml-2">
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLike(comment._id);
                                }}
                                className={`flex items-center gap-1 text-xs cursor-pointer transition ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"} ${processingLikes.has(comment._id) ? "opacity-50 pointer-events-none" : ""}`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill={isLiked ? "currentColor" : "none"}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>{comment.likes?.length || 0} Likes</span>
                            </div>
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent double triggering if parent is clicked
                                    onReplyClick(comment);
                                }}
                                className="flex items-center gap-1 text-gray-500 text-xs cursor-pointer hover:text-blue-500"
                            >
                                <i className='bx bx-message-circle-reply text-base'></i>
                                <span>{comment.replyCount || 0} Replies</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CommentSection = ({ postId, canComment, privacyMessage, onCommentAdded }) => {
  const { _id: currentUserId } = useSelector((state) => state.user);
  
  // Navigation Stack: [] means root view.
  const [navigationStack, setNavigationStack] = useState([]);
  
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingCommentLikes, setProcessingCommentLikes] = useState(new Set());
  
  // Input State
  const [commentText, setCommentText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState([]);
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = useRef(null);

  // Load comments when navigation stack changes
  useEffect(() => {
    fetchComments();
  }, [navigationStack, postId]);

  // Debounce user search for mentions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (showMentions && mentionQuery) {
          try {
              const res = await searchMentionableUsers(mentionQuery); 
              setMentionResults(res.users || []);
          } catch (err) {
              console.error("User search failed", err);
          }
      } else {
          setMentionResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [mentionQuery, showMentions]);

  const fetchComments = async () => {
    setLoading(true);
    try {
        if (navigationStack.length === 0) {
            // Load Root Comments
            const data = await getPostComments(postId);
            setComments(data.comments || []);
        } else {
            // Load Replies for the focused comment (last in stack)
            const parentComment = navigationStack[navigationStack.length - 1];
            const data = await getReplies(postId, parentComment._id);
            setComments(data.replies || []);
        }
    } catch (err) {
        console.error("Failed to load comments", err);
    } finally {
        setLoading(false);
    }
  };

  const handleReplyClick = (comment) => {
    setNavigationStack([...navigationStack, comment]);
    setCommentText(""); 
  };

  const handleBack = () => {
      setNavigationStack(prev => prev.slice(0, -1));
  };

  const handleGoToRoot = () => {
      setNavigationStack([]);
  }

  const handleCommentLike = async (commentId) => {
    if (processingCommentLikes.has(commentId)) return;

    setProcessingCommentLikes(prev => new Set(prev).add(commentId));

    // Optimistic update logic
    const updateLikeInList = (list) => list.map(c => {
        if (c._id === commentId) {
            const wasLiked = c.hasLiked;
            const newHasLiked = !wasLiked;
            let newLikes = c.likes || [];
            if (newHasLiked) {
                newLikes = [...newLikes, { _id: currentUserId }];
            } else {
                newLikes = newLikes.filter(like => (like._id || like) !== currentUserId);
            }
            return { ...c, hasLiked: newHasLiked, likes: newLikes };
        }
        return c;
    });

    setComments(prev => updateLikeInList(prev));
    setNavigationStack(prev => updateLikeInList(prev));

    try {
      await mainApi.post(`/api/comment/${commentId}/like`);
    } catch (err) {
      console.error("Failed to like comment", err);
      // Revert is complex here due to dual state, simplistic revert for now:
      fetchComments(); 
    } finally {
      setProcessingCommentLikes(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setCommentText(value);
    
    // Check for @
    const cursor = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursor);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtPos !== -1) {
        const textAfterAt = textBeforeCursor.slice(lastAtPos + 1);
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
    
    setMentionedUsers(prev => {
        if (!prev.find(u => u._id === user._id)) {
            return [...prev, user];
        }
        return prev;
    });

    setShowMentions(false);
    commentInputRef.current.focus();
  };

  const handleSubmit = async () => {
      if (!commentText.trim()) return;
      setIsSubmitting(true);
      try {
          const finalMentions = mentionedUsers
            .filter(u => commentText.includes(`@${u.username}`))
            .map(u => u._id);

          if (navigationStack.length === 0) {
              // Create Root Comment
              await createComment(postId, commentText, finalMentions);
          } else {
              // Create Reply to the LAST item in stack
              const parentComment = navigationStack[navigationStack.length - 1];
              
              // Determine Root ID
              // If stack has 1 item, that item is Root.
              // If stack has > 1 item, stack[0] is Root.
              const rootComment = navigationStack[0];
              const rootId = rootComment._id;
              const parentId = parentComment._id;
              
              await replyToComment(postId, rootId, parentId, commentText, finalMentions);
          }
          
          setCommentText("");
          setMentionedUsers([]);
          await fetchComments();
          if (onCommentAdded) onCommentAdded();
      } catch (err) {
          console.error("Failed to post comment", err);
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleHeaderClick = (index) => {
        // Navigate back to this specific level
        // If stack is [A, B, C] and I click A (index 0), I want stack to be [A]
        setNavigationStack(prev => prev.slice(0, index + 1));
    };

    return (
    <div className="flex flex-col h-[600px] bg-gray-50 border-t border-gray-200 rounded-xl overflow-hidden relative">
        {/* Header Title Bar */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0 z-20">
            <h3 className="font-bold text-gray-800 text-lg">Comments</h3>
            {navigationStack.length > 0 && (
                <button 
                    onClick={handleGoToRoot}
                    className="text-sm text-red-500 hover:underline flex items-center gap-1"
                >
                    <i className='bx bx-arrow-to-top'></i>
                    See all comments
                </button>
            )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 custom-scrollbar">
            
            {/* Header: Navigation Stack (Ancestry) */}
            {navigationStack.length > 0 && (
                <div className="mb-6">
                    <button 
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition text-sm font-medium"
                    >
                        <i className='bx bx-arrow-back'></i>
                        <span>Back</span>
                    </button>

                    <div className="flex flex-col gap-4">
                        {navigationStack.map((stackComment, idx) => (
                            <CommentItem 
                                key={stackComment._id}
                                comment={stackComment} 
                                onReplyClick={() => {}} 
                                onLike={handleCommentLike} 
                                processingLikes={processingCommentLikes}
                                currentUserId={currentUserId}
                                isHeader={true}
                                levelIndex={idx}
                                onClick={() => handleHeaderClick(idx)}
                            />
                        ))}
                    </div>
                    
                    <div className="pl-2 mt-4 text-sm text-gray-500 font-medium flex items-center gap-2">
                        <i className='bx bx-subdirectory-right text-xl text-gray-400'></i>
                        <span>Replying to <span className="text-red-500">@{navigationStack[navigationStack.length - 1].author.username}</span></span>
                    </div>
                </div>
            )}

            {/* List: Current Level Comments */}
            {loading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-16 bg-gray-200 rounded-2xl"></div>
                                </div>
                            </div>
                        ))}
                    </div>
            ) : (
                <div className="space-y-4">
                    {comments && comments.length > 0 ? (
                        comments.map(comment => (
                            <CommentItem 
                                key={comment._id}
                                comment={comment}
                                onReplyClick={handleReplyClick}
                                onLike={handleCommentLike}
                                processingLikes={processingCommentLikes}
                                currentUserId={currentUserId}
                                onClick={() => handleReplyClick(comment)}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            {navigationStack.length > 0 ? "No replies yet." : "No comments yet. Be the first to share your thoughts!"}
                        </p>
                    )}
                </div>
            )}
        </div>

        {/* Sticky Bottom Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
             {canComment ? (
                <div className="relative">
                    <textarea
                        ref={commentInputRef}
                        value={commentText}
                        onChange={handleCommentChange}
                        placeholder={navigationStack.length > 0 ? "Write a reply..." : "Write a comment... (use @ to mention)"}
                        className="w-full p-3 pr-16 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-gray-50"
                        rows="1"
                        style={{ minHeight: '46px', maxHeight: '120px' }} 
                    />
                    
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {isSubmitting ? (
                             <div className="animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
                        ) : (
                             commentText.trim() && (
                                <button 
                                    onClick={handleSubmit}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition flex items-center justify-center shadow-md"
                                >
                                    <i className='bx bx-send'></i>
                                </button>
                             )
                        )}
                    </div>

                    {/* Mention Suggestions - Pop up from bottom */}
                    {showMentions && mentionResults.length > 0 && (
                        <ul className="absolute bottom-full left-0 w-64 bg-white border border-gray-200 shadow-xl rounded-lg mb-2 max-h-48 overflow-y-auto z-50">
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
            ) : (
                    <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 text-center text-gray-500 text-sm italic">
                    {privacyMessage || "Comments are disabled."}
                    </div>
            )}
        </div>
    </div>
  );
};

export default CommentSection;