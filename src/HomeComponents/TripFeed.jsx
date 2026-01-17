import React, { useState, useEffect } from "react";
import {
  getVisibleTrips,
  getPublicTrips,
} from "../Apis/feedApi.js";
import { toggleTripLike } from "../Apis/likeApi.js";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useDebounce from "../CustomHooks/useDebounceHook";

const TRIP_TAGS = [
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
 
const TripFeed = ({ filter }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likingStates, setLikingStates] = useState({});

  // Filters for visible trips only
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  const { _id } = useSelector((state) => state.user);
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    setPage(1);
    setTrips([]);
    setSearchQuery("");
    setSelectedTag("");
    setSortBy("newest");
    fetchTrips(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (filter === "visible") {
      setPage(1);
      setTrips([]);
      fetchTrips(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedTag, sortBy, filter]);

  const fetchTrips = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (filter === "visible") {
        response = await getVisibleTrips(
          pageNum,
          20,
          debouncedSearch,
          selectedTag,
          sortBy === "newest" ? "" : sortBy
        );
        setTrips((prev) => (pageNum === 1 ? response.trips : [...prev, ...response.trips]));
        setHasMore(pageNum < response.totalPages);
      } else if (filter === "public") {
        response = await getPublicTrips(pageNum, 20);
        setTrips((prev) => (pageNum === 1 ? response.trips : [...prev, ...response.trips]));
        setHasMore(pageNum < response.totalPages);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load trips");
      console.error("Error fetching trips:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTrips(nextPage);
    }
  };

  const handleLike = async (tripId, currentLiked) => {
    if (likingStates[tripId]) return;
    
    setLikingStates((prev) => ({ ...prev, [tripId]: true }));
    const newLikedState = !currentLiked;

    // Optimistic update
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip._id === tripId) {
          const currentLikes = trip.likes || [];
          const newLikes = newLikedState
            ? [...currentLikes, _id]
            : currentLikes.filter((id) => (id._id || id).toString() !== _id.toString());
          
          return {
            ...trip,
            likes: newLikes,
            isLikedByViewer: newLikedState,
          };
        }
        return trip;
      })
    );

    try {
      await toggleTripLike(tripId);
    } catch (err) {
      // Rollback on error
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip._id === tripId) {
            return {
              ...trip,
              isLikedByViewer: currentLiked,
            };
          }
          return trip;
        })
      );
      console.error("Error toggling like:", err);
    } finally {
      setLikingStates((prev) => ({ ...prev, [tripId]: false }));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTripStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < now) return { text: "Completed", color: "bg-green-500" };
    if (start > now) return { text: "Upcoming", color: "bg-red-500" };
    return { text: "Ongoing", color: "bg-blue-500" };
  };

  if (loading && trips.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error && trips.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 gap-3">
        <i className="bx bx-error-circle text-5xl text-red-500"></i>
        <p className="text-lg text-gray-600">{error}</p>
        <button
          onClick={() => fetchTrips(1)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (trips.length === 0 && !loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 gap-3">
        <i className="bx bx-trip text-6xl text-gray-400"></i>
        <p className="text-xl font-semibold text-gray-600">No trips found</p>
        <p className="text-sm text-gray-500">
          {filter === "visible"
            ? "No visible trips available"
            : filter === "public"
            ? "No public trips available"
            : "No trips to discover"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-10">
      {/* Search, Tag Filter, and Sort Options - Only for Visible Trips */}
      {filter === "visible" && (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="bx bx-search text-xl text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Search trips by title or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Tag Filter */}
            <div className="relative flex-1 min-w-[200px]">
              <button
                onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-red-400 transition-all"
              >
                <span className="flex items-center gap-2">
                  <i className="bx bx-tag text-red-500 text-3xl"></i>
                  <span className={selectedTag ? "text-gray-800" : "text-gray-500"}>
                    {selectedTag
                      ? selectedTag.charAt(0).toUpperCase() + selectedTag.slice(1).replace("_", " ")
                      : "All Tags"}
                  </span>
                </span>
                <i
                  className={`bx bx-chevron-${tagDropdownOpen ? "up" : "down"} text-gray-500 text-2xl transition-transform`}
                ></i>
              </button>

              {tagDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setTagDropdownOpen(false)}
                  ></div>
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedTag("");
                        setTagDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition ${
                        selectedTag === "" ? "bg-red-50 text-red-600 font-medium" : "text-gray-700"
                      }`}
                    >
                      All Tags
                    </button>
                    {TRIP_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(tag);
                          setTagDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition ${
                          selectedTag === tag
                            ? "bg-red-50 text-red-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {tag.charAt(0).toUpperCase() + tag.slice(1).replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sort By */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all cursor-pointer appearance-none pr-10"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Popular</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="bx bx-chevron-down text-gray-500"></i>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedTag) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag("");
                }}
                className="px-4 py-3 text-red-500 hover:text-red-600 font-medium transition flex items-center gap-2"
              >
                <i className="bx bx-x"></i>
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => {
          const status = getTripStatus(trip.startDate, trip.endDate);
          const coverPhoto = trip.coverPhoto?.url || trip.coverPhoto;
          const owner = trip.user;
          const likesCount = trip.likes?.length || 0;
          const postsCount = trip.posts?.length || 0;

          return (
            <Link
              key={trip._id}
              to={`/trip/${trip._id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 group"
            >
              {/* Cover Photo */}
              <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                {coverPhoto ? (
                  <img
                    src={coverPhoto}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200">
                    <i className="bx bx-trip text-5xl text-red-400"></i>
                  </div>
                )}
                {/* Status Badge */}
                <div
                  className={`absolute top-2 right-2 ${status.color} text-white px-2 py-1 rounded-full text-xs font-semibold`}
                >
                  {status.text}
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 group-hover:text-red-500 transition">
                  {trip.title}
                </h3>

                {/* Owner */}
                {owner && (
                  <div className="flex items-center gap-2">
                    <img
                      src={owner.avatar?.url || owner.avatar || "/default-avatar.png"}
                      alt={owner.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <p className="text-sm text-gray-600">{owner.name || owner.username}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <i className="bx bx-calendar"></i>
                  <span>
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </span>
                </div>

                {/* Destinations */}
                {trip.destinations && trip.destinations.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <i className="bx bx-map"></i>
                    <span className="line-clamp-1">
                      {trip.destinations[0].city},{trip.destinations[0].state},{trip.destinations[0].country},
                    </span>
                    {trip.destinations.length>1 && <span>& {trip.destinations.length-1} more</span>}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const isLiked = trip.isLikedByViewer || trip.likes?.some((like) => (like._id || like).toString() === _id.toString());
                      handleLike(trip._id, isLiked);
                    }}
                    disabled={likingStates[trip._id]}
                    className="flex items-center gap-1 hover:opacity-70 transition disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={trip.isLikedByViewer || trip.likes?.some((like) => (like._id || like).toString() === _id.toString()) ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className={`w-6 h-6 ${trip.isLikedByViewer || trip.likes?.some((like) => (like._id || like).toString() === _id.toString()) ? "text-red-500" : "text-gray-500"}`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className="text-xs text-gray-600">{likesCount}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <i className="bx bx-image text-gray-500"></i>
                    <span className="text-xs text-gray-600">{postsCount}</span>
                  </div>
                  {trip.acceptedFriends && trip.acceptedFriends.length > 0 && (
                    <div className="flex items-center gap-1">
                      <i className="bx bx-group text-gray-500"></i>
                      <span className="text-xs text-gray-600">
                        {trip.acceptedFriends.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="w-full flex items-center justify-center py-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </div>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TripFeed;
