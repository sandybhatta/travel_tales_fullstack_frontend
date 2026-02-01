import React, { useCallback, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useGetUserFollowingsQuery, useUnfollowUserMutation } from '../../slices/userApiSlice'

const MyFollowings = () => {
  const [skip, setSkip] = useState(0)
  const reduxUserId = useSelector(state => state.user._id);
  const storageUser = JSON.parse(localStorage.getItem("userInfo"))
  const storageUserId = storageUser._id;
  const userId = reduxUserId || storageUserId

  const { data, isLoading: loading } = useGetUserFollowingsQuery({ userId, skip, limit: 10 }, {
    skip: !userId
  });
  
  const followings = data?.followingList || [];
  const count = data?.count || 0;
  const hasMore = data?.hasMore;

  const [unfollowUser] = useUnfollowUserMutation();

  const observer = useRef()

  const loadMore = () => {
    if (!loading && hasMore) {
        setSkip(prev => prev + 10);
    }
  }

  const lastUserRef = useCallback((node) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })

    if (node) observer.current.observe(node)

  }, [loading, hasMore])

  const handleUnfollow = async (id) => {
    try {
      await unfollowUser(id).unwrap();
    } catch (error) {
      console.error("Error unfollowing:", error)
    }
  }

  return (
    <div className="w-full flex flex-col text-white">
      <div className="flex justify-between items-baseline mb-6 border-b border-gray-700 pb-2">
        <h2 className="text-2xl font-bold text-red-500">My Following</h2>
        <span className="text-gray-400 text-sm bg-gray-800 px-3 py-1 rounded-full">{count} following</span>
      </div>

      {loading && followings.length === 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-800 h-24 rounded-xl"></div>
            ))}
         </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followings.map((user, index) => {
              const logo = user.avatar?.url || user.avatar;
              const isLast = index === followings.length - 1;
              
              return (
                <div
                  key={user._id}
                  ref={isLast ? lastUserRef : null}
                  className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 flex items-center justify-between"
                >
                  <Link to={`/profile/${user._id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={logo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt={user.username}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-600 hover:border-red-500 transition-colors shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-white truncate hover:text-red-500 transition-colors">@{user.username}</p>
                      <p className="text-sm text-gray-400 truncate">{user.name}</p>
                    </div>
                  </Link>
                  
                  <button
                    className='ml-3 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 hover:border-gray-500 transition-all text-sm font-medium shrink-0'
                    onClick={() => handleUnfollow(user._id)}
                  >
                    Unfollow
                  </button>
                </div>
              );
            })}
          </div>

          {!hasMore && followings.length > 0 && (
            <div className="w-full text-center mt-8 pb-4">
                <p className="text-gray-500 text-sm">You've reached the end of the list</p>
            </div>
          )}
          
          {followings.length === 0 && !loading && (
             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="text-xl">You are not following anyone yet.</p>
             </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyFollowings