import React, { useEffect, useState } from 'react'
import mainApi from '../Apis/axios'
import { useSelector } from 'react-redux'

const TagUsers = () => {
    
    const [followingsOfUser ,  setFollowingsOfUser] = useState({
        count:0,
        followingList:[],
        hasMore:false,
    })

    const userId = useSelector(state=>state.user._id)
    

    useEffect(()=>{

        async function fetchFollowingsOfUser (){
            let { data } = await mainApi.get(`/api/user/${userId}/following`) 
            setFollowingsOfUser(data);
        } 
        fetchFollowingsOfUser()

    },[])

  return (
    <div>
        <div>

        </div>

        {/* followings list */}
        <div>
            {
                followingsOfUser.count===0 ?(
                <p>you are currently not following anyone</p>):
                (
                    followingsOfUser.followingList.map((following)=>{

                        const avatar = following.avatar?.url || following.avatar;

                        return (
                            <div className='w-full h-[150px] flex  items-center justify-around gap-1'>
                                <div className='w-[20%] h-full '>
                                    <img
                                        src={avatar}
                                        alt="user photo"
                                        className='obeject-cover h-full w-full'
                                    
                                    />
                                </div>
                                <div className='h-full w-[80%] flex flex-col items-center justify-center gap-1'>
                                    <p>{following.name}</p>
                                    <p>@{following.username}</p>
                                </div>
                             </div>
                        )
                    })
                )

            }
        </div>
    </div>
  )
}

export default TagUsers