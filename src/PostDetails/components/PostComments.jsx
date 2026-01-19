import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import mainApi from "../../Apis/axios";

const PostComments = ({ postId, rootComments, commentsCount, onCommentAdded }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
        const { data } = await mainApi.post(`/api/comments/${postId}`, {
            content: newComment
        });
        setNewComment("");
        if (onCommentAdded) {
            onCommentAdded(data.comment);
        }
    } catch (err) {
        console.error("Failed to post comment", err);
    } finally {
        setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="px-4 py-4 border-t border-gray-100">
      {/* Input */}
      <div className="flex gap-3 mb-6">
        <img 
            src={currentUser?.avatar?.url || "/default-avatar.png"} 
            alt="My Avatar" 
            className="w-8 h-8 rounded-full object-cover"
        />
        <form onSubmit={handleSubmit} className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4 py-2">
            <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="bg-transparent border-none outline-none flex-1 text-sm"
                disabled={submitting}
            />
            <button 
                type="submit" 
                disabled={!newComment.trim() || submitting}
                className="text-blue-500 disabled:opacity-50"
            >
                <i className="bx bxs-send text-lg"></i>
            </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        {rootComments && rootComments.length > 0 ? (
            rootComments.map(comment => (
                <div key={comment._id} className="flex gap-3">
                    <Link to={`/profile/${comment.author._id}`}>
                        <img 
                            src={comment.author.avatar?.url || "/default-avatar.png"} 
                            alt={comment.author.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    </Link>
                    <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block">
                            <Link to={`/profile/${comment.author._id}`} className="font-semibold text-xs text-gray-900 hover:underline block">
                                {comment.author.name}
                            </Link>
                            <p className="text-sm text-gray-800">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-1 ml-2 text-xs text-gray-500 font-semibold">
                            <span>{formatDate(comment.createdAt)}</span>
                            <button className="hover:underline">Like</button>
                            <button className="hover:underline">Reply</button>
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PostComments;
