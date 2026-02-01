import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
    useGetPostCommentsQuery, 
    useGetRepliesQuery, 
    useCreateRootCommentMutation, 
    useReplyToCommentMutation, 
    useEditCommentMutation, 
    useDeleteCommentMutation, 
    useToggleCommentLikeMutation, 
    useLazyGetCommentLikesQuery 
} from "../slices/commentApiSlice";
import { 
    useSearchMentionableUsersQuery, 
    useFollowUserMutation, 
    useUnfollowUserMutation 
} from "../slices/userApiSlice";

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

const LikesModal = ({ isOpen, onClose, likes, loading, currentUserId }) => {
    const [localLikes, setLocalLikes] = useState(likes);
    const [followUser] = useFollowUserMutation();
    const [unfollowUser] = useUnfollowUserMutation();

    useEffect(() => {
        setLocalLikes(likes);
    }, [likes]);

    const handleFollowToggle = async (user) => {
        try {
            if (user.isFollowing) {
                await unfollowUser(user._id).unwrap();
                setLocalLikes(prev => prev.map(u => u._id === user._id ? { ...u, isFollowing: false } : u));
            } else {
                await followUser(user._id).unwrap();
                setLocalLikes(prev => prev.map(u => u._id === user._id ? { ...u, isFollowing: true } : u));
            }
        } catch (error) {
            console.error("Follow/Unfollow failed", error);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl w-96 max-h-[500px] flex flex-col shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-lg text-gray-800">Likes</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
                        <i className='bx bx-x text-2xl'></i>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <div className="animate-spin h-6 w-6 border-2 border-red-500 rounded-full border-t-transparent"></div>
                        </div>
                    ) : localLikes.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No likes yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {localLikes.map(user => (
                                <div key={user._id} className="flex items-center gap-3 p-2 rounded-lg transition hover:bg-gray-50">
                                    <Link to={`/profile/${user._id}`} onClick={onClose}>
                                        <img src={user.avatar?.url || user.avatar || "/default-avatar.png"} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                                    </Link>
                                    <div className="flex-1">
                                        <Link to={`/profile/${user._id}`} onClick={onClose} className="font-bold text-sm text-gray-800 hover:underline">{user.name}</Link>
                                        <p className="text-xs text-gray-500">@{user.username}</p>
                                    </div>
                                    {user._id === currentUserId ? (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">(Me)</span>
                                    ) : (
                                        <button 
                                            onClick={() => handleFollowToggle(user)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${user.isFollowing 
                                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                                                : "bg-red-500 text-white hover:bg-red-600"}`}
                                        >
                                            {user.isFollowing ? "Unfollow" : "Follow"}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CommentItem = ({ 
    comment, 
    onReplyClick, 
    onLike, 
    processingLikes, 
    currentUserId, 
    isHeader = false, 
    levelIndex = -1,
    onClick,
    onLikeCountClick,
    onEdit,
    isEditing,
    onEditSubmit,
    onEditCancel,
    onDelete
}) => {
    const isLiked = comment.hasLiked;
    const isOwner = comment.author._id === currentUserId;
    const [editText, setEditText] = useState(comment.content);

    useEffect(() => {
        setEditText(comment.content);
    }, [comment.content]);
    
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

    const handleEditSave = () => {
        onEditSubmit(comment._id, editText);
    };

    return (
        <div 
            onClick={onClick}
            className={`flex flex-col ${isHeader ? "cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm bg-white" : "cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"}`}
        >
             {isHeader && (
                <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
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
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 relative group">
                        <div className="flex items-center justify-between mb-1">
                            <Link 
                                to={`/profile/${comment.author._id}`} 
                                className="font-semibold text-sm hover:underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {comment.author.name}
                            </Link>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                                {!isHeader && isOwner && !isEditing && (
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(comment._id);
                                            }}
                                            className="text-gray-400 hover:text-blue-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
                                            title="Edit Comment"
                                        >
                                            <i className='bx bx-edit-alt'></i>
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(comment._id);
                                            }}
                                            className="text-gray-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
                                            title="Delete Comment"
                                        >
                                            <i className='bx bx-trash'></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            <div onClick={(e) => e.stopPropagation()} className="mt-2">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                    rows="3"
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button 
                                        onClick={onEditCancel}
                                        className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-full transition"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleEditSave}
                                        className="px-3 py-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-full transition"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-700 text-sm">{renderCommentContent(comment.content, comment.mentions)}</p>
                        )}
                    </div>

                    {/* Comment Actions - ONLY SHOW IF NOT HEADER AND NOT EDITING */}
                    {!isHeader && !isEditing && (
                        <div className="flex items-center gap-4 mt-1 ml-2">
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLike(comment._id);
                                }}
                                className={`flex items-center gap-1 text-sm font-medium cursor-pointer transition ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"} ${processingLikes.has(comment._id) ? "opacity-50 pointer-events-none" : ""}`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill={isLiked ? "currentColor" : "none"}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onLikeCountClick(comment._id);
                                    }}
                                    className="hover:underline"
                                >
                                    {comment.likes?.length || 0} Likes
                                </span>
                            </div>
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent double triggering if parent is clicked
                                    onReplyClick(comment);
                                }}
                                className="flex items-center gap-1 text-gray-500 text-sm font-medium cursor-pointer hover:text-blue-500"
                            >
                                <i className='bx bx-message-circle-reply text-xl'></i>
                                <span>{comment.replyCount || 0} Replies</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 animate-fadeIn">
            <div 
                className="bg-white w-full max-w-xs rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className='bx bx-trash text-3xl text-red-500'></i>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Comment</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Are you sure you want to delete this comment? This cannot be undone.
                    </p>

                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm}
                            className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-sm shadow-red-200 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
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
  // const [loading, setLoading] = useState(false); // Handled by RTK Query
  const [processingCommentLikes, setProcessingCommentLikes] = useState(new Set());
  
  // Likes Modal State
  const [likesModal, setLikesModal] = useState({ isOpen: false, likes: [], loading: false });

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, commentId: null });

  // Edit State
  const [editingCommentId, setEditingCommentId] = useState(null);

  // Input State
  const [commentText, setCommentText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  // const [mentionResults, setMentionResults] = useState([]); // Handled by RTK Query
  const [mentionedUsers, setMentionedUsers] = useState([]);
  // const [isSubmitting, setIsSubmitting] = useState(false); // Handled by Mutation
  const commentInputRef = useRef(null);

  // RTK Query Hooks
  const currentParentId = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1]?._id : null;

  const { 
    data: rootData, 
    isLoading: rootLoading, 
    refetch: refetchRoot 
  } = useGetPostCommentsQuery(postId, {
    skip: currentParentId !== null || !postId,
  });

  const { 
    data: replyData, 
    isLoading: replyLoading, 
    refetch: refetchReplies 
  } = useGetRepliesQuery({ postId, parentCommentId: currentParentId }, {
    skip: currentParentId === null || !postId,
  });

  const [createRootComment, { isLoading: isCreatingRoot }] = useCreateRootCommentMutation();
  const [replyToComment, { isLoading: isReplying }] = useReplyToCommentMutation();
  const [editComment] = useEditCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [toggleCommentLike] = useToggleCommentLikeMutation();
  const [getCommentLikes] = useLazyGetCommentLikesQuery();
  
  const { data: mentionData } = useSearchMentionableUsersQuery(mentionQuery, {
    skip: !showMentions || !mentionQuery,
  });
  const mentionResults = mentionData?.users || [];

  const loading = currentParentId ? replyLoading : rootLoading;
  const isSubmitting = isCreatingRoot || isReplying;

  // Sync data to local state
  useEffect(() => {
    if (currentParentId === null) {
        if (rootData?.comments) setComments(rootData.comments);
    } else {
        if (replyData?.replies) setComments(replyData.replies);
    }
  }, [rootData, replyData, currentParentId]);

  // Handle Comment Like
  const handleCommentLike = async (commentId) => {
    if (processingCommentLikes.has(commentId) || !currentUserId) return;

    setProcessingCommentLikes(prev => new Set(prev).add(commentId));

    // Optimistic update logic
    const updateLikeInList = (list) => list.map(c => {
        if (c._id === commentId) {
            const wasLiked = c.hasLiked;
            const newHasLiked = !wasLiked;
            let newLikes = c.likes || [];
            
            if (newHasLiked) {
                newLikes = [...newLikes, { _id: currentUserId, name: "You", username: "you" }];
            } else {
                newLikes = newLikes.filter(like => {
                    const likeId = like._id || like;
                    return likeId !== currentUserId;
                });
            }
            return { ...c, hasLiked: newHasLiked, likes: newLikes };
        }
        return c;
    });

    // Store previous state for rollback
    const previousComments = [...comments];
    const previousStack = [...navigationStack];

    setComments(prev => updateLikeInList(prev));
    setNavigationStack(prev => updateLikeInList(prev));

    try {
      await toggleCommentLike(commentId).unwrap();
    } catch (err) {
      console.error("Failed to like comment", err);
      setComments(previousComments);
      setNavigationStack(previousStack);
    } finally {
      setProcessingCommentLikes(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
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

  const handleLikeCountClick = async (commentId) => {
      setLikesModal({ isOpen: true, likes: [], loading: true });
      try {
          const data = await getCommentLikes(commentId).unwrap();
          setLikesModal({ isOpen: true, likes: data.likes || [], loading: false });
      } catch (err) {
          console.error("Failed to fetch likes", err);
          setLikesModal({ isOpen: false, likes: [], loading: false });
      }
  };

  const handleEditClick = (commentId) => {
      setEditingCommentId(commentId);
  };

  const handleEditSubmit = async (commentId, newContent) => {
      try {
          const updatedCommentRes = await editComment({ commentId, content: newContent }).unwrap();
          const updatedComment = updatedCommentRes.comment;

          // Update lists
          const updateList = (list) => list.map(c => c._id === commentId ? { ...c, content: updatedComment.content, mentions: updatedComment.mentions } : c);
          
          setComments(prev => updateList(prev));
          setNavigationStack(prev => updateList(prev));
          
          setEditingCommentId(null);
      } catch (err) {
          console.error("Failed to edit comment", err);
          alert("Failed to update comment");
      }
  };

  const handleDeleteClick = (commentId) => {
      setDeleteModal({ isOpen: true, commentId });
  };

  const confirmDelete = async () => {
      const { commentId } = deleteModal;
      if (!commentId) return;

      setDeleteModal({ isOpen: false, commentId: null });

      try {
          // Optimistically remove from local state
          const removeList = (list) => list.filter(c => c._id !== commentId);
          setComments(prev => removeList(prev));
          setNavigationStack(prev => removeList(prev));

          await deleteComment(commentId).unwrap();
          
          // Refetch handled by tag invalidation, but we can force it if needed
      } catch (err) {
          console.error("Failed to delete comment", err);
          // Revert handled by refetch usually
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
      try {
          const finalMentions = mentionedUsers
            .filter(u => commentText.includes(`@${u.username}`))
            .map(u => u._id);

          if (navigationStack.length === 0) {
              // Create Root Comment
              await createRootComment({ postId, content: commentText, mentions: finalMentions }).unwrap();
          } else {
              // Create Reply
              const parentComment = navigationStack[navigationStack.length - 1];
              const rootComment = navigationStack[0];
              const rootId = rootComment._id;
              const parentId = parentComment._id;
              
              await replyToComment({ postId, rootCommentId: rootId, parentCommentId: parentId, content: commentText, mentions: finalMentions }).unwrap();
          }
          
          setCommentText("");
          setMentionedUsers([]);
          if (onCommentAdded) onCommentAdded();
      } catch (err) {
          console.error("Failed to post comment", err);
      }
  };

  const handleHeaderClick = (index) => {
        // Navigate back to this specific level
        setNavigationStack(prev => prev.slice(0, index + 1));
    };

    const getPlaceholderText = () => {
        if (navigationStack.length === 0) {
            return "Comment and @ to mention anyone";
        }
        // If stack length is 1, we are in Level 1 (child of Root).
        // The parent is Root.
        // If stack length is 2, we are in Level 2. The parent is Parent 1.
        const parentLabel = navigationStack.length === 1 ? "Root Comment" : `Parent ${navigationStack.length - 1}`;
        return `Reply in ${parentLabel}...`;
    };

    return (
    <div className="flex flex-col h-[600px] bg-gray-50 border-t border-gray-200 rounded-xl overflow-hidden relative">
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal 
            isOpen={deleteModal.isOpen} 
            onClose={() => setDeleteModal({ isOpen: false, commentId: null })} 
            onConfirm={confirmDelete}
        />

        {/* Likes Modal */}
        <LikesModal 
            isOpen={likesModal.isOpen} 
            onClose={() => setLikesModal({ ...likesModal, isOpen: false })} 
            likes={likesModal.likes} 
            loading={likesModal.loading} 
            currentUserId={currentUserId}
        />

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

                    <div className="flex flex-col gap-[2px]">
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
                                onLikeCountClick={() => {}} // Headers don't need like click
                                onEdit={() => {}}
                                isEditing={false}
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
                                onLikeCountClick={handleLikeCountClick}
                                onEdit={handleEditClick}
                                isEditing={editingCommentId === comment._id}
                                onEditSubmit={handleEditSubmit}
                                onEditCancel={() => setEditingCommentId(null)}
                                onDelete={handleDeleteClick}
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
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:p-4 z-30">
             {canComment ? (
                <div className="relative">
                    <textarea
                        ref={commentInputRef}
                        value={commentText}
                        onChange={handleCommentChange}
                        placeholder={getPlaceholderText()}
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
