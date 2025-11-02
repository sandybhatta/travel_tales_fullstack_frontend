import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import mainApi from '../../Apis/axios'

const Suggestions = () => {
    const [usersFromDb,setUsersFromDb] = useState([])
    const followDivRef = useRef([])


    useEffect(()=>{
        const fetchUsers = async()=>{
            let response=await mainApi.get("/api/user/users")
                setUsersFromDb([...response.data.users])

        }
        fetchUsers()
    },[])

    const handleFollow = async(id,index)=>{
      
        try {
            let response = await mainApi.post(`/api/user/follow/${id}`);

            followDivRef.current[index].innerHTML=` <p class="followed-user">${response.data.message} </p>` 

            setTimeout(()=>{
                
                setUsersFromDb(prev=>prev.filter(user=>user._id!==id))
            },2000)

        } catch (error) {
            
        }
    }
  return (
    <div className='w-full h-auto flex flex-col items-center justify-center gap-5  text-white'>
                    {usersFromDb.map((user,index)=>{
                        const logo= user.avatar?.url ? user.avatar.url:user.avatar
                        return(
                            <div
                            key={user._id}
                            ref={(el)=>followDivRef.current[index]=el}
                            className='w-[70%]  h-[100px] border-1 flex items-center justify-around mt-5 flex-wrap rounded-lg bg-[#2B2D42]'
                            >
                                <Link to={`/profile/${user._id}`}
                                className='w-[80%] flex gap-5 justify-between items-center '
                                >
                                <div className='w-[10%] h-full '>
                                    <img
                                    src={logo}
                                    className='object-contain '
                                    />
                                </div>

                                <div 
                                className='w-[90%] h-full  flex items-center justify-around px-4 py-2'
                                >
                                    <div
                                      className='w-full h-full'
                                    >
                                    <p 
                                        className='text-lg'
                                        >@{user.username}</p>
                                        <p
                                        className='text-md'
                                        >{user.name}</p>
                                        
                                        <p  
                                        className='text-sm'
                                        >lives in {user.location.city} , {user.location.state}, {user.location.country} 
                                        </p>
                                    </div>
                                
                                </div>
                                </Link>

                                <button
                                className='px-4 py-2  mr-2 block rounded-lg bg-green-500 border-1 border-white cursor-pointer'
                                onClick={()=>handleFollow(user._id,index)}
                                >Follow</button>


                            </div>
                            )
                    })}
        </div>
  )
}

export default Suggestions