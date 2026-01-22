import React from 'react';

const TripDescription = ({ trip, showDescription, setShowDescription }) => {
  return (
    <div className="w-full px-5 py-5 rounded-lg bg-white flex flex-col items-start jusitfy-center gap-5">
      <h2 className="text-2xl font-semibold text-black ">
        About This Trip :
      </h2>
      <div className="w-full px-5 py-3  rounded-lg ">
        {trip.description.length > 0 ? (
          <p className="text-base text-gray-700 whitespace-pre-wrap">
            {showDescription
              ? trip.description
              : trip.description.slice(0, 150)}{" "}
            <span
              className="text-red-500 font-semibold cursor-pointer text-lg"
              onClick={(e) => {
                e.stopPropagation();
                setShowDescription((prev) => !prev);
              }}
            >
              {showDescription ? "... See Less" : "... See More"}{" "}
            </span>
          </p>
        ) : (
          <p>No Description added for this trip.</p>
        )}
      </div>
    </div>
  );
};

export default TripDescription;
