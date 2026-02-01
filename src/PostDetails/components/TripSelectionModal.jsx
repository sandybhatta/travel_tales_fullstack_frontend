import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetOwnTripsQuery, useGetCollaboratedTripsQuery } from '../../slices/tripApiSlice';

const TripSelectionModal = ({ onClose, onSelectTrip, currentTripId }) => {
    const { _id: userId } = useSelector(state => state.user);
    const [activeTab, setActiveTab] = useState('own'); // 'own' or 'collaborated'
    
    // Queries
    const { data: ownTripsData, isLoading: ownLoading } = useGetOwnTripsQuery(userId, {
        skip: !userId || activeTab !== 'own',
    });
    
    const { data: collabTripsData, isLoading: collabLoading } = useGetCollaboratedTripsQuery(userId, {
        skip: !userId || activeTab !== 'collaborated',
    });

    const [selectedTripId, setSelectedTripId] = useState(null);
    const [dayNumber, setDayNumber] = useState(1);
    const [isHighlighted, setIsHighlighted] = useState(false);

    // Derived State
    const loading = activeTab === 'own' ? ownLoading : collabLoading;
    const rawData = activeTab === 'own' ? ownTripsData : collabTripsData;
    
    let tripsArray = [];
    if (rawData && Array.isArray(rawData.trips)) {
        tripsArray = rawData.trips;
    } else if (Array.isArray(rawData)) {
        tripsArray = rawData;
    }
    
    const trips = (tripsArray || []).filter(t => t._id !== currentTripId);

    const handleTripClick = (tripId) => {
        if (selectedTripId === tripId) {
            setSelectedTripId(null); // Deselect
        } else {
            setSelectedTripId(tripId);
            setDayNumber(1);
            setIsHighlighted(false);
        }
    };

    const handleConfirmSelection = (trip) => {
        onSelectTrip(trip, dayNumber, isHighlighted);
        onClose();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const getDurationDays = (start, end) => {
        const s = new Date(start);
        const e = new Date(end);
        return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Select a Trip</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <i className='bx bx-x text-3xl text-gray-600'></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        className={`flex-1 py-3 font-semibold text-sm transition ${activeTab === 'own' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => { setActiveTab('own'); setSelectedTripId(null); }}
                    >
                        My Trips
                    </button>
                    <button
                        className={`flex-1 py-3 font-semibold text-sm transition ${activeTab === 'collaborated' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => { setActiveTab('collaborated'); setSelectedTripId(null); }}
                    >
                        Collaborated Trips
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-lg h-64 animate-pulse shadow-sm">
                                    <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                                    <div className="p-3 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : trips.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <i className='bx bx-map-alt text-6xl mb-2 text-gray-300'></i>
                            <p>No trips found in this category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {trips.map(trip => {
                                const isSelected = selectedTripId === trip._id;
                                const duration = getDurationDays(trip.startDate, trip.endDate);
                                
                                return (
                                    <div 
                                        key={trip._id} 
                                        onClick={() => handleTripClick(trip._id)}
                                        className={`bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border-2 overflow-hidden relative group ${isSelected ? 'border-red-500 ring-2 ring-red-100' : 'border-transparent'}`}
                                    >
                                        {/* Cover Photo */}
                                        <div className="h-40 relative">
                                            <img 
                                                src={trip.coverPhoto?.url || "https://via.placeholder.com/400x200?text=No+Cover"} 
                                                alt={trip.title} 
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                            <div className="absolute bottom-2 left-3 right-3 text-white">
                                                <h3 className="font-bold text-lg truncate drop-shadow-md">{trip.title}</h3>
                                                <div className="flex items-center gap-1 text-xs opacity-90 mt-1">
                                                    <i className='bx bx-calendar-week'></i>
                                                    <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="p-3 space-y-3">
                                            {/* Destinations */}
                                            {trip.destinations?.length > 0 && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <i className='bx bx-location-plus text-red-500 text-lg'></i>
                                                    <span className="truncate">
                                                        {trip.destinations[0].city}, {trip.destinations[0].country}
                                                        {trip.destinations.length > 1 && <span className="text-gray-400 ml-1">+{trip.destinations.length - 1} more</span>}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Friends / Collaborators */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                {activeTab === 'own' ? (
                                                    <div className="flex items-center pl-2">
                                                        {trip.acceptedFriends?.slice(0, 2).map((friend, idx) => (
                                                            <img 
                                                                key={friend.user._id || friend.user} 
                                                                src={friend.user.avatar?.url || friend.user.avatar || "https://via.placeholder.com/30"} 
                                                                alt="friend" 
                                                                className={`w-8 h-8 rounded-full border-2 border-white object-cover -ml-2`}
                                                            />
                                                        ))}
                                                        {trip.acceptedFriends?.length > 2 && (
                                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 -ml-2">
                                                                +{trip.acceptedFriends.length - 2}
                                                            </div>
                                                        )}
                                                        {trip.acceptedFriends?.length === 0 && <span className="text-xs text-gray-400 italic">No collaborators</span>}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative">
                                                            <img 
                                                                src={trip.user?.avatar?.url || trip.user?.avatar} 
                                                                alt={trip.user?.name} 
                                                                className="w-8 h-8 rounded-full border border-gray-200"
                                                            />
                                                            <i className='bx bxs-crown text-yellow-500 absolute -top-2 -right-1 text-sm drop-shadow-sm'></i>
                                                        </div>
                                                        {trip.acceptedFriends?.length > 1 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{trip.acceptedFriends.length - 1} others
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Selection Overlay */}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-6 space-y-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                                                <h4 className="font-bold text-gray-800 text-lg">Trip Selected</h4>
                                                
                                                {/* Day Selection */}
                                                <div className="w-full">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Select Day</label>
                                                    <select 
                                                        value={dayNumber} 
                                                        onChange={(e) => setDayNumber(Number(e.target.value))}
                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                                    >
                                                        {Array.from({ length: duration }, (_, i) => i + 1).map(d => (
                                                            <option key={d} value={d}>Day {d}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Highlight Toggle */}
                                                <div 
                                                    className="flex items-center gap-3 cursor-pointer group/highlight"
                                                    onClick={() => setIsHighlighted(!isHighlighted)}
                                                >
                                                    {isHighlighted ? (
                                                        <i className='bx bxs-star text-4xl text-yellow-400 drop-shadow-sm transition-transform transform scale-110'></i>
                                                    ) : (
                                                        <i className='bx bx-star text-4xl text-gray-300 group-hover/highlight:text-yellow-400 transition'></i>
                                                    )}
                                                    <span className={`font-medium ${isHighlighted ? 'text-yellow-600' : 'text-gray-500'}`}>
                                                        {isHighlighted ? 'Highlighted' : 'Mark as Highlight'}
                                                    </span>
                                                </div>

                                                {/* Done Button */}
                                                <button 
                                                    onClick={() => handleConfirmSelection(trip)}
                                                    className="w-full py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-lg mt-2"
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TripSelectionModal;
