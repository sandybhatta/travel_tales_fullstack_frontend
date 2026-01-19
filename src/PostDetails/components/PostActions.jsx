import React from "react";

const PostActions = ({ 
    hasLiked, 
    onLike, 
    liking, 
    isBookmarked, 
    onBookmark, 
    bookmarking,
    bookmarkCount
}) => {
  return (
    <div className="px-2 py-1 grid grid-cols-3 gap-2">
      <button 
        onClick={onLike}
        disabled={liking}
        className={`flex items-center justify-center gap-2 py-2 rounded-lg transition hover:bg-gray-100 ${
            hasLiked ? "text-red-500" : "text-gray-600"
        }`}
      >
        <i className={`bx ${hasLiked ? 'bxs-like' : 'bx-like'} text-xl`}></i>
        <span className="font-semibold text-sm">Like</span>
      </button>

      <button className="flex items-center justify-center gap-2 py-2 rounded-lg transition hover:bg-gray-100 text-gray-600">
        <i className="bx bx-message-rounded text-xl"></i>
        <span className="font-semibold text-sm">Comment</span>
      </button>

      <div className="flex items-center">
         {/* Share */}
         <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition hover:bg-gray-100 text-gray-600">
            <i className="bx bx-share text-xl"></i>
            <span className="font-semibold text-sm">Share</span>
         </button>
         
         {/* Bookmark (small icon on side or integrated? User asked for bookmark count alongside bookmark svg) */}
         <button 
            onClick={onBookmark}
            disabled={bookmarking}
            className={`ml-2 p-2 rounded-full hover:bg-gray-100 transition flex items-center gap-1 ${
                isBookmarked ? "text-yellow-500" : "text-gray-500"
            }`}
            title="Bookmark"
         >
            <i className={`bx ${isBookmarked ? 'bxs-bookmark' : 'bx-bookmark'} text-xl`}></i>
            <span className="text-xs font-medium">{bookmarkCount}</span>
         </button>
      </div>
    </div>
  );
};

export default PostActions;
