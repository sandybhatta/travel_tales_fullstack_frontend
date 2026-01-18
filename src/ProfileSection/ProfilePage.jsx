import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import mainApi from "../Apis/axios";

// Components
import ProfileSkeleton from "./components/ProfileSkeleton";
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";
import ProfileTabs from "./components/ProfileTabs";
import ProfileContent from "./components/ProfileContent";

// Lazy Loaded Components
const EditProfileForm = React.lazy(() => import("./components/EditProfileForm"));
const UserListModal = React.lazy(() => import("./components/UserListModal"));
const SettingsModal = React.lazy(() => import("./SettingsModal"));

/**
 * Main Profile Page Component.
 * Orchestrates fetching user data, handling profile actions, and rendering sub-components.
 */
const ProfilePage = () => {
  const { userId } = useParams();

  const reduxUser = useSelector((state) => state.user);
  const localUser = JSON.parse(localStorage.getItem("userInfo"));
  const loggedInId = reduxUser?._id || localUser?._id;

  const [ownProfile, setOwnProfile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState("posts");
  const [contentData, setContentData] = useState({
    posts: [],
    trips: [],
    collaboratedTrips: [],
    sharedPosts: [],
    bookmarks: [],
  });
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState("");

  // Modal States
  const [listModalType, setListModalType] = useState(null);
  const [listUsers, setListUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [listActionLoadingId, setListActionLoadingId] = useState(null);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);

  useEffect(() => {
    setOwnProfile(loggedInId?.toString() === userId?.toString());
  }, [loggedInId, userId]);

  useEffect(() => {
    setActiveTab("posts");
    setContentData({
      posts: [],
      trips: [],
      collaboratedTrips: [],
      sharedPosts: [],
      bookmarks: [],
    });
  }, [userId]);

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

  useEffect(() => {
    fetchUserInfo();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!userData || ownProfile || actionLoading) return;
    const relationship = userData.viewerRelationship || {};
    const currentlyFollowing = relationship.isFollowing;
    setActionLoading(true);
    try {
      if (currentlyFollowing) {
        await mainApi.post(`/api/user/unfollow/${userId}`);
      } else {
        await mainApi.post(`/api/user/follow/${userId}`);
      }
      setUserData((prev) => {
        if (!prev) return prev;
        const prevRel = prev.viewerRelationship || {};
        const followerDelta = currentlyFollowing ? -1 : 1;
        return {
          ...prev,
          followerCount: (prev.followerCount || 0) + followerDelta,
          viewerRelationship: {
            ...prevRel,
            isFollowing: !currentlyFollowing,
          },
        };
      });
    } catch (err) {
      setErrorMsg("Unable to update follow status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseFriendToggle = async () => {
    if (!userData || ownProfile || actionLoading) return;
    const relationship = userData.viewerRelationship || {};
    const isCloseFriend = relationship.isCloseFriend;
    setActionLoading(true);
    try {
      if (isCloseFriend) {
        await mainApi.delete(`/api/user/close-friends/${userId}`);
      } else {
        await mainApi.patch(`/api/user/close-friends/${userId}`);
      }
      setUserData((prev) => {
        if (!prev) return prev;
        const prevRel = prev.viewerRelationship || {};
        const countDelta = isCloseFriend ? -1 : 1;
        return {
          ...prev,
          closeFriendCount: (prev.closeFriendCount || 0) + countDelta,
          viewerRelationship: {
            ...prevRel,
            isCloseFriend: !isCloseFriend,
          },
        };
      });
    } catch (err) {
      setErrorMsg("Unable to update close friend status");
    } finally {
      setActionLoading(false);
    }
  };

  // Content Fetching
  const fetchContent = useCallback(async (tabKey) => {
    setContentError("");
    setContentLoading(true);
    try {
      let newData = {};
      if (tabKey === "posts" || tabKey === "sharedPosts") {
        const endpoint = ownProfile ? "/api/posts/me" : `/api/posts/user/${userId}`;
        const res = await mainApi.get(endpoint);
        const list = res.data?.post || [];
        newData = {
          posts: list,
          sharedPosts: list.filter((p) => p.sharedFrom),
        };
      } else if (tabKey === "trips") {
        const res = await mainApi.get(`/api/trips/${userId}/own-trip`);
        newData = { trips: res.data?.trips || [] };
      } else if (tabKey === "collaboratedTrips") {
        const res = await mainApi.get(`/api/trips/${userId}/collaborated-trip`);
        newData = { collaboratedTrips: res.data?.trips || [] };
      } else if (tabKey === "bookmarks") {
        if (!ownProfile) {
          newData = { bookmarks: [] };
        } else {
          const res = await mainApi.get("/api/user/bookmarks");
          newData = { bookmarks: Array.isArray(res.data) ? res.data : [] };
        }
      }

      setContentData((prev) => ({ ...prev, ...newData }));
    } catch (err) {
      setContentError(err?.response?.data?.message || "Failed to load content");
    } finally {
      setContentLoading(false);
    }
  }, [userId, ownProfile]);

  useEffect(() => {
    if (!loading && !errorMsg && activeTab === "posts" && contentData.posts.length === 0) {
      fetchContent("posts");
    }
  }, [loading, errorMsg, activeTab, fetchContent, contentData.posts.length]);

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    fetchContent(tabKey);
  };

  // List Modal Handlers
  const openUserList = async (type) => {
    if (!userId) return;
    if (type === "closeFriends" && !ownProfile) return;
    setListModalType(type);
    setListLoading(true);
    setListError("");
    setListUsers([]);
    try {
      let res;
      if (type === "followers") {
        res = await mainApi.get(`/api/user/${userId}/followers`);
        setListUsers(res.data?.followers || []);
      } else if (type === "following") {
        res = await mainApi.get(`/api/user/${userId}/following`, { params: { skip: 0, limit: 50 } });
        setListUsers(res.data?.followingList || []);
      } else if (type === "mutual") {
        res = await mainApi.get(`/api/user/${userId}/mutual-follower`, { params: { skip: 0, limit: 50 } });
        setListUsers(res.data?.mutualFollowers || []);
      } else if (type === "closeFriends") {
        res = await mainApi.get("/api/user/close-friends");
        if (Array.isArray(res.data?.closeFriends)) {
          setListUsers(res.data.closeFriends);
        } else {
          if (res.data?.message) setListError(res.data.message);
        }
      }
    } catch (err) {
      setListError(err?.response?.data?.message || "Failed to load users list");
    } finally {
      setListLoading(false);
    }
  };

  // List Actions (Follow/Unfollow/CloseFriend from modal)
  const handleListAction = async (action, targetId) => {
    if (!targetId) return;
    setListError("");
    setListActionLoadingId(targetId);
    try {
      if (action === "removeCloseFriend") {
        await mainApi.delete(`/api/user/close-friends/${targetId}`);
        setListUsers((prev) => prev.filter((u) => u._id !== targetId));
        setUserData((prev) => ({
          ...prev,
          closeFriendCount: Math.max((prev.closeFriendCount || 1) - 1, 0),
        }));
      } else if (action === "unfollow") {
        await mainApi.post(`/api/user/unfollow/${targetId}`);
        // If in following list, remove; if followers, just update state if needed
        if (listModalType === "following") {
           setListUsers((prev) => prev.filter((u) => u._id !== targetId));
           setUserData((prev) => ({
             ...prev,
             followingCount: Math.max((prev.followingCount || 1) - 1, 0),
           }));
        } else {
           // For followers list, update followBack status
           setListUsers((prev) => prev.map(u => u._id === targetId ? {...u, followBack: false} : u));
        }
      } else if (action === "addCloseFriend") {
        await mainApi.patch(`/api/user/close-friends/${targetId}`);
        setUserData((prev) => ({
          ...prev,
          closeFriendCount: (prev.closeFriendCount || 0) + 1,
        }));
        setListUsers((prev) => prev.map((u) => u._id === targetId ? { ...u, _localIsCloseFriend: true } : u));
      } else if (action === "follow") {
        await mainApi.post(`/api/user/follow/${targetId}`);
        setUserData((prev) => ({
          ...prev,
          followingCount: (prev.followingCount || 0) + 1,
        }));
        setListUsers((prev) => prev.map((u) => u._id === targetId ? { ...u, followBack: true } : u));
      }
    } catch (err) {
      setListError(err?.response?.data?.message || "Action failed");
    } finally {
      setListActionLoadingId(null);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUserData((prev) => ({
      ...prev,
      user: { ...prev.user, ...updatedUser },
    }));
  };

  if (loading) return <ProfileSkeleton />;
  if (errorMsg) return <div className="p-6 text-red-500 font-semibold">{errorMsg}</div>;

  const user = userData?.user;
  const privacy = userData?.privacy;
  const criteriaMet = userData?.criteriaMet;
  
  return (
    <div className="w-full min-h-screen bg-[#edf2f4]">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {privacy && criteriaMet === false && !ownProfile && (
          <div className="p-4 sm:p-6 bg-yellow-100 rounded-xl mb-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold">
              This profile is {privacy.replace("_", " ")} only
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              You need permission to view the full details.
            </p>
          </div>
        )}

      {user && (
        <>
          <ProfileHeader
            user={user}
            ownProfile={ownProfile}
            actionLoading={actionLoading}
            viewerRelationship={userData.viewerRelationship}
            onFollowToggle={handleFollowToggle}
            onCloseFriendToggle={handleCloseFriendToggle}
            onEditProfile={() => setIsEditProfileOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onAvatarClick={() => setIsAvatarPreviewOpen(true)}
          />

          {!privacy && (
            <>
              <ProfileStats
                userData={userData}
                ownProfile={ownProfile}
                viewerRelationship={userData.viewerRelationship}
                onOpenUserList={openUserList}
              />

              <div className="mt-8 border-t border-gray-200">
                <ProfileTabs
                  activeTab={activeTab}
                  onTabClick={handleTabClick}
                  ownProfile={ownProfile}
                />
                <ProfileContent
                  activeTab={activeTab}
                  items={contentData[activeTab] || []}
                  loading={contentLoading}
                  error={contentError}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
        {listModalType && (
          <UserListModal
            type={listModalType}
            loading={listLoading}
            error={listError}
            users={listUsers}
            onClose={() => setListModalType(null)}
            ownProfile={ownProfile}
            actionLoadingId={listActionLoadingId}
            onRemoveCloseFriend={(id) => handleListAction("removeCloseFriend", id)}
            onUnfollow={(id) => handleListAction("unfollow", id)}
            onAddCloseFriend={(id) => handleListAction("addCloseFriend", id)}
            onFollow={(id) => handleListAction("follow", id)}
          />
        )}

        {isEditProfileOpen && ownProfile && (
          <EditProfileForm
            user={user}
            onClose={() => setIsEditProfileOpen(false)}
            onUpdate={handleProfileUpdate}
          />
        )}

        {isSettingsOpen && ownProfile && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            userData={userData}
            setUserData={setUserData}
          />
        )}
      </Suspense>

      {isAvatarPreviewOpen && user?.avatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsAvatarPreviewOpen(false)}
        >
          <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <img
              src={user.avatar?.url || user.avatar}
              alt="Profile photo"
              className="w-full max-h-[80vh] rounded-2xl object-contain bg-black shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setIsAvatarPreviewOpen(false)}
              className="absolute top-3 right-3 rounded-full bg-black/50 text-white p-2 hover:bg-black/70 transition-colors backdrop-blur-md"
            >
              <i className="bx bx-x text-2xl" />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ProfilePage;
