import React, { useEffect, useMemo, useState } from "react";
import { Crown } from "lucide-react";
import { useSelector } from "react-redux";
import mainApi from "../../Apis/axios";

const PostsOfTrip = ({ trip, setTrip }) => {
  const canEdit = trip?.currentUser?.canAccessPrivateData;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewItenary, setShowViewItenary] = useState(false);

  const [myPosts, setMyPosts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { _id, username, avatar } = useSelector((state) => state.user);

  // loading state for highligting post
  const [highlightLoading, setHighlightLoading] = useState({});

  const [selectedPosts, setSelectedPosts] = useState([]);

  const canRemovePostFromTrip = (post) => {
    if (_id === trip.user._id || post.author._id === _id) {
      return true;
    } else return false;
  };

  const [postAddLoading, setPostAddLoading] = useState(false);
  /* -------------------------------- utils -------------------------------- */

  const formatDate = (date) => new Date(date).toDateString();

  const tripDays = useMemo(() => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, [trip.startDate, trip.endDate]);

  /* --------------------------- fetch own posts ---------------------------- */

  useEffect(() => {
    if (!showAddModal || !canEdit) return;

    const controller = new AbortController();

    const fetchMyPosts = async () => {
      try {
        setError("");
        setLoading(true);
        const res = await mainApi.get("/api/posts/me", {
          signal: controller.signal,
        });
        setMyPosts(res.data?.post || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
    return () => controller.abort();
  }, [showAddModal, canEdit]);

  /* ----------------------- filter posts not in trips ----------------------- */

  const availablePosts = useMemo(() => {
    const postsWithNoTrip = myPosts.filter((p) => !p.tripId);
    return postsWithNoTrip.map((p) => ({
      ...p,
      isSelected: false,
      isHighlighted: false,
      dayNumber: 1,
    }));
  }, [myPosts]);

  /* -------------------------- sort trip posts ------------------------------ */

  const sortedTripPosts = useMemo(() => {
    return [...trip.posts].sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) {
        return (a.dayNumber || 1) - (b.dayNumber || 1);
      }
      return new Date(a.addedAt) - new Date(b.addedAt);
    });
  }, [trip.posts]);

  /* ---------------------------- is post selected ------------------------------- */
  const isPostSelected = (postId) => {
    return selectedPosts.some((p) => p._id === postId);
  };

  const handleToggleSelectPost = (postId) => {
    if (selectedPosts.some((p) => p._id === postId)) {
      setSelectedPosts((prev) => prev.filter((p) => p._id !== postId));
    } else {
      setSelectedPosts((prev) => [
        ...prev,
        { _id: postId, dayNumber: 1, isHighlighted: false },
      ]);
    }
  };

  const handleAddPost = async () => {
    if (selectedPosts.length === 0) return;

    try {
      setPostAddLoading(true);

      await mainApi.post(`/api/trips/${trip._id}/posts`, {
        posts: selectedPosts,
      });

      setTrip((prev) => {
        const existingPosts = [...prev.posts];

        const newPosts = selectedPosts.map((p) => {
          const postFromAvailablePost = availablePosts.find(
            (ap) => ap._id === p._id
          );

          return {
            dayNumber: p.dayNumber,
            isHighlighted: p.isHighlighted,
            highlightedBy: p.isHighlighted ? { _id, username, avatar } : null,
            addedAt: new Date(),
            post: { ...postFromAvailablePost },
          };
        });

        return {
          ...prev,
          posts: [...existingPosts, ...newPosts],
        };
      });

      setShowAddModal(false);
      setSelectedPosts([]);
    } catch (error) {
      console.error(error);
    } finally {
      setPostAddLoading(false);
    }
  };

  const handleSelectDayNumber = (postId, dayNumber) => {
    setSelectedPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, dayNumber } : p))
    );
  };

  const handleHighlightSelectedPost = (postId) => {
    setSelectedPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, isHighlighted: !p.isHighlighted } : p
      )
    );
  };

  const isPostHighlighted = (postId) => {
    return selectedPosts?.find((p) => p._id === postId).isHighlighted;
  };

  const isUsernameMatch = (word, mentionedUser) => {
    const username = word.slice(1);
    return mentionedUser?.some((user) => user.username === username);
  };

  /* ---------- highlight toggle ----------- */

  const handlePostHighlight = async (postId) => {
    if (highlightLoading[postId]) return;

    setHighlightLoading((prev) => ({
      ...prev,
      [postId]: true,
    }));

    const prevPosts = trip.posts;

    setTrip((prev) => ({
      ...prev,
      posts: prev.posts.map((p) =>
        p.post._id === postId
          ? {
              ...p,
              isHighlighted: !p.isHighlighted,
              highlightedBy: {
                _id,
                username,
                avatar,
              },
            }
          : p
      ),
    }));

    try {
      await mainApi.patch(`/api/trips/${trip._id}/posts/${postId}/highlight`);
    } catch (error) {
      setTrip((prev) => ({
        ...prev,
        posts: prevPosts,
      }));
    } finally {
      setHighlightLoading((prev) => ({
        ...prev,
        [postId]: false,
      }));
    }
  };
  /* --------------------------- delete from trip ---------------------------- */

  const handlePostRemove = async (postId) => {
    let removedPost;
    let removedIndex;

    setTrip((prev) => {
      removedIndex = prev.posts.findIndex((p) => p.post._id === postId);
      removedPost = prev.posts[removedIndex];

      return {
        ...prev,
        posts: prev.posts.filter((p) => p.post._id !== postId),
      };
    });

    try {
      await mainApi.delete(`/api/trips/${trip._id}/posts/${postId}`);
    } catch (error) {
      // exact rollback
      setTrip((prev) => {
        const posts = [...prev.posts];
        posts.splice(removedIndex, 0, removedPost);
        return { ...prev, posts };
      });
    }
  };

  const dayThemes = [
    {
      bg: "bg-gradient-to-br from-rose-50 to-pink-50",
      accent: "text-rose-700",
      border: "border-rose-200",
      badge: "bg-rose-500",
    },
    {
      bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
      accent: "text-blue-700",
      border: "border-blue-200",
      badge: "bg-blue-500",
    },
    {
      bg: "bg-gradient-to-br from-purple-50 to-violet-50",
      accent: "text-purple-700",
      border: "border-purple-200",
      badge: "bg-purple-500",
    },
    {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      accent: "text-emerald-700",
      border: "border-emerald-200",
      badge: "bg-emerald-500",
    },
    {
      bg: "bg-gradient-to-br from-amber-50 to-orange-50",
      accent: "text-amber-700",
      border: "border-amber-200",
      badge: "bg-amber-500",
    },
    {
      bg: "bg-gradient-to-br from-indigo-50 to-blue-50",
      accent: "text-indigo-700",
      border: "border-indigo-200",
      badge: "bg-indigo-500",
    },
    {
      bg: "bg-gradient-to-br from-fuchsia-50 to-pink-50",
      accent: "text-fuchsia-700",
      border: "border-fuchsia-200",
      badge: "bg-fuchsia-500",
    },
  ];

  // itinerary specific calculations

  const totalDaysAndPhotosOFTrip = useMemo(() => {
    const totalDays = Object.keys(trip?.itinerary)?.length;
    const totalPhotos = trip.posts.reduce(
      (acc, p) => acc + (p.post?.media?.length || 0),
      0
    );

    return {
      totalDays,
      totalPhotos,
    };
  }, [trip.posts.length]);

  return (
    <div className="w-full bg-white rounded-xl p-4 shadow-lg flex flex-col gap-5 z-2">
      {/* Header */}
      <div className="flex justify-between items-center ">
        <h3 className="text-2xl font-semibold leckerli text-red-500">
          Trip Posts
        </h3>

        <div className="flex items-center justify-end gap-4">
          {canEdit && (
            <div
              onClick={() => setShowAddModal(true)}
              className="bg-red-500 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <i className="bx bx-image-plus text-white text-2xl" />
              <p className=" text-white font-semibold cursor-pointer">
                Add Posts
              </p>
            </div>
          )}

          <div
            className="bg-red-500 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            onClick={() => setShowViewItenary(true)}
          >
            <i className="bx  bx-glasses-alt text-white text-2xl"></i>
            <p className=" text-white font-semibold cursor-pointer">
              View Itinerary
            </p>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedTripPosts.map((p) => (
          <div
            key={p._id}
            className="relative  rounded-lg overflow-hidden shadow-md flex flex-col items-center  w-full  "
          >
            {p.post.media?.length > 1 && (
              <div className="w-full h-8 flex flex-col items-center justify-center">
                <div className="w-[70%] h-1/3 rounded-t-[10px] bg-black/30 border-1 border-white"></div>
                <div className="w-[80%] h-1/3 rounded-t-[10px] bg-black/50 border-1 border-white"></div>
                <div className="w-[90%] h-1/3 rounded-t-[10px] bg-black/90 border-1 border-white"></div>
              </div>
            )}
            <div className="w-full h-80 relative overflow-hidden group rounded-lg ">
              {/* Media / Caption */}
              {p.post.media?.length ? (
                p.post.media[0].resource_type === "image" ? (
                  <img
                    src={p.post.media[0].url}
                    alt=""
                    className="h-full object-cover "
                  />
                ) : (
                  <video
                    src={p.post.media[0].url}
                    controls
                    className="w-full object-cover "
                  />
                )
              ) : (
                <div className="w-full h-full overflow-hidden p-4 text-gray-700">
                  <p className="leading-relaxed line-clamp-[12]">
                    {p.post.caption}
                  </p>
                </div>
              )}

              {/* post author */}
              <div className="w-full h-full bg-black/30  absolute inset-0 opacity-0 group-hover:opacity-100 ">
                <div className="absolute bottom-2 left-1 px-2 w-full flex flex-col items-start gap-2">
                  <div className="w-full flex items-center justify-start gap-2">
                    {/* avatar */}
                    <div className="w-8 h-8 rounded-full">
                      <img
                        src={p.post.author.avatar?.url || p.post.author.avatar}
                        className="w-full object-cover"
                      />
                    </div>
                    {/* name and username */}
                    <div className="flex flex-col items-start gap-1.5">
                      <p className="text-white text-sm">
                        {p.post.author.name}{" "}
                      </p>
                      <p className="text-white text-xs">
                        @{p.post.author.username}{" "}
                      </p>
                    </div>
                  </div>

                  {p.post.media?.length > 0 && p.post.caption.length > 0 && (
                    <div className="w-full text-white text-sm truncate ">
                      {p.post.caption}
                    </div>
                  )}
                </div>
              </div>

              {/* likes and comments of the post */}
              <div className="w-full absolute top-1/2 left-1/2 -translate-1/2 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                {/* like */}
                <div className="flex items-center justify-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="red"
                    viewBox="0 0 24 24"
                    stroke="white"
                    className="w-5 h-5 "
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.995 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 
             5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.495 2.09C13.09 
             3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 
             3.78-3.4 6.86-8.545 11.54l-1.46 1.31z"
                    />
                  </svg>
                  <p className="text-white text-sm">{p.post.likes?.length} </p>
                </div>

                {/* comment */}
                <div className="flex items-center justify-center gap-1.5">
                  <i className="bx  bx-message-bubble text-white text-xl" />

                  <p className="text-white text-sm">
                    {p.post.comments?.length}{" "}
                  </p>
                </div>
              </div>

              {/* highlight , multiple post icon , remove post */}

              <div className=" absolute right-2 top-2 flex items-center justify-center gap-3 ">
                {/* Highlight Star */}
                {p.isHighlighted ? (
                  <div
                    className={`h-7 w-7  bg-yellow-500 border-1 border-yellow-600 rounded-full ${
                      highlightLoading[p.post._id]
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() =>
                      handlePostHighlight(p.post._id, "unHighlight")
                    }
                  >
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 200 200"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Star */}
                      <polygon
                        points="100,20 124,78 186,78 136,116 156,178 100,140 44,178 64,116 14,78 76,78"
                        fill="#ffffff"
                      />
                    </svg>
                  </div>
                ) : !p.isHighlighted && canEdit ? (
                  <div
                    className={`h-7 w-7  rounded-full bg-gray-600 border-1 border-white ${
                      highlightLoading[p.post._id]
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() => handlePostHighlight(p.post._id, "highlight")}
                  >
                    <svg
                      className="w-full h-full "
                      viewBox="0 0 200 200"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Star */}
                      <polygon
                        points="100,20 124,78 186,78 136,116 156,178 100,140 44,178 64,116 14,78 76,78"
                        fill="#FFF"
                      />
                    </svg>
                  </div>
                ) : (
                  <></>
                )}

                {p.post.media?.length > 1 && (
                  <div className="bg-black/30 px-3 py-1.5 rounded-full flex items-center justify-center gap-1.5 ">
                    <i className="bx bx-images text-white text-2xl" />
                    <p className=" text-white text-sm font-semibold">
                      {p.post.media?.length}{" "}
                    </p>
                  </div>
                )}

                {canRemovePostFromTrip(p.post) && (
                  <i
                    className="bx bx-trash p-2 bg-white rounded-full text-red-500 text-xl  cursor-pointer"
                    onClick={() => handlePostRemove(p.post._id)}
                  />
                )}
              </div>

              {/* Day Badge */}
              {p.dayNumber && (
                <div className="absolute top-2 left-2 bg-red-500  text-white font-semibold px-2 rounded-lg ">
                  Day {p.dayNumber}
                </div>
              )}
            </div>

            {/* highlighted by  */}

            {p.isHighlighted && (
              <div className="w-full flex  items-center gap-3 px-2 py-1.5 bg-yellow-500/30 border-2 border-yellow-600 rounded-lg shadow-md hover:shadow-2xl mt-2">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Star */}
                  <polygon
                    points="100,20 124,78 186,78 136,116 156,178 100,140 44,178 64,116 14,78 76,78"
                    fill="#cd9400"
                  />
                </svg>

                <img
                  src={p.highlightedBy.avatar?.url || p.highlightedBy.avatar}
                  alt="image"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <p className="text-black text-sm">
                  <span className="font-semibold">
                    @{p.highlightedBy.username}{" "}
                  </span>
                  highlighted this
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Post Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center px-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[#edf2f4] rounded-2xl w-full md:w-2xl max-h-screen flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <>
              {/* ================= HEADER ================= */}
              <div className="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 p-6 flex items-center justify-between z-10">
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl md:text-3xl text-white font-semibold leckerli">
                    Add Posts to The Trip
                  </h3>
                  {selectedPosts.length > 0 && (
                    <p className="text-sm font-medium text-white/90">
                      {selectedPosts.length} post selected
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setShowAddModal(false)}
                  className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/20 transition"
                >
                  <i className="bx bx-x text-white text-3xl" />
                </button>
              </div>

              {/* ================= BODY ================= */}
              <div className="flex flex-col gap-4 p-5 overflow-y-auto">
                {/* loading shimmer*/}
                {loading && (
                  <>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        className="animate-pulse rounded-xl border border-gray-300 bg-white p-4 flex flex-col gap-4"
                        key={i}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-full bg-gray-300" />
                          <div className="flex flex-col gap-2">
                            <div className="h-4 w-32 bg-gray-300 rounded" />
                            <div className="h-3 w-24 bg-gray-200 rounded" />
                          </div>
                        </div>

                        <div className="h-4 w-full bg-gray-200 rounded" />
                        <div className="h-4 w-5/6 bg-gray-200 rounded" />

                        <div className="h-60 w-full bg-gray-300 rounded-lg" />
                      </div>
                    ))}
                  </>
                )}

                {/* error state */}

                {!loading && error && (
                  <div className="w-full flex flex-col items-center justify-center py-10 gap-3">
                    <i className="bx bx-error-circle text-5xl text-red-500" />
                    <p className="text-lg font-semibold text-red-600">
                      {error}
                    </p>
                    <p className="text-sm text-gray-500">
                      Please try again later
                    </p>
                  </div>
                )}

                {/* no posts made */}
                {!loading && !error && availablePosts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <i className="bx bx-image-alt text-6xl text-gray-400" />
                    <p className="text-xl font-semibold text-gray-600">
                      No posts made yet
                    </p>
                    <p className="text-sm text-gray-500">
                      Create a post to add it to your trip
                    </p>
                  </div>
                )}

                {!loading && !error && availablePosts.length > 0 && (
                  <>
                    {availablePosts.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => handleToggleSelectPost(p._id)}
                        className={`cursor-pointer rounded-xl border-3 transition-all duration-200 ${
                          isPostSelected(p._id)
                            ? "bg-red-500/8 border-red-500 shadow-md"
                            : "bg-white border-gray-300 hover:border-red-400"
                        }`}
                      >
                        <div className="flex flex-col gap-4 p-4">
                          {/* ===== AUTHOR INFO ===== */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 rounded-full overflow-hidden">
                                <img
                                  src={p.author.avatar?.url || p.author.avatar}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="flex flex-col">
                                <div className=" flex items-center justify-start ">
                                  <p className="text-sm font-semibold">
                                    {p.author.name}
                                  </p>
                                  {p.taggedUsers?.length > 0 && (
                                    <div className="flex items-center gap-2 ml-4">
                                      <span className="text-sm text-gray-600">
                                        With
                                      </span>
                                      <img
                                        src={
                                          p.taggedUsers[0].avatar?.url ||
                                          p.taggedUsers[0].avatar
                                        }
                                        alt=""
                                        className="h-7 w-7 rounded-full"
                                      />
                                      {p.taggedUsers.length > 1 && (
                                        <span className="text-sm text-gray-600">
                                          & {p.taggedUsers.length - 1} others
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className=" flex items-center justify-start gap-3">
                                  <p className="text-sm text-gray-500">
                                    @{p.author.username}
                                  </p>
                                  <span className="text-xl text-gray-600">
                                    {" "}
                                    |{" "}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {" "}
                                    Created at {formatDate(p.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* ===== SELECT INDICATOR ===== */}
                            <div
                              className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition ${
                                isPostSelected(p._id)
                                  ? "bg-red-500 border-red-500"
                                  : "border-gray-400"
                              }`}
                            >
                              {isPostSelected(p._id) && (
                                <i className="bx bx-check text-white text-xl" />
                              )}
                            </div>
                          </div>

                          {/* caption */}
                          {p.caption?.length > 0 && (
                            <div className="w-full px-2">
                              <p className="text-base flex flex-wrap gap-1">
                                {p.caption.split(" ").map((word, i) => {
                                  if (word.startsWith("@")) {
                                    const isMentioned = isUsernameMatch(
                                      word,
                                      p.mentions
                                    );
                                    return isMentioned ? (
                                      <span
                                        key={i}
                                        className="text-red-500 text-lg leckerli"
                                      >
                                        {word}
                                      </span>
                                    ) : (
                                      <span key={i}>{word}</span>
                                    );
                                  }

                                  if (word.startsWith("#")) {
                                    return (
                                      <span
                                        key={i}
                                        className="text-blue-500 leckerli"
                                      >
                                        {word}
                                      </span>
                                    );
                                  }

                                  return (
                                    <span key={i} className="text-black">
                                      {word}
                                    </span>
                                  );
                                })}
                              </p>
                            </div>
                          )}

                          {/* ===== MEDIA ===== */}
                          {p.media?.length > 0 && (
                            <div className="w-full h-80 rounded-lg overflow-hidden">
                              {/* ===== 1 MEDIA ===== */}
                              {p.media.length === 1 && (
                                <div className="w-full h-full">
                                  {p.media[0].resource_type === "image" ? (
                                    <img
                                      src={p.media[0].url}
                                      className="w-full h-full object-cover"
                                      alt=""
                                    />
                                  ) : (
                                    <video
                                      src={p.media[0].url}
                                      className="w-full h-full object-cover"
                                      controls
                                    />
                                  )}
                                </div>
                              )}

                              {/* ===== 2 MEDIA ===== */}
                              {p.media.length === 2 && (
                                <div className="grid grid-cols-2 h-full w-full">
                                  {p.media.map((m, i) =>
                                    m.resource_type === "image" ? (
                                      <img
                                        key={i}
                                        src={m.url}
                                        className="w-full h-full object-cover"
                                        alt=""
                                      />
                                    ) : (
                                      <video
                                        key={i}
                                        src={m.url}
                                        className="w-full h-full object-cover"
                                        controls
                                      />
                                    )
                                  )}
                                </div>
                              )}

                              {/* ===== 3 OR MORE MEDIA ===== */}
                              {p.media.length >= 3 && (
                                <div className="grid grid-cols-2 h-full w-full">
                                  {/* LEFT COLUMN */}
                                  <div className="w-full h-full">
                                    {p.media[0].resource_type === "image" ? (
                                      <img
                                        src={p.media[0].url}
                                        className="w-full h-full object-cover"
                                        alt=""
                                      />
                                    ) : (
                                      <video
                                        src={p.media[0].url}
                                        className=" h-full object-cover"
                                        controls
                                      />
                                    )}
                                  </div>

                                  {/* RIGHT COLUMN */}
                                  <div className="grid grid-rows-[1fr_1fr] h-full w-full">
                                    {/* TOP RIGHT */}
                                    <div className="w-full h-full overflow-hidden">
                                      {p.media[1].resource_type === "image" ? (
                                        <img
                                          src={p.media[1].url}
                                          className="w-full h-full object-cover block"
                                          alt=""
                                        />
                                      ) : (
                                        <video
                                          src={p.media[1].url}
                                          className="w-full h-full object-cover block"
                                          controls
                                        />
                                      )}
                                    </div>

                                    {/* BOTTOM RIGHT */}
                                    <div className="relative w-full h-full overflow-hidden">
                                      {p.media[2].resource_type === "image" ? (
                                        <img
                                          src={p.media[2].url}
                                          className="w-full h-full object-cover block"
                                          alt=""
                                        />
                                      ) : (
                                        <video
                                          src={p.media[2].url}
                                          className="w-full h-full object-cover block"
                                          controls
                                        />
                                      )}

                                      {p.media.length > 3 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                          <span className="text-white text-xl font-semibold">
                                            +{p.media.length - 3} more
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {p.media?.length === 0 && (
                            <div className="w-full flex items-center justify-end">
                              <p className="px-3 py-2 rounded-full bg-gray-300 text-black font-semibold text-sm">
                                text only
                              </p>
                            </div>
                          )}

                          <div className="w-full flex items-center justify-start gap-5">
                            <div className="flex items-center justify-start gap-2">
                              <i className="bx bx-heart text-2xl text-gray-600" />
                              <p className="text-gray-600">{p.likes.length} </p>
                            </div>
                            <div className="flex items-center justify-start gap-2">
                              <i className="bx  bx-message-circle-reply text-2xl text-gray-700" />

                              <p className="text-gray-600">
                                {p.comments.length}{" "}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* day number and highlight */}
                        <div
                          className={`${
                            isPostSelected(p._id) ? "h-fit" : "h-0"
                          } transition-all duration-300 ease-in w-full  px-3 py-4`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isPostSelected(p._id) && (
                            <div className="w-full flex flex-col gap-5 ">
                              <div className="w-full flex flex-col items-start gap-2 ">
                                <h2 className="text-black font-semibold">
                                  Assign to Day
                                </h2>
                                <div className="w-full flex items-center flex-wrap gap-2">
                                  {Array.from({ length: tripDays }, (_, i) => {
                                    const dayNumber = selectedPosts.find(
                                      (post) => post._id === p._id
                                    )?.dayNumber;

                                    return (
                                      <span
                                        key={i}
                                        className={`px-3 cursor-pointer py-2 font-semibold rounded-xl text-sm ${
                                          i + 1 === dayNumber
                                            ? "bg-red-500 text-white"
                                            : "bg-white text-black"
                                        }`}
                                        onClick={(e) => {
                                          handleSelectDayNumber(p._id, i + 1);
                                        }}
                                      >
                                        Day {i + 1}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* highlight */}
                              <div
                                className={`${
                                  isPostHighlighted(p._id)
                                    ? "bg-amber-500 border-yellow-700"
                                    : " bg-white border-gray-400"
                                } w-full flex items-center justify-center gap-2 rounded-lg border-3 py-3 `}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleHighlightSelectedPost(p._id);
                                }}
                              >
                                {isPostHighlighted(p._id) ? (
                                  <div className="w-full flex items-center justify-center gap-1.5 font-semibold">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="white"
                                      className="h-8 w-8"
                                    >
                                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                                    </svg>

                                    <p className="text-white text-lg">
                                      Highlighted
                                    </p>
                                  </div>
                                ) : (
                                  <div className="w-full flex items-center justify-center gap-1.5 font-semibold">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="white"
                                      stroke="black"
                                      className="h-8 w-8"
                                    >
                                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                                    </svg>

                                    <p className="text-gray-600 text-lg">
                                      Mark as Highlight
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="sticky bottom-0  px-3 py-3 flex items-center justify-between bg-gradient-to-r from-gray-300 to-gray-400">
                <p className="flex items-center text-gray-800">
                  {selectedPosts.length === 0 ? (
                    <span>Select posts to continue </span>
                  ) : (
                    <span>
                      Ready to add{" "}
                      <span className="text-red-500 font-semibold">
                        {selectedPosts.length}
                      </span>{" "}
                      {selectedPosts.length === 1 ? "post" : "posts"}
                    </span>
                  )}
                </p>

                <div className="flex items-center justify-end gap-3">
                  {/* cancel */}
                  <div
                    className="px-3 py-2 text-gray-600 bg-white rounded-lg cursor-pointer shadow-md hover:shadow-2xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddModal(false);
                    }}
                  >
                    Cancel
                  </div>

                  {/* add post */}
                  {postAddLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="spinner" />
                      <p className="text-white font-semibold">Adding posts…</p>
                    </div>
                  ) : (
                    <div
                      className={`${
                        selectedPosts.length === 0
                          ? "cursor-not-allowed pointer-events-none opacity-60"
                          : "cursor-pointer opacity-100"
                      } bg-red-500 leckerli  px-3 py-2 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-2xl`}
                      onClick={
                        selectedPosts.length > 0 ? handleAddPost : undefined
                      }
                    >
                      <i className="bx bx-plus text-white text-2xl" />
                      <p className="text-white font-semibold">Add Posts</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          </div>
        </div>
      )}

      {/* view iternary of posts */}
      {showViewItenary && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center px-4"
          onClick={() => setShowViewItenary(false)}
        >
          <div
            className="bg-[#edf2f4] rounded-2xl w-full md:w-2xl max-h-screen flex flex-col justify-between overflow-y-auto shadow-2xl   "
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="w-full flex items-center justify-between px-3 py-4  bg-white sticky top-0 z-40">
              <div className="flex flex-col items-start gap-3">
                <h2 className="text-2xl text-red-500 font-semibold">
                  Trip Itinerary
                </h2>
                <p>
                  {" "}
                  {totalDaysAndPhotosOFTrip.totalDays} Days{" "}
                  <span className="text-gray-500 text-xl"> | </span>
                  {totalDaysAndPhotosOFTrip.totalPhotos} Moments captured
                </p>
              </div>

              {/* cancel */}
              <i className="bx bx-x text-3xl text-gray-500" />
            </div>

            {/* posts */}
            <div className="flex flex-col items-center gap-5 w-full p-4 bg-[#edf2f4] h-fit">
              {Object.keys(trip.itinerary).map((day, i) => {
                const memory = trip.itinerary[day].length || 0;
                const photosCaptured = trip.itinerary[day].reduce(
                  (acc, p) => acc + (p.media?.length || 0),
                  0
                );

                const totalLikes = trip.itinerary[day].reduce(
                  (acc, p) => acc + (p?.likes?.length || 0),
                  0
                );

                return (
                  <div
                    key={i}
                    className={`bg-white w-full flex flex-col items-center ${
                      dayThemes[i % dayThemes.length].border
                    } rounded-xl border-3`}
                  >
                    {/* Day Header */}
                    <div
                      className={`flex items-center justify-between  w-full p-4 ${
                        dayThemes[i % dayThemes.length].bg
                      } rounded-t-xl`}
                    >
                      {/* Day number and memory */}
                      <div className="flex items-center justify-start gap-3">
                        <h2
                          className={`${
                            dayThemes[i % dayThemes.length].badge
                          }  text-white px-4 py-2.5 rounded-lg text-2xl font-semibold leckerli `}
                        >
                          Day {day}
                        </h2>

                        <div className=" flex flex-col items-start gap-2">
                          <h3
                            className={` text-xl ${
                              dayThemes[i % dayThemes.length].accent
                            }`}
                          >
                            {memory} {memory === 1 ? "Memory" : "Memories"}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            {photosCaptured}{" "}
                            {photosCaptured === 1 ? "photo" : "photos"} captured{" "}
                          </p>
                        </div>
                      </div>
                      {/* like counts */}
                      <div className=" flex items-center justify-end gap-2">
                        <i className="bx bx-heart text-xl text-red-600" />
                        <p className="text-sm text-gray-500 ">
                          {totalLikes} likes{" "}
                        </p>
                      </div>
                    </div>

                    {/* posts in a day */}
                    <div className=" p-4 bg-white flex flex-col items-center gap-4 w-full rounded-b-xl">
                      {trip.itinerary[day].map((p) => {
                        const isLikedByCurrentUser = p.isLikedByCurrentUser;

                        return (
                          <div
                            key={p._id}
                            className={`w-full p-2.5 flex flex-col items-center gap-3 ${
                              dayThemes[i % dayThemes.length].bg
                            } rounded-lg`}
                          >
                            {/* author */}
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-full overflow-hidden">
                                  <img
                                    src={
                                      p.author.avatar?.url || p.author.avatar
                                    }
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                <div className="flex flex-col">
                                  <div className=" flex items-center justify-start ">
                                    <p className="text-sm font-semibold flex items-center justify-start ">
                                      <span>{p.author.name}</span>
                                      {trip.user._id === p.author._id && (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          fill="white"
                                          stroke="#ffc800"
                                          strokeWidth="3"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-crown-icon lucide-crown h-6 w-6"
                                        >
                                          <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                                          <path d="M5 21h14" />
                                        </svg>
                                      )}
                                    </p>
                                    {p.taggedUsers?.length > 0 && (
                                      <div className="flex items-center gap-2 ml-4">
                                        <span className="text-sm text-gray-600">
                                          With
                                        </span>
                                        <img
                                          src={
                                            p.taggedUsers[0].avatar?.url ||
                                            p.taggedUsers[0].avatar
                                          }
                                          alt=""
                                          className="h-7 w-7 rounded-full"
                                        />
                                        {p.taggedUsers.length > 1 && (
                                          <span className="text-sm text-gray-600">
                                            & {p.taggedUsers.length - 1} others
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className=" flex items-center justify-start gap-3">
                                    <p className="text-sm text-gray-500">
                                      @{p.author.username}
                                    </p>
                                    <span className="text-xl text-gray-600">
                                      {" "}
                                      |{" "}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {" "}
                                      Created at {formatDate(p.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {p.isHighlighted && p.highlightedBy && (
                                <div className="flex items-center justify-end gap-1.5 bg-yellow-500/20 rounded-full px-4 py-1 border-1 border-yellow-700 shadow-xl">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="#FEA102"
                                    stroke="#FEA102"
                                    strokeWidth="4.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-star-icon lucide-star h-6 w-6"
                                  >
                                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                                  </svg>
                                  <p className="text-sm text-yellow-800">
                                    Highlighted
                                  </p>
                                </div>
                              )}
                            </div>
                            {/* caption */}
                            {p.caption.length > 0 && (
                              <p className="text-base flex flex-wrap gap-1">
                                {p.caption.split(/\s+/).map((word, i) => {
                                  if (word.startsWith("@")) {
                                    const isMentioned = isUsernameMatch(
                                      word,
                                      p.mentions
                                    );
                                    return isMentioned ? (
                                      <span
                                        key={i}
                                        className="text-red-500 text-lg leckerli"
                                      >
                                        {word}
                                      </span>
                                    ) : (
                                      <span key={i}>{word}</span>
                                    );
                                  }

                                  if (word.startsWith("#")) {
                                    return (
                                      <span
                                        key={i}
                                        className="text-blue-500 leckerli"
                                      >
                                        {word}
                                      </span>
                                    );
                                  }

                                  return (
                                    <span key={i} className="text-black">
                                      {word}
                                    </span>
                                  );
                                })}
                              </p>
                            )}
                            {/* images and videos */}
                            {p.media?.length > 0 && (
                              <>
                                {p.media.length === 1 ? (
                                  // Single Image
                                  <div
                                    className="relative rounded-lg overflow-hidden cursor-pointer"
                                    onClick={() => handleImageClick(p.media, 0)}
                                  >
                                    <img
                                      src={p.media[0].url}
                                      alt=""
                                      className="w-full max-h-96 object-cover transition-transform group-hover:scale-105"
                                    />
                                  </div>
                                ) : (
                                  // Multiple Images Grid
                                  <div>
                                    <div className="flex items-center gap-2 mb-2 text-gray-600">
                                      <i
                                        className={` bx bx-images  text-3xl ${
                                          dayThemes[i % dayThemes.length].accent
                                        }`}
                                      />
                                      <span className="text-sm">
                                        {p.media.length} photos
                                      </span>
                                    </div>
                                    <div
                                      className={`grid grid-cols-${
                                        p.media.length === 2 ? "2" : "3"
                                      } gap-2`}
                                    >
                                      {p.media
                                        .slice(0, 6)
                                        .map((file, index) => (
                                          <div
                                            key={file._id}
                                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer "
                                            onClick={() =>
                                              handleImageClick(p.media)
                                            }
                                          >
                                            {file.resource_type === "image" ? (
                                              <img
                                                src={file.url}
                                                alt=""
                                                className="w-full h-full object-cover  "
                                              />
                                            ) : (
                                              <video
                                                src={file.url}
                                                alt=""
                                                className="w-full h-full object-cover "
                                              />
                                            )}
                                            {index === 5 &&
                                              p.media.length > 6 && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                  <span className="text-white text-xl">
                                                    +{p.media.length - 6} more
                                                  </span>
                                                </div>
                                              )}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            <div className="w-full border-t-2 border-gray-600" />

                            {/*Likes and Comments  */}

                            <div className="w-full flex items-center justify-start gap-5">
                              {/* likes */}
                              <div className="flex items-center justify-start gap-2">
                                {isLikedByCurrentUser ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="#E2504D"
                                    stroke="#ffffff"
                                    strokeWidth="2.625"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-heart-icon lucide-heart h-6 w-6"
                                  >
                                    <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="#ffffff"
                                    stroke="#E2504D"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-heart-icon lucide-heart h-6 w-6"
                                  >
                                    <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
                                  </svg>
                                )}
                                <p className="text-gray-600 text-sm">
                                  {p.likeCount} Likes
                                </p>
                              </div>

                              {/* comments */}
                              <div className="flex items-center justify-start gap-2">
                                <i className="bx  bx-message-circle-reply text-gray-600 text-2xl" />
                                <p className="text-gray-600 text-sm">
                                  {p.commentCount}
                                </p>
                              </div>
                            </div>

                            {/* highlighted post */}

                            {p.isHighlighted && p.highlightedBy && (
                              <div className="p-3 bg-yellow-500/30 border-2 border-yellow-700 rounded-xl flex items-center justify-start  gap-3 w-full">
                                <img
                                  src={
                                    p.highlightedBy.avatar.url ||
                                    p.highlightedBy.avatar
                                  }
                                  className="h-8 w-8 rounded-full object-cover"
                                  alt="image"
                                />
                                <p className="text-sm text-yellow-800 ">
                                  <span className="font-semibold ">
                                    {p.highlightedBy.name}{" "}
                                  </span>{" "}
                                  highlighted this moment
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsOfTrip;

// like
{
  /* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
</svg> */
}

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="lucide lucide-crown-icon lucide-crown"
>
  <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
  <path d="M5 21h14" />
</svg>;
