import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import mainApi from '../../Apis/axios'
import { Link } from 'react-router-dom'

const MyFollowings = () => {
  const [followings , setFollowings] = useState([])
  const [count , setCount ] = useState(0)
  const [skip, setSkip] =useState(0)
  const [hasMore, setHasMore]= useState(true)
  const reduxUserId = useSelector(state=>state.user._id);
  const storageUser = JSON.parse(localStorage.getItem("userInfo"))
  const storageUserId = storageUser._id;
  const userId = reduxUserId || storageUserId 

  const observer = useRef()

  const fetchFollowings = async()=>{
    try {
       let response = await mainApi.get(`/api/user/${userId}/following`,{
        params:{
          skip,
          limit:10
        }
       })
       setFollowings([...response.data.followingList])
       setCount(response.data.count)
       setHasMore(response.data.hasMore)
       setSkip(prev=>prev+10)
    } catch (error) {
      
    }
  }
   const lastUserRef = useCallback((node)=>{
    if(!node)return;
    if(observer.current)observer.current.disconnect()

    observer.current = new IntersectionObserver((entries)=>{
      if(entries[0].isIntersecting && hasMore){
        fetchFollowings()
      }
    })

    if(node)observer.current.observe(node)
    
   },[hasMore])
  useEffect(()=>{
    fetchFollowings()
  },[])


   return (
    <div className="w-full flex flex-col items-center text-white">
      <h2 className="text-2xl font-bold mt-5 mb-3">My Followings</h2>
        <p>{count} followings</p>
      {followings.map((user, index) => {
        const logo = user.avatar?.url || user.avatar;
        
        const isLast = index === followings.length - 1;
        return (
          <div
            key={user._id}
            ref={isLast ? lastUserRef : null}
            className="w-[70%] h-[100px] border flex items-center justify-between bg-[#2B2D42] rounded-lg mb-4 px-4"
          >
            <Link to={`/profile/${user._id}`} className="flex items-center gap-4">
              <img
                src={logo}
                alt={user.username}
                className="w-[60px] h-[60px] rounded-full object-cover"
              />
              <div>
                <p className="text-lg font-semibold">@{user.username}</p>
                <p className="text-md">{user.name}</p>
              </div>
            </Link>
          </div>
        );
      })}

     
      {!hasMore && <p className="text-gray-400 my-4">No more followings</p>}
    </div>
  );
}

export default MyFollowings