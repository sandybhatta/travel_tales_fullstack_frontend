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
    archivedTrips: [],
  });
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState("");
  const [archivedTripsLoading, setArchivedTripsLoading] = useState(false);
  
  // Throttle states
  const [isArchivingAll, setIsArchivingAll] = useState(false);
  const [isRestoringAll, setIsRestoringAll] = useState(false);

  // Modal States
  const [listModalType, setListModalType] = useState(null);
  const [listUsers, setListUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [listActionLoadingId, setListActionLoadingId] = useState(null);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  const [deleteConfirmationData, setDeleteConfirmationData] = useState(null); // { postId: string }

  const [tripSubTab, setTripSubTab] = useState("visible"); // 'visible' | 'archived'

  useEffect(() => {
    setOwnProfile(loggedInId?.toString() === userId?.toString());
  }, [loggedInId, userId]);

  useEffect(() => {
    setActiveTab("posts");
    setTripSubTab("visible");
    setContentData({
      posts: [],
      trips: [],
      collaboratedTrips: [],
      sharedPosts: [],
      bookmarks: [],
      archivedTrips: [],
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
        return {
          ...prev,
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
      } else if (tabKey === "archivedTrips") {
        if (!ownProfile) {
          newData = { archivedTrips: [] };
        } else {
           setArchivedTripsLoading(true);
           try {
             const res = await mainApi.get("/api/trips/archived-trips");
             newData = { archivedTrips: res.data?.archivedTrips || [] };
           } finally {
             setArchivedTripsLoading(false);
           }
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

  const handleTripSubTabChange = (subTab) => {
    setTripSubTab(subTab);
    if (subTab === "archived") {
      fetchContent("archivedTrips");
    }
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

  const requestDeletePost = (postId) => {
    setDeleteConfirmationData({ postId });
  };

  const cancelDelete = () => {
    setDeleteConfirmationData(null);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmationData) return;
    const { postId } = deleteConfirmationData;
    
    // Optimistic Update
    const previousContent = { ...contentData };
    
    setContentData((prev) => ({
      ...prev,
      posts: prev.posts.filter((p) => p._id !== postId),
      sharedPosts: prev.sharedPosts.filter((p) => p._id !== postId),
    }));

    setDeleteConfirmationData(null); // Close modal immediately

    try {
      await mainApi.delete(`/api/posts/${postId}`);
    } catch (err) {
      // Rollback
      setContentData(previousContent);
      console.error("Failed to delete post:", err);
      alert("Failed to delete post");
    }
  };

  const handleArchiveTrip = async (tripId) => {
    // Optimistic Update: Move from trips to archivedTrips
    const tripToArchive = contentData.trips.find(t => t._id === tripId);
    if (!tripToArchive) return;

    const previousTrips = [...contentData.trips];
    const previousArchived = [...contentData.archivedTrips];

    setContentData(prev => ({
        ...prev,
        trips: prev.trips.filter(t => t._id !== tripId),
        archivedTrips: [tripToArchive, ...prev.archivedTrips]
    }));

    try {
        await mainApi.delete(`/api/trips/${tripId}/archive`);
    } catch (error) {
        console.error("Archive failed", error);
        setContentData(prev => ({
            ...prev,
            trips: previousTrips,
            archivedTrips: previousArchived
        }));
    }
  };

  const handleRestoreTrip = async (tripId) => {
      // Optimistic Update: Move from archivedTrips to trips
      const tripToRestore = contentData.archivedTrips.find(t => t._id === tripId);
      if (!tripToRestore) return;

      const previousTrips = [...contentData.trips];
      const previousArchived = [...contentData.archivedTrips];

      setContentData(prev => ({
          ...prev,
          archivedTrips: prev.archivedTrips.filter(t => t._id !== tripId),
          trips: [tripToRestore, ...prev.trips]
      }));

      try {
          await mainApi.patch(`/api/trips/${tripId}/restore`);
      } catch (error) {
          console.error("Restore failed", error);
          setContentData(prev => ({
              ...prev,
              trips: previousTrips,
              archivedTrips: previousArchived
          }));
      }
  };

  const handleArchiveAllTrips = async () => {
      if (isArchivingAll || contentData.trips.length === 0) return;
      setIsArchivingAll(true);
      
      const previousTrips = [...contentData.trips];
      const previousArchived = [...contentData.archivedTrips];

      // Optimistic Update
      setContentData(prev => ({
          ...prev,
          trips: [],
          archivedTrips: [...previousTrips, ...prev.archivedTrips]
      }));

      try {
          await mainApi.delete("/api/trips/archive-all");
      } catch (error) {
          console.error("Archive all failed", error);
          // Rollback
          setContentData(prev => ({
              ...prev,
              trips: previousTrips,
              archivedTrips: previousArchived
          }));
      } finally {
          setIsArchivingAll(false);
      }
  };

  const handleRestoreAllTrips = async () => {
      if (isRestoringAll || contentData.archivedTrips.length === 0) return;
      setIsRestoringAll(true);

      const previousTrips = [...contentData.trips];
      const previousArchived = [...contentData.archivedTrips];

      // Optimistic Update
      setContentData(prev => ({
          ...prev,
          archivedTrips: [],
          trips: [...previousArchived, ...prev.trips]
      }));

      try {
          await mainApi.patch("/api/trips/restore-all");
      } catch (error) {
          console.error("Restore all failed", error);
          // Rollback
          setContentData(prev => ({
              ...prev,
              trips: previousTrips,
              archivedTrips: previousArchived
          }));
      } finally {
          setIsRestoringAll(false);
      }
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
                
                {ownProfile && activeTab === "trips" && (
                  <div className="flex flex-col sm:flex-row justify-between items-center px-4 mt-4 mb-2 border-b border-gray-200">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleTripSubTabChange("visible")}
                        className={`pb-2 text-sm font-medium transition-colors ${
                          tripSubTab === "visible"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Visible Trips
                      </button>
                      <button
                        onClick={() => handleTripSubTabChange("archived")}
                        className={`pb-2 text-sm font-medium transition-colors ${
                          tripSubTab === "archived"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Archived Trips
                      </button>
                    </div>

                    {tripSubTab === "visible" && contentData.trips.length > 0 && (
                       <button
                         onClick={handleArchiveAllTrips}
                         disabled={isArchivingAll}
                         className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 mt-2 sm:mt-0"
                       >
                         <i className="bx bx-archive-in text-lg"></i>
                         {isArchivingAll ? "Archiving..." : "Archive All"}
                       </button>
                    )}

                    {tripSubTab === "archived" && contentData.archivedTrips.length > 0 && (
                       <button
                         onClick={handleRestoreAllTrips}
                         disabled={isRestoringAll}
                         className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50 mt-2 sm:mt-0"
                       >
                         <i className="bx bx-undo text-lg"></i>
                         {isRestoringAll ? "Restoring..." : "Restore All"}
                       </button>
                    )}
                  </div>
                )}

                <ProfileContent
                  activeTab={activeTab}
                  items={
                    activeTab === "trips"
                      ? (tripSubTab === "visible" ? contentData.trips : contentData.archivedTrips)
                      : (contentData[activeTab] || [])
                  }
                  loading={
                    contentLoading || 
                    (activeTab === "trips" && tripSubTab === "archived" && archivedTripsLoading)
                  }
                  error={contentError}
                  ownProfile={ownProfile}
                  onDeletePost={requestDeletePost}
                  onArchiveTrip={handleArchiveTrip}
                  onRestoreTrip={handleRestoreTrip}
                  isArchivedTab={activeTab === "trips" && tripSubTab === "archived"}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
        {deleteConfirmationData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <i className="bx bx-trash text-2xl text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete Post?
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this post? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
