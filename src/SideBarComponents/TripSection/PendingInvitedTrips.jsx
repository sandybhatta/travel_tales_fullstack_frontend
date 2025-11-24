import React, { useState } from "react";
import mainApi from "../../Apis/axios";

const PendingInvitedTrips = ({
  invitedTrips,
  setInvitedTrips,
  formatDate,
  setError,
}) => {
  const [acceptingTripIds, setAcceptingTripIds] = useState([]);
  const [successForTrip, setSuccessForTrip] = useState({}); 

  if (invitedTrips.length === 0) {
    return <div>No invited trips found.</div>;
  }

  const handleAcceptTrip = async (tripId) => {
    setError("");

    // mark this trip as accepting
    setAcceptingTripIds((prev) => [...prev, tripId]);

    try {
      const response = await mainApi.post(`/api/trips/${tripId}/accept`);

      // store success message only for this card
      setSuccessForTrip((prev) => ({
        ...prev,
        [tripId]: response.data.message,
      }));

      // remove trip after 3 seconds
      setTimeout(() => {
        setInvitedTrips((prev) => prev.filter((trip) => trip.id !== tripId));
      }, 3000);
    } catch (error) {
      if (error?.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.code === "ERR_NETWORK") {
        setError("Your network is Slow");
      }
    } finally {
      // clear loading & success after 3 seconds
      setTimeout(() => {
        setAcceptingTripIds((prev) => prev.filter((id) => id !== tripId));

        setSuccessForTrip((prev) => {
          const newState = { ...prev };
          delete newState[tripId];
          return newState;
        });
      }, 3000);
    }
  };

  const handleDecline = async (tripId) =>{
    setError("")
    try {
      await mainApi.delete(`/api/user${tripId}/reject-invitation`)
      setInvitedTrips((prev) => prev.filter((trip) => trip.id !== tripId));

    } catch (error) {
      if (error?.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.code === "ERR_NETWORK") {
        setError("Your network is Slow");
      }
    }
   

  }

  return (
    <div className="grid grid-cols-3 gap-5">
      {invitedTrips.map((trip) => {
        const isAccepting = acceptingTripIds.includes(trip.id);
        const successMessage = successForTrip[trip.id];

        return (
          <div
            key={trip.id}
            className="flex flex-col items-center gap-0 rounded-lg overflow-hidden bg-white relative"
          >
            {/* If success message exists, show it */}
            {successMessage ? (
              <div className="w-full h-full flex items-center justify-center bg-red-500 text-white p-10">
                <p className="text-3xl font-semibold">{successMessage}</p>
              </div>
            ) : (
              <>
                {/* Cover Photo */}
                {trip.photoUrl ? (
                  <div className="w-full h-48 relative bg-white/20 overflow-hidden">
                    <img
                      src={trip.photoUrl}
                      alt="trip cover"
                      className="h-full w-full object-cover"
                    />
                    <p className="w-full truncate text-white text-2xl absolute bottom-2 left-2">
                      {trip.title}
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-48 relative bg-white/20">
                    <p className="w-[80%] truncate text-white text-2xl absolute bottom-2 left-2">
                      {trip.title}
                    </p>
                  </div>
                )}

                {/* Info Box */}
                <div className="w-full flex flex-col items-center gap-5 justify-around py-5 px-5">
                  {/* Owner */}
                  <div className="w-full px-3 py-2 flex items-center justify-between gap-2 bg-[#EDF2F4] rounded-lg">
                    <div className="h-15 rounded-full">
                      <img
                        src={trip.owner.avatar?.url || trip.owner.avatar}
                        className="h-full object-cover"
                      />
                    </div>

                    <div className="w-[80%] flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <p className="text-black text-base">
                          {trip.owner.name}
                        </p>
                        <p className="text-gray-500 text-sm">
                          @{trip.owner.username}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <i className="bx bx-siren-alt text-2xl text-red-500" />
                        <p className="text-gray-500 text-xs">Invited You</p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="w-full flex items-center gap-2">
                    <i className="bx bx-calendar-week text-xl text-red-500" />
                    <p className="text-black text-base">
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="w-full flex items-center gap-2">
                    <i className="bx bx-clock-4 text-xl text-gray-500" />
                    <p className="text-gray-500 text-base">
                      {trip.duration} Days
                    </p>
                  </div>

                  {/* Destinations */}
                  <div className="w-full flex items-center gap-2">
                    <i className="bx bx-location text-xl text-red-500" />
                    <p className="text-gray-500 text-base">Destinations:</p>
                  </div>

                  <div className="w-full flex flex-col gap-2">
                    {trip.destinations.map((dest) => (
                      <div
                        key={dest._id}
                        className="w-full flex items-center gap-2"
                      >
                        <i className="bx bx-chevron-right text-gray-400 text-xl" />
                        <p className="text-sm text-black">
                          {dest.city}, {dest.state}, {dest.country}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="w-full h-[1px] bg-[#8D99AE]" />

                  {/* Tags */}
                  <div className="w-full flex items-center gap-2 flex-wrap">
                    {trip.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg text-black hover:bg-red-500 hover:text-white text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="w-full h-[1px] bg-[#8D99AE]" />

                  {/* Actions */}
                  <div className="w-full flex items-center gap-5 justify-around flex-wrap">
                    <div
                      className={`text-white px-4 py-3 rounded-lg shadow-xl flex items-center justify-center gap-3 bg-red-400 hover:bg-red-600 hover:shadow-2xl ${
                        isAccepting ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                      onClick={() =>
                        !isAccepting ? handleAcceptTrip(trip.id) : null
                      }
                    >
                      <i className="bx bx-check text-2xl" />
                      <p className="text-base font-semibold">
                        {isAccepting ? "Accepting..." : "Accept"}
                      </p>
                    </div>

                    <div className="text-black px-4 py-3 cursor-pointer rounded-lg shadow-xl flex items-center justify-center gap-3 bg-[#8D99AE]/40 hover:bg-[#8D99AE] hover:shadow-2xl"
                    onClick={()=>handleDecline(trip.id)}
                    >
                      <i className="bx bx-x text-2xl" />
                      <p className="text-base font-semibold">Decline</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PendingInvitedTrips;
