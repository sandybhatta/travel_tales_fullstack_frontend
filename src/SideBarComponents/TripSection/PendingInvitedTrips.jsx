import React, { useState } from "react";
import { 
  useAcceptTripInvitationMutation, 
  useRejectTripInvitationMutation 
} from "../../slices/tripApiSlice";

const PendingInvitedTrips = ({
  invitedTrips,
  formatDate,
  loading
}) => {
  const [acceptingTripIds, setAcceptingTripIds] = useState([]);
  const [decliningTripIds, setDecliningTripIds] = useState([]);
  const [successForTrip, setSuccessForTrip] = useState({}); 
  const [error, setError] = useState("");

  const [acceptTripInvitation] = useAcceptTripInvitationMutation();
  const [rejectTripInvitation] = useRejectTripInvitationMutation();

  if (loading) {
      return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-800 rounded-xl overflow-hidden h-[500px] animate-pulse">
                      <div className="h-48 bg-gray-700"></div>
                      <div className="p-5 space-y-4">
                          <div className="h-14 bg-gray-700 rounded-lg"></div>
                          <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                          <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                          <div className="h-20 bg-gray-700 rounded"></div>
                          <div className="flex gap-4 pt-4">
                              <div className="h-10 flex-1 bg-gray-700 rounded-lg"></div>
                              <div className="h-10 flex-1 bg-gray-700 rounded-lg"></div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      );
  }

  if (invitedTrips.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className='bx bx-envelope-open text-6xl mb-4 text-gray-600'></i>
            <p className="text-xl">No pending invitations.</p>
        </div>
    );
  }

  const handleAcceptTrip = async (tripId) => {
    if (acceptingTripIds.includes(tripId) || decliningTripIds.includes(tripId)) return;
    
    setError("");
    setAcceptingTripIds((prev) => [...prev, tripId]);

    try {
      const response = await acceptTripInvitation(tripId).unwrap();

      setSuccessForTrip((prev) => ({
        ...prev,
        [tripId]: response.message || "Trip accepted!",
      }));

      // No need to manually update state, RTK Query invalidates tags
    } catch (error) {
      if (error?.data?.message) {
        setError(error.data.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      // Keep loading state for a bit to show success message before removal (via re-fetch)
      // Actually, if we invalidate, the list updates. The item disappears.
      // So the success message might disappear too quickly.
      // We can rely on the fact that re-fetch takes a moment.
      setTimeout(() => {
        setAcceptingTripIds((prev) => prev.filter((id) => id !== tripId));
        setSuccessForTrip((prev) => {
          const newState = { ...prev };
          delete newState[tripId];
          return newState;
        });
      }, 2000);
    }
  };

  const handleDecline = async (tripId) => {
    if (acceptingTripIds.includes(tripId) || decliningTripIds.includes(tripId)) return;

    setError("");
    setDecliningTripIds((prev) => [...prev, tripId]);

    try {
      await rejectTripInvitation(tripId).unwrap();
      // List updates automatically
    } catch (error) {
      if (error?.data?.message) {
        setError(error.data.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
        setDecliningTripIds((prev) => prev.filter((id) => id !== tripId));
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Error Display */}
      {error && (
        <div className="col-span-full bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg text-center mb-4">
            {error}
        </div>
      )}
      
      {invitedTrips.map((trip) => {
        const isAccepting = acceptingTripIds.includes(trip.id);
        const isDeclining = decliningTripIds.includes(trip.id);
        const successMessage = successForTrip[trip.id];

        return (
          <div
            key={trip.id}
            className="flex flex-col rounded-xl overflow-hidden bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 relative group"
          >
            {/* If success message exists, show it overlay */}
            {successMessage ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-green-500/90 text-white p-6 text-center backdrop-blur-sm">
                <div className="bg-white/20 p-4 rounded-full mb-4">
                    <i className='bx bx-check text-4xl'></i>
                </div>
                <p className="text-xl font-bold">{successMessage}</p>
              </div>
            ) : null}

            {/* Cover Photo */}
            <div className="h-48 relative overflow-hidden bg-gray-700">
                {trip.photoUrl ? (
                  <img
                    src={trip.photoUrl}
                    alt="trip cover"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-600">
                        <i className='bx bx-image text-4xl text-gray-500'></i>
                   </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
                <h3 className="absolute bottom-3 left-4 right-4 text-lg md:text-xl font-bold text-white truncate">
                  {trip.title}
                </h3>
            </div>

            {/* Info Box */}
            <div className="p-3 md:p-5 flex flex-col gap-3 md:gap-4">
              {/* Owner */}
              <div className="flex items-center gap-2 md:gap-3 bg-gray-700/50 p-2 md:p-3 rounded-lg border border-gray-700">
                <img
                    src={trip.owner.avatar?.url || trip.owner.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-gray-600"
                    alt={trip.owner.username}
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{trip.owner.name}</p>
                    <p className="text-xs text-gray-400 truncate">@{trip.owner.username}</p>
                </div>
                <div className="flex flex-col items-end">
                     <span className="text-[10px] text-red-400 font-medium bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">Invited You</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <i className="bx bx-calendar text-red-500" />
                    <span>{formatDate(trip.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <i className="bx bx-time text-gray-400" />
                    <span>{trip.duration} Days</span>
                  </div>
              </div>

              {/* Destinations */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <i className="bx bx-map text-red-500" />
                    <span>Destinations</span>
                </div>
                <div className="pl-6 flex flex-col gap-1 max-h-20 overflow-y-auto custom-scrollbar">
                    {trip.destinations.map((dest) => (
                      <p key={dest._id} className="text-xs text-gray-400 truncate flex items-center gap-1">
                         <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                         {dest.city}, {dest.country}
                      </p>
                    ))}
                </div>
              </div>

              <div className="h-px bg-gray-700" />

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {trip.tags.length > 0 ? trip.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300 border border-gray-600"
                  >
                    #{tag}
                  </span>
                )) : <span className="text-xs text-gray-500 italic">No tags</span>}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-medium ${
                    isAccepting 
                        ? "bg-red-500/50 cursor-wait text-white" 
                        : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 active:scale-95"
                  }`}
                  disabled={isAccepting || isDeclining}
                  onClick={() => handleAcceptTrip(trip.id)}
                >
                  {isAccepting ? (
                      <i className='bx bx-loader-alt animate-spin text-xl'></i>
                  ) : (
                      <i className="bx bx-check text-xl" />
                  )}
                  {isAccepting ? "Accepting..." : "Accept"}
                </button>

                <button 
                    className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-medium border ${
                        isDeclining
                            ? "bg-gray-700 text-gray-400 cursor-wait border-gray-600"
                            : "bg-transparent text-gray-300 border-gray-600 hover:bg-gray-800 hover:text-white active:scale-95"
                    }`}
                    disabled={isAccepting || isDeclining}
                    onClick={()=>handleDecline(trip.id)}
                >
                   {isDeclining ? (
                       <i className='bx bx-loader-alt animate-spin text-xl'></i>
                   ) : (
                       <i className="bx bx-x text-xl" />
                   )}
                   Decline
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PendingInvitedTrips;