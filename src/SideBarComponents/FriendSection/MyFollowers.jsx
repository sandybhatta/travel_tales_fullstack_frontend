import React, { useEffect, useState } from "react";
import mainApi from "../../Apis/axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom"; 

const MyFollowers = () => {
  const [followers, setFollowers] = useState([]);
  const reduxState = useSelector((state) => state.user);
  const storageState = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const userId = reduxState._id || storageState._id;

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await mainApi.get(`/api/user/${userId}/followers`);
        console.log(response.data);
        setFollowers(response.data.followers || []);
      } catch (error) {
        console.error("Error fetching followers:", error);
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
    <div className="w-full flex flex-col items-center text-white">
      <h2 className="text-2xl font-bold mt-5 mb-3">My Followers</h2>
      <p>{followers.length} followers</p>

      {followers.map((user, index) => {
        const logo = user.avatar?.url || user.avatar;

        return (
          <div
            key={user._id}
            className="w-[70%] h-[100px] border flex items-center justify-between bg-[#2B2D42] rounded-lg mb-4 px-4"
          >
            <Link to={`/profile/${user._id}`} className="flex items-center gap-4">
              <img
                src={logo}
                alt={user.username}
                className="w-[60px] h-[60px] rounded-full object-cover"
              />
              <div>
                <p className="text-lg font-semibold">@{user.username}</p>
                <p className="text-md">{user.name}</p>
              </div>
            </Link>

            <button
              className={`px-4 py-2 mr-2 block rounded-lg ${
                user.followBack ? "bg-red-400" : "bg-green-400"
              } border border-white cursor-pointer`}
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
  );
};

export default MyFollowers;
