import React, { useState, useEffect } from "react";
import {
  getVisibleTrips,
  getPublicTrips,
  getDiscoverTrips,
} from "../Apis/feedApi.js";
import { Link } from "react-router-dom";

const TripFeed = ({ filter }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setPage(1);
    setTrips([]);
    fetchTrips(1);
  }, [filter]);

  const fetchTrips = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (filter === "visible") {
        response = await getVisibleTrips(pageNum, 20);
        setTrips((prev) => (pageNum === 1 ? response.trips : [...prev, ...response.trips]));
        setHasMore(pageNum < response.totalPages);
      } else if (filter === "public") {
        response = await getPublicTrips(pageNum, 20);
        setTrips((prev) => (pageNum === 1 ? response.trips : [...prev, ...response.trips]));
        setHasMore(pageNum < response.totalPages);
      } else if (filter === "discover") {
        response = await getDiscoverTrips(20);
        // Discover feed returns mixed posts and trips
        if (response.feed) {
          // Response has feed array with type and data structure
          const feedItems = response.feed || [];
          // Filter only trips (type === "trip" or has title/destinations)
          const tripsOnly = feedItems
            .filter((item) => {
              const data = item.data || item;
              return item.type === "trip" || (data.title && data.destinations && !data.media);
            })
            .map((item) => item.data || item);
          setTrips((prev) => (pageNum === 1 ? tripsOnly : [...prev, ...tripsOnly]));
          setHasMore(response.hasMore || tripsOnly.length === 20);
        } else if (response.trips) {
          setTrips((prev) => (pageNum === 1 ? response.trips : [...prev, ...response.trips]));
          setHasMore(response.hasMore || response.trips.length === 20);
        } else {
          setTrips((prev) => (pageNum === 1 ? [] : prev));
          setHasMore(false);
        }
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

    if (end < now) return { text: "Completed", color: "bg-gray-500" };
    if (start > now) return { text: "Upcoming", color: "bg-blue-500" };
    return { text: "Ongoing", color: "bg-green-500" };
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
                      {Array.isArray(trip.destinations)
                        ? trip.destinations.join(", ")
                        : trip.destinations}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <i className="bx bx-heart text-red-500"></i>
                    <span className="text-xs text-gray-600">{likesCount}</span>
                  </div>
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
