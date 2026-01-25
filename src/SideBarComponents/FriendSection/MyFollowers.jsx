import React, { useEffect, useState } from "react";
import mainApi from "../../Apis/axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom"; 

const MyFollowers = () => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const reduxState = useSelector((state) => state.user);
  const storageState = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const userId = reduxState._id || storageState._id;

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await mainApi.get(`/api/user/${userId}/followers`);
        setFollowers(response.data.followers || []);
      } catch (error) {
        console.error("Error fetching followers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId]);

  const handleFollow = async (id, index) => {
    try {
      await mainApi.post(`/api/user/follow/${id}`); 
      setFollowers((prev) =>
        prev.map((user, i) =>
          i === index ? { ...user, followBack: true } : user
        )
      );
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (id, index) => {
    try {
      await mainApi.post(`/api/user/unfollow/${id}`); 
      setFollowers((prev) =>
        prev.map((user, i) =>
          i === index ? { ...user, followBack: false } : user
        )
      );
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  return (
    <div className="w-full flex flex-col text-white">
      <div className="flex justify-between items-baseline mb-6 border-b border-gray-700 pb-2">
        <h2 className="text-2xl font-bold text-red-500">My Followers</h2>
        <span className="text-gray-400 text-sm bg-gray-800 px-3 py-1 rounded-full">{followers.length} followers</span>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-800 h-24 rounded-xl"></div>
            ))}
         </div>
      ) : followers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-xl">You don't have any followers yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followers.map((user, index) => {
            const logo = user.avatar?.url || user.avatar;
            // logic: if user.followBack is true, it means WE follow THEM. 
            // So we show 'Unfollow' (Gray).
            // If false, we show 'Follow Back' (Red).

            return (
              <div
                key={user._id}
                className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 flex items-center justify-between"
              >
                <Link to={`/profile/${user._id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={logo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt={user.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-600 hover:border-red-500 transition-colors shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-white truncate hover:text-red-500 transition-colors">@{user.username}</p>
                    <p className="text-sm text-gray-400 truncate">{user.name}</p>
                  </div>
                </Link>

                <button
                  className={`ml-3 px-4 py-2 rounded-lg text-sm font-medium shrink-0 transition-colors shadow-md ${
                    user.followBack 
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 hover:border-gray-500" // Unfollow style
                      : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" // Follow Back style
                  }`}
                  onClick={() =>
                    user.followBack
                      ? handleUnfollow(user._id, index)
                      : handleFollow(user._id, index)
                  }
                >
                  {user.followBack ? "Unfollow" : "Follow Back"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyFollowers;