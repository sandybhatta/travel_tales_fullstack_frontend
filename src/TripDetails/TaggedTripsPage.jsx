import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTripsByTag } from "../Apis/tripApi";

const TaggedTripsPage = () => {
  const { tagname } = useParams();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getTripsByTag(tagname);
        setTrips(data.trips);
      } catch (err) {
        setError("Failed to fetch trips.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (tagname) {
      fetchTrips();
    }
  }, [tagname]);

  return (
    <div className="w-full min-h-screen p-4 md:p-8 animate-fadeIn bg-[#EDF2F4]">
      {/* Header */}
      <div className="mb-8 border-b border-[#D8E2DC] pb-4">
        <h2 className="text-2xl font-bold text-[#2B2D42] flex items-center gap-2">
          Trips tagged with <span className="text-[#EF233C]">#{tagname}</span>
        </h2>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      ) : error ? (
        <div className="text-center py-20 text-red-400">
          <i className="bx bx-error-circle text-4xl mb-2"></i>
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-12 pb-10">
          {trips.length === 0 ? (
             <div className="text-center py-20 opacity-60">
              <i className="bx bx-hash text-6xl text-[#8D99AE] mb-4"></i>
              <h2 className="text-xl font-bold text-[#2B2D42]">No trips found</h2>
              <p className="text-[#8D99AE]">Be the first to create a trip with this tag!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
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
                        src={
                          trip.user?.avatar?.url ||
                          trip.user?.avatar ||
                          "https://via.placeholder.com/20"
                        }
                        alt="owner"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs text-[#8D99AE] truncate">
                        by {trip.user?.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#8D99AE] mt-2">
                      <i className="bx bx-map text-[#EF233C]"></i>
                      <span className="truncate">
                        {trip.destinations?.map((d) => d.city).join(", ") ||
                          "Multiple Locations"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaggedTripsPage;
