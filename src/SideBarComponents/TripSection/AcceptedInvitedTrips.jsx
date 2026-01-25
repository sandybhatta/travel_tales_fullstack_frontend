import React from 'react'
import { Link } from 'react-router-dom';

const AcceptedInvitedTrips = ({ acceptedTrips, formatDate, loading }) => {

    function formatAcceptedDate(dateString) {
        return new Date(dateString).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-800 rounded-xl overflow-hidden h-[450px] animate-pulse">
                        <div className="h-48 bg-gray-700"></div>
                        <div className="p-5 space-y-4">
                            <div className="h-14 bg-gray-700 rounded-lg"></div>
                            <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                            <div className="h-10 bg-gray-700 rounded-lg mt-4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (acceptedTrips.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <i className='bx bx-check-circle text-6xl mb-4 text-gray-600'></i>
                <p className="text-xl">No accepted trips yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acceptedTrips.map((trip) => {
                return (
                    <div
                        key={trip.id}
                        className="flex flex-col rounded-xl overflow-hidden bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 relative group"
                    >
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
                            
                            <div className='absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-semibold text-white bg-green-500/90 backdrop-blur-sm flex items-center gap-1 shadow-lg'>
                                <i className='bx bx-check text-base'></i>
                                Accepted
                            </div>

                            <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-semibold text-white backdrop-blur-sm shadow-lg ${
                                trip.tripStatus === "past" ? "bg-gray-500/90" : 
                                trip.tripStatus === "upcoming" ? "bg-blue-500/90" : "bg-red-500/90"
                            }`}>
                                {trip.tripStatus ? trip.tripStatus.charAt(0).toUpperCase() + trip.tripStatus.slice(1) : 'Unknown'}
                            </div>

                            <h3 className="absolute bottom-3 left-4 right-4 text-xl font-bold text-white truncate">
                                {trip.title}
                            </h3>
                        </div>

                        {/* Info Box */}
                        <div className="p-5 flex flex-col gap-4 flex-1">
                            {/* Owner */}
                            <div className="flex items-center gap-3 bg-gray-700/50 p-3 rounded-lg border border-gray-700">
                                <img
                                    src={trip.owner.avatar?.url || trip.owner.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-600"
                                    alt={trip.owner.username}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{trip.owner.name}</p>
                                    <p className="text-xs text-gray-400 truncate">@{trip.owner.username}</p>
                                    <p className="text-[10px] text-green-400 mt-0.5">Accepted: {formatAcceptedDate(trip.acceptedAt)} </p>
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
                            <div className="flex flex-wrap gap-2 mb-2">
                                {trip.tags.length > 0 ? trip.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300 border border-gray-600"
                                    >
                                        #{tag}
                                    </span>
                                )) : <span className="text-xs text-gray-500 italic">No tags</span>}
                            </div>

                            <div className="mt-auto pt-2">
                                <Link to={`/trip/${trip.id}`} className='block w-full'>
                                    <div className='w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-center shadow-lg shadow-red-500/20 transition-all active:scale-95'>
                                        View Trip Details
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

export default AcceptedInvitedTrips