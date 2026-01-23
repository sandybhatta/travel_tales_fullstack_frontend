import React from 'react';

const TripDestinations = ({ trip }) => {
  if (!trip.destinations || trip.destinations.length === 0) return null;

  return (
    <div className="flex flex-col items-start justify-start gap-5 bg-white rounded-xl px-5 shadow-sm hover:shadow-md transition-shadow pb-6 h-fit border border-gray-100">
      <div className="flex items-center justify-start gap-3 px-1 py-2 mb-1">
        <div className="p-2 bg-red-50 rounded-lg flex items-center justify-center">
          <i className="bx bx-location text-red-500 text-2xl"></i>
        </div>
        <p className="text-xl font-bold text-gray-800">Destinations</p>
      </div>

      <div className="flex flex-col items-center justify-around gap-4 w-full">
        {trip.destinations.map((destination) => (
          <div
            key={destination._id}
            className="flex flex-col items-start justify-center gap-1 w-full bg-gray-50 p-4 rounded-lg border border-gray-100 hover:bg-red-50/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <i className='bx bxs-city text-gray-400'></i>
              <p className="text-lg font-normal text-gray-800">
                {[destination.city, destination.state, destination.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripDestinations;
