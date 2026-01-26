import React from 'react';
import { Link } from 'react-router-dom';

const TripCollaborators = ({ trip }) => {
  return (
    <div className="w-full px-3 py-3 md:px-6 md:py-6 bg-white rounded-xl shadow-sm flex flex-col items-start justify-start gap-4 md:gap-6 transition-all hover:shadow-md">
      {/* Trip Owner Section */}
      <Link to={`/profile/${trip.user._id}`} className="w-full flex items-center gap-3 md:gap-5 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all">
        <div className="relative">
          <img
            src={trip.user.avatar?.url || trip.user.avatar}
            alt="Owner Avatar"
            className="h-14 w-14 md:h-20 md:w-20 rounded-full object-cover border-4 border-yellow-100 shadow-sm"
          />
          <div className="absolute -top-2 -right-1 md:-top-3 md:-right-2 bg-white rounded-full p-1 shadow-sm flex items-center justify-center">
            <i className='bx bxs-crown text-xl md:text-3xl text-yellow-500'></i>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">{trip.user.name}</h2>
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] md:text-xs font-bold uppercase rounded-full tracking-wide">
              Owner
            </span>
          </div>
          <p className="text-sm md:text-base text-gray-500 font-medium">@{trip.user.username}</p>
        </div>
      </Link>

      {/* Collaborators Section */}
      {trip.acceptedFriends && trip.acceptedFriends.length > 0 && (
        <div className="w-full flex flex-col gap-3 md:gap-4 pl-2 border-l-2 border-gray-100 ml-3 md:ml-4">
          {trip.acceptedFriends.map((friend) => (
            <Link 
              to={`/profile/${friend.user._id}`}
              key={friend._id} 
              className="flex items-center gap-3 md:gap-4 pl-3 md:pl-4 py-2 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
            >
              <div className="relative">
                <img
                  src={friend.user.avatar?.url || friend.user.avatar}
                  alt={friend.user.name}
                  className="h-10 w-10 md:h-14 md:w-14 rounded-full object-cover border-2 border-gray-100 group-hover:border-gray-200 transition-colors"
                />
                <div className="absolute -top-1.5 -right-1 md:-top-2 md:-right-1 bg-white rounded-full p-0.5 shadow-sm flex items-center justify-center">
                  <i className='bx bxs-crown text-base md:text-xl text-gray-400'></i>
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="text-sm md:text-lg font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {friend.user.name}
                  </p>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[8px] md:text-[10px] font-bold uppercase rounded-full tracking-wide">
                    Collaborator
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-400 group-hover:text-gray-500 transition-colors">
                  @{friend.user.username}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripCollaborators;
