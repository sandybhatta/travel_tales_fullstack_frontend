import React from 'react';

const TripDestinations = ({ trip }) => {
  if (!trip.destinations || trip.destinations.length === 0) return null;

  return (
    <div className="flex flex-col items-start justify-start gap-5 bg-white rounded-lg px-3 shadow-2xl pb-5 h-fit">
      <div className="flex items-center justify-start gap-2 px-3 py-2 mb-3">
        <i className="bx bx-location text-2xl text-red-500"></i>
        <p className="text-xl text-black">Destinations</p>
      </div>

      <div className="flex flex-col items-center justify-around gap-4 w-full px-3">
        {trip.destinations.map((destination) => (
          <div
            key={destination._id}
            className="flex flex-col items-start justify-center gap-1 shadow-md w-full bg-[#EDF2F4] p-2"
          >
            <p className="text-lg text-black">{destination.city}</p>
            <p className="text-base text-gray-600">
              {destination.state}, {destination.country}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripDestinations;
