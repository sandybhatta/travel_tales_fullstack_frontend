import React from "react";
import { Link } from "react-router-dom";

const PostHeader = ({ post, onOpenTaggedUsers }) => {
  const author = post.author || post.sharedFrom?.author;
  const taggedUsers = post.taggedUsers || [];
  const createdAt = new Date(post.createdAt).toLocaleString();

  return (
    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to={`/profile/${author?._id}`}>
          <img
            src={author?.avatar?.url || author?.avatar}
            alt={author?.name}
            className="w-12 h-12 rounded-full object-cover border border-gray-200"
          />
        </Link>
        <div>
          <div className="flex items-center flex-wrap gap-1">
            <Link
              to={`/profile/${author?._id}`}
              className="font-bold text-gray-900 hover:underline text-base"
            >
              {author.name}
            </Link>
            
            {/* Tagged Users Logic */}
            {taggedUsers.length > 0 && (
              <span className="text-gray-600 text-sm flex items-center gap-1">
                is with 
                <Link to={`/profile/${taggedUsers[0]._id}`} className="font-semibold hover:underline text-gray-900">
                   {taggedUsers[0].name}
                </Link>
                {taggedUsers.length > 1 && (
                  <span 
                    onClick={onOpenTaggedUsers}
                    className="cursor-pointer font-semibold hover:underline text-gray-900"
                  >
                    and {taggedUsers.length - 1} others
                  </span>
                )}
              </span>
            )}
          </div>
          
          <div className="text-xs text-gray-500 flex items-center gap-1">
             <span>{createdAt}</span>
             <span>·</span>
             <i className={`bx bx-${post.visibility === 'public' ? 'world' : post.visibility === 'private' ? 'lock-alt' : 'group'}`}></i>
          </div>
        </div>
      </div>
      
      <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition">
        <i className="bx bx-dots-horizontal-rounded text-xl"></i>
      </button>
    </div>
  );
};

export default PostHeader;
