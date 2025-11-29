import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const UpcomingTrips = ({upcomingTrips, sortBy}) => {
  const [option, setOption] = useState(null);

  const handleOption = (index, e) => {
    e.stopPropagation();
    setOption(index);
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!Array.isArray(upcomingTrips) || upcomingTrips.length === 0) {
    return (
      <p className="w-full h-1/2 text-5xl text-gray-500 bg-white text-center">
        No trips found
      </p>
    );
  }

  let sortedTrips = null;
  if (sortBy === "Start Date") {
    sortedTrips = [...upcomingTrips].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    )
  } else if (sortBy === "End Date") {
    sortedTrips = [...upcomingTrips].sort(
      (a, b) => new Date(a.endDate) - new Date(b.endDate)
    )
  } else if (sortBy === "Destinations") {
    sortedTrips = [...upcomingTrips].sort(
      (a, b) => (b?.destinations?.length ?? 0) - (a?.destinations?.length ?? 0)
    )
  } else if (sortBy === "Posts") {
    sortedTrips = [...upcomingTrips].sort(
      (a, b) => (b?.posts?.length ?? 0) - (a?.posts?.length ?? 0)
    )
  }

  return (
    <div
      className="w-full grid grid-cols-3 gap-5"
      onClick={() => setOption(null)}
    >
      {sortedTrips.map((trip, i) => {
        const coverPhoto = trip?.coverPhoto?.url ? trip.coverPhoto.url : null;


        return (
          <div
            className=" rounded-lg pb-4 bg-white overflow-hidden flex flex-col items-center gap-4  justify-center shadow-lg hover:shadow-2xl"
            key={trip._id}
          >
            {/* top section of images */}
            <div className="w-full h-1/2 relative">
              <img src={coverPhoto} className="w-full h-full object-cover" />
              <span
                className='bg-blue-500 text-sm font-semibold px-3 py-1 rounded-lg absolute top-2 left-2 text-white'
              >
                Upcoming
              </span>

              <span className="truncate absolute bottom-1 left-2 text-white text-2xl w-full font-semibold">
                {" "}
                {trip.title}{" "}
              </span>

              <button
                className="px-2 py-2 bg-black/30 hover:bg-black/50 absolute top-2 right-2 flex items-center justify-center rounded-lg cursor-pointer"
                onClick={(e) => handleOption(i, e)}
              >
                <i className="bx  bx-dots-vertical-rounded text-white text-2xl"></i>
              </button>
              {option === i && (
                <div className="bg-white flex flex-col items-center justify-around gap-2 rounded-lg px-3 py-2 absolute top-15 right-2 w-fit h-auto">
                  {/* edit trip */}
                  <div className="group text-black hover:bg-red-500 rounded-sm flex items-center justify-between gap-3 w-full px-3 py-2 cursor-pointer">
                    <i className="bx bx-edit text-2xl text-red-500 group-hover:text-white"></i>
                    <p className="group-hover:text-white text-sm">Edit Trip</p>
                  </div>

                  {/* delete trip */}
                  <div className="group text-black hover:bg-red-500 rounded-sm flex items-center justify-between gap-3 w-full px-3 py-2 cursor-pointer">
                    <i className="bx bx-trash text-2xl text-red-500 group-hover:text-white"></i>
                    <p className="group-hover:text-white text-sm">
                      Delete Trip
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* bottom section of Info */}
            <div className="w-full h-1/2 flex flex-col items-center justify-center gap-2">
              <div className="w-full px-5 flex justify-start items-center gap-2">
                {trip?.destinations && trip?.destinations.length > 0 && (
                  <div className="text-sm text-gray-600 flex items-center justify-around gap-2 ">
                    <i className="bx bx-location text-red-500 text-2xl "></i>
                    {trip.destinations[0].city}, {trip.destinations[0].state},{" "}
                    {trip.destinations[0].country}
                    {trip.destinations.length > 1 && (
                      <> and {trip.destinations.length - 1} other place </>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full px-5 flex justify-start items-center gap-2 text-sm text-gray-400">
                <i className="bx bx-calendar-week text-gray-500 text-2xl "></i>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </div>

              {/* collaborators */}
              <div className="text-sm text-black px-5 py-2 flex items-center gap-2 w-full">
                {trip.acceptedFriends && trip.acceptedFriends.length > 0 &&<i className='bx bx-group text-3xl text-gray-500'></i>}

                {trip.acceptedFriends && trip.acceptedFriends.length > 0 && (
                  <div className=" flex -space-x-3  px-2 ">
                    <span className='h-16 w-16 overflow-hidden rounded-full border-2 border-white'>
                      <img
                        src={
                          trip.acceptedFriends[0].user.avatar?.url ||
                          trip.acceptedFriends[0].user.avatar
                        }
                        className="h-full object-cover "
                      />
                    </span>
                    {trip.acceptedFriends.length > 1 && (
                      <span className='h-16 w-16 overflow-hidden rounded-full border-2 border-white'>
                        <img
                          src={
                            trip.acceptedFriends[1].user.avatar?.url ||
                            trip.acceptedFriends[1].user.avatar
                          }
                          className="h-full object-cover "
                        />
                      </span>
                    )}
                    
                    {trip.acceptedFriends.length > 2 && (
                      <span>
                       and {trip.acceptedFriends.length - 2} other collaborators
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="w-4/5 h-[2px] bg-gray-400 mt-5"></div>

              <div className="flex items-center justify-around w-full">
                <div className="text-gray-500 text-sm flex items-center gap-2 ">
                  <i className="bx bx-photo-album text-gray-500 text-2xl "></i>
                  {trip.posts.length} Posts
                </div>
                <Link
                className=""
                to={`/trip/${trip._id}`}
                >
                <div className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg cursor-pointer">
                  View Trip
                </div>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default UpcomingTrips