import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import mainApi from '../Apis/axios'

const ProfilePage = () => {
    const { userId } = useParams()
    const reduxStateId = useSelector(state=>state.user._id)
    const localState = JSON.parse(localStorage.getItem("userInfo"))
    const stateId = localState._id;

    const id =reduxStateId || stateId 
    const [ownProfile, setOwnProfile] = useState(id===userId)

    const [userData, setUserData ] =useState({})

    useEffect(()=>{

      const fetchUserInfo = async()=>{
       
          const {data} = await mainApi.get(`/api/user/${userId}/profile`)
          setUserData(data)
        
      }

      fetchUserInfo()
    },[userId])

  return (
    <div className='w-full min-h-screen'>
      <div>

      </div>
    </div>
  )
}

export default ProfilePage