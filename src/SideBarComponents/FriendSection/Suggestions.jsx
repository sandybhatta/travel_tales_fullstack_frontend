import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetSuggestionsQuery, useFollowUserMutation } from '../../slices/userApiSlice'

const Suggestions = () => {
    const { data: response, isLoading: loading } = useGetSuggestionsQuery();
    const users = response?.users || [];

    const [followUser] = useFollowUserMutation();
    const [followedIds, setFollowedIds] = useState([]);
    const [hiddenIds, setHiddenIds] = useState([]);

    const handleFollow = async (id) => {
        try {
            await followUser(id).unwrap();
            
            // Mark as followed immediately
            setFollowedIds(prev => [...prev, id]);

            // Hide after 1 second
            setTimeout(() => {
                setHiddenIds(prev => [...prev, id]);
            }, 1000)

        } catch (error) {
            console.error("Error following user:", error)
            setFollowedIds(prev => prev.filter(uid => uid !== id)); // Rollback
        }
    }

    const displayUsers = users.filter(user => !hiddenIds.includes(user._id));

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-800 h-32 rounded-xl"></div>
                ))}
            </div>
        )
    }

    if (displayUsers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="text-xl">No suggestions available at the moment.</p>
            </div>
        )
    }

    return (
        <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-5'>
            {displayUsers.map((user, index) => {
                const logo = user.avatar?.url ? user.avatar.url : user.avatar
                const isFollowed = followedIds.includes(user._id);

                return (
                    <div
                        key={user._id}
                        className='bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 flex flex-col justify-between'
                    >
                        <div className="flex items-start space-x-4">
                            <Link to={`/profile/${user._id}`} className="shrink-0">
                                <img
                                    src={logo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                    alt={user.username}
                                    className='w-14 h-14 rounded-full object-cover border-2 border-gray-600 hover:border-red-500 transition-colors'
                                />
                            </Link>
                            
                            <div className="flex-1 min-w-0">
                                <Link to={`/profile/${user._id}`}>
                                    <h3 className='text-lg font-semibold text-white truncate hover:text-red-500 transition-colors'>
                                        @{user.username}
                                    </h3>
                                    <p className='text-gray-400 text-sm truncate'>{user.name}</p>
                                    <p className='text-gray-500 text-xs mt-1 truncate'>
                                        {user.location?.city ? `${user.location.city}, ${user.location.country}` : 'Location unknown'}
                                    </p>
                                </Link>
                            </div>
                        </div>

                        <div className="mt-4">
                            <button
                                disabled={isFollowed}
                                className={`w-full py-2 rounded-lg font-medium transition-colors shadow-md ${
                                    isFollowed 
                                    ? "bg-green-500 text-white cursor-default" 
                                    : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 active:scale-95"
                                }`}
                                onClick={() => handleFollow(user._id)}
                            >
                                {isFollowed ? "Followed" : "Follow"}
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Suggestions