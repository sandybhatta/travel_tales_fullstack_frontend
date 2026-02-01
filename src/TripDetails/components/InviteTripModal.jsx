import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetTripInvitedQuery,
    useGetTripCollaboratorsQuery,
    useInviteUserToTripMutation,
    useRemoveTripInviteMutation,
    useRemoveTripCollaboratorMutation
} from '../../slices/tripApiSlice';

const InviteTripModal = ({ trip, onClose, onUpdate }) => {
    const { following } = useSelector((state) => state.user);
    
    // RTK Query Hooks
    const { data: invitedData, isLoading: invitedLoading } = useGetTripInvitedQuery(trip._id);
    const { data: collaboratorsData, isLoading: collaboratorsLoading } = useGetTripCollaboratorsQuery(trip._id);
    
    const [inviteUserToTrip] = useInviteUserToTripMutation();
    const [removeTripInvite] = useRemoveTripInviteMutation();
    const [removeTripCollaborator] = useRemoveTripCollaboratorMutation();

    // Derived State from RTK Query
    const invitedUsers = invitedData?.invitedFriends || [];
    const collaborators = collaboratorsData?.collaborators || [];
    const isOwner = invitedData?.isOwner || false; // Backend returns isOwner in invited response

    // UI state
    const [activeTab, setActiveTab] = useState('invited'); // 'invited' | 'collaborators' | 'invite'
    const [searchTerm, setSearchTerm] = useState('');
    
    // Optimistic tracking for instant feedback (since RTK Query invalidation might take a moment)
    const [justInvitedIds, setJustInvitedIds] = useState(new Set()); 

    const loading = invitedLoading || collaboratorsLoading;

    // Check if trip is past (end date is before today)
    const isPastTrip = trip?.endDate && new Date(trip.endDate) < new Date(new Date().setHours(0, 0, 0, 0));

    // Filtering Logic for "Invite Friends" tab
    const getFilteredFollowing = () => {
        if (!following) return [];
        
        // Remove collaborators from the list entirely
        const collaboratorIds = new Set(collaborators.map(c => c.user?._id || c.user));
        
        return following.filter(user => {
            const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  user.name.toLowerCase().includes(searchTerm.toLowerCase());
            const isCollaborator = collaboratorIds.has(user._id);
            const isJustInvited = justInvitedIds.has(user._id);
            
            return matchesSearch && !isCollaborator && !isJustInvited;
        });
    };

    const isUserInvited = (userId) => {
        return invitedUsers.some(u => u._id === userId);
    };

    // --- Actions ---

    const handleInvite = async (userToInvite) => {
        // Optimistic Update: Hide user immediately
        setJustInvitedIds(prev => {
            const next = new Set(prev);
            next.add(userToInvite._id);
            return next;
        });

        try {
            await inviteUserToTrip({ tripId: trip._id, invitee: userToInvite._id }).unwrap();
        } catch (error) {
            console.error("Invite failed", error);
            // Rollback: Show user again
            setJustInvitedIds(prev => {
                const next = new Set(prev);
                next.delete(userToInvite._id);
                return next;
            });
        }
    };

    const handleRemoveInvite = async (userId) => {
        try {
            await removeTripInvite({ tripId: trip._id, userId }).unwrap();
        } catch (error) {
            console.error("Remove invite failed", error);
        }
    };

    const handleRemoveCollaborator = async (collaboratorEntry) => {
        const userId = collaboratorEntry.user?._id;
        if (!userId) return;

        try {
            await removeTripCollaborator({ tripId: trip._id, userId }).unwrap();
            if(onUpdate) onUpdate(); // Optional: if parent needs to refresh something beyond cache
        } catch (error) {
            console.error("Remove collaborator failed", error);
        }
    };

    // Shimmer Component
    const UserShimmer = () => (
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4" onClick={onClose}>
            <div className="bg-white w-[95%] md:w-full max-w-2xl h-[90vh] md:h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                
                {/* Header with Tabs */}
                <div className="bg-white sticky top-0 z-10 border-b">
                    <div className="p-3 md:p-4 flex justify-between items-center">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                            <i className='bx bx-group text-xl md:text-2xl text-red-500'></i>
                            Manage People
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
                            <i className="bx bx-x text-2xl md:text-3xl"></i>
                        </button>
                    </div>
                    
                    <div className="flex px-2 md:px-4 gap-2 md:gap-6 overflow-x-auto hide-scrollbar justify-between md:justify-start">
                        <button 
                            onClick={() => setActiveTab('invited')}
                            className={`pb-2 md:pb-3 font-semibold text-[10px] md:text-sm whitespace-nowrap transition-all border-b-2 ${
                                activeTab === 'invited' 
                                    ? 'text-red-500 border-red-500' 
                                    : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                        >
                            Invited ({invitedUsers.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('collaborators')}
                            className={`pb-2 md:pb-3 font-semibold text-[10px] md:text-sm whitespace-nowrap transition-all border-b-2 ${
                                activeTab === 'collaborators' 
                                    ? 'text-red-500 border-red-500' 
                                    : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                        >
                            Collaborators ({collaborators.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('invite')}
                            className={`pb-2 md:pb-3 font-semibold text-[10px] md:text-sm whitespace-nowrap transition-all border-b-2 ${
                                activeTab === 'invite' 
                                    ? 'text-red-500 border-red-500' 
                                    : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                        >
                            Invite Friends
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-3 md:p-5 flex-1 bg-gray-50/50">
                    
                    {/* Tab Content: Invited Friends */}
                    {activeTab === 'invited' && (
                        <div className="space-y-3 md:space-y-4">
                            {loading ? (
                                // Shimmer Loading
                                Array(5).fill(0).map((_, i) => <UserShimmer key={i} />)
                            ) : invitedUsers.length > 0 ? (
                                invitedUsers.map(user => (
                                    <div key={user._id} className="flex items-center justify-between p-2 md:p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <img 
                                                src={user.avatar?.url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                                alt={user.username}
                                                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover opacity-75 grayscale-[30%]"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-700 text-xs md:text-sm">{user.username}</p>
                                                <p className="text-[10px] md:text-xs text-gray-400">Pending Acceptance...</p>
                                            </div>
                                        </div>
                                        {isOwner && (
                                            <button 
                                                onClick={() => handleRemoveInvite(user._id)} 
                                                className="p-1.5 md:px-3 md:py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center"
                                                title="Remove Invite"
                                            >
                                                <i className='bx bx-trash text-xl md:text-lg'></i>
                                                <span className="hidden md:inline ml-1 font-medium text-sm">Remove</span>
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <i className='bx bx-envelope text-4xl mb-2'></i>
                                    <p>No pending invitations.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Content: Collaborators */}
                    {activeTab === 'collaborators' && (
                        <div className="space-y-3 md:space-y-4">
                            {loading ? (
                                // Shimmer Loading
                                Array(5).fill(0).map((_, i) => <UserShimmer key={i} />)
                            ) : collaborators.length > 0 ? (
                                collaborators.map((collab, index) => {
                                    const user = collab.user; 
                                    if (!user) return null;

                                    return (
                                        <div key={user._id || index} className="flex items-center justify-between p-2 md:p-3 bg-white rounded-xl border border-green-100 shadow-sm">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <img 
                                                    src={user.avatar?.url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                                    alt={user.username}
                                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-green-100"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-xs md:text-sm">{user.username}</p>
                                                    <p className="text-[10px] md:text-xs text-green-600 font-medium flex items-center gap-1">
                                                        <i className='bx bx-check-circle'></i> Accepted
                                                    </p>
                                                </div>
                                            </div>
                                            {isOwner && (
                                                <button 
                                                    onClick={() => handleRemoveCollaborator(collab)}
                                                    className="p-1.5 md:px-3 md:py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center"
                                                    title="Remove Collaborator"
                                                >
                                                    <i className='bx bx-trash text-xl md:text-lg'></i>
                                                    <span className="hidden md:inline ml-1 font-medium text-sm">Remove</span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <i className='bx bx-user-check text-4xl mb-2'></i>
                                    <p>No collaborators yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Content: Invite Friends */}
                    {activeTab === 'invite' && (
                        <div className="space-y-3 md:space-y-4">
                            {isPastTrip ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-center space-y-4">
                                    <div className="bg-red-50 p-6 rounded-full">
                                        <i className='bx bx-calendar-x text-5xl text-red-400'></i>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-700">Trip Has Ended</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto mt-2 leading-relaxed">
                                            This trip ended on <span className="font-semibold text-gray-700">{new Date(trip.endDate).toLocaleDateString()}</span>. 
                                            You cannot invite new friends to a past trip.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Search */}
                                    <div className="relative mb-3 md:mb-4">
                                        <i className='bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-xl'></i>
                                        <input 
                                            type="text" 
                                            placeholder="Search your followings..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 text-sm md:text-base bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 outline-none transition-all shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        {getFilteredFollowing().length > 0 ? (
                                            getFilteredFollowing().map(user => {
                                                const alreadyInvited = isUserInvited(user._id);
                                                return (
                                                    <div key={user._id} className="flex items-center justify-between p-2 md:p-3 bg-white hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 shadow-sm">
                                                        <div className="flex items-center gap-2 md:gap-3">
                                                            <img 
                                                                src={user.avatar?.url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                                                alt={user.username}
                                                                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-gray-200"
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-gray-800 text-xs md:text-sm">{user.username}</p>
                                                                <p className="text-[10px] md:text-xs text-gray-500">{user.name}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {alreadyInvited ? (
                                                            <button 
                                                                disabled
                                                                className="px-3 py-1 md:px-4 md:py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs md:text-sm font-semibold cursor-not-allowed flex items-center gap-1"
                                                            >
                                                                <i className='bx bx-time'></i> Invited
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleInvite(user)}
                                                                className="px-3 py-1 md:px-4 md:py-1.5 bg-red-50 text-red-600 rounded-lg text-xs md:text-sm font-semibold hover:bg-red-500 hover:text-white transition-all flex items-center gap-1 shadow-sm hover:shadow"
                                                            >
                                                                <i className='bx bx-plus'></i> Add
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-10 text-gray-400">
                                                <p>No friends found to invite.</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default InviteTripModal;
