import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  globalSearch,
  userSearch,
  postSearch,
  tripSearch,
} from "../Apis/searchApi";
import { followUser, unfollowUser } from "../Apis/userApi";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { user: currentUser } = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState("All");
  const [results, setResults] = useState({ users: [], trips: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [followLoading, setFollowLoading] = useState({});

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setLoading(true);
      setError("");
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
      } catch (err) {
        console.error(err);
        setError("Failed to fetch results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, activeTab]);

  const handleFollowToggle = async (e, targetUser) => {
    e.preventDefault();
    e.stopPropagation();
    if (followLoading[targetUser._id]) return;

    const isFollowing = targetUser.isFollowing;
    const action = isFollowing ? unfollowUser : followUser;

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

  return (
    <div className="w-full min-h-full p-4 md:p-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-8 border-b border-[#D8E2DC] pb-4">
        <h2 className="text-2xl font-bold text-[#2B2D42]">
          Search Results for <span className="text-[#EF233C]">"{query}"</span>
        </h2>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {["All", "Users", "Trips", "Posts"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[#EF233C] text-white shadow-md"
                  : "bg-white text-[#8D99AE] hover:bg-[#D8E2DC] hover:text-[#2B2D42]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-8">
          {/* Shimmer for Users */}
          {(activeTab === "All" || activeTab === "Users") && (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm animate-pulse">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
                      <div className="space-y-2 w-full">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shimmer for Trips */}
          {(activeTab === "All" || activeTab === "Trips") && (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                    <div className="h-40 bg-gray-200"></div>
                    <div className="p-3 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shimmer for Posts */}
          {(activeTab === "All" || activeTab === "Posts") && (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">
          <i className="bx bx-error-circle text-4xl mb-2"></i>
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-12 pb-10">
          {/* No Results */}
          {!results.users?.length && !results.trips?.length && !results.posts?.length && (
            <div className="text-center py-20 opacity-60">
              <i className="bx bx-search-alt text-6xl text-[#8D99AE] mb-4"></i>
              <h2 className="text-xl font-bold text-[#2B2D42]">No matches found</h2>
              <p className="text-[#8D99AE]">Try checking your spelling or use different keywords</p>
            </div>
          )}

          {/* Users */}
          {results.users?.length > 0 && (activeTab === "All" || activeTab === "Users") && (
            <section>
              <h3 className="text-[#8D99AE] text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <i className="bx bx-user"></i> Users
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.users.map((user) => (
                  <Link
                    to={`/profile/${user._id}`}
                    key={user._id}
                    className="bg-white p-4 rounded-xl flex items-center justify-between group border border-transparent hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar?.url || user.avatar || "https://via.placeholder.com/150"}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#D8E2DC] group-hover:border-[#EF233C] transition-colors"
                      />
                      <div>
                        <h4 className="font-bold text-[#2B2D42] text-sm">{user.name}</h4>
                        <p className="text-xs text-[#8D99AE]">@{user.username}</p>
                      </div>
                    </div>
                    {currentUser?._id !== user._id && (
                      <button
                        onClick={(e) => handleFollowToggle(e, user)}
                        disabled={followLoading[user._id]}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          user.isFollowing
                            ? "bg-[#EDF2F4] text-[#2B2D42] border border-[#8D99AE]"
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
            </section>
          )}

          {/* Trips */}
          {results.trips?.length > 0 && (activeTab === "All" || activeTab === "Trips") && (
            <section>
              <h3 className="text-[#8D99AE] text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <i className="bx bx-map-alt"></i> Trips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.trips.map((trip) => (
                  <Link
                    to={`/trip/${trip._id}`}
                    key={trip._id}
                    className="bg-white rounded-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl"
                  >
                    <div className="h-40 relative overflow-hidden">
                      <img
                        src={trip.coverPhoto?.url || trip.coverPhoto}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-[#2B2D42] truncate group-hover:text-[#EF233C] transition-colors">
                        {trip.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <img
                          src={trip.user?.avatar?.url || trip.user?.avatar || "https://via.placeholder.com/20"}
                          alt="owner"
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-xs text-[#8D99AE] truncate">by {trip.user?.username}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#8D99AE] mt-2">
                        <i className="bx bx-map text-[#EF233C]"></i>
                        <span className="truncate">
                          {trip.destinations?.map((d) => d.city).join(", ") || "Multiple Locations"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Posts */}
          {results.posts?.length > 0 && (activeTab === "All" || activeTab === "Posts") && (
            <section>
              <h3 className="text-[#8D99AE] text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <i className="bx bx-images"></i> Posts
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.posts.map((post) => (
                  <Link
                    to={`/post/${post._id}`}
                    key={post._id}
                    className="aspect-square bg-white rounded-xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-lg"
                  >
                    <img
                      src={
                        post.media?.[0]?.url ||
                        post.thumbnail ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                      <div className="flex items-center gap-1 font-bold">
                        <i className="bx bxs-heart text-[#EF233C]"></i> {post.likesCount}
                      </div>
                      <div className="flex items-center gap-1 font-bold">
                        <i className="bx bxs-comment text-blue-400"></i> {post.commentsCount}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
