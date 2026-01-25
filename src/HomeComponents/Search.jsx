import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  history,
  globalSearch,
  userSearch,
  postSearch,
  tripSearch,
  deleteOneHistory,
  deleteAllHistory,
} from "../Apis/searchApi";
import { followUser, unfollowUser } from "../Apis/userApi";

const Search = ({ isSearchOpen, setIsSearchOpen }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], trips: [], posts: [] });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});

  const debounceTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);
  const { user: currentUser } = useSelector((state) => state.user);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsSearchOpen]);

  // Fetch history when search opens
  useEffect(() => {
    if (isSearchOpen && !query.trim()) {
      fetchHistory();
    }
  }, [isSearchOpen, query]);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const { data } = await history();
      setRecent(data.history);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Debounced Search Effect
  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], trips: [], posts: [] });
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setLoading(true);
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        let res;
        switch (activeTab) {
          case "All":
            res = await globalSearch(query);
            setResults(res.data);
            break;
          case "Users":
            res = await userSearch(query);
            setResults({ users: res.data.users, trips: [], posts: [] });
            break;
          case "Trips":
            res = await tripSearch(query);
            setResults({ users: [], trips: res.data.trips, posts: [] });
            break;
          case "Posts":
            res = await postSearch(query);
            setResults({ users: [], trips: [], posts: res.data.posts });
            break;
          default:
            break;
        }
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch results");
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimeoutRef.current);
  }, [query, activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setQuery("");
    setResults({ users: [], trips: [], posts: [] });
  };

  // Optimistic History Deletion
  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    // Optimistic update
    const previousRecent = [...recent];
    setRecent(recent.filter((item) => item._id !== id));

    try {
      await deleteOneHistory(id);
    } catch (error) {
      console.error("Failed to delete history", error);
      setRecent(previousRecent); // Rollback
    }
  };

  // Optimistic Clear All History
  const handleClearHistory = async () => {
    const previousRecent = [...recent];
    setRecent([]);

    try {
      await deleteAllHistory();
    } catch (error) {
      console.error("Failed to clear history", error);
      setRecent(previousRecent); // Rollback
    }
  };

  // Optimistic Follow/Unfollow
  const handleFollowToggle = async (e, targetUser) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (followLoading[targetUser._id]) return;

    const isFollowing = targetUser.isFollowing;
    const action = isFollowing ? unfollowUser : followUser;

    // Set loading
    setFollowLoading((prev) => ({ ...prev, [targetUser._id]: true }));

    // Optimistic Update
    setResults((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u._id === targetUser._id ? { ...u, isFollowing: !isFollowing } : u
      ),
    }));

    try {
      await action(targetUser._id);
    } catch (error) {
      console.error("Follow toggle failed", error);
      // Rollback
      setResults((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u._id === targetUser._id ? { ...u, isFollowing: isFollowing } : u
        ),
      }));
    } finally {
      setFollowLoading((prev) => ({ ...prev, [targetUser._id]: false }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      setIsSearchOpen(false);
      navigate(`/home/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div
      ref={searchContainerRef}
      className="w-full relative flex flex-col items-center justify-center z-50"
    >
      {/* Search Input Container */}
      <div className="w-full relative group">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsSearchOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for adventures..."
          className="w-full h-[45px] pl-12 pr-12 rounded-full border-none bg-[#353749] text-[#EDF2F4] placeholder-[#8D99AE] focus:ring-2 focus:ring-[#EF233C] transition-all shadow-inner text-sm md:text-base"
        />
        <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#8D99AE] group-focus-within:text-[#EF233C] transition-colors" />

        {/* Close/Clear Button */}
        {(isSearchOpen || query) && (
          <i
            className="bx bx-x absolute right-4 top-1/2 -translate-y-1/2 text-xl text-[#8D99AE] hover:text-[#EF233C] cursor-pointer transition-colors"
            onClick={closeSearch}
          />
        )}
      </div>

      {/* Dropdown Results Modal */}
      {isSearchOpen && (
        <div className="absolute top-[55px] left-0 w-full bg-[#2B2D42] rounded-2xl shadow-2xl border border-[#353749] overflow-hidden animate-fadeIn flex flex-col max-h-[70vh] min-h-[150px]">
          {/* Tabs */}
          <div className="flex items-center justify-between px-2 pt-2 pb-2 bg-[#232536] border-b border-[#353749]">
            {["All", "Users", "Trips", "Posts"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex-1 py-2 mx-1 text-xs font-semibold rounded-lg transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-[#EF233C] text-white shadow-md"
                    : "text-[#8D99AE] hover:bg-[#353749] hover:text-[#EDF2F4]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-8">
                <i className="bx bx-loader-alt animate-spin text-3xl text-[#EF233C]"></i>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="text-center py-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* History (if no query) */}
            {!loading && !query.trim() && (
              <div className="px-1">
                <div className="flex justify-between items-center mb-2 px-2 pt-2">
                  <span className="text-[#8D99AE] text-xs font-bold uppercase tracking-wider">
                    Recent
                  </span>
                  {recent.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-[#EF233C] text-xs hover:underline font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* History Loading Shimmer */}
                {historyLoading && (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl animate-pulse"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#353749]"></div>
                        <div className="h-4 bg-[#353749] rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* History Items */}
                {!historyLoading &&
                  recent.map((item) => (
                    <div
                      key={item._id}
                      className="group flex justify-between items-center p-3 hover:bg-[#353749] rounded-xl cursor-pointer transition-all duration-200"
                      onClick={() => setQuery(item.query)}
                    >
                      <span className="text-[#EDF2F4] text-sm flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#232536] flex items-center justify-center">
                          <i
                            className={`bx ${
                              item.type === "user"
                                ? "bx-user"
                                : item.type === "trip"
                                ? "bx-map"
                                : "bx-image"
                            } text-[#8D99AE]`}
                          ></i>
                        </div>
                        {item.query}
                      </span>
                      <i
                        className="bx bx-x text-[#8D99AE] hover:text-[#EF233C] text-lg p-1 rounded-full hover:bg-[#2B2D42] transition-all opacity-0 group-hover:opacity-100"
                        onClick={(e) => handleDeleteHistory(item._id, e)}
                      ></i>
                    </div>
                  ))}

                {/* Empty History State */}
                {!historyLoading && recent.length === 0 && (
                  <div className="text-center py-10 text-[#8D99AE] opacity-60">
                    <i className="bx bx-history text-4xl mb-2"></i>
                    <p className="text-sm">No recent searches</p>
                  </div>
                )}
              </div>
            )}

            {/* Search Results */}
            {!loading && query.trim() && (
              <div className="space-y-6 px-1">
                {/* No Results */}
                {results.users.length === 0 &&
                  results.trips.length === 0 &&
                  results.posts.length === 0 && (
                    <div className="text-center py-10 text-[#8D99AE]">
                      <i className="bx bx-search-alt text-5xl mb-3 opacity-40 text-[#EF233C]"></i>
                      <p className="text-base font-medium">
                        No results found for "{query}"
                      </p>
                      <p className="text-xs mt-1 opacity-70">
                        Try different keywords or filters
                      </p>
                    </div>
                  )}

                {/* Users Section */}
                {results.users &&
                  results.users.length > 0 &&
                  (activeTab === "All" || activeTab === "Users") && (
                    <div>
                      {activeTab === "All" && (
                        <h3 className="text-[#8D99AE] text-xs font-bold uppercase tracking-wider px-2 mb-3 mt-1 flex items-center gap-2">
                          <i className="bx bx-user"></i> Users
                        </h3>
                      )}
                      <div className="grid gap-2">
                        {results.users.map((user) => (
                          <Link
                            to={`/profile/${user._id}`}
                            key={user._id}
                            className="flex items-center justify-between p-2 hover:bg-[#353749] rounded-xl transition-colors group border border-transparent hover:border-[#353749]"
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  user.avatar ||
                                  user.avatar?.url ||
                                  "https://via.placeholder.com/40"
                                }
                                alt={user.username}
                                className="w-10 h-10 rounded-full object-cover border-2 border-[#2B2D42] group-hover:border-[#EF233C] transition-colors"
                              />
                              <div className="flex flex-col">
                                <span className="text-[#EDF2F4] font-semibold text-sm">
                                  {user.name}
                                </span>
                                <span className="text-[#8D99AE] text-xs">
                                  @{user.username}
                                </span>
                              </div>
                            </div>
                            {currentUser?._id !== user._id && (
                              <button
                                onClick={(e) => handleFollowToggle(e, user)}
                                disabled={followLoading[user._id]}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                  user.isFollowing
                                    ? "bg-[#353749] text-[#EDF2F4] border border-[#8D99AE]"
                                    : "bg-[#EF233C] text-white hover:bg-[#D90429]"
                                }`}
                              >
                                {followLoading[user._id] ? (
                                  <i className="bx bx-loader-alt animate-spin"></i>
                                ) : user.isFollowing ? (
                                  "Following"
                                ) : (
                                  "Follow"
                                )}
                              </button>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Trips Section */}
                {results.trips &&
                  results.trips.length > 0 &&
                  (activeTab === "All" || activeTab === "Trips") && (
                    <div>
                      {activeTab === "All" && (
                        <h3 className="text-[#8D99AE] text-xs font-bold uppercase tracking-wider px-2 mb-3 mt-4 flex items-center gap-2">
                          <i className="bx bx-map-alt"></i> Trips
                        </h3>
                      )}
                      <div className="grid gap-2">
                        {results.trips.map((trip) => (
                          <Link
                            to={`/trip/${trip._id}`}
                            key={trip._id}
                            className="flex items-center gap-3 p-2 hover:bg-[#353749] rounded-xl transition-colors group"
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <div className="relative w-14 h-14 shrink-0">
                              <img
                                src={
                                  trip.coverPhoto?.url ||
                                  trip.coverPhoto ||
                                  "https://via.placeholder.com/60"
                                }
                                alt={trip.title}
                                className="w-full h-full rounded-lg object-cover"
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-[#2B2D42]">
                                <img
                                  src={
                                    trip.user?.avatar?.url ||
                                    trip.user?.avatar ||
                                    "https://via.placeholder.com/20"
                                  }
                                  alt="Owner"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                              <span className="text-[#EDF2F4] font-medium text-sm truncate group-hover:text-[#EF233C] transition-colors">
                                {trip.title}
                              </span>
                              <div className="flex items-center gap-1 text-[#8D99AE] text-xs mt-0.5">
                                <i className="bx bx-map shrink-0"></i>
                                <span className="truncate">
                                  {trip.destinations?.map(d => d.city).join(", ") ||
                                    "Unknown Location"}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Posts Section */}
                {results.posts &&
                  results.posts.length > 0 &&
                  (activeTab === "All" || activeTab === "Posts") && (
                    <div>
                      {activeTab === "All" && (
                        <h3 className="text-[#8D99AE] text-xs font-bold uppercase tracking-wider px-2 mb-3 mt-4 flex items-center gap-2">
                          <i className="bx bx-images"></i> Posts
                        </h3>
                      )}
                      <div className="grid gap-2">
                        {results.posts.map((post) => (
                          <Link
                            to={`/post/${post._id}`}
                            key={post._id}
                            className="flex items-center gap-3 p-2 hover:bg-[#353749] rounded-xl transition-colors cursor-pointer group"
                            onClick={() => {
                              setIsSearchOpen(false);
                            }}
                          >
                            <div className="w-12 h-12 shrink-0 rounded-lg bg-[#232536] overflow-hidden flex items-center justify-center border border-[#353749] group-hover:border-[#EF233C] transition-colors">
                              {post.media?.[0]?.url || post.thumbnail ? (
                                <img
                                  src={post.media?.[0]?.url || post.thumbnail}
                                  alt="Post"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <i className="bx bx-text text-[#8D99AE] text-xl"></i>
                              )}
                            </div>
                            <div className="flex flex-col overflow-hidden min-w-0">
                              <span className="text-[#EDF2F4] text-sm truncate">
                                {post.caption || "Untitled Post"}
                              </span>
                              <div className="flex items-center gap-1 text-[#8D99AE] text-xs mt-0.5">
                                <span className="truncate">
                                  by @{post.author?.username}
                                </span>
                                {post.likesCount > 0 && (
                                  <>
                                    <span>•</span>
                                    <i className="bx bxs-heart text-[#EF233C] text-[10px]"></i>
                                    <span>{post.likesCount}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
