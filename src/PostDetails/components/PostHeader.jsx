import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { deletePost } from "../../Apis/postApi";
import EditPostModal from "./EditPostModal";

const PostHeader = ({ post, onOpenTaggedUsers, onPostUpdate }) => {
  const { _id: currentUserId } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const author = post.author || post.sharedFrom?.author;
  const taggedUsers = post.taggedUsers || [];
  const createdAt = new Date(post.createdAt).toLocaleString();
  const isAuthor = currentUserId === author?._id;

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case "public":
        return "bx-globe";
      case "followers":
        return "bx-group";
      case "close_friends":
        return "bx-user-check";
      case "private":
        return "bx-lock-alt";
      default:
        return "bx-globe";
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(post._id);
        navigate("/"); // Redirect to home
      } catch (error) {
        console.error("Failed to delete post", error);
        alert("Failed to delete post");
      }
    }
  };

  return (
    <div className="p-3 md:p-4 border-b border-gray-100 flex items-center justify-between relative">
      <div className="flex items-center gap-2 md:gap-3">
        <Link to={`/profile/${author?._id}`}>
          <img
            src={author?.avatar?.url || author?.avatar}
            alt={author?.name}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-gray-200"
          />
        </Link>
        <div>
          <div className="flex items-center flex-wrap gap-1">
            <Link
              to={`/profile/${author?._id}`}
              className="font-bold text-gray-900 hover:underline text-sm md:text-base"
            >
              {author?.name}
            </Link>
            
            {post.sharedFrom && (
                <span className="text-gray-500 text-sm ml-1">shared a post</span>
            )}

            {/* Tagged Users Logic */}
            {taggedUsers.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600 ml-2">
                <span>is with</span>
                <Link to={`/profile/${taggedUsers[0]._id}`} className="flex items-center gap-1 font-semibold text-gray-900 hover:underline">
                    <img 
                        src={taggedUsers[0].avatar?.url || taggedUsers[0].avatar} 
                        alt={taggedUsers[0].name}
                        className="w-5 h-5 rounded-full object-cover border border-gray-200"
                    />
                    {taggedUsers[0].name}
                </Link>
                {taggedUsers.length > 1 && (
                    <span 
                        onClick={() => setShowTagsModal(true)}
                        className="cursor-pointer font-semibold hover:underline text-gray-900 ml-1"
                    >
                        + {taggedUsers.length - 1} more
                    </span>
                )}
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 flex items-center gap-1">
             <span>{createdAt}</span>
             <span>·</span>
             <i className={`bx ${post.sharedFrom ? "bx-globe" : getVisibilityIcon(post.visibility)} text-xl text-red-500`}></i>
          </div>
        </div>
      </div>
      
      {/* Menu Button */}
      <div className="relative">
          {isAuthor ? (
            <button 
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition"
            >
                <i className="bx bx-dots-vertical-rounded text-xl"></i>
            </button>
          ) : (
            <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition">
                <i className="bx bx-dots-horizontal-rounded text-xl"></i>
            </button>
          )}
          
          {showMenu && isAuthor && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg rounded-lg w-48 z-10 py-1">
              <button 
                onClick={() => { setShowMenu(false); setShowEditModal(true); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm flex items-center gap-2"
              >
                <i className="bx bx-edit"></i> Edit Post
              </button>
              
              <button 
                onClick={() => { setShowMenu(false); handleDelete(); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 text-sm flex items-center gap-2"
              >
                <i className="bx bx-trash"></i> Delete Post
              </button>
            </div>
          )}
      </div>

      {/* View Tags Modal */}
      {showTagsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
             <div className="bg-white rounded-lg p-4 w-80 max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200">
                 <div className="flex justify-between items-center mb-4 border-b pb-2">
                     <h3 className="font-bold text-lg text-gray-800">Tagged Users</h3>
                     <button onClick={() => setShowTagsModal(false)} className="hover:bg-gray-100 rounded-full p-1">
                        <i className="bx bx-x text-2xl"></i>
                     </button>
                 </div>
                 <div className="flex flex-col gap-3">
                     {taggedUsers.map(u => (
                         <Link key={u._id} to={`/profile/${u._id}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition" onClick={() => setShowTagsModal(false)}>
                             <img
                                 src={u.avatar?.url || u.avatar}
                                 alt={u.username}
                                 className="w-10 h-10 rounded-full object-cover border border-gray-200"
                             />
                             <div className="flex flex-col">
                                 <span className="font-semibold text-sm text-gray-800">{u.name}</span>
                                 <span className="text-xs text-gray-500">@{u.username}</span>
                             </div>
                         </Link>
                     ))}
                 </div>
             </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && (
          <EditPostModal 
            post={post}
            onClose={() => setShowEditModal(false)}
            onPostUpdate={onPostUpdate}
          />
      )}
    </div>
  );
};

export default PostHeader;
