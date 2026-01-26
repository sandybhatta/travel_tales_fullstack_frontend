import React from "react";
import { Link, useNavigate } from "react-router-dom";

const TripInfoCard = ({ trip }) => {
  if (!trip) return null;

  const navigate = useNavigate();
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  let status = "";
  let colorClass = "";

  if (now < start) {
    status = "Upcoming";
    colorClass = "bg-red-500";
  } else if (now >= start && now <= end) {
    status = "Ongoing";
    colorClass = "bg-blue-500";
  } else {
    status = "Completed";
    colorClass = "bg-green-500";
  }

  return (
    <div
      onClick={() => navigate(`/trip/${trip._id}`)}
      className="block mx-0 sm:mx-4 mt-4 group cursor-pointer"
    >
      <div className="relative rounded-none sm:rounded-xl overflow-hidden shadow-sm md:shadow-md border-y sm:border border-gray-200">
        {/* Cover Photo */}
        <div className="h-40 sm:h-48 w-full relative">
          <img
            src={
              trip.coverPhoto?.url ||
              "https://via.placeholder.com/800x400?text=No+Cover"
            }
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`${colorClass} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm`}
            >
              {status}
            </span>
          </div>

          {/* Title & Dates */}
          <div className="absolute bottom-0 left-0 p-4 text-white w-full">
            <h3 className="text-lg md:text-xl font-bold mb-1 truncate">{trip.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-200">
              <i className="bx bx-calendar"></i>
              <span>
                {new Date(trip.startDate).toLocaleDateString()} -{" "}
                {new Date(trip.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Destinations & Collaborators */}
        <div className="bg-white p-4">
          {/* Destinations */}
          <div className="flex items-start gap-2 mb-3 text-gray-600">
            <i className="bx bx-location-plus mt-1 text-red-500"></i>
            <div className="text-sm">
              {trip.destinations && trip.destinations.length > 0 ? (
                <span>
                  {trip.destinations[0].city}, {trip.destinations[0].country}
                  {trip.destinations.length > 1 && (
                    <span className="text-gray-400 ml-1">
                      +{trip.destinations.length - 1} more
                    </span>
                  )}
                </span>
              ) : (
                <span>No destinations added</span>
              )}
            </div>
          </div>

          {/* Collaborators */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-3 items-center">
                {/* Owner */}
                <div className="relative z-20">
                  <Link
                    to={`/profile/${trip.user?._id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={trip.user?.avatar?.url || trip.user?.avatar}
                      alt={trip.user?.name}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                  </Link>
                  <span className="absolute -top-2 -right-1 text-yellow-500 text-xs">
                    <i className="bx bxs-crown text-sm"></i>
                  </span>
                </div>

                {/* First Accepted Friend */}
                {trip.acceptedFriends && trip.acceptedFriends.length > 0 && (
                  <div className="relative z-10">
                    <Link
                      to={`/profile/${trip.acceptedFriends[0].user?._id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src={
                          trip.acceptedFriends[0].user?.avatar?.url ||
                          trip.acceptedFriends[0].user?.avatar
                        }
                        alt={trip.acceptedFriends[0].user?.name}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                      />
                    </Link>
                    <span className="absolute -top-2 -right-1 text-gray-400 text-xs">
                      <i className="bx bxs-crown text-sm"></i>
                    </span>
                  </div>
                )}
              </div>

              {/* Remaining Count or Owner Name */}
              {trip.acceptedFriends && trip.acceptedFriends.length > 1 ? (
                <span className="text-xs text-gray-500 font-medium ml-1">
                  +{trip.acceptedFriends.length - 1} more collaborators
                </span>
              ) : (
                (!trip.acceptedFriends ||
                  trip.acceptedFriends.length === 0) && (
                  <div className="flex flex-col ml-2">
                    <span className="text-sm font-semibold text-gray-800 leading-tight">
                      {trip.user?.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      @{trip.user?.username}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripInfoCard;
