import React, { useEffect, useMemo, useRef, useState } from "react";
import mainApi from "../Apis/axios";
import { useSelector } from "react-redux";
import useDebounce from "../CustomHooks/useDebounceHook";

const PostCreate = ({ setCreationTab, setCreateModal }) => {
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [followings, setFollowings] = useState([]);
  const [skip, setSkip] = useState(0);
  const { _id, location } = useSelector((state) => state.user);

  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");

  //   for tag related states
  const [tagOpen, setTagOpen] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [tagQuery, setTagQuery] = useState("");
  const debouncedQuery = useDebounce(tagQuery);

  const [tagUsersLoading, setTagUsersLoading] = useState(false);
  const [tagUsersError, setTagUsersError] = useState("");

  // visibility related states
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [visibilityStatus, setVisibilityStatus] = useState("public");
  // location related states
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationArea, setLocationArea] = useState(location);

  const [showTripModal, setShowTripModal] = useState(false);

  const [caption, setCaption] = useState("");

  // mention related states
  const [mentionOpen, setMentionOpen] = useState(false);

  const [mentionQuery, setMentionQuery] = useState("");

  const [usersToMention, setUsersToMention] = useState([]);
  const [mentionedUsers, setMentionedUsers] = useState([]);

  const [mentionLoading, setMentionLoading] = useState(false);
  const [mentionError, setMentionError] = useState("");

  //   trip selection
  const [activatedTripPage, setActivatedTripPage] = useState("own-trip");
  const [trips, setTrips] = useState([]);
  const [tripLoading, setTripLoading] = useState(true);
  const [tripError, setTripError] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(null);

  // search

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropDownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Start Date");

  //   files
  const MAX_FILES = 20;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const fileRef = useRef(null);
  const lastUserRef = useRef(null);
  const captionRef = useRef(null);

  const fetchFollowingsController = new AbortController();

  const fetchFollowings = async () => {
    if (!hasMore || tagUsersLoading) return;

    setTagUsersLoading(true);
    setTagUsersError("");

    try {
      const res = await mainApi.get(`/api/user/${_id}/following?skip=${skip}`, {
        signal: fetchFollowingsController.signal,
      });

      setFollowings((prev) => [...prev, ...res.data.followingList]);
      setHasMore(res.data.hasMore);
      setSkip((prev) => prev + 10);
    } catch (err) {
      setTagUsersError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setTagUsersLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // initial fetch of followings
  useEffect(() => {
    if (!tagOpen) return;

    setFollowings([]);
    setSkip(0);
    setHasMore(true);
    setTagUsersError("");
    fetchFollowings();
  }, [tagOpen]);

  useEffect(() => {
    if (!tagOpen) return;
    if (!hasMore) return;
    if (!lastUserRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchFollowings();
        }
      },
      { threshold: 0.2 }
    );

    observerRef.current.observe(lastUserRef.current);

    return () => {
      observerRef.current.disconnect();
      fetchFollowingsController.abort();
    };
  }, [followings, tagOpen, hasMore]);

  const filteredUsers = useMemo(() => {
    if (!debouncedQuery.trim()) return followings;

    return followings.filter(
      (u) =>
        u.username.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [debouncedQuery, followings]);

  const canTagUser = (user) => {
    if (user._id === _id) return false;
    if (taggedUsers.some((u) => u._id === user._id)) return false;
    return true;
  };

  const handleCaption = (e) => {
    const value = e.target.value;

    if (value.length > 1000) return;

    setCaption(value);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);

    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);

    if (match) {
      setMentionQuery(match[1]);
      setMentionOpen(true);
    } else {
      setMentionOpen(false);
      setMentionQuery("");
    }
  };

  //   when user mentions someone this fetches result
  useEffect(() => {
    if (!mentionOpen || !mentionQuery) return;

    const fetchMentionUsers = async () => {
      setMentionLoading(true);
      setMentionError("");

      try {
        const res = await mainApi.get(
          `/api/user/search-mentions?q=${mentionQuery}`
        );
        setUsersToMention(res.data.users);
      } catch (err) {
        setMentionError("Failed to fetch users");
      } finally {
        setMentionLoading(false);
      }
    };

    fetchMentionUsers();
  }, [mentionQuery, mentionOpen]);

  const handleMentionSelect = (user) => {
    const textarea = document.querySelector("textarea");
    const cursorPosition = textarea.selectionStart;

    const before = caption.slice(0, cursorPosition);
    const after = caption.slice(cursorPosition);

    // replace "@query" with "@username "
    const newBefore = before.replace(/@([a-zA-Z0-9_]*)$/, `@${user.username} `);

    setCaption(newBefore + after);

    // store mentioned users (important for backend)
    setMentionedUsers((prev) => {
      if (prev.some((u) => u._id === user._id)) return prev;
      return [...prev, user];
    });

    setMentionOpen(false);
    setMentionQuery("");
  };

  const handleFiles = (newFiles) => {
    setFileError("");

    const incomingFiles = Array.from(newFiles);

    // max files check
    if (files.length + incomingFiles.length > MAX_FILES) {
      setFileError("Max 20 files allowed");
      return;
    }

    // map ONLY raw File objects
    const normalizedIncoming = incomingFiles.map((f) => ({
      file: f,
      type: f.type.startsWith("image") ? "image" : "video",
      url: URL.createObjectURL(f),
      size: f.size,
    }));

    const totalSize = [...files, ...normalizedIncoming].reduce(
      (acc, f) => acc + f.size,
      0
    );

    if (totalSize > MAX_FILE_SIZE) {
      setFileError("Total media size exceeded");
      return;
    }

    setFiles((prev) => [...prev, ...normalizedIncoming]);

    fileRef.current.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const openTagDropdown = () => {
    setTagOpen(true);

    if (followings.length === 0) {
      setSkip(0);
      setHasMore(true);
      setError("");
      fetchFollowings();
    }
  };

  useEffect(() => {
    captionRef.current.style.height = "auto";
    captionRef.current.style.height = captionRef.current.scrollHeight + "px";
  }, [caption]);

  const renderStyledCaption = (text) => {
    if (!text) return null;

    const words = text.split(/(\s+)/); // keep spaces

    return words.map((word, index) => {
      if (word.startsWith("@")) {
        const username = word.slice(1);

        const isMentioned = mentionedUsers.some((m) => m.username === username);

        if (isMentioned) {
          return (
            <span key={index} className="text-red-500 font-medium">
              {word}
            </span>
          );
        }
      }

      if (word.startsWith("#")) {
        return (
          <span key={index} className="text-red-500 font-medium leckerli">
            {word}
          </span>
        );
      }

      return <span key={index}>{word}</span>;
    });
  };

  const handleCreatePost = async () => {
    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("taggedUsers", [...taggedUsers.map((user) => user._id)]);
    if (selectedTrip) {
      formData.append("tripId", selectedTrip._id);
      formData.append("visibility", selectedTrip.visibility);
    } else {
      formData.append("visibility", visibilityStatus);
    }
    formData.append("location", locationArea);
    if (mentionedUsers && mentionedUsers.length > 0) {
      formData.append("mentions", [...mentionedUsers.map((user) => user._id)]);
    }

    if (files && files.length > 0) {
      files.forEach((post) => {
        formData.append("post", post.file);
      });
    }
    console.log(formData);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchTrips = async () => {
      setTripError("");
      setTripLoading(true);

      try {
        const result = await mainApi.get(
          `/api/trips/${_id}/${activatedTripPage}`,
          { signal: controller.signal }
        );
        setTrips(result.data?.message ? [] : result.data.trips);
      } catch (error) {
        setTripError(error?.response?.data?.message || "something went wrong");
      } finally {
        setTripLoading(false);
      }
    };

    fetchTrips();

    return () => controller.abort();
  }, [activatedTripPage]);

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setShowTripModal(false);
  };

  useEffect(() => {
    if (selectedTrip) {
      setVisibilityStatus(selectedTrip.visibility);
    }
  }, [selectedTrip]);

  let sortedSearchTrips = useMemo(() => {
    const searchedTrips = trips?.filter(
      (trip) =>
        trip.title?.toLowerCase().includes(search.toLowerCase()) ||
        trip.description?.toLowerCase().includes(search.toLowerCase()) ||
        trip.tags?.includes(
          search.startsWith("#")
            ? search.slice(1).toLowerCase()
            : search.toLowerCase()
        ) ||
        trip.acceptedFriends?.some(
          (friend) =>
            friend.user.username.toLowerCase().includes(search.toLowerCase()) ||
            friend.user.name.toLowerCase().includes(search.toLowerCase())
        ) ||
        trip.user.username.toLowerCase().includes(search.toLowerCase()) ||
        trip.user.name.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === "Start Date") {
      return [...searchedTrips].sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
      );
    } else if (sortBy === "End Date") {
      return [...searchedTrips].sort(
        (a, b) => new Date(a.endDate) - new Date(b.endDate)
      );
    } else if (sortBy === "Destinations") {
      return [...searchedTrips].sort(
        (a, b) =>
          (b?.destinations?.length ?? 0) - (a?.destinations?.length ?? 0)
      );
    } else if (sortBy === "Posts") {
      return [...searchedTrips].sort(
        (a, b) => (b?.posts?.length ?? 0) - (a?.posts?.length ?? 0)
      );
    }
    return [];
  }, [trips, sortBy, search]);

  return (
    <div>
      {!showTripModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
             min-h-screen overflow-y-auto
             flex justify-center py-10 px-4"
          onClick={() => {
            setCreationTab("");
            setCreateModal(false);
          }}
        >
          <div
            className="w-full max-w-2xl bg-[#edf2f4] rounded-2xl shadow-2xl
             p-6 flex flex-col gap-6 h-fit z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center justify-start gap-3">
                <i className="bx bx-image-plus text-4xl text-red-500"></i>
                <h2 className="text-2xl font-semibold text-red-500 leckerli">
                  Create Post
                </h2>
              </div>
              <div
                className="flex items-center justify-center cursor-pointer "
                onClick={() => {
                  setCreationTab("");
                }}
              >
                <i className="bx bx-x text-3xl text-black" />
              </div>
            </div>

            {/* Caption */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800">Caption</h3>
                <span className="text-sm text-gray-500">
                  {caption.length}/1000
                </span>
              </div>

              <div className="relative w-full shadow-2xl">
                {/* Styled preview */}
                <div
                  className="absolute inset-0 px-4 py-3 bg-white rounded-2xl
             pointer-events-none text-gray-700
             whitespace-pre-wrap break-words overflow-hidden"
                >
                  {renderStyledCaption(caption)}
                </div>

                {/* Actual textarea */}
                <textarea
                  value={caption}
                  onChange={handleCaption}
                  ref={captionRef}
                  className="relative w-full min-h-[120px] px-4 py-3 bg-transparent
               text-transparent caret-black resize-none outline-none rounded-2xl"
                  placeholder="Write something..."
                />
              </div>
              {/* Mention Dropdown */}
              {mentionOpen && (
                <div className="relative">
                  <div className="absolute z-50 w-full bg-white rounded-xl shadow-xl border max-h-60 overflow-y-auto">
                    {mentionLoading && (
                      <p className="p-3 text-sm text-gray-500">Searching...</p>
                    )}

                    {mentionError && (
                      <p className="p-3 text-sm text-red-500">{mentionError}</p>
                    )}

                    {!mentionLoading &&
                      !mentionError &&
                      usersToMention.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-red-50"
                          onClick={() => handleMentionSelect(user)}
                        >
                          <img
                            src={user.avatar?.url || user.avatar}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium">
                              @{user.username}
                            </p>
                            <p className="text-xs text-gray-500">{user.name}</p>
                          </div>
                        </div>
                      ))}

                    {!mentionLoading &&
                      !mentionError &&
                      usersToMention.length === 0 && (
                        <p className="p-3 text-sm text-gray-400">
                          No users found
                        </p>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Media Upload */}
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-medium text-gray-800">
                Photos & Videos
              </h3>

              <div
                className="border-4 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition bg-white"
                onClick={() => fileRef.current.click()}
              >
                <i className="bx bx-cloud-upload text-6xl text-gray-400"></i>
                <p className="text-lg font-medium text-gray-700">
                  Click to upload photos & videos
                </p>
                <p className="text-sm text-gray-500">
                  Max 20 files | Total size ≤ 10MB
                </p>

                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                  ref={fileRef}
                />
              </div>

              {fileError && (
                <p className="text-red-500 text-sm font-medium">{fileError}</p>
              )}

              {/* Media Preview */}
              {files.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {files.map((file, ind) => (
                    <div
                      key={ind}
                      className="relative group rounded-xl overflow-hidden shadow-md"
                    >
                      {file.type === "image" ? (
                        <img
                          src={file.url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={file.url}
                          className="w-full h-full object-cover"
                        />
                      )}

                      <button
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition duration-200 ease-in flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(ind);
                        }}
                      >
                        <i className="bx bx-x text-xl"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* visibility */}

            <div className="flex flex-col gap-3">
              <div className="w-full flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">
                  Post Visibility
                </h3>

                {/* info button */}
                <div className="flex items-center justify-center p-3 group w-fit h-fit cursor-pointer relative">
                  <i className="bx bx-info-circle text-3xl text-red-500"></i>

                  <div
                    className="absolute z-50 opacity-0 group-hover:opacity-100 
                  scale-0 group-hover:scale-100
                  transition-all duration-200 ease-out
                  bottom-0 left-0 -translate-x-full translate-y-full
                  mt-3 w-[260px] bg-white rounded-xl shadow-2xl 
                  p-4 flex flex-col gap-3 text-sm text-gray-700"
                  >
                    {/* Arrow */}
                    <div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 
                    w-4 h-4 bg-red-500 rotate-45 shadow-md "
                    ></div>

                    <p className="leading-relaxed mt-3 ">
                      <span className="text-3xl text-red-500">•</span> Selecting
                      a <span className="font-medium text-red-500">Trip</span>{" "}
                      will automatically change your post visibility to the
                      <span className="font-medium"> Trip’s visibility</span>.
                    </p>

                    <p className="leading-relaxed ">
                      <span className="text-3xl text-red-500">•</span> To change
                      post visibility, either
                      <span className="font-medium"> detach the trip</span> or
                      update the{" "}
                      <span className="font-medium">Trip visibility</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Selected visibility */}
                <div
                  className={`${
                    selectedTrip ? "cursor-not-allowed" : "cursor-pointer"
                  } flex items-center justify-between px-4 py-3  hover:bg-gray-50 transition`}
                  onClick={() => {
                    if (!selectedTrip) {
                      setVisibilityOpen((prev) => !prev);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <i
                      className={`bx text-2xl text-red-500 bx-${
                        visibilityStatus === "public"
                          ? "globe"
                          : visibilityStatus === "followers"
                          ? "group"
                          : visibilityStatus === "close_friends"
                          ? "user-check"
                          : "lock"
                      }`}
                    ></i>

                    <p className="text-gray-800 font-medium">
                      {visibilityStatus === "public"
                        ? "Public"
                        : visibilityStatus === "followers"
                        ? "Followers"
                        : visibilityStatus === "close_friends"
                        ? "Close Friends"
                        : "Private"}
                    </p>
                  </div>

                  <i
                    className={`bx bx-chevron-${
                      visibilityOpen ? "up" : "down"
                    } text-2xl text-gray-500`}
                  ></i>
                </div>

                {/* Dropdown */}
                {visibilityOpen && (
                  <div className="border-t border-gray-200 divide-y">
                    {["public", "followers", "close_friends", "private"].map(
                      (visibility, i) => {
                        const status =
                          visibility === "public"
                            ? "Public"
                            : visibility === "followers"
                            ? "Followers"
                            : visibility === "close_friends"
                            ? "Close Friends"
                            : "Private";

                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition
                  ${
                    visibilityStatus === visibility
                      ? "bg-red-50 text-red-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                            onClick={() => {
                              setVisibilityStatus(visibility);
                              setVisibilityOpen(false);
                            }}
                          >
                            <i
                              className={`bx text-2xl bx-${
                                visibility === "public"
                                  ? "globe"
                                  : visibility === "followers"
                                  ? "group"
                                  : visibility === "close_friends"
                                  ? "user-check"
                                  : "lock"
                              }`}
                            ></i>

                            <p className="font-medium">{status}</p>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Location */}

            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-medium text-gray-800">
                Post Location
              </h3>

              <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Selected visibility */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => {
                    setLocationOpen((prev) => !prev);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span>{locationArea?.city || "no city selected"}</span>,
                    <span>{locationArea?.state || "no state selected"}</span>,
                    <span>
                      {locationArea?.country || "no country selected"}
                    </span>
                  </div>

                  <i
                    className={`bx bx-chevron-${
                      locationOpen ? "up" : "down"
                    } text-2xl text-gray-500`}
                  ></i>
                </div>

                {/* Dropdown */}
                {locationOpen && (
                  <div className="w-full flex flex-col items-start justify-center gap-3 px-3 py-3 bg-[#edf2f4]">
                    <div className="flex flex-col items-start justify-center gap-1.5">
                      <h3 className="text-lg font-medium text-gray-800">
                        City
                      </h3>
                      <input
                        type="text"
                        className="px-2 py-0.5 rounded-lg outline-none border-none bg-white shadow-2xl"
                        value={locationArea.city}
                        onChange={(e) => {
                          setLocationArea((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }));
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center gap-1.5">
                      <h3 className="text-lg font-medium text-gray-800">
                        State
                      </h3>
                      <input
                        type="text"
                        className="px-2 py-0.5 rounded-lg outline-none border-none bg-white shadow-2xl"
                        value={locationArea.state}
                        onChange={(e) => {
                          setLocationArea((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }));
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center gap-1.5">
                      <h3 className="text-lg font-medium text-gray-800">
                        Country
                      </h3>
                      <input
                        type="text"
                        className="px-2 py-0.5 rounded-lg outline-none border-none bg-white shadow-2xl"
                        value={locationArea.country}
                        onChange={(e) => {
                          setLocationArea((prev) => ({
                            ...prev,
                            country: e.target.value,
                          }));
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ---------------- TAG PEOPLE ---------------- */}
            <div className="flex flex-col gap-3 tag-wrapper">
              <h3 className="text-lg font-medium text-gray-800">Tag people</h3>

              <div className="bg-white rounded-xl  shadow-sm">
                {/* Input */}
                <div className="flex items-center gap-2 px-4 py-3">
                  <i className="bx bx-user-plus text-2xl text-red-500" />
                  <input
                    type="text"
                    value={tagQuery}
                    placeholder="Search people you follow..."
                    className="flex-1 outline-none"
                    onFocus={openTagDropdown}
                    onChange={(e) => setTagQuery(e.target.value)}
                  />
                </div>

                {/* Tagged Chips */}
                {taggedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-4 pb-3">
                    {taggedUsers.map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm"
                      >
                        @{u.username}
                        <i
                          className="bx bx-x cursor-pointer"
                          onClick={() =>
                            setTaggedUsers((prev) =>
                              prev.filter((x) => x._id !== u._id)
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Dropdown */}
                {tagOpen && (
                  <div className="border-t max-h-64 overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 py-2 bg-gray-50 ">
                      <span className="text-sm font-medium">Select users</span>
                      <button
                        onClick={() => {
                          setTagOpen(false);
                          setTagQuery("");
                          setTagUsersError("");
                        }}
                      >
                        <i className="bx bx-x text-2xl text-gray-500" />
                      </button>
                    </div>

                    {/* Loading Shimmer */}
                    {tagUsersLoading && (
                      <div className="p-4 space-y-3 animate-pulse">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-gray-200 w-1/3 rounded" />
                              <div className="h-2 bg-gray-200 w-1/4 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Error */}
                    {tagUsersError && (
                      <div className="p-4 text-center">
                        <p className="text-sm text-red-500">{tagUsersError}</p>
                        <button
                          className="text-sm underline mt-2"
                          onClick={() => setTagOpen(false)}
                        >
                          Close
                        </button>
                      </div>
                    )}

                    {/* User List */}
                    {!tagUsersLoading &&
                      !tagUsersError &&
                      filteredUsers.map((user, i) => (
                        <div
                          key={user._id}
                          ref={
                            i === filteredUsers.length - 1 ? lastUserRef : null
                          }
                          className={`flex items-center gap-4 px-4 py-3 cursor-pointer
                        ${
                          canTagUser(user)
                            ? "hover:bg-red-50"
                            : "opacity-40 cursor-not-allowed"
                        }`}
                          onClick={() => {
                            if (canTagUser(user)) {
                              setTaggedUsers((prev) => [...prev, user]);
                            }
                          }}
                        >
                          <img
                            src={user.avatar?.url || user.avatar}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">@{user.username}</p>
                            <p className="text-xs text-gray-500">{user.name}</p>
                            {user._id === _id && (
                              <p className="text-xs text-red-500">
                                You can’t tag yourself
                              </p>
                            )}
                          </div>
                        </div>
                      ))}

                    {!hasMore && !tagUsersLoading && (
                      <p className="text-center text-sm py-3 text-gray-400">
                        — No more users —
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* adding trip */}

            <div className=" flex flex-col items-center justify-center gap-5  shadow-md hover:shadow-2xl    ">
              <div
                className="w-full flex items-center justify-start gap-3 bg-white hover:bg-red-500 transition hover:text-white cursor-pointer group px-4 py-3 rounded-xl"
                onClick={() => {
                  setShowTripModal(true);
                }}
              >
                <i className="bx bx-camping text-2xl text-red-500 group-hover:text-white"></i>
                <p className="text-base ">Add post in a Trip</p>
              </div>

              {selectedTrip && (
                <div className="w-full ">
                  <div
                    className={` bg-white rounded-2xl shadow-md overflow-hidden
                   hover:shadow-2xl transition cursor-pointer group relative`}
                  >
                    {/* to detach the trip */}
                    <div
                      className="absolute right-2 top-2 bg-red-500 p-3 rounded-full cursor-pointer flex items-center justify-center "
                      onClick={() => {
                        setSelectedTrip(null);
                      }}
                    >
                      <i className="bx bx-x text-3xl text-white" />
                    </div>

                    {/* Cover Image */}
                    <div className="h-44 w-full bg-gray-100 overflow-hidden">
                      {selectedTrip?.coverPhoto?.url ? (
                        <img
                          src={selectedTrip.coverPhoto.url}
                          alt={selectedTrip.title}
                          className="h-full w-full object-cover "
                        />
                      ) : (
                        <div className="h-full w-full bg-black/40" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col gap-2">
                      <h4 className="text-lg font-semibold text-gray-800 line-clamp-1">
                        {selectedTrip.title}
                      </h4>

                      <p className="text-sm text-gray-500 line-clamp-2">
                        {selectedTrip.description || "No description provided"}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600">
                          {selectedTrip.visibility}
                        </span>

                        <span className="text-xs text-gray-600">
                          {selectedTrip.posts.length || 0} posts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full flex items-center justify-end ">
              <div
                className={`leckerli text-3xl font-semibold px-2 py-1.5 rounded-md bg-red-500 shadow-2xl  text-white ${
                  caption.length === 0 && files.length === 0
                    ? "cursor-not-allowed pointer-events-none" :"cursor-pointer"
                     
                } `}
                onClick={
                  caption.length > 0 || files.length > 0
                    ? handleCreatePost
                    : undefined
                }
              >
                Create Post
              </div>
            </div>
          </div>
        </div>
      )}
      {showTripModal && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm
               overflow-y-auto flex justify-center px-4 py-8"
          onClick={(e) => {
            e.stopPropagation();
            setShowTripModal(false);
          }}
        >
          {/* Main Container */}
          <div
            className="w-full max-w-6xl min-h-screen h-fit bg-[#edf2f4]
                 rounded-3xl shadow-2xl p-6 flex flex-col gap-10"
            onClick={(e) => {
              e.stopPropagation();
              setSearchOpen(false);
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-3xl font-semibold text-red-500 leckerli">
                Select a Trip
              </h2>

              <button
                onClick={() => setShowTripModal(false)}
                className="p-2 rounded-full hover:bg-gray-200 transition flex items-center justify-center"
              >
                <i className="bx bx-x text-3xl text-gray-600" />
              </button>
            </div>

            <section className="flex flex-col gap-5">
              {/* headers */}
              <div className="w-full flex items-center justify-between  ">
                <div className="flex items-center justify-start gap-5">
                  <h3
                    className={`text-2xl font-semibold text-gray-800 cursor-pointer   rounded-lg px-3 py-2 ${
                      activatedTripPage === "own-trip"
                        ? "border-2 border-red-500 shadow-2xl hover:bg-red-500 hover:text-white"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivatedTripPage("own-trip");
                    }}
                  >
                    My Own Trips
                  </h3>

                  <div className="h-[3rem] w-[2px] bg-red-500"></div>

                  <h3
                    className={`text-2xl font-semibold text-gray-800 cursor-pointer   rounded-lg px-3 py-2 ${
                      activatedTripPage === "collaborated-trip"
                        ? "border-2 shadow-2xl border-red-500 hover:text-white hover:bg-red-500"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivatedTripPage("collaborated-trip");
                    }}
                  >
                    Collaborated Trips
                  </h3>
                </div>

                {/* info button */}
                <div className="flex items-center justify-center p-3 group w-fit h-fit cursor-pointer relative">
                  <i className="bx bx-info-circle text-3xl text-red-500"></i>

                  <div
                    className="absolute z-50 opacity-0 group-hover:opacity-100 
                  scale-0 group-hover:scale-100
                  transition-all duration-200 ease-out
                  bottom-0 left-1/2 -translate-x-1/2 translate-y-full
                  mt-3 w-[260px] bg-white rounded-xl shadow-2xl 
                  p-4 flex flex-col gap-3 text-sm text-gray-700"
                  >
                    {/* Arrow */}
                    <div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 
                    w-4 h-4 bg-red-500 rotate-45 shadow-md "
                    ></div>

                    <p className="leading-relaxed mt-3 ">
                      <span className="text-3xl text-red-500">•</span> Selecting
                      a <span className="font-medium text-red-500">Trip</span>{" "}
                      will automatically change your post visibility to the
                      <span className="font-medium"> Trip’s visibility</span>.
                    </p>

                    <p className="leading-relaxed ">
                      <span className="text-3xl text-red-500">•</span> To change
                      post visibility, either
                      <span className="font-medium"> detach the trip</span> or
                      update the{" "}
                      <span className="font-medium">Trip visibility</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* search bar and option */}
              <div className="w-[80%] flex  items-center justify-between ">
                <div
                  className={`w-[70%] bg-white rounded-lg shadow-lg ${
                    searchOpen ? "border-3 border-red-500  " : "border-none"
                  } flex items-center justify-start gap-2 px-4 py-2 `}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchOpen(true);
                  }}
                >
                  <i className="bx bx-search text-xl text-gray-500"></i>
                  <input
                    value={search}
                    className="w-full text-xl text-black focus:outline-none border-none"
                    placeholder="Search trips..."
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                  />
                </div>

                <div className="w-[25%] flex flex-col items-center gap-2 justify-center text-base text-black z-20">
                  <div
                    className="relative shadow-2xl bg-white text-xl text-black flex items-center gap-3 justify-between px-2 py-2 rounded-lg w-full cursor-pointer"
                    onClick={() => setDropDownOpen((prev) => !prev)}
                  >
                    <i className="bx bx-slider text-xl text-black"></i>
                    <p className="text-sm ">Sort By {sortBy}</p>
                    <i className="bx bx-chevron-down text-2xl text-gray-500"></i>
                  </div>

                  <div className="px-3 relative w-full ">
                    {dropdownOpen && (
                      <div className="w-full absolute top-0 left-1/2 -translate-x-1/2 bg-white flex flex-col items-start justify-center gap-3 px-3 py-2  rounded-lg shadow-2xl ">
                        <p
                          className="text-sm w-full flex  items-center justify-center hover:bg-red-500 hover:text-white px-2 py-1 rounded-lg cursor-pointer"
                          onClick={() => {
                            setDropDownOpen(false);
                            setSortBy("Start Date");
                          }}
                        >
                          Sort By Start Date
                          {sortBy === "Start Date" && (
                            <i className="bx bx-check text-2xl ml-2"></i>
                          )}
                        </p>
                        <p
                          className="text-sm w-full flex  items-center justify-center hover:bg-red-500 hover:text-white px-2 py-1 rounded-lg cursor-pointer"
                          onClick={() => {
                            setDropDownOpen(false);
                            setSortBy("End Date");
                          }}
                        >
                          Sort By End Date
                          {sortBy === "End Date" && (
                            <i className="bx bx-check text-2xl ml-2"></i>
                          )}
                        </p>
                        <p
                          className="text-sm w-full flex  items-center justify-center hover:bg-red-500 hover:text-white px-2 py-1 rounded-lg cursor-pointer"
                          onClick={() => {
                            setDropDownOpen(false);
                            setSortBy("Destinations");
                          }}
                        >
                          Sort By Destinations
                          {sortBy === "Destinations" && (
                            <i className="bx bx-check text-2xl ml-2"></i>
                          )}
                        </p>
                        <p
                          className="text-sm w-full flex  items-center justify-center hover:bg-red-500 hover:text-white px-2 py-1 rounded-lg cursor-pointer"
                          onClick={() => {
                            setDropDownOpen(false);
                            setSortBy("Posts");
                          }}
                        >
                          Sort By Posts
                          {sortBy === "Posts" && (
                            <i className="bx bx-check text-2xl ml-2"></i>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/*  Loading State */}
              {tripLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl shadow-md p-4 animate-pulse"
                    >
                      <div className="h-40 w-full bg-gray-200 rounded-xl mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              )}

              {/*  Error State */}
              {!tripLoading && tripError && (
                <div className="w-full flex flex-col items-center justify-center gap-3 py-16">
                  <i className="bx bx-error-circle text-5xl text-red-500"></i>
                  <p className="text-lg font-medium text-gray-700">
                    {tripError}
                  </p>
                  <p className="text-sm text-gray-500">
                    Please try again later.
                  </p>
                </div>
              )}

              {/* 3 Empty State */}
              {!tripLoading && !tripError && trips.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center gap-4 py-16">
                  <i className="bx bx-map-alt text-6xl text-gray-400"></i>
                  <p className="text-xl font-semibold text-gray-700">
                    No trips found
                  </p>
                  <p className="text-sm text-gray-500 text-center max-w-sm">
                    You don’t have any{" "}
                    {activatedTripPage === "own-trip"
                      ? "personal trips"
                      : "collaborated trips"}{" "}
                    yet.
                  </p>
                </div>
              )}

              {/* 4 Trips Loaded */}
              {!tripLoading && !tripError && trips.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {sortedSearchTrips.map((trip) => (
                    <div
                      key={trip._id}
                      className={`${
                        selectedTrip?._id === trip._id
                          ? "border-5 border-red-500"
                          : "border-none"
                      } bg-white rounded-2xl shadow-md overflow-hidden
                   hover:shadow-2xl transition cursor-pointer group`}
                      onClick={() => {
                        handleTripSelect(trip);
                      }}
                    >
                      {/* Cover Image */}
                      <div className="h-44 w-full bg-gray-100 overflow-hidden">
                        {trip?.coverPhoto?.url ? (
                          <img
                            src={trip.coverPhoto.url}
                            alt={trip.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="h-full w-full bg-black/40" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col gap-2">
                        <h4 className="text-lg font-semibold text-gray-800 line-clamp-1">
                          {trip.title}
                        </h4>

                        <div className="flex  items-center justify-start gap-5">
                          <i className="bx bx-calendar text-2xl text-red-500 " />
                          <p className="text-sm text-gray-600">
                            {" "}
                            {formatDate(trip.startDate)} -{" "}
                            {formatDate(trip.endDate)}
                          </p>
                        </div>

                        {/* collaborators */}
                        <div className="text-sm text-black px-5 py-2 flex items-center justify-start gap-2 w-full">
                          {trip.acceptedFriends &&
                            trip.acceptedFriends.length > 0 && (
                              <i className="bx bx-group text-3xl text-red-500"></i>
                            )}

                          {trip.acceptedFriends &&
                            trip.acceptedFriends.length > 0 && (
                              <div className=" flex -space-x-3  px-2 ">
                                <span className="h-16 w-16 overflow-hidden rounded-full border-2 border-white">
                                  <img
                                    src={
                                      trip.acceptedFriends[0].user.avatar
                                        ?.url ||
                                      trip.acceptedFriends[0].user.avatar
                                    }
                                    className="h-full object-cover "
                                  />
                                </span>
                                {trip.acceptedFriends.length > 1 && (
                                  <span className="h-16 w-16 overflow-hidden rounded-full border-2 border-white">
                                    <img
                                      src={
                                        trip.acceptedFriends[1].user.avatar
                                          ?.url ||
                                        trip.acceptedFriends[1].user.avatar
                                      }
                                      className="h-full object-cover "
                                    />
                                  </span>
                                )}

                                {trip.acceptedFriends.length > 2 && (
                                  <span>
                                    and {trip.acceptedFriends.length - 2} other
                                    collaborators
                                  </span>
                                )}
                              </div>
                            )}
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-2">
                          {trip.description || "No description provided"}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600">
                            {trip.visibility}
                          </span>

                          <span className="text-xs text-gray-600">
                            {trip.posts.length || 0} posts
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCreate;
