import React, { useState, useEffect } from "react";
import { getPostLikes, getTripLikes } from "../Apis/likeApi.js";
import { followUser, unfollowUser } from "../Apis/likeApi.js";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
const LikesModal = ({ isOpen, onClose, postId, type = "post" }) => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [followingStates, setFollowingStates] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  const { _id: currentUserId } = useSelector((state) => state.user);

  useEffect(() => {
    if (isOpen && postId) {
      fetchLikes();
    }
  }, [isOpen, postId]);

  const fetchLikes = async () => {
    setLoading(true);
    setError("");
    try {
      let likesData = [];
      
      if (type === "post") {
        const response = await getPostLikes(postId);
        likesData = response.likesInfo || [];
      } else if (type === "trip") {
        const response = await getTripLikes(postId);
        // Normalize trip likes data to match post likes structure
        // Post likes have isFollowedByMe, Trip likes might have isFollowing or similar
        likesData = (response.likes || []).map(like => ({
            ...like,
            isFollowedByMe: like.isFollowing !== undefined ? like.isFollowing : like.isFollowedByMe
        }));
      }

      setLikes(likesData);
      
      // Initialize following states
      const initialStates = {};
      likesData.forEach((like) => {
        initialStates[like._id] = like.isFollowedByMe || false;
      });
      setFollowingStates(initialStates);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load likes");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId, currentState) => {
    if (loadingStates[userId]) return; // Prevent double clicks
    
    setLoadingStates((prev) => ({ ...prev, [userId]: true }));
    const newState = !currentState;
    
    // Optimistic update
    setFollowingStates((prev) => ({ ...prev, [userId]: newState }));

    try {
      if (newState) {
        await followUser(userId);
      } else {
        await unfollowUser(userId);
      }
    } catch (err) {
      // Rollback on error
      setFollowingStates((prev) => ({ ...prev, [userId]: currentState }));
      console.error("Error toggling follow:", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-[90%] max-w-md bg-white rounded-2xl shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Likes</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <i className="bx bx-x text-3xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <i className="bx bx-error-circle text-4xl text-red-500"></i>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : likes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <i className="bx bx-heart text-4xl text-gray-400"></i>
              <p className="text-gray-600">No likes yet</p>
            </div>
          ) : (
            <div className="p-2">
              {likes.map((like) => {
                const isFollowing = followingStates[like._id] || false;
                const isLoading = loadingStates[like._id] || false;

                return (
                  <div
                    key={like._id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Link
                      to={`/profile/${like._id}`}
                      className="flex items-center gap-3 flex-1"
                      onClick={onClose}
                    >
                      <img
                        src={like.avatar?.url || like.avatar || "/default-avatar.png"}
                        alt={like.name || like.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-800">{like.name || "Unknown"}</p>
                        <p className="text-sm text-gray-500">@{like.username}</p>
                      </div>
                    </Link>
                    
                    {like._id && (
                      like._id === currentUserId ? (
                        <span className="text-gray-500 font-medium px-4">(Me)</span>
                      ) : (
                        <button
                          onClick={() => handleFollowToggle(like._id, isFollowing)}
                          disabled={isLoading}
                          className={`px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 ${
                            isFollowing
                              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : isFollowing ? (
                            "Unfollow"
                          ) : (
                            "Follow"
                          )}
                        </button>
                      )
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

export default LikesModal;
