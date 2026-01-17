import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import mainApi from "../Apis/axios";

const INTEREST_OPTIONS = [
  "adventure",
  "beach",
  "mountains",
  "history",
  "food",
  "wildlife",
  "culture",
  "luxury",
  "budget",
  "road_trip",
  "solo",
  "group",
  "trekking",
  "spiritual",
  "nature",
  "photography",
  "festivals",
  "architecture",
  "offbeat",
  "shopping",
];

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
  const [activeTab, setActiveTab] = useState("posts");

  const [posts, setPosts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [collaboratedTrips, setCollaboratedTrips] = useState([]);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState("");

  const [listModalType, setListModalType] = useState(null);
  const [listUsers, setListUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: "",
    bio: "",
    city: "",
    state: "",
    country: "",
    interests: [],
  });
  const [editProfileError, setEditProfileError] = useState("");
  const [editProfileLoading, setEditProfileLoading] = useState(false);

  const [isChangeUsernameOpen, setIsChangeUsernameOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);

  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  const [listActionLoadingId, setListActionLoadingId] = useState(null);

  useEffect(() => {
    setOwnProfile(loggedInId?.toString() === userId?.toString());
  }, [loggedInId, userId]);

  useEffect(() => {
    setActiveTab("posts");
    setPosts([]);
    setTrips([]);
    setCollaboratedTrips([]);
    setSharedPosts([]);
    setBookmarkedPosts([]);
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

  const openUserList = async (type) => {
    if (!userId) return;
    if (type === "closeFriends" && !ownProfile) return;
    setListModalType(type);
    setListLoading(true);
    setListError("");
    setListUsers([]);
    try {
      if (type === "followers") {
        const res = await mainApi.get(`/api/user/${userId}/followers`);
        setListUsers(res.data?.followers || []);
      } else if (type === "following") {
        const res = await mainApi.get(`/api/user/${userId}/following`, {
          params: { skip: 0, limit: 50 },
        });
        setListUsers(res.data?.followingList || []);
      } else if (type === "mutual") {
        const res = await mainApi.get(
          `/api/user/${userId}/mutual-follower`,
          {
            params: { skip: 0, limit: 50 },
          }
        );
        setListUsers(res.data?.mutualFollowers || []);
      } else if (type === "closeFriends") {
        const res = await mainApi.get("/api/user/close-friends");
        if (Array.isArray(res.data?.closeFriends)) {
          setListUsers(res.data.closeFriends);
        } else {
          setListUsers([]);
          if (res.data?.message) {
            setListError(res.data.message);
          }
        }
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to load users list";
      setListError(message);
    } finally {
      setListLoading(false);
    }
  };

  const closeUserList = () => {
    setListModalType(null);
    setListUsers([]);
    setListError("");
  };

  const handleRemoveCloseFriendFromList = async (targetId) => {
    if (!targetId) return;
    setListError("");
    setListActionLoadingId(targetId);
    try {
      await mainApi.delete(`/api/user/close-friends/${targetId}`);
      setListUsers((prev) => prev.filter((u) => u._id !== targetId));
      setUserData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          closeFriendCount: Math.max((prev.closeFriendCount || 1) - 1, 0),
        };
      });
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to remove close friend";
      setListError(message);
    } finally {
      setListActionLoadingId(null);
    }
  };

  const handleUnfollowFromList = async (targetId) => {
    if (!targetId) return;
    setListError("");
    setListActionLoadingId(targetId);
    try {
      await mainApi.post(`/api/user/unfollow/${targetId}`);
      setListUsers((prev) => prev.filter((u) => u._id !== targetId));
      setUserData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          followingCount: Math.max((prev.followingCount || 1) - 1, 0),
        };
      });
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to unfollow user";
      setListError(message);
    } finally {
      setListActionLoadingId(null);
    }
  };

  const handleAddCloseFriendFromList = async (targetId) => {
    if (!targetId) return;
    setListError("");
    setListActionLoadingId(targetId);
    try {
      await mainApi.patch(`/api/user/close-friends/${targetId}`);
      setUserData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          closeFriendCount: (prev.closeFriendCount || 0) + 1,
        };
      });
      setListUsers((prev) =>
        prev.map((u) =>
          u._id === targetId ? { ...u, _localIsCloseFriend: true } : u
        )
      );
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to add close friend";
      setListError(message);
    } finally {
      setListActionLoadingId(null);
    }
  };

  const fetchContent = async (tabKey) => {
    setContentError("");
    setContentLoading(true);
    try {
      if (tabKey === "posts" || tabKey === "sharedPosts") {
        if (ownProfile) {
          const res = await mainApi.get("/api/posts/me");
          const list = res.data?.post || [];
          setPosts(list);
          setSharedPosts(list.filter((p) => p.sharedFrom));
        } else {
          const res = await mainApi.get(`/api/posts/user/${userId}`);
          const list = res.data?.post || [];
          setPosts(list);
          setSharedPosts(list.filter((p) => p.sharedFrom));
        }
      } else if (tabKey === "trips") {
        const res = await mainApi.get(`/api/trips/${userId}/own-trip`);
        const list = res.data?.trips || [];
        setTrips(list);
      } else if (tabKey === "collaboratedTrips") {
        const res = await mainApi.get(
          `/api/trips/${userId}/collaborated-trip`
        );
        const list = res.data?.trips || [];
        setCollaboratedTrips(list);
      } else if (tabKey === "bookmarks") {
        if (!ownProfile) {
          setBookmarkedPosts([]);
          return;
        }
        const res = await mainApi.get("/api/user/bookmarks");
        const list = Array.isArray(res.data) ? res.data : [];
        setBookmarkedPosts(list);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to load content";
      setContentError(message);
    } finally {
      setContentLoading(false);
    }
  };

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    fetchContent(tabKey);
  };

  useEffect(() => {
    if (!loading && !errorMsg && activeTab === "posts" && posts.length === 0) {
      fetchContent("posts");
    }
  }, [loading, errorMsg, activeTab, userId, ownProfile, posts.length]);

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleProfileInputChange = (field, value) => {
    setEditProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInterestToggle = (interest) => {
    setEditProfileForm((prev) => {
      const exists = prev.interests.includes(interest);
      const nextInterests = exists
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return {
        ...prev,
        interests: nextInterests,
      };
    });
  };

  const handleSaveProfile = async () => {
    if (!userData?.user) return;
    setEditProfileError("");
    setEditProfileLoading(true);
    try {
      const payload = {
        name: editProfileForm.name,
        bio: editProfileForm.bio,
        city: editProfileForm.city,
        state: editProfileForm.state,
        country: editProfileForm.country,
        interests: editProfileForm.interests || [],
      };

      let res;

      if (avatarFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
          }
        });
        formData.append("avatar", avatarFile);

        res = await mainApi.patch("/api/user/update-profile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        res = await mainApi.patch("/api/user/update-profile", payload);
      }

      const updated = res.data?.user;

      if (updated) {
        setUserData((prev) => {
          if (!prev?.user) return prev;
          return {
            ...prev,
            user: {
              ...prev.user,
              ...updated,
            },
          };
        });
      }

      setIsEditProfileOpen(false);
      setAvatarFile(null);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to update profile";
      setEditProfileError(message);
    } finally {
      setEditProfileLoading(false);
    }
  };

  const openEditProfile = () => {
    if (!userData?.user) return;
    const baseUser = userData.user;
    setEditProfileForm({
      name: baseUser.name || "",
      bio: baseUser.bio || "",
      city: baseUser.location?.city || "",
      state: baseUser.location?.state || "",
      country: baseUser.location?.country || "",
      interests: Array.isArray(baseUser.interests) ? baseUser.interests : [],
    });
    setEditProfileError("");
    setAvatarFile(null);
    setIsEditProfileOpen(true);
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      setUsernameError("Username is required");
      setTimeout(() => {
        setUsernameError("");
      }, 4000);
      return;
    }
    setUsernameError("");
    setUsernameLoading(true);
    try {
      const res = await mainApi.patch("/api/user/change-username", {
        username: newUsername.trim(),
      });
      const updatedUsername = res.data?.newUsername || newUsername.trim();
      setUserData((prev) => {
        if (!prev?.user) return prev;
        return {
          ...prev,
          user: {
            ...prev.user,
            username: updatedUsername,
          },
        };
      });
      setIsChangeUsernameOpen(false);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to change username";
      setUsernameError(message);
      setTimeout(() => {
        setUsernameError("");
      }, 4000);
    } finally {
      setUsernameLoading(false);
    }
  };

  const openChangeUsername = () => {
    if (!userData?.user) return;
    setNewUsername(userData.user.username || "");
    setUsernameError("");
    setUsernameLoading(false);
    setIsChangeUsernameOpen(true);
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      setEmailError("Email is required");
      setTimeout(() => {
        setEmailError("");
      }, 4000);
      return;
    }
    setEmailError("");
    setEmailMessage("");
    setEmailLoading(true);
    try {
      const res = await mainApi.patch("/api/user/change-email", {
        email: newEmail.trim(),
      });
      setEmailMessage(
        res.data?.message ||
          "Verification link sent to your new email. Please confirm within 30 minutes."
      );
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to change email";
      setEmailError(message);
      setTimeout(() => {
        setEmailError("");
      }, 4000);
    } finally {
      setEmailLoading(false);
    }
  };

  const openChangeEmail = () => {
    if (!userData?.user) return;
    setNewEmail(userData.user.email || "");
    setEmailError("");
    setEmailMessage("");
    setEmailLoading(false);
    setIsChangeEmailOpen(true);
  };

  const renderProfileSkeleton = () => {
    return (
      <div className="w-full min-h-screen p-4 max-w-4xl mx-auto animate-pulse">
        <div className="mt-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-300" />
            <div className="space-y-2">
              <div className="h-6 w-40 rounded bg-gray-300" />
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-4 w-52 rounded bg-gray-200" />
              <div className="h-3 w-64 rounded bg-gray-200" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-9 w-24 rounded-lg bg-gray-300" />
            <div className="h-7 w-28 rounded-lg bg-gray-200" />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center min-w-[90px] space-y-1"
            >
              <div className="h-5 w-8 rounded bg-gray-300" />
              <div className="h-3 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-gray-200">
          <div className="flex justify-around text-xs sm:text-sm font-semibold text-gray-500">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex-1 flex items-center justify-center gap-1 py-3"
              >
                <div className="h-5 w-5 rounded-full bg-gray-300" />
                <div className="hidden sm:block h-3 w-12 rounded bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-1 sm:gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="relative w-full overflow-hidden bg-gray-200"
                style={{ paddingBottom: "100%" }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return renderProfileSkeleton();

  if (errorMsg)
    return <div className="p-6 text-red-500 font-semibold">{errorMsg}</div>;

  const user = userData?.user;
  const privacy = userData?.privacy;
  const criteriaMet = userData?.criteriaMet;
  const viewerRelationship = userData?.viewerRelationship || {};

  const followLabel = ownProfile
    ? ""
    : viewerRelationship.isFollowing
    ? "Following"
    : viewerRelationship.isFollower
    ? "Follow back"
    : "Follow";

  const closeFriendLabel = ownProfile
    ? ""
    : viewerRelationship.isCloseFriend
    ? "Close friend"
    : "Add to close friends";

  const getActiveItems = () => {
    if (activeTab === "posts") return posts;
    if (activeTab === "trips") return trips;
    if (activeTab === "collaboratedTrips") return collaboratedTrips;
    if (activeTab === "sharedPosts") return sharedPosts;
    if (activeTab === "bookmarks") return bookmarkedPosts;
    return [];
  };

  const renderContentGrid = () => {
    const items = getActiveItems();

    if (contentLoading) {
      return (
        <div className="mt-4 grid grid-cols-3 gap-1 sm:gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="relative w-full overflow-hidden bg-gray-200 animate-pulse"
              style={{ paddingBottom: "100%" }}
            />
          ))}
        </div>
      );
    }

    if (!contentError && items.length === 0) {
      if (activeTab === "posts") {
        return (
          <p className="text-sm text-center text-gray-500">
            No posts to display yet.
          </p>
        );
      }
      if (activeTab === "trips") {
        return (
          <p className="text-sm text-center text-gray-500">
            No trips to display yet.
          </p>
        );
      }
      if (activeTab === "collaboratedTrips") {
        return (
          <p className="text-sm text-center text-gray-500">
            No collaborated trips to display yet.
          </p>
        );
      }
      if (activeTab === "sharedPosts") {
        return (
          <p className="text-sm text-center text-gray-500">
            No shared posts to display yet.
          </p>
        );
      }
      if (activeTab === "bookmarks") {
        return (
          <p className="text-sm text-center text-gray-500">
            No bookmarked posts to display yet.
          </p>
        );
      }
    }

    if (activeTab === "trips" || activeTab === "collaboratedTrips") {
      return (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((trip) => {
            const cover =
              trip.coverPhoto?.url || trip.coverPhoto || "";
            const hasCover = !!cover;
            return (
              <Link
                key={trip._id}
                to={`/trip/${trip._id}`}
                className="relative block overflow-hidden rounded-lg bg-gray-900 text-white"
              >
                <div className="w-full" style={{ paddingBottom: "70%" }}>
                  {hasCover ? (
                    <img
                      src={cover}
                      alt={trip.title || ""}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-2">
                      <p
                        className="text-sm font-medium text-center text-white truncate"
                        title={trip.title}
                      >
                        {trip.title || "Untitled trip"}
                      </p>
                    </div>
                  )}
                  {hasCover && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1">
                      <p
                        className="text-xs font-semibold text-white truncate"
                        title={trip.title}
                      >
                        {trip.title || "Untitled trip"}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      );
    }

    return (
      <div className="mt-4 grid grid-cols-3 gap-1 sm:gap-2">
        {items.map((item) => {
          const isPostTab =
            activeTab === "posts" ||
            activeTab === "sharedPosts" ||
            activeTab === "bookmarks";
          const mediaSource = isPostTab
            ? item.media?.[0]?.url || item.media?.[0]
            : item.coverPhoto?.url || item.coverPhoto;

          return (
            <div
              key={item._id}
              className="relative w-full overflow-hidden bg-gray-200"
              style={{ paddingBottom: "100%" }}
            >
              {isPostTab ? (
                mediaSource ? (
                  <img
                    src={mediaSource}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 px-2">
                    <p
                      className="text-xs text-white leading-snug w-full"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.caption || "No caption"}
                    </p>
                  </div>
                )
              ) : mediaSource ? (
                <img
                  src={mediaSource}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <i className="bx bx-image text-3xl" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen p-4 max-w-4xl mx-auto">
      {privacy && criteriaMet === false && !ownProfile && (
        <div className="p-6 bg-yellow-100 rounded-xl mb-4">
          <h2 className="text-xl font-semibold">
            This profile is {privacy.replace("_", " ")} only
          </h2>
          <p className="text-gray-600">
            You need permission to view the full details.
          </p>
        </div>
      )}

      {user && (
        <div className="mt-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar?.url || user.avatar || "/default-avatar.png"}
              className="w-24 h-24 rounded-full object-cover ring-2 ring-red-500/40 cursor-pointer hover:scale-105 transition-transform duration-200"
              alt="Profile"
              onClick={() => setIsAvatarPreviewOpen(true)}
            />
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-stone-700">@{user.username}</p>
              {user.email && (
                <p className="text-sm text-gray-700 break-all">{user.email}</p>
              )}
              {user.location && (
                <p className="text-sm text-gray-600">
                  {user.location.city}, {user.location.state},{" "}
                  {user.location.country}
                </p>
              )}
              {user.bio && (
                <div className="mt-3 max-w-xl rounded-2xl bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 px-4 py-3 border border-red-100">
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              )}
            </div>
          </div>

          {ownProfile ? (
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={openEditProfile}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-black disabled:opacity-50"
              >
                Edit profile
              </button>
              <div className="flex gap-2">
                <button
                  onClick={openChangeUsername}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Change username
                </button>
                <button
                  onClick={openChangeEmail}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Change email
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleFollowToggle}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  viewerRelationship.isFollowing
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    : "bg-red-500 text-white hover:bg-red-600"
                } disabled:opacity-50`}
              >
                {actionLoading ? "Please wait..." : followLabel}
              </button>
              <button
                onClick={handleCloseFriendToggle}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                {closeFriendLabel}
              </button>
            </div>
          )}
        </div>
      )}

      {!privacy && (
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <button
            className="flex flex-col items-center text-center min-w-[90px]"
            onClick={() => openUserList("followers")}
          >
            <span className="text-lg font-bold">
              {userData.followerCount ?? 0}
            </span>
            <span className="text-xs text-gray-600">Followers</span>
          </button>
          <button
            className="flex flex-col items-center text-center min-w-[90px]"
            onClick={() => openUserList("following")}
          >
            <span className="text-lg font-bold">
              {userData.followingCount ?? 0}
            </span>
            <span className="text-xs text-gray-600">Following</span>
          </button>
          {ownProfile && (
            <button
              className="flex flex-col items-center text-center min-w-[90px]"
              onClick={() => openUserList("closeFriends")}
            >
              <span className="text-lg font-bold">
                {userData.closeFriendCount ?? 0}
              </span>
              <span className="text-xs text-gray-600">Close friends</span>
            </button>
          )}
          {!ownProfile &&
            typeof viewerRelationship.mutualFollowersCount === "number" &&
            viewerRelationship.mutualFollowersCount > 0 && (
              <button
                className="flex flex-col items-center text-center min-w-[90px]"
                onClick={() => openUserList("mutual")}
              >
                <span className="text-lg font-bold">
                  {viewerRelationship.mutualFollowersCount}
                </span>
                <span className="text-xs text-gray-600">Mutual</span>
              </button>
            )}
        </div>
      )}

      {!privacy && (
        <div className="mt-8 border-t border-gray-200">
          <div className="flex justify-around text-xs sm:text-sm font-semibold text-gray-500">
            <button
              onClick={() => handleTabClick("posts")}
              className={`flex-1 flex items-center justify-center gap-1 py-3 border-b-2 ${
                activeTab === "posts"
                  ? "border-red-500 text-red-500"
                  : "border-transparent"
              }`}
            >
              <i className="bx bx-grid-alt text-lg sm:text-xl" />
              <span className="hidden sm:inline">Posts</span>
            </button>
            <button
              onClick={() => handleTabClick("trips")}
              className={`flex-1 flex items-center justify-center gap-1 py-3 border-b-2 ${
                activeTab === "trips"
                  ? "border-red-500 text-red-500"
                  : "border-transparent"
              }`}
            >
              <i className="bx bx-trip text-lg sm:text-xl" />
              <span className="hidden sm:inline">Trips</span>
            </button>
            <button
              onClick={() => handleTabClick("collaboratedTrips")}
              className={`flex-1 flex items-center justify-center gap-1 py-3 border-b-2 ${
                activeTab === "collaboratedTrips"
                  ? "border-red-500 text-red-500"
                  : "border-transparent"
              }`}
            >
              <i className="bx bx-group text-lg sm:text-xl" />
              <span className="hidden sm:inline">Collaborated</span>
            </button>
            <button
              onClick={() => handleTabClick("sharedPosts")}
              className={`flex-1 flex items-center justify-center gap-1 py-3 border-b-2 ${
                activeTab === "sharedPosts"
                  ? "border-red-500 text-red-500"
                  : "border-transparent"
              }`}
            >
              <i className="bx bx-share-alt text-lg sm:text-xl" />
              <span className="hidden sm:inline">Shared</span>
            </button>
            {ownProfile && (
              <button
                onClick={() => handleTabClick("bookmarks")}
                className={`flex-1 flex items-center justify-center gap-1 py-3 border-b-2 ${
                  activeTab === "bookmarks"
                    ? "border-red-500 text-red-500"
                    : "border-transparent"
                }`}
              >
                <i className="bx bx-bookmark text-lg sm:text-xl" />
                <span className="hidden sm:inline">Bookmarked</span>
              </button>
            )}
          </div>

          <div className="mt-4">
            {contentError && (
              <p className="text-sm text-center text-red-500">{contentError}</p>
            )}
            {!contentError && renderContentGrid()}
          </div>
        </div>
      )}

      {listModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-semibold capitalize">
                {listModalType === "mutual"
                  ? "Mutual followers"
                  : listModalType === "followers"
                  ? "Followers"
                  : listModalType === "following"
                  ? "Following"
                  : "Close friends"}
              </h2>
              <button
                onClick={closeUserList}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="bx bx-x text-2xl" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {listLoading && (
                <div className="flex items-center justify-center py-6">
                  <p className="text-gray-500 text-sm">Loading users...</p>
                </div>
              )}
              {!listLoading && listError && (
                <div className="flex items-center justify-center py-6 px-4">
                  <p className="text-sm text-red-500 text-center">
                    {listError}
                  </p>
                </div>
              )}
              {!listLoading && !listError && listUsers.length === 0 && (
                <div className="flex items-center justify-center py-6">
                  <p className="text-sm text-gray-500">No users found.</p>
                </div>
              )}
              {!listLoading &&
                !listError &&
                listUsers.length > 0 && (
                  <div className="p-2">
                    {listUsers.map((u) => {
                      const avatar = u.avatar?.url || u.avatar;
                      const isFollowingList =
                        listModalType === "following" && ownProfile;
                      const isCloseFriendsList = listModalType === "closeFriends";
                      const isBusy = listActionLoadingId === u._id;
                      const isCloseFriendAlready = u._localIsCloseFriend;
                      return (
                        <div
                          key={u._id}
                          className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
                        >
                          <Link
                            to={`/profile/${u._id}`}
                            className="flex items-center gap-3 flex-1"
                            onClick={closeUserList}
                          >
                            <img
                              src={avatar || "/default-avatar.png"}
                              alt={u.username || u.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-800">
                                {u.name || u.username}
                              </span>
                              <span className="text-xs text-gray-500">
                                @{u.username}
                              </span>
                            </div>
                          </Link>
                          {isCloseFriendsList && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveCloseFriendFromList(u._id)
                              }
                              disabled={isBusy}
                              className="ml-2 inline-flex items-center justify-center rounded-full bg-red-50 text-red-600 px-3 py-1 text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
                            >
                              <i className="bx bx-trash text-base mr-1" />
                              {isBusy ? "Removing..." : "Remove"}
                            </button>
                          )}
                          {isFollowingList && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleUnfollowFromList(u._id)}
                                disabled={isBusy}
                                className="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-semibold hover:bg-gray-200 disabled:opacity-50"
                              >
                                {isBusy ? "Updating..." : "Unfollow"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleAddCloseFriendFromList(u._id)
                                }
                                disabled={isBusy || isCloseFriendAlready}
                                className="inline-flex items-center justify-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50"
                              >
                                <i className="bx bx-star text-base mr-1" />
                                {isCloseFriendAlready ? "Close friend" : "Add close"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {isAvatarPreviewOpen && user?.avatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setIsAvatarPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-lg px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={user.avatar?.url || user.avatar}
              alt="Profile photo"
              className="w-full max-h-[80vh] rounded-2xl object-contain bg-black"
            />
            <button
              type="button"
              onClick={() => setIsAvatarPreviewOpen(false)}
              className="absolute top-3 right-3 rounded-full bg-black/70 text-white p-1.5 hover:bg-black"
            >
              <i className="bx bx-x text-2xl" />
            </button>
          </div>
        </div>
      )}

      {ownProfile && isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto p-5">
            <h2 className="text-lg font-semibold mb-4">Edit profile</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-red-500/40 bg-gray-100 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar?.url || user.avatar}
                      alt="Current avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="bx bx-user text-2xl text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="block text-xs font-semibold text-gray-600 mb-1">
                    Profile photo
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      setAvatarFile(file || null);
                    }}
                    className="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                  />
                  {avatarFile && (
                    <p className="mt-1 text-[11px] text-gray-500">
                      Selected: {avatarFile.name}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="block text-xs font-semibold text-gray-600 mb-1">
                  Name
                </p>
                <input
                  type="text"
                  value={editProfileForm.name}
                  onChange={(e) =>
                    handleProfileInputChange("name", e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <p className="block text-xs font-semibold text-gray-600 mb-1">
                  Bio
                </p>
                <textarea
                  value={editProfileForm.bio}
                  onChange={(e) =>
                    handleProfileInputChange("bio", e.target.value)
                  }
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="block text-xs font-semibold text-gray-600 mb-1">
                    City
                  </p>
                  <input
                    type="text"
                    value={editProfileForm.city}
                    onChange={(e) =>
                      handleProfileInputChange("city", e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <p className="block text-xs font-semibold text-gray-600 mb-1">
                    State
                  </p>
                  <input
                    type="text"
                    value={editProfileForm.state}
                    onChange={(e) =>
                      handleProfileInputChange("state", e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <p className="block text-xs font-semibold text-gray-600 mb-1">
                    Country
                  </p>
                  <input
                    type="text"
                    value={editProfileForm.country}
                    onChange={(e) =>
                      handleProfileInputChange("country", e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div>
                <p className="block text-xs font-semibold text-gray-600 mb-2">
                  Interests
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {INTEREST_OPTIONS.map((interest) => {
                    const selected = editProfileForm.interests.includes(
                      interest
                    );
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-2 py-1 rounded-full text-xs border ${
                          selected
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-white text-gray-700 border-gray-300"
                        }`}
                      >
                        {interest.replace("_", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {editProfileError && (
              <p className="mt-3 text-sm text-red-500">{editProfileError}</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditProfileOpen(false);
                  setAvatarFile(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={editProfileLoading}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
              >
                {editProfileLoading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {ownProfile && isChangeUsernameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-5">
            <h2 className="text-lg font-semibold mb-4">Change username</h2>
            <p className="text-xs text-gray-500 mb-2">
              You can change your username once every 30 days.
            </p>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {usernameError && (
              <p className="mt-3 text-sm text-red-500">{usernameError}</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsChangeUsernameOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangeUsername}
                disabled={usernameLoading}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
              >
                {usernameLoading ? "Saving..." : "Change username"}
              </button>
            </div>
          </div>
        </div>
      )}

      {ownProfile && isChangeEmailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-5">
            <h2 className="text-lg font-semibold mb-4">Change email</h2>
            <p className="text-xs text-gray-500 mb-2">
              We will send a verification link to your new email. The change
              completes after you confirm it.
            </p>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {emailError && (
              <p className="mt-3 text-sm text-red-500">{emailError}</p>
            )}
            {emailMessage && (
              <p className="mt-3 text-sm text-green-600">{emailMessage}</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsChangeEmailOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleChangeEmail}
                disabled={emailLoading}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
              >
                {emailLoading ? "Sending..." : "Send link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
