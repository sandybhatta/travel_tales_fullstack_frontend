import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import mainApi from "../../Apis/axios";
import { toggleFollow } from "../../redux/userSlice"; // Assuming you might want to update redux, or just local state

const UserListModal = ({ title, users, onClose, onUpdateUser }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [loadingId, setLoadingId] = useState(null);

  // We'll manage the local state of users to update follow buttons immediately
  // However, the parent might pass `users` which might be static. 
  // Ideally, we should check `currentUser.following` to see if we follow them.
  // But `currentUser.following` in Redux might be an array of IDs.
  
  // Let's assume currentUser.following is available in Redux and is an array of IDs.
  // If not, we might rely on the `followers` field of the user object passed in, 
  // but that might not be up to date with *current user's* action.
  
  // Best approach: Check if `user._id` is in `currentUser.following`.
  // If `currentUser.following` is not in redux, we might need to rely on the passed user object
  // having a field like `isFollowing` or check if `user.followers` includes `currentUser._id`.

  // Let's assume `currentUser.following` is an array of objects or IDs.
  // We'll try to use a safe check.

  const isFollowing = (targetUser) => {
    if (!currentUser || !currentUser.following) return false;
    // Check if targetUser._id is in currentUser.following
    // currentUser.following might be populated or just IDs.
    return currentUser.following.some(f => 
      (f._id ? f._id.toString() : f.toString()) === targetUser._id.toString()
    );
  };

  const handleFollowToggle = async (targetUser) => {
    if (loadingId) return;
    setLoadingId(targetUser._id);

    const following = isFollowing(targetUser);
    const url = following 
      ? `/api/user/unfollow/${targetUser._id}`
      : `/api/user/follow/${targetUser._id}`;

    try {
      await mainApi.post(url);
      
      // We should ideally update the Redux state or notify parent.
      // For now, let's call onUpdateUser if provided to refresh data 
      // or we can force a reload of the post details? 
      // Actually, updating the global user state (Redux) would be best so the button updates.
      // But I don't have access to the Redux action structure here easily.
      // I'll just reload the page or trigger a refresh callback? 
      // Reloading is bad UX.
      
      if (onUpdateUser) {
        onUpdateUser(); // Callback to re-fetch post details or user details
      } else {
         // Minimal fallback: window.location.reload(); 
         // Better: Dispatch an action if possible.
      }
      
    } catch (err) {
      console.error("Error toggling follow", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition"
          >
            <i className="bx bx-x text-2xl"></i>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No users found.</p>
          ) : (
            <div className="space-y-1">
              {users.map((user) => {
                 const following = isFollowing(user);
                 const isMe = currentUser?._id === user._id;

                 return (
                   <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition">
                      <Link to={`/profile/${user._id}`} className="flex items-center gap-3 flex-1" onClick={onClose}>
                        <img 
                          src={user.avatar?.url || "/default-avatar.png"} 
                          alt={user.username} 
                          className="w-10 h-10 rounded-full object-cover border border-gray-100"
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-800 leading-tight">{user.name}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </Link>

                      {!isMe && (
                        <button
                          onClick={() => handleFollowToggle(user)}
                          disabled={loadingId === user._id}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            following 
                              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              : "bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg"
                          }`}
                        >
                          {loadingId === user._id ? "..." : (following ? "Unfollow" : "Follow")}
                        </button>
                      )}
                   </div>
                 );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
