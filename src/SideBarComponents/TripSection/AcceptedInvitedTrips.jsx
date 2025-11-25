import React from 'react'

const AcceptedInvitedTrips = ({acceptedTrips,formatDate}) => {
    return (
        <div className="grid grid-cols-3 gap-5">
          {acceptedTrips.map((trip) => {
            
    
            return (
              <div
                key={trip.id}
                className="flex flex-col items-center gap-0 rounded-lg overflow-hidden bg-white relative"
              >
                
                    {trip.photoUrl ? (
                      <div className="w-full h-48 relative bg-white/20 overflow-hidden ">
                        <img
                          src={trip.photoUrl}
                          alt="trip cover"
                          className="h-full w-full object-cover"
                        />
                        <span className='absolute top-2 left-2 px-4 py-2 rounded-full text-white bg-green-500 flex items-center gap-2'> 
                            <i className='bx bx-check text-2xl'></i>
                            Accepted
                        </span>

                        <span className={`${trip.tripStatus==="past"? "bg-green-500": trip.tripStatus=== "upcoming"?"bg-blue-500":"bg-red-500"} absolute top-2 right-2 px-4 py-2 rounded-full text-white`}>
                            {trip.tripStatus}
                        </span>

                        


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
    
                      
                    </div>
                  
                
              </div>
            );
          })}
        </div>
      );
}

export default AcceptedInvitedTrips