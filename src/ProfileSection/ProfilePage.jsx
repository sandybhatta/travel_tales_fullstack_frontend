import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import mainApi from "../Apis/axios";

const ProfilePage = () => {
  const { userId } = useParams();

  const reduxUser = useSelector((state) => state.user);
  const localUser = JSON.parse(localStorage.getItem("userInfo"));

  const loggedInId = reduxUser?._id || localUser?._id;

  const [ownProfile, setOwnProfile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setOwnProfile(loggedInId?.toString() === userId?.toString());
  }, [loggedInId, userId]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data } = await mainApi.get(`/api/user/${userId}/profile`);

        if (data.message) {
          setErrorMsg(data.message);
          setLoading(false);
          return;
        }

        setUserData(data);
        setLoading(false);
      } catch (err) {
        setErrorMsg("Failed to load profile");
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

  if (loading) return <div className="p-6">Loading...</div>;

  if (errorMsg)
    return <div className="p-6 text-red-500 font-semibold">{errorMsg}</div>;

  const user = userData?.user;
  const privacy = userData?.privacy;
  const criteriaMet = userData?.criteriaMet;

  return (
    <div className="w-full min-h-screen p-4">
      
      {privacy && criteriaMet === false && !ownProfile && (
        <div className="p-6 bg-yellow-100 rounded-xl">
          <h2 className="text-xl font-semibold">
            This profile is {privacy.replace("_", " ")} only
          </h2>
          <p className="text-gray-600">
            You need permission to view the full details.
          </p>
        </div>
      )}

      
      {user && (
        <div className="mt-4">
          <img
            src={user.avatar?.url || user.avatar}
            className="w-24 h-24 rounded-full"
            alt="Profile"
          />
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-stone-700">@{user.username}</p>
        </div>
      )}

      
      {!privacy && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <p className="text-lg font-bold">{userData.followerCount}</p>
            <p className="text-gray-600 text-sm">Followers</p>
          </div>

          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <p className="text-lg font-bold">{userData.followingCount}</p>
            <p className="text-gray-600 text-sm">Following</p>
          </div>

          <div className="p-4 bg-gray-100 rounded-xl text-center">
            <p className="text-lg font-bold">{userData.postCount}</p>
            <p className="text-gray-600 text-sm">Posts</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
