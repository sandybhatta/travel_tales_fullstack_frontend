import React from 'react';

const TripDescription = ({ trip, showDescription, setShowDescription }) => {
  return (
    <div className="w-full px-3 py-3 md:px-6 md:py-6 rounded-xl bg-white shadow-sm flex flex-col items-start justify-center gap-3 md:gap-4 transition-all hover:shadow-md border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <i className='bx bxs-quote-left text-2xl md:text-3xl text-red-500 opacity-20'></i>
        <h2 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">
          About This Trip
        </h2>
      </div>
      
      <div className="w-full pl-3 md:pl-4 border-l-4 border-red-50">
        {trip.description && trip.description.length > 0 ? (
          <div className="relative">
            <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
              {showDescription
                ? trip.description
                : trip.description.slice(0, 200)}
              {!showDescription && trip.description.length > 200 && "..."}
            </p>
            
            {trip.description.length > 200 && (
              <button
                className="mt-2 text-xs md:text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDescription((prev) => !prev);
                }}
              >
                {showDescription ? (
                  <>See Less <i className='bx bx-chevron-up'></i></>
                ) : (
                  <>Read More <i className='bx bx-chevron-down'></i></>
                )}
              </button>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-sm md:text-base italic">No description added for this trip yet.</p>
        )}
      </div>
    </div>
  );
};

export default TripDescription;
