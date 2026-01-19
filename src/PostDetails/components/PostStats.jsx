import React from "react";

const PostStats = ({ likesCount, commentsCount, shareCount, onOpenLikes }) => {
  return (
    <div className="px-4 py-3 flex items-center justify-between text-gray-500 text-sm border-b border-gray-100 mx-4">
      <div 
        className="flex items-center gap-1 cursor-pointer hover:underline"
        onClick={onOpenLikes}
      >
        <div className="bg-red-500 rounded-full p-1 flex items-center justify-center w-5 h-5">
            <i className="bx bxs-like text-white text-xs"></i>
        </div>
        <span>{likesCount}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="cursor-pointer hover:underline">{commentsCount} comments</span>
        <span className="cursor-pointer hover:underline">{shareCount} shares</span>
      </div>
    </div>
  );
};

export default PostStats;
