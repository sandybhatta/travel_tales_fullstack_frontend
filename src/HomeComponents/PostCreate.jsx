import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import useDebounce from "../CustomHooks/useDebounceHook";
import { useCreatePostMutation } from "../slices/postApiSlice";
import { useLazySearchMentionableUsersQuery } from "../slices/userApiSlice";
import {
  useGetOwnTripsQuery,
  useGetCollaboratedTripsQuery,
} from "../slices/tripApiSlice";

const PostCreate = ({ setCreationTab, setCreateModal }) => {
  const [error, setError] = useState("");
  // Removed custom createLoading state as mutation provides it
  // Removed uploadProgress state as RTK Query doesn't support it natively for now

  const {
    _id,
    location,
    avatar: reduxAvatar,
    following: reduxFollowing,
  } = useSelector((state) => state.user);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userAvatar = userInfo?.avatar;
  const avatar =
    reduxAvatar ||
    userAvatar ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");

  // RTK Query hooks
  const [createPost, { isLoading: createLoading }] = useCreatePostMutation();
  const [
    triggerSearchMentions,
    { data: mentionData, isFetching: mentionLoading },
  ] = useLazySearchMentionableUsersQuery();

  //   for tag related states
  const [tagOpen, setTagOpen] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [tagQuery, setTagQuery] = useState("");
  const debouncedQuery = useDebounce(tagQuery);

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

  const [mentionedUsers, setMentionedUsers] = useState([]);

  const [mentionError, setMentionError] = useState("");

  //   trip selection
  const [activatedTripPage, setActivatedTripPage] = useState("own-trip");

  // Trip Queries
  const {
    data: ownTripsData,
    isLoading: ownTripsLoading,
    error: ownTripsError,
  } = useGetOwnTripsQuery(_id, {
    skip: !showTripModal || activatedTripPage !== "own-trip",
  });
  const {
    data: collabTripsData,
    isLoading: collabTripsLoading,
    error: collabTripsError,
  } = useGetCollaboratedTripsQuery(_id, {
    skip: !showTripModal || activatedTripPage !== "collaborated-trip",
  });

  const trips =
    (activatedTripPage === "own-trip"
      ? ownTripsData?.trips
      : collabTripsData?.trips) || [];
  const tripLoading =
    activatedTripPage === "own-trip" ? ownTripsLoading : collabTripsLoading;
  const tripError =
    (activatedTripPage === "own-trip" ? ownTripsError : collabTripsError)?.data
      ?.message || "";

  const [selectedTrip, setSelectedTrip] = useState(null);

  // search

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropDownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Start Date");

  // highlight and daynumber of a post in  a trip

  const [isHighlighted, setIsHighlighted] = useState(false);
  const [dayNumber, setDayNumber] = useState(1);
  const [daysInATrip, setDaysInATrip] = useState(0);
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);

  //   files
  const MAX_FILES = 20;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const fileRef = useRef(null);
  const captionRef = useRef(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredUsers = useMemo(() => {
    if (!reduxFollowing) return [];
    if (!debouncedQuery.trim()) return reduxFollowing;

    return reduxFollowing.filter(
      (u) =>
        u.username.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [debouncedQuery, reduxFollowing]);

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

  const usersToMention = mentionData?.users || [];

  //   when user mentions someone this fetches result
  useEffect(() => {
    if (!mentionOpen || !mentionQuery) return;

    // Debounce manual call or just call
    const timeout = setTimeout(() => {
      triggerSearchMentions(mentionQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [mentionQuery, mentionOpen, triggerSearchMentions]);

  const handleMentionSelect = (user) => {
    const textarea = captionRef.current;
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
    captionRef.current.focus();
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
  };
  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, []);

  useEffect(() => {
    if (captionRef.current) {
      captionRef.current.style.height = "auto";
      captionRef.current.style.height = captionRef.current.scrollHeight + "px";
    }
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
            <span key={index} className="text-red-500 text-sm ">
              {word}
            </span>
          );
        }
      }

      if (word.startsWith("#")) {
        return (
          <span key={index} className="text-red-500 text-sm  ">
            {word}
          </span>
        );
      }

      return (
        <span key={index} className="text-sm ">
          {word}
        </span>
      );
    });
  };

  const handleCreatePost = async () => {
    setError("");
    // createLoading is handled by mutation hook

    const formData = new FormData();
    formData.append("caption", caption);

    if (taggedUsers.length > 0) {
      formData.append(
        "taggedUsers",
        JSON.stringify(taggedUsers.map((u) => u._id))
      );
    }

    if (selectedTrip) {
      formData.append("tripId", selectedTrip._id);
      formData.append("visibility", selectedTrip.visibility);
      formData.append("dayNumber", dayNumber);
      formData.append("isHighlighted", isHighlighted);
    } else {
      formData.append("visibility", visibilityStatus);
    }

    formData.append("location", JSON.stringify(locationArea));

    if (mentionedUsers && mentionedUsers.length > 0) {
      formData.append(
        "mentions",
        JSON.stringify(mentionedUsers.map((u) => u._id))
      );
    }

    if (files && files.length > 0) {
      files.forEach((post) => {
        formData.append("post", post.file);
      });
    }

    try {
      await createPost(formData).unwrap();

      setCreateModal(false);
      setCreationTab("");
    } catch (error) {
      setError(error?.data?.message || "Some thing went worng");
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setShowTripModal(false);
  };

  useEffect(() => {
    if (!selectedTrip) return;

    setVisibilityStatus(selectedTrip.visibility);

    const ms =
      new Date(selectedTrip.endDate) - new Date(selectedTrip.startDate);

    const totalDays = Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;

    setDaysInATrip(totalDays);
    setDayNumber(1);
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md min-h-screen overflow-y-auto flex justify-center items-start py-4 sm:py-10 px-4 animate-fadeIn"
          onClick={() => {
            setCreationTab("");
            setCreateModal(false);
          }}
        >
          <div
            className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-0 flex flex-col h-fit z-50 overflow-hidden animate-scaleIn mb-20 sm:mb-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl">
                  <i className="bx bx-edit"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Create Post</h2>
              </div>
              <button
                onClick={() => {
                  setCreationTab("");
                  setCreateModal(false);
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <i className="bx bx-x text-2xl" />
              </button>
            </div>

            <div className="p-4 sm:p-6 flex flex-col gap-6">
              {/* Caption Area */}
              <div className="flex gap-4">
                <img
                  src={avatar}
                  className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm flex-shrink-0 hidden sm:block"
                  alt=""
                />
                <div className="flex-1 relative">
                  {/* Custom Textarea Wrapper */}
                  <div className="relative min-h-[120px] shadow-sm rounded-2xl border border-gray-100 bg-gray-50/30 p-2">
                  <div
  className="
    absolute inset-0
    pointer-events-none
    whitespace-pre-wrap
    break-words
    leading-[24px]
    px-2 py-1
    font-sans
    z-10
  "
>
  {renderStyledCaption(caption)}
</div>

<textarea
  ref={captionRef}
  value={caption}
  onChange={handleCaption}
  placeholder="What's on your mind? Use @ to mention or # for tags."
  className="
    relative
    w-full
    min-h-[120px]
    resize-none
    bg-transparent
    text-transparent
    caret-gray-800
    outline-none
    leading-[24px]
    text-sm
    px-0
    font-sans
    z-0
    placeholder-gray-400
    no-scrollbar
  "
/>


                    <div className="absolute bottom-2 right-4 text-xs text-gray-400">
                      {caption.length}/1000
                    </div>
                  </div>

                  {/* Mentions Dropdown */}
                  {mentionOpen && (
                    <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-fadeIn">
                      {mentionLoading && (
                        <p className="p-3 text-sm text-gray-500">
                          Searching...
                        </p>
                      )}

                      {mentionError && (
                        <p className="p-3 text-sm text-red-500">
                          {mentionError}
                        </p>
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
                              <p className="text-xs text-gray-500">
                                {user.name}
                              </p>
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
                  )}
                </div>
              </div>

              {/* Media Upload Area */}
              <div className="space-y-3">
                {files.length === 0 ? (
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-red-400 hover:bg-red-50/10 transition-all group"
                    onClick={() => fileRef.current.click()}
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-400 group-hover:text-red-500 group-hover:bg-red-50 flex items-center justify-center text-3xl transition-colors">
                      <i className="bx bx-images"></i>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-700">
                        Add Photos/Videos
                      </p>
                      <p className="text-sm text-gray-400">or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Max 20 files | Total size ≤ 10MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    <div
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50/10 transition-all text-gray-400 hover:text-red-500"
                      onClick={() => fileRef.current.click()}
                    >
                      <i className="bx bx-plus text-3xl"></i>
                    </div>
                    {files.map((file, ind) => (
                      <div
                        key={ind}
                        className="relative aspect-square rounded-xl overflow-hidden group shadow-sm"
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
                          className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(ind);
                          }}
                        >
                          <i className="bx bx-x text-lg"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                  ref={fileRef}
                  accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4"
                />
                {fileError && (
                  <p className="text-red-500 text-sm px-2">{fileError}</p>
                )}
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Visibility */}
                <div className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors bg-gray-50/50 relative">
                  <div
                    className={`flex items-center justify-between cursor-pointer ${
                      selectedTrip ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() =>
                      !selectedTrip && setVisibilityOpen(!visibilityOpen)
                    }
                  >
                    <div className="flex items-center gap-3 text-gray-700">
                      <i
                        className={`bx bx-${
                          visibilityStatus === "public"
                            ? "globe"
                            : visibilityStatus === "lock"
                            ? "lock"
                            : visibilityStatus === "close_friends"
                            ? "user-check"
                            : "group"
                        } text-xl`}
                      ></i>
                      <span className="font-medium capitalize">
                        {visibilityStatus.replace("_", " ")}
                      </span>
                    </div>
                    {!selectedTrip && (
                      <i className="bx bx-chevron-down text-gray-400"></i>
                    )}
                  </div>
                  {/* Dropdown */}
                  {visibilityOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                      {["public", "followers", "close_friends", "private"].map(
                        (v) => (
                          <div
                            key={v}
                            className="px-4 py-2 hover:bg-red-50 cursor-pointer text-sm capitalize flex items-center gap-2"
                            onClick={() => {
                              setVisibilityStatus(v);
                              setVisibilityOpen(false);
                            }}
                          >
                            <i
                              className={`bx bx-${
                                v === "public"
                                  ? "globe"
                                  : v === "private"
                                  ? "lock"
                                  : v === "close_friends"
                                  ? "user-check"
                                  : "group"
                              }`}
                            ></i>
                            {v.replace("_", " ")}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors bg-gray-50/50 relative">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setLocationOpen(!locationOpen)}
                  >
                    <div className="flex items-center gap-3 text-gray-700">
                      <i className="bx bx-map text-xl"></i>
                      <span className="font-medium truncate max-w-[150px]">
                        {locationArea?.city || "Add Location"}
                      </span>
                    </div>
                    <i className="bx bx-chevron-down text-gray-400"></i>
                  </div>
                  {/* Dropdown */}
                  {locationOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 p-3 space-y-2">
                      <input
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-red-400"
                        placeholder="City"
                        value={locationArea.city}
                        onChange={(e) =>
                          setLocationArea((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                      />
                      <input
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-red-400"
                        placeholder="State"
                        value={locationArea.state}
                        onChange={(e) =>
                          setLocationArea((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                      />
                      <input
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-red-400"
                        placeholder="Country"
                        value={locationArea.country}
                        onChange={(e) =>
                          setLocationArea((prev) => ({
                            ...prev,
                            country: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Tag People */}
                <div className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors bg-gray-50/50 col-span-1 sm:col-span-2 relative">
                  <div className="flex flex-wrap items-center gap-2">
                    <i className="bx bx-purchase-tag text-xl text-gray-500 mr-1"></i>
                    {taggedUsers.map((u) => (
                      <span
                        key={u._id}
                        className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-sm flex items-center gap-1"
                      >
                        @{u.username}
                        <i
                          className="bx bx-x cursor-pointer"
                          onClick={() =>
                            setTaggedUsers((prev) =>
                              prev.filter((x) => x._id !== u._id)
                            )
                          }
                        ></i>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder={
                        taggedUsers.length === 0 ? "Tag people..." : ""
                      }
                      className="bg-transparent outline-none text-sm flex-1 min-w-[100px]"
                      value={tagQuery}
                      onFocus={openTagDropdown}
                      onChange={(e) => setTagQuery(e.target.value)}
                    />
                  </div>
                  {/* Tag Dropdown */}
                  {tagOpen && (
                    <div className="absolute bottom-full mb-2 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 max-h-48 overflow-y-auto z-30">
                      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 sticky top-0">
                        <span className="text-xs font-medium uppercase text-gray-500">
                          Select users
                        </span>
                        <i
                          className="bx bx-x text-xl cursor-pointer"
                          onClick={() => setTagOpen(false)}
                        ></i>
                      </div>
                      {filteredUsers.map((user, i) => (
                        <div
                          key={user._id}
                          className={`flex items-center gap-3 px-4 py-2 cursor-pointer ${
                            canTagUser(user) ? "hover:bg-red-50" : "opacity-50"
                          }`}
                          onClick={() =>
                            canTagUser(user) &&
                            setTaggedUsers((prev) => [...prev, user])
                          }
                        >
                          <img
                            src={user.avatar?.url || user.avatar}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Trip Selector Banner */}
              <div
                className={`rounded-xl p-4 cursor-pointer transition-all border-2 ${
                  selectedTrip
                    ? "bg-red-50 border-red-200"
                    : "bg-gray-50 border-dashed border-gray-300 hover:border-red-300"
                }`}
                onClick={() => setShowTripModal(true)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                      selectedTrip
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <i className="bx bx-trip"></i>
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-semibold ${
                        selectedTrip ? "text-red-700" : "text-gray-600"
                      }`}
                    >
                      {selectedTrip ? selectedTrip.title : "Add to a Trip"}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {selectedTrip
                        ? `Day ${dayNumber} • ${selectedTrip.visibility}`
                        : "Link this post to one of your trips"}
                    </p>
                  </div>
                  {selectedTrip && (
                    <button
                      className="p-2 hover:bg-red-200 rounded-full text-red-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrip(null);
                      }}
                    >
                      <i className="bx bx-x text-xl"></i>
                    </button>
                  )}
                </div>
                {selectedTrip && (
                  <div className="mt-3 pt-3 border-t border-red-100 flex items-center justify-between pl-1">
                    {/* Day Selector */}
                    <div className="relative">
                      <div
                        className="flex items-center gap-2 text-sm text-red-700 font-medium cursor-pointer px-2 py-1 hover:bg-red-100 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDayDropdownOpen(!dayDropdownOpen);
                          e.preventDefault();
                        }}
                      >
                        <i className="bx bx-calendar"></i>
                        Day {dayNumber}
                        <i className="bx bx-chevron-down"></i>
                      </div>
                      {dayDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 bg-white shadow-xl rounded-xl max-h-40 overflow-y-auto border border-red-100 z-10 min-w-[100px]">
                          {Array.from(
                            { length: daysInATrip },
                            (_, i) => i + 1
                          ).map((day) => (
                            <div
                              key={day}
                              className="px-4 py-2 hover:bg-red-50 text-sm cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDayNumber(day);
                                setDayDropdownOpen(false);
                              }}
                            >
                              Day {day}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Highlight Toggle */}
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsHighlighted(!isHighlighted);
                      }}
                    >
                      <span className="text-sm text-red-700 font-medium">
                        Highlight
                      </span>
                      <div
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${
                          isHighlighted ? "bg-red-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                            isHighlighted ? "translate-x-4" : ""
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 pb-safe sm:pb-0">
                {error && (
                  <p className="text-red-500 text-sm mr-auto font-medium">
                    {error}
                  </p>
                )}
                <button
                  className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setCreationTab("");
                    setCreateModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={`px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg shadow-red-200 transition-all transform active:scale-95 ${
                    (!caption && files.length === 0) || createLoading
                      ? "bg-gray-300 cursor-not-allowed shadow-none"
                      : "bg-red-500 hover:bg-red-600 hover:shadow-xl hover:shadow-red-200"
                  }`}
                  onClick={handleCreatePost}
                  disabled={(!caption && files.length === 0) || createLoading}
                >
                  {createLoading ? "Posting..." : "Post"}
                </button>
              </div>

              {/* Progress Bar */}
              {createLoading && (
                <div className="h-1 bg-gray-100 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showTripModal && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md overflow-hidden flex flex-col items-center justify-end sm:justify-center animate-fadeIn"
          onClick={(e) => {
            e.stopPropagation();
            setShowTripModal(false);
          }}
        >
          {/* Main Container */}
          <div
            className="w-full max-w-5xl h-[90vh] sm:h-[85vh] bg-[#f8fafc]
                 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp sm:animate-scaleIn"
            onClick={(e) => {
              e.stopPropagation();
              setSearchOpen(false);
              setDropDownOpen(false);
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
              <h2 className="text-2xl font-bold text-gray-800 leckerli">
                Select a Trip
              </h2>

              <button
                onClick={() => setShowTripModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center text-gray-500"
              >
                <i className="bx bx-x text-3xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Tabs & Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Custom Tab Switcher */}
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex w-full sm:w-auto">
                  <button
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      activatedTripPage === "own-trip"
                        ? "bg-red-500 text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                    onClick={() => setActivatedTripPage("own-trip")}
                  >
                    My Trips
                  </button>
                  <button
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      activatedTripPage === "collaborated-trip"
                        ? "bg-red-500 text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                    onClick={() => setActivatedTripPage("collaborated-trip")}
                  >
                    Collabs
                  </button>
                </div>

                {/* Info Note */}
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                  <i className="bx bx-info-circle text-red-400 text-lg"></i>
                  <span>Visibility will sync with trip settings</span>
                </div>
              </div>

              {/* Search & Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bx bx-search text-xl text-gray-400 group-focus-within:text-red-500 transition-colors"></i>
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all bg-white"
                    placeholder="Search trips by title, tag, or friends..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="relative z-20">
                  <button
                    className="w-full sm:w-auto px-4 py-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between sm:justify-center gap-2 text-gray-600 hover:border-red-400 hover:text-red-500 transition-all font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropDownOpen(!dropdownOpen);
                    }}
                  >
                    <i className="bx bx-sort-alt-2"></i>
                    <span>{sortBy}</span>
                    <i
                      className={`bx bx-chevron-down transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    ></i>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-full sm:w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 overflow-hidden animate-fadeIn">
                      {["Start Date", "End Date", "Destinations", "Posts"].map(
                        (sort) => (
                          <div
                            key={sort}
                            className={`px-4 py-2.5 rounded-lg text-sm cursor-pointer flex items-center justify-between ${
                              sortBy === sort
                                ? "bg-red-50 text-red-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              setSortBy(sort);
                              setDropDownOpen(false);
                            }}
                          >
                            {sort}
                            {sortBy === sort && (
                              <i className="bx bx-check text-lg"></i>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/*  Loading State */}
              {tripLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 animate-pulse"
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
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <i className="bx bx-error-circle text-4xl text-red-500"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Oops! Something went wrong
                  </h3>
                  <p className="text-gray-500 mb-6">{tripError}</p>
                  <button
                    onClick={() => setActivatedTripPage(activatedTripPage)}
                    className="px-6 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!tripLoading && !tripError && trips.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <i className="bx bx-map-alt text-5xl text-gray-400"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No trips found
                  </h3>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    You don’t have any{" "}
                    {activatedTripPage === "own-trip"
                      ? "personal"
                      : "collaborated"}{" "}
                    trips matching your search yet.
                  </p>
                </div>
              )}

              {/* Trips Grid */}
              {!tripLoading && !tripError && trips.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-20">
                  {sortedSearchTrips.map((trip) => (
                    <div
                      key={trip._id}
                      className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-2 ${
                        selectedTrip?._id === trip._id
                          ? "border-red-500 ring-4 ring-red-500/10"
                          : "border-transparent hover:border-gray-200"
                      }`}
                      onClick={() => handleTripSelect(trip)}
                    >
                      {/* Image Badge */}
                      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm">
                        {trip.visibility}
                      </div>

                      {/* Cover Image */}
                      <div className="h-48 w-full bg-gray-100 overflow-hidden relative">
                        {trip?.coverPhoto?.url ? (
                          <img
                            src={trip.coverPhoto.url}
                            alt={trip.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <i className="bx bx-image text-4xl text-gray-400"></i>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                        <div className="absolute bottom-3 left-3 text-white">
                          <p className="text-xs font-medium opacity-90 flex items-center gap-1">
                            <i className="bx bx-calendar"></i>
                            {formatDate(trip.startDate)}
                          </p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h4 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-red-500 transition-colors">
                          {trip.title}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                          {trip.description ||
                            "No description provided for this trip."}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          {/* Collaborators Avatars */}
                          <div className="flex items-center -space-x-2">
                            <img
                              src={trip.user.avatar?.url || trip.user.avatar}
                              className="w-8 h-8 rounded-full border-2 border-white object-cover"
                              title={`Owner: ${trip.user.name}`}
                            />
                            {trip.acceptedFriends
                              ?.slice(0, 3)
                              .map((friend, idx) => (
                                <img
                                  key={idx}
                                  src={
                                    friend.user.avatar?.url ||
                                    friend.user.avatar
                                  }
                                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                  title={friend.user.name}
                                />
                              ))}
                            {trip.acceptedFriends?.length > 3 && (
                              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                +{trip.acceptedFriends.length - 3}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                            <i className="bx bx-photo-album"></i>
                            {trip.posts?.length || 0}
                          </div>
                        </div>
                      </div>

                      {/* Selection Overlay */}
                      {selectedTrip?._id === trip._id && (
                        <div className="absolute inset-0 bg-red-500/10 z-20 flex items-center justify-center backdrop-blur-[1px]">
                          <div className="bg-white text-red-500 rounded-full p-3 shadow-xl transform scale-100 animate-bounce">
                            <i className="bx bx-check text-3xl"></i>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCreate;
