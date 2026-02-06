import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import mainApi from '../../Apis/axios';

const TripLikesModal = ({ isOpen, onClose, likedUsersData }) => {
    const currentUser = useSelector((state) => state.user);
    const [usersList, setUsersList] = useState([]);
    const [actionLoading, setActionLoading] = useState({}); // { [userId]: true/false }

    useEffect(() => {
        if (likedUsersData?.users) {
            setUsersList(likedUsersData.users);
        }
    }, [likedUsersData]);

    if (!isOpen) return null;

    const handleFollow = async (userId) => {
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            await mainApi.post(`/api/users/follow/${userId}`);
            // Update local list state
            setUsersList(prev => prev.map(u => 
                u._id === userId ? { ...u, isFollowing: true } : u
            ));
        } catch (error) {
            console.error("Follow failed", error);
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleUnfollow = async (userId) => {
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            await mainApi.post(`/api/users/unfollow/${userId}`);
            // Update local list state
            setUsersList(prev => prev.map(u => 
                u._id === userId ? { ...u, isFollowing: false } : u
            ));
        } catch (error) {
            console.error("Unfollow failed", error);
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
             <div className="bg-white w-full max-w-md max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-bold text-gray-800">Likes ({likedUsersData?.totalLikes || 0})</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
                        <i className='bx bx-x text-3xl'></i>
                    </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
                    {usersList && usersList.length > 0 ? (
                        usersList.map(user => {
                            const isMe = currentUser?._id === user._id;
                            const isLoading = actionLoading[user._id];

                            return (
                                <div key={user._id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={user.avatar?.url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                            alt={user.username}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{user.username}</p>
                                            <p className="text-xs text-gray-500">{user.name}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {isMe ? (
                                            <span className="text-gray-400 font-semibold text-sm">(Me)</span>
                                        ) : (
                                            user.isFollowing ? (
                                                <button 
                                                    onClick={() => handleUnfollow(user._id)}
                                                    disabled={isLoading}
                                                    className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all min-w-[90px] flex justify-center"
                                                >
                                                    {isLoading ? (
                                                        <i className='bx bx-loader-alt animate-spin'></i>
                                                    ) : 'Unfollow'}
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleFollow(user._id)}
                                                    disabled={isLoading}
                                                    className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-all min-w-[90px] flex justify-center"
                                                >
                                                    {isLoading ? (
                                                        <i className='bx bx-loader-alt animate-spin text-white'></i>
                                                    ) : 'Follow'}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <p>No likes yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TripLikesModal;